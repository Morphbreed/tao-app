import data from "@/content/reflections.json";

/**
 * One question per chapter, shown with the chapter of the day. The questions
 * are written for this app and stand beside Wilhelm's text, not inside it —
 * they quote nobody and speak for nobody.
 */
type Reflection = { chapter: number; question: string };

export const REFLECTIONS: Reflection[] = data as Reflection[];

export function getReflection(chapter: number): string | undefined {
  return REFLECTIONS.find((entry) => entry.chapter === chapter)?.question;
}
