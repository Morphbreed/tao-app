#!/usr/bin/env node
/**
 * Extracts the 81 chapters of the Daodejing from the source PDF into
 * src/content/daodejing.json.
 *
 * Source: Laozi, Daodejing, translated by Richard Wilhelm
 *         (Jena: Diederichs 1910) — public domain.
 *         Typeset: METIS German Classics, Zurich 2023.
 *
 * Method: pdftotext produces a text rendering in which both chapter numbers
 * and page numbers appear as standalone numeric lines. They are told apart by
 * a counter: a standalone number is a chapter number exactly when it equals
 * the next expected chapter number. Chapters run strictly upward 1..81 while
 * page numbers run 1..36, which makes the assignment unambiguous.
 *
 * Usage: node scripts/extract-daodejing.mjs
 * Requires: pdftotext (poppler). The result is committed so that neither the
 * build nor the runtime depends on poppler.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PDF_PATH = join(ROOT, "scripts/source/daodejing-wilhelm.pdf");
const OUTPUT_PATH = join(ROOT, "src/content/daodejing.json");
const CHAPTER_COUNT = 81;

function fail(message) {
  console.error(`\n  FEHLER: ${message}\n`);
  process.exit(1);
}

let raw;
try {
  raw = execFileSync("pdftotext", [PDF_PATH, "-"], { encoding: "utf8" });
} catch (cause) {
  fail(
    `pdftotext konnte nicht ausgefuehrt werden (${cause.message}).\n` +
      `  Unter Arch Linux: sudo pacman -S poppler`
  );
}

const chapters = [];
let expected = 1;
let current = null;

for (const rawLine of raw.split("\n")) {
  const line = rawLine.trim();

  if (/^\d{1,3}$/.test(line)) {
    const value = Number(line);
    if (value === expected && expected <= CHAPTER_COUNT) {
      // A new chapter heading.
      current = { number: value, lines: [] };
      chapters.push(current);
      expected += 1;
      continue;
    }
    // Otherwise: a page number from the footer — discard.
    continue;
  }

  if (line === "") continue;
  // Everything before chapter 1 is front matter (title, translator credit).
  if (current) current.lines.push(line);
}

// --- Self-check -----------------------------------------------------------
if (chapters.length !== CHAPTER_COUNT) {
  const present = new Set(chapters.map((chapter) => chapter.number));
  const missing = [];
  for (let n = 1; n <= CHAPTER_COUNT; n += 1) {
    if (!present.has(n)) missing.push(n);
  }
  fail(
    `${chapters.length} statt ${CHAPTER_COUNT} Kapitel gefunden. ` +
      `Fehlend: ${missing.join(", ") || "—"}`
  );
}

const empty = chapters.filter((chapter) => chapter.lines.length === 0).map((c) => c.number);
if (empty.length > 0) fail(`Kapitel ohne Text: ${empty.join(", ")}`);

for (const [index, chapter] of chapters.entries()) {
  if (chapter.number !== index + 1) {
    fail(`Kapitel stehen nicht in Reihenfolge (bei Position ${index + 1}).`);
  }
}

// --- Write ----------------------------------------------------------------
mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, `${JSON.stringify(chapters, null, 2)}\n`, "utf8");

const lineCount = chapters.reduce((total, chapter) => total + chapter.lines.length, 0);
console.log(`  ${chapters.length} Kapitel extrahiert (${lineCount} Verszeilen).`);
console.log(`  geschrieben nach src/content/daodejing.json`);
