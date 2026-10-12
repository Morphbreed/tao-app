import { CHAPTER_COUNT } from "./daodejing";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Picks a chapter deterministically from the date: the same day always yields
 * the same chapter, with no backend and no stored state. Local calendar time
 * is used so the switch happens at midnight in the reader's own time zone.
 */
export function chapterOfTheDay(date: Date = new Date()): number {
  const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysSinceEpoch = Math.floor(localMidnight.getTime() / MS_PER_DAY);
  return (((daysSinceEpoch % CHAPTER_COUNT) + CHAPTER_COUNT) % CHAPTER_COUNT) + 1;
}
