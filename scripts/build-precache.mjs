#!/usr/bin/env node
/**
 * Schreibt out/precache.json — die Liste aller Adressen, die der Service
 * Worker beim Installieren in den Cache legt.
 *
 * Warum als eigene Datei und nicht als Liste in sw.js: so bleibt der Service
 * Worker unveraendert eingecheckt, und die Liste entsteht aus dem, was der
 * Build tatsaechlich erzeugt hat. Sie kann nicht veralten.
 *
 * Wichtig sind nicht nur die HTML-Seiten. Next laedt beim Blaettern innerhalb
 * der App kleine .txt-Nutzdaten statt ganzer Seiten; fehlen die im Cache,
 * funktionieren offline zwar direkt eingegebene Adressen, aber keine Links.
 *
 * Aufruf: node scripts/build-precache.mjs  (laeuft automatisch nach dem Build)
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");

/**
 * precache.json darf nie im Cache liegen — daraus lernt ein neuer Worker ja
 * erst, was er holen soll.
 *
 * diagnose.html gehoert dagegen ausdruecklich HINEIN: Die Seite misst, ob bei
 * abgeschaltetem Server alles aus dem Cache kommt — und waere sie selbst nicht
 * vorgehalten, liesse sie sich genau dann nicht oeffnen.
 */
const SKIP = new Set(["precache.json", ".nojekyll"]);

/*
 * Der Pfad, unter dem die App ausgeliefert wird — leer lokal, "/tao-app" auf
 * GitHub Pages. Die Adressen im Cache muessen exakt die sein, die der Browser
 * spaeter anfragt, sonst greift offline nichts.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const PLACEHOLDER = "__CONTENT_HASH__";

/**
 * Die Pruefsumme entsteht aus den QUELLEN, nicht aus dem Bauergebnis.
 *
 * Das ist keine Bequemlichkeit, sondern notwendig: Next bettet in jede
 * erzeugte Seite eine Kennung ein, die bei jedem Build neu entsteht. Zwei
 * Builds ohne jede Aenderung unterscheiden sich darum in ueber 600 Dateien.
 * Eine Summe darueber waere bei jedem Lauf eine andere, und das Handy laedt
 * neun Megabyte nach, obwohl sich nichts getan hat.
 *
 * public/sw.js geht bewusst MIT ein. Es ist die Vorlage und enthaelt immer nur
 * den Platzhalter, ist also stabil — kein Zirkelschluss. Nur so bekommt eine
 * geaenderte Worker-Logik auch eine neue Version, und man kann am Geraet
 * ablesen, welche Fassung tatsaechlich das Kommando hat.
 */
const SOURCES = ["src", "public", "next.config.ts", "package.json"];
const NOT_HASHED = new Set();

function walk(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) found.push(...walk(full));
    else found.push(full);
  }
  return found;
}

function toUrl(file) {
  const rel = relative(OUT, file).split(sep).join("/");
  if (SKIP.has(rel)) return null;
  const prefix = (address) => `${BASE_PATH}${address}`;
  // Die .txt-Dateien sind Nutzdaten fuer Nexts Client-Router. Seit die App
  // gewoehnliche Anker benutzt (siehe src/components/PageLink.tsx), fragt sie
  // niemand mehr an — sie machten aber drei Viertel des Vorgehaltenen aus.
  if (rel.endsWith(".txt")) return null;

  // trailingSlash ist aktiv: /daodejing/1/index.html wird unter /daodejing/1/ geliefert.
  if (rel === "index.html") return prefix("/");
  if (rel.endsWith("/index.html")) return prefix(`/${rel.slice(0, -"index.html".length)}`);

  // Jede andere .html-Datei liefert der Server ohne Endung aus und leitet von
  // der Endung dorthin um. Eine umgeleitete Antwort laesst sich aber nicht in
  // den Cache legen — cache.add() bricht daran ab, und der Fehler faellt nicht
  // auf, weil er beim Vorhalten verschluckt wird. Also gleich die Adresse
  // nennen, die ohne Umleitung antwortet.
  if (rel.endsWith(".html")) return prefix(`/${rel.slice(0, -".html".length)}`);

  return prefix(`/${rel}`);
}

let files;
try {
  files = walk(OUT);
} catch {
  console.error("\n  FEHLER: out/ fehlt — zuerst `next build` ausfuehren.\n");
  process.exit(1);
}

const urls = [...new Set(files.map(toUrl).filter(Boolean))].sort();

// Selbstpruefung: ohne Startseite waere der Cache nutzlos.
if (!urls.includes(`${BASE_PATH}/`)) {
  console.error("\n  FEHLER: die Startseite fehlt in der Liste.\n");
  process.exit(1);
}

writeFileSync(join(OUT, "precache.json"), `${JSON.stringify(urls, null, 0)}\n`, "utf8");

// --- Pruefsumme ueber die Quellen ----------------------------------------
// Der Browser holt sw.js immer am Cache vorbei und vergleicht Byte fuer Byte.
// Eine aus den Quellen abgeleitete Version macht daraus den Ausloeser fuer
// Aktualisierungen — ohne dass jemand eine Zahl von Hand hochsetzen muss.
const digest = createHash("sha256");
const hashed = [];

// Die Adressliste gehoert dazu: kommt eine Seite hinzu oder lautet eine
// Adresse anders, muss das Handy die neue Liste bekommen. Kein Zirkelschluss —
// precache.json enthaelt die Summe nicht.
//
// Ohne die Bundles: deren Dateinamen wechseln bei jedem Build, weil Next sie
// aus einer Build-Kennung bildet. Sie hier mitzuzaehlen machte die Summe bei
// jedem Lauf zu einer anderen.
digest.update(urls.filter((u) => !u.startsWith("/_next/")).join("\n"));

for (const entry of SOURCES) {
  const full = join(ROOT, entry);
  let listing;
  try {
    listing = statSync(full).isDirectory() ? walk(full) : [full];
  } catch {
    continue; // Nicht vorhanden — etwa public/ in einem schlanken Klon.
  }
  for (const file of listing.sort()) {
    const rel = relative(ROOT, file).split(sep).join("/");
    if (NOT_HASHED.has(rel)) continue;
    hashed.push(rel);
    digest.update(rel);
    digest.update(readFileSync(file));
  }
}

if (hashed.length === 0) {
  console.error("\n  FEHLER: keine Quelldateien fuer die Pruefsumme gefunden.\n");
  process.exit(1);
}

const version = digest.digest("hex").slice(0, 12);

const swPath = join(OUT, "sw.js");
let worker;
try {
  worker = readFileSync(swPath, "utf8");
} catch {
  console.error("\n  FEHLER: out/sw.js fehlt.\n");
  process.exit(1);
}

if (!worker.includes(PLACEHOLDER)) {
  console.error(
    `\n  FEHLER: ${PLACEHOLDER} steht nicht in out/sw.js.\n` +
      `  Ohne Platzhalter bekommt das Handy nie eine neue Fassung —\n` +
      `  in public/sw.js muss die Zeile const VERSION = "${PLACEHOLDER}"; stehen.\n`
  );
  process.exit(1);
}

writeFileSync(swPath, worker.replaceAll(PLACEHOLDER, version), "utf8");

const pages = urls.filter((u) => u.endsWith("/")).length;
const payloads = urls.filter((u) => u.endsWith(".txt")).length;
console.log(
  `  precache.json: ${urls.length} Adressen ` +
    `(${pages} Seiten, ${payloads} Nutzdaten, ${urls.length - pages - payloads} sonstige).`
);
console.log(`  sw.js: Version ${version} aus ${hashed.length} Quelldateien gebildet.`);
