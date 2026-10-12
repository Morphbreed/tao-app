import data from "@/content/daodejing.json";
import type { Chapter } from "./types";

export const CHAPTERS: Chapter[] = data as Chapter[];
export const CHAPTER_COUNT = CHAPTERS.length;

export function getChapter(number: number): Chapter | undefined {
  return CHAPTERS.find((chapter) => chapter.number === number);
}

/** Previous chapter; wraps from 1 back around to 81. */
export function previousChapter(number: number): number {
  return number === 1 ? CHAPTER_COUNT : number - 1;
}

/** Next chapter; wraps from 81 around to 1. */
export function nextChapter(number: number): number {
  return number === CHAPTER_COUNT ? 1 : number + 1;
}

/** First line of a chapter — used as a teaser in overviews. */
export function openingLine(chapter: Chapter): string {
  return chapter.lines[0] ?? "";
}
