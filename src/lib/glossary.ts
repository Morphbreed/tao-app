import data from "@/content/glossary.json";
import { getChapter } from "./daodejing";

/**
 * Wilhelm renders several central terms with unusual German words — 道 as
 * "Sinn", 德 as "Leben". Nothing in the translation says so, which leaves the
 * reader stranded on the very first line of chapter 1. These entries say it.
 */
export type GlossaryEntry = {
  slug: string;
  /** Wilhelm's word, as the reader meets it. */
  term: string;
  /** Inflected forms, used to detect the term in a chapter. */
  forms: string[];
  chinese: string;
  pinyin: string;
  /** How the term is usually rendered elsewhere. */
  usual: string;
  text: string;
  /** Chapters where the term carries weight; each verified to contain it. */
  chapters: number[];
};

export const GLOSSARY: GlossaryEntry[] = data as GlossaryEntry[];

/** German letters, so that "Sinn" does not match inside "Sinnes" by accident. */
const LETTER = "A-Za-zÄÖÜäöüß";

const PATTERNS = new Map(
  GLOSSARY.map((entry) => [
    entry.slug,
    new RegExp(
      `(?<![${LETTER}])(${entry.forms.map(escape).join("|")})(?![${LETTER}])`,
      "u"
    ),
  ])
);

/**
 * Escapes a term for use in a pattern. The hyphen is left alone on purpose:
 * outside a character class it needs no escape, and "\-" is an illegal escape
 * under the unicode flag — which "Nicht-Handeln" would otherwise trip over.
 */
function escape(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Terms occurring in a chapter, in the order of the glossary. Runs at build
 * time only — the chapter pages are static.
 */
export function termsInChapter(number: number): GlossaryEntry[] {
  const chapter = getChapter(number);
  if (!chapter) return [];

  return GLOSSARY.filter((entry) => {
    const pattern = PATTERNS.get(entry.slug);
    return pattern ? chapter.lines.some((line) => pattern.test(line)) : false;
  });
}
