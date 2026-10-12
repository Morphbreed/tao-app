/**
 * Reads the minute values out of a meditation's `duration` frontmatter field.
 *
 * The field is prose written for the reader ("10–20 Minuten"), not a machine
 * format, so the numbers are picked out rather than parsed strictly. A range
 * yields both ends as separate choices; anything without a number yields an
 * empty list, which means the practice gets no timer.
 */
export function parseDuration(value: string): number[] {
  const minutes = Array.from(value.matchAll(/\d+/g), (match) => Number(match[0]))
    .filter((minute) => minute > 0 && minute <= 120);

  return Array.from(new Set(minutes)).sort((a, b) => a - b);
}

/** Wording used on the timer buttons and in the summary line. */
export function formatMinutes(minutes: number): string {
  return `${minutes} Minuten`;
}
