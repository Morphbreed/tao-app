#!/usr/bin/env node
/**
 * Extrahiert eine Auswahl von Geschichten aus Dschuang Dsi nach
 * src/content/stories/.
 *
 * Quelle: Dschuang Dsi, "Das wahre Buch vom suedlichen Bluetenland",
 *         uebersetzt von Richard Wilhelm (Jena: Diederichs 1912).
 *         Wilhelm starb 1930; die Uebersetzung ist seit 2001 gemeinfrei —
 *         dieselbe Grundlage wie beim Daodejing dieser App.
 *
 *         Digitalisat: Internet Archive, Item "pts_dschuangdsidaswa_3720_0702"
 *         (Scan derselben Ausgabe, ABBYY-Texterkennung), Datei
 *         "…_djvu.txt", abgerufen am 12.10.2026. Eine Kopie liegt unter
 *         scripts/source/ — damit laeuft die Extraktion offline und
 *         reproduzierbar, ohne dass Build oder Laufzeit ins Netz greifen.
 *
 * Die Auswahl steht unten in STORIES und ist bewusst klein: die App
 * sammelt nicht das Buch, sondern die Geschichten, die zu den Kapiteln
 * sprechen, die sie ohnehin fuehrt.
 *
 * Aufruf: node scripts/extract-dschuangdsi.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(ROOT, "scripts/source/dschuangdsi-wilhelm-1912.txt");
const OUT_DIR = join(ROOT, "src/content/stories");

/**
 * Auswahl: slug, Titel in der App, Buch, die Abschnittsueberschrift der
 * Vorlage und die Daodejing-Kapitel, zu denen das Stueck spricht.
 */
const STORIES = [
  { slug: "der-vogel-rokh", title: "Der Vogel Rokh", book: "Buch I", source: "1. Der Vogel Rokh und die Wachtel", chapters: [1, 20], order: 1 },
  { slug: "der-grosse-kuerbis", title: "Der große Kürbis", book: "Buch I", source: "4. Der große Kürbis", chapters: [11, 45], order: 2 },
  { slug: "der-unnuetze-baum", title: "Der unnütze Baum", book: "Buch I", source: "5. Der unnütze Baum", chapters: [11, 24], order: 3 },
  { slug: "jenseits-der-unterschiede", title: "Jenseits der Unterschiede", book: "Buch II", source: "7. Jenseits der Unterschiede", chapters: [2], order: 4 },
  { slug: "schmetterlingstraum", title: "Der Schmetterlingstraum", book: "Buch II", source: "12. Schmetterlingstraum", chapters: [2, 21], order: 5 },
  { slug: "der-koch", title: "Der Koch", book: "Buch III", source: "2. Der Koch", chapters: [43, 63], order: 6 },
  { slug: "der-tod-des-laotse", title: "Der Tod des Laotse", book: "Buch III", source: "4. Der Tod des Laotse", chapters: [50, 76], order: 7 },
  { slug: "der-alte-eichbaum", title: "Der alte Eichbaum", book: "Buch IV", source: "4. Der alte Eichbaum", chapters: [11, 24], order: 8 },
  { slug: "das-leiden-der-brauchbarkeit", title: "Das Leiden der Brauchbarkeit", book: "Buch IV", source: "6. Das Leiden der Brauchbarkeit", chapters: [24, 44], order: 9 },
  { slug: "angesichts-des-todes", title: "Angesichts des Todes", book: "Buch VI", source: "5. Angesichts des Todes", chapters: [50, 76], order: 10 },
  { slug: "sitzen-im-vergessen", title: "Sitzen im Vergessen", book: "Buch VI", source: "6. Befreiung aus den Banden der Moral", chapters: [16, 48], order: 11 },
  { slug: "der-spiegel-des-herzens", title: "Der Spiegel des Herzens", book: "Buch VII", source: "6. Der Spiegel des Herzens", chapters: [10, 16], order: 12 },
  { slug: "handeln-und-nicht-handeln", title: "Handeln und Nicht-Handeln", book: "Buch XIII", source: "3. Handeln und Nicht-Handeln", chapters: [37, 48], order: 13 },
  { slug: "wertlosigkeit-der-buecher", title: "Der Wagner und das Buch", book: "Buch XIII", source: "10. Wertlosigkeit der Bücher", chapters: [1, 81], order: 14 },
  // Die Ueberschrift ist in der Vorlage stark beschaedigt (vorangestellter
  // Kolumnentitel, fehlender Punkt, "DIE" als "J3IE" verlesen, Umbruch durch
  // Silbentrennung). Sie wird deshalb ueber einen eindeutigen Textanker
  // festgelegt statt ueber den Aehnlichkeitsvergleich.
  { slug: "der-brunnenfrosch", title: "Der Brunnenfrosch", book: "Buch XVII", source: "9. Die Lehre des Dschuang Dsï der Brunnenfrosch", chapters: [20, 47], order: 15, anchor: "DER  BRUNNEN-" },
  { slug: "die-schildkroete", title: "Die Schildkröte", book: "Buch XVII", source: "10. Die Schildkröte", chapters: [44, 80], order: 16 },
  { slug: "die-freude-der-fische", title: "Die Freude der Fische", book: "Buch XVII", source: "12. Die Freude der Fische", chapters: [2, 71], order: 17 },
  { slug: "beim-tode-seiner-frau", title: "Beim Tode seiner Frau", book: "Buch XVIII", source: "2. Dschuang Dsï beim Tode seiner Frau", chapters: [50, 76], order: 18 },
  { slug: "der-holzschnitzer", title: "Der Holzschnitzer", book: "Buch XIX", source: "10. Der Holzschnitzer", chapters: [19, 45], order: 19 },
  { slug: "der-wagenlenker", title: "Der Wagenlenker", book: "Buch XIX", source: "11. Der Wagenlenker", chapters: [9, 24], order: 20 },
  // Ebenfalls beschaedigt: vorangestellter Kolumnentitel ("Budi XX"), kein
  // Punkt nach der Nummer. Daher ueber einen eindeutigen Anker festgelegt.
  { slug: "der-weg-zum-leben", title: "Der Weg zum Leben", book: "Buch XX", source: "4. Der Weg zum Leben", chapters: [20, 22], order: 21, anchor: "DER  WEG  ZUM  LEBEN" },
  { slug: "wo-ist-der-sinn", title: "Wo ist der Sinn", book: "Buch XXII", source: "5. Wo ist der Sinn", chapters: [1, 14], order: 22 },
  { slug: "schweigen-ist-gold", title: "Schweigen ist Gold", book: "Buch XXIV", source: "10. Schweigen ist Gold", chapters: [56, 81], order: 23 },
  { slug: "die-notwendigkeit-des-unnoetigen", title: "Die Notwendigkeit des Unnötigen", book: "Buch XXVI", source: "7. Die Notwendigkeit des Unnötigen", chapters: [11, 24], order: 24 },
  { slug: "der-tod-des-dschuang-dsi", title: "Der Tod des Dschuang Dsi", book: "Buch XXVII", source: "20. Der Tod des Dschuang Dsï", chapters: [50, 76], order: 25 },
];

/**
 * Systematische Lesefehler der Texterkennung.
 *
 * Aufgenommen ist nur, was sich aus der Rechtschreibung selbst entscheiden
 * laesst: Die linke Seite ist jeweils kein deutsches Wort, die rechte die
 * einzige sinnvolle Lesung. Zweifelsfaelle und blosse Schreibvarianten der
 * Vorlage stehen bewusst NICHT hier — die Vorlage bleibt dann massgeblich.
 *
 * Die Ursachen sind immer dieselben drei Verwechslungen im Fraktursatz:
 *   "ch" wird als "di"/"dh" gelesen, "ck" als "dce"/"cic"/"cii",
 *   und "l"/"A" werden zu "U"/"H"/"Ä".
 */
const OCR_FIXES = [
  // "ch" als "di" verlesen
  ["nidit", "nicht"], ["sidi", "sich"], ["idi", "ich"], ["idb", "ich"],
  ["midi", "mich"], ["nadi", "nach"], ["nodi", "noch"], ["dodi", "doch"],
  ["sdion", "schon"], ["sdieint", "scheint"], ["spradi", "sprach"],
  ["Sdiicksal", "Schicksal"], ["Eigensdiaften", "Eigenschaften"],
  ["Frosdi", "Frosch"], ["Madit", "Macht"], ["Kodi", "Koch"], ["Dsdiuang", "Dschuang"],
  ["Dchuang", "Dschuang"], ["durdistreidie", "durchstreiche"],
  ["dadurdi", "dadurch"], ["dennodi", "dennoch"], ["Tsdien", "Tschen"],
  ["Tsdiu", "Tschu"], ["göttlidicr", "göttlicher"], ["reidier", "reicher"],
  ["sudit", "sucht"], ["tüditig", "tüchtig"], ["Büdier", "Bücher"],
  ["Wertsdiätzung", "Wertschätzung"], ["Fladi", "Flach"],
  ["Trauerbräudie", "Trauerbräuche"], ["erwadit", "erwacht"],
  ["Modesdiarfsinn", "Modescharfsinn"], ["Schläditers", "Schlächters"],
  ["präditige", "prächtige"],

  // "ck" als "dce"/"cic"/"cii" verlesen
  ["blidce", "blicke"], ["stedcen", "stecken"], ["rüdcwärts", "rückwärts"],
  ["Fleischstüdce", "Fleischstücke"], ["zurücicgewichen", "zurückgewichen"],
  ["zurücicziehend", "zurückziehend"], ["zurücii", "zurück"],
  ["Zurüdcweisungen", "Zurückweisungen"],

  // "l" als "U"/"H" verlesen
  ["absichtUcii", "absichtlich"], ["gewöhnUchen", "gewöhnlichen"],
  ["plötzHch", "plötzlich"], ["HeiUge", "Heilige"], ["Hnken", "linken"],
  ["woUne", "wollne"],

  // "A" als "Ä"/"H" verlesen
  ["Älter", "Alter"], ["Äxt", "Axt"], ["Äugen", "Augen"],
  ["Äugenblick", "Augenblick"], ["Äugenschein", "Augenschein"],
  ["Äugenlosen", "Augenlosen"], ["Äußerhalb", "Außerhalb"], ["Äch", "Ach"],
  ["Äbsdinitt", "Abschnitt"], ["HuBending", "Außending"], ["HUes", "Alles"],

  // "ß" als "B" verlesen
  ["TausendfuB", "Tausendfuß"], ["groBe", "große"], ["groBen", "großen"],
  ["groB", "groß"], ["FuB", "Fuß"], ["daB", "daß"],

  // Eigennamen, im Satz mit Trema
  ["DsT", "Dsï"], ["DsP", "Dsï"], ["Dsi", "Dsï"], ["Dsl", "Dsï"], ["Schi", "Schï"],
  ["Himmclssec", "Himmelssee"],
];

/**
 * Gezielte Korrekturen einzelner Stellen, falls eine Lesung nur im
 * Zusammenhang zu entscheiden ist. Greift ein Eintrag nicht mehr, meldet
 * das Skript das als Warnung — so verrotten die Eintraege nicht still.
 */
const CORRECTIONS = {};

function fail(message) {
  console.error(`\n  FEHLER: ${message}\n`);
  process.exit(1);
}

/** Vergleichsform: Versalien, ohne Diakritika, ohne Satz- und Leerzeichen. */
function key(value) {
  return value
    .toUpperCase()
    .replaceAll("ß", "SS")
    .replaceAll("SZ", "SS")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

/** Aehnlichkeit zweier Zeichenketten als Anteil gemeinsamer Bigramme. */
function similarity(a, b) {
  if (a === b) return 1;
  const grams = (s) => {
    const out = new Map();
    for (let i = 0; i < s.length - 1; i += 1) {
      const g = s.slice(i, i + 2);
      out.set(g, (out.get(g) ?? 0) + 1);
    }
    return out;
  };
  const ga = grams(a);
  const gb = grams(b);
  let shared = 0;
  for (const [g, n] of ga) shared += Math.min(n, gb.get(g) ?? 0);
  const total = (a.length - 1 + b.length - 1) / 2;
  return total > 0 ? shared / total : 0;
}

const raw = readFileSync(SOURCE, "utf8");
const lines = raw.split("\n").map((line) => line.replace(/\s+$/, ""));

/*
 * Nach dem Haupttext folgen Wilhelms Anmerkungen und zuletzt das
 * Inhaltsverzeichnis. Beide wiederholen die Abschnittsueberschriften und
 * wuerden die Suche verwirren — der Haupttext endet bei "ANMERKUNGEN".
 */
const notesStart = lines.findIndex((line, i) => i > 9000 && /^\s*ANMERKUNGEN\s*$/.test(line));
if (notesStart < 0) fail("Ende des Haupttexts (\"ANMERKUNGEN\") nicht gefunden");
const body = lines.slice(0, notesStart);

/* Kandidaten fuer Abschnittsueberschriften: "<Nr>. <VERSALIEN>" auf eigener Zeile. */
/* Vor der Nummer steht gelegentlich ein kurzes Scan-Artefakt ("o", "B\"*"). */
const HEADING = /^.{0,8}?(\d{1,2})\s*[.,]\s+([A-ZÄÖÜ][^a-z]{3,}?)(?:\s+Buch\s+\S{1,6})?\s*$/;
/* Buchmarken trennen Abschnitte ebenfalls — und davor steht Wilhelms Einleitung. */
const BOOK_MARK = /^[^a-z]*\bBUCH\b[^a-z]*$/;

const headings = [];
for (let i = 0; i < body.length; i += 1) {
  if (HEADING.test(body[i])) headings.push(i);
}
/**
 * Jedes Buch beginnt mit einem Titelblock in Versalien ("PFLEGE DES
 * LEBENSPRINZIPS"), dem Wilhelms Einleitung folgt. Dieser Block beendet den
 * vorangehenden Abschnitt — ohne ihn liefe die Extraktion in den Kommentar.
 * Kurze Versalienfetzen aus dem Scan sind durch die Mindestlaenge ausgeschlossen.
 */
function isBlockMark(line) {
  const letters = line.replace(/[^\p{L}]/gu, "");
  if (letters.length < 8) return false;
  const upper = letters.replace(/\p{Ll}/gu, "").length;
  return upper / letters.length >= 0.8;
}

const bookMarks = [];
for (let i = 0; i < body.length; i += 1) {
  if (BOOK_MARK.test(body[i]) && body[i].trim().length < 40) bookMarks.push(i);
  else if (isBlockMark(body[i])) bookMarks.push(i);
  // Manche Abschnitte beginnen ohne Titelblock: die Nummer steht allein auf
  // einer Zeile, die Initiale des Folgetexts ebenfalls. Auch das beendet den
  // vorangehenden Abschnitt.
  else if (/^\s*\d{1,2}\s*\.\s*$/.test(body[i])) bookMarks.push(i);
  // Wilhelms Kommentarbloecke beginnen mit einer Initiale, die im Satz als
  // grosser Einzelbuchstabe auf eigener Zeile steht ("D" + "er 3. Abschnitt…").
  // Auch sie beendet den vorangehenden Abschnitt.
  else if (/^\s*[A-ZÄÖÜ]\s*$/.test(body[i])) bookMarks.push(i);
}

/**
 * Sucht die Zeile, deren Ueberschrift am besten zur Vorlage passt.
 * `after` erzwingt, dass der Treffer hinter der vorigen Geschichte liegt:
 * STORIES steht in Buchreihenfolge, also muessen die Fundstellen monoton
 * aufsteigen. Ohne diese Schranke greift der Aehnlichkeitsvergleich bei
 * beschaedigten Ueberschriften gelegentlich auf eine aehnlich lautende
 * Stelle in einem ganz anderen Buch.
 */
function findHeading(story, after = -1) {
  if (story.anchor) {
    const hits = [];
    for (let i = 0; i < body.length; i += 1) {
      if (body[i].includes(story.anchor)) hits.push(i);
    }
    if (hits.length !== 1) {
      fail(`Anker "${story.anchor}" trifft ${hits.length} Zeilen — er muss eindeutig sein`);
    }
    return { score: 1, line: hits[0] };
  }

  let best = { score: 0, line: -1 };
  for (const line of headings) {
    if (line <= after) continue;
    // Angeklebte Kolumnentitel ("… Buch ffl") vor dem Vergleich abschneiden.
    const text = body[line]
      .replace(/\s+Buch\s+\S+\s*$/i, "")
      .replace(/^[^\d]*?(?=\d)/, "");
    const score = similarity(key(text), key(story.source));
    if (score > best.score) best = { score, line };
  }
  return best;
}

/** Ende eines Abschnitts: naechste Ueberschrift oder naechste Buchmarke. */
function sectionEnd(start) {
  const nextHeading = headings.find((i) => i > start) ?? body.length;
  // +2: eine durch Silbentrennung umgebrochene Ueberschrift steht noch in
  // Versalien und darf den Abschnitt nicht sofort beenden.
  const nextBook = bookMarks.find((i) => i > start + 2) ?? body.length;
  return Math.min(nextHeading, nextBook);
}

/* --- Bereinigung --------------------------------------------------------- */

/** Zeilen, die kein Fliesstext sind: Seitenzahlen, Kolumnentitel, Scan-Rauschen. */
function isNoise(line) {
  const t = line.trim();
  if (t === "") return true;
  if (/^[\d\s.,*'"|_–—-]+$/.test(t)) return true;          // reine Zahlen-/Zeichenzeilen
  if (/^[^a-zäöüß]*BUCH\b/i.test(t) && t.length < 40) return true;  // Kolumnentitel
  // Zeilen fast ohne Kleinbuchstaben sind Zierleisten oder Versalien-Rauschen.
  const letters = t.replace(/[^A-Za-zÄÖÜäöüß]/g, "");
  if (letters.length >= 3 && letters.replace(/[a-zäöüß]/g, "").length / letters.length > 0.8) {
    return true;
  }
  if (letters.length < 3) return true;
  return false;
}

/**
 * Einzelne Normalisierungsschritte. Sie greifen ineinander: Entfernt man ein
 * Fussnotenzeichen, kann dadurch erst eine Trennstelle sichtbar werden, und
 * das Trennen von Woertern legt Kolumnentitel frei. Statt eine perfekte
 * Reihenfolge zu suchen, laeuft cleanUp die Schritte bis zur Stabilitaet.
 */
function cleanUpOnce(text) {
  return (
    text
      // Doppelte Spatien der Texterkennung zusammenziehen.
      .replace(/[ \t]+/g, " ")
      // Fussnotenzeichen: im Satz als hochgestellte Ziffer gedruckt, von der
      // Texterkennung als Ziffer, Gradzeichen oder Zirkumflex wiedergegeben.
      .replace(/\s*[\^]+["'°,]?[\d°*]{0,3}/g, "")
      .replace(/(\p{L})\s*[\d°*]{1,3}(?=[\s,.;:!?"„“]|$)/gu, "$1")
      // Am Zeilenende getrennte Woerter zusammenfuegen. Laeuft bewusst NACH
      // dem Entfernen der Fussnotenzeichen: stand eines zwischen Trennstrich
      // und Wortrest, entsteht die Trennstelle erst dadurch.
      .replace(/(\p{L})-\s+(\p{Ll})/gu, "$1$2")
      // Spatium vor Satzzeichen.
      .replace(/\s+([,.;:!?])/g, "$1")

      // Anfuehrungszeichen und Gedankenstriche normalisieren.
      .replace(/\s*"\s*/g, '"')
      // Fehlendes Spatium nach schliessendem Anfuehrungszeichen — muss nach
      // deren Normalisierung laufen, sonst wird es gleich wieder entfernt.
      .replace(/"(?=\p{Lu})/gu, '" ')
      // Zusammengezogene Woerter ("nachBalken"): im Deutschen steht mitten
      // im Wort kein Grossbuchstabe.
      .replace(/(\p{Ll})(\p{Lu})/gu, "$1 $2")
      // Kolumnentitel ("… Buch I"); "Budi" ist die haeufige Fehllesung von
      // "Buch". Laeuft bewusst NACH dem Worttrennen: in der Vorlage klebt der
      // Titel teils ohne Spatium am Text ("BudiXIII").
      .replace(/\s*(?:Buch|Budi|Budb)\s+[IVXLCivxlc1]+(?=\s|$)/g, " ")
      // Durch den Zeilenumbruch gesprengte Bindestrich-Komposita ("So- Sein").
      .replace(/(\p{L})-\s+(\p{Lu})/gu, "$1-$2")
      // Vereinzelte Fussnotenziffern zwischen zwei Woertern.
      .replace(/([,.;:!?"])\s+\d{1,2}\s+(?=\p{Lu})/gu, "$1 ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/** Wendet die Normalisierung an, bis sich nichts mehr aendert. */
function cleanUp(text) {
  let current = text;
  for (let pass = 0; pass < 5; pass += 1) {
    const next = cleanUpOnce(current);
    if (next === current) return next;
    current = next;
  }
  return current;
}

/**
 * Zierleisten am Kapitelende werden als sinnlose Zeichenfolgen erkannt.
 * Merkmal: lang, aber ohne brauchbares Vokal-Konsonant-Verhaeltnis.
 */
function isGibberish(token) {
  const letters = token.replace(/[^\p{L}]/gu, "");
  if (letters.length < 6) return false;
  const vowels = (letters.match(/[aeiouäöüAEIOUÄÖÜ]/g) ?? []).length;
  const ratio = vowels / letters.length;
  const junk = (token.match(/[^\p{L}\s]/gu) ?? []).length / token.length;
  return ratio > 0.72 || ratio < 0.1 || junk > 0.3;
}

/** Entfernt Zierleisten-Reste, wo immer sie im Abschnitt auftauchen. */
function dropGibberish(text) {
  return text
    .split(" ")
    .filter((token) => !isGibberish(token))
    .join(" ");
}

/** Wendet die systematischen Lesekorrekturen wortweise an. */
function applyOcrFixes(text) {
  let out = text;
  for (const [wrong, right] of OCR_FIXES) {
    out = out.replace(new RegExp(`(?<![\\p{L}])${wrong}(?![\\p{L}])`, "gu"), right);
  }
  return out;
}

/* --- Extraktion ---------------------------------------------------------- */

mkdirSync(OUT_DIR, { recursive: true });

const report = [];
let previousLine = -1;
for (const story of STORIES) {
  const { score, line } = findHeading(story, previousLine);
  if (score < 0.6) fail(`Ueberschrift fuer "${story.title}" nicht gefunden (beste Uebereinstimmung ${score.toFixed(2)})`);
  if (score < 0.85) console.warn(`  WARNUNG: schwache Uebereinstimmung ${score.toFixed(2)} bei "${story.title}" (Z. ${line + 1}) — pruefen`);
  previousLine = line;

  const end = sectionEnd(line);
  const kept = body.slice(line + 1, end).filter((l) => !isNoise(l));
  if (kept.length === 0) fail(`kein Text fuer "${story.title}"`);

  let text = dropGibberish(applyOcrFixes(cleanUp(kept.join(" "))));

  for (const [wrong, right] of CORRECTIONS[story.slug] ?? []) {
    if (!text.includes(wrong)) {
      console.warn(`  WARNUNG: Korrektur "${wrong}" greift nicht mehr in ${story.slug}`);
      continue;
    }
    text = text.replaceAll(wrong, right);
  }

  report.push({ story, line: line + 1, score, text });
}

/* --- Schreiben ----------------------------------------------------------- */

function frontmatter(story, text) {
  const summary = `${text.slice(0, 110).replace(/\s\S*$/, "")} …`;
  return [
    "---",
    `title: ${story.title}`,
    `summary: ${JSON.stringify(summary)}`,
    `book: ${story.book}`,
    `source: ${JSON.stringify(story.source)}`,
    `chapters: [${story.chapters.join(", ")}]`,
    `order: ${story.order}`,
    "---",
    "",
  ].join("\n");
}

for (const { story, text } of report) {
  writeFileSync(join(OUT_DIR, `${story.slug}.md`), `${frontmatter(story, text)}${text}\n`, "utf8");
}

for (const { story, line, score, text } of report) {
  const words = text.split(/\s+/).length;
  console.log(`  ${story.book.padEnd(11)} ${story.title.padEnd(32)} Z.${String(line).padStart(5)}  ${score.toFixed(2)}  ${String(words).padStart(4)} Woerter`);
}
console.log(`\n  ${report.length} Geschichten nach src/content/stories/ geschrieben.`);
