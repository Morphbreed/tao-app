import data from "@/content/themes.json";

/**
 * A way into the 81 chapters other than counting. Each theme names chapters
 * that carry it; a chapter may belong to several, and every chapter belongs to
 * at least one.
 */
export type Theme = {
  slug: string;
  /** Shown to the reader, therefore German. */
  label: string;
  chapters: number[];
};

export const THEMES: Theme[] = data as Theme[];

/** Chapter numbers covered by any of the given themes. */
export function chaptersOfThemes(slugs: string[]): Set<number> {
  const selected = new Set(slugs);
  const chapters = new Set<number>();

  for (const theme of THEMES) {
    if (!selected.has(theme.slug)) continue;
    for (const chapter of theme.chapters) chapters.add(chapter);
  }

  return chapters;
}
