"use client";

import { useSyncExternalStore } from "react";
import { chapterOfTheDay } from "@/lib/chapter-of-the-day";
import { CHAPTERS } from "@/lib/daodejing";
import { getReflection } from "@/lib/reflections";
import styles from "./ChapterOfTheDay.module.css";
import PageLink from "@/components/PageLink";

/** Maximum number of lines shown in the preview. */
const PREVIEW_LINES = 6;

/**
 * Today's date is external state: the static export does not know it at build
 * time, and it changes independently of React. So it is read through
 * useSyncExternalStore rather than set in an effect. Until hydration a
 * placeholder of equal height holds the space, so nothing jumps.
 */
function subscribe(onChange: () => void) {
  // Anyone leaving the app open past midnight sees the new chapter on return.
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function getSnapshot(): number {
  return chapterOfTheDay();
}

function getServerSnapshot(): number | null {
  return null;
}

export default function ChapterOfTheDay() {
  const number = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const chapter = number === null ? null : (CHAPTERS.find((c) => c.number === number) ?? null);
  const reflection = number === null ? undefined : getReflection(number);

  return (
    <section className={styles.block} aria-labelledby="chapter-of-the-day-heading">
      <p id="chapter-of-the-day-heading" className={styles.heading}>
        Kapitel des Tages
      </p>

      <div className={styles.frame}>
        {chapter === null ? (
          <p className={styles.placeholder} aria-hidden="true" />
        ) : (
          <>
            <p className={styles.number}>{chapter.number}</p>
            <div className={styles.lines}>
              {chapter.lines.slice(0, PREVIEW_LINES).map((line, index) => (
                // Lines can repeat, so the index is the right key.
                <p key={index} className={styles.line}>
                  {line}
                </p>
              ))}
              {chapter.lines.length > PREVIEW_LINES && <p className={styles.ellipsis}>…</p>}
            </div>
            {reflection && (
              <div className={styles.reflection}>
                <p className={styles.reflectionHeading}>Zum Betrachten</p>
                <p className={styles.reflectionText}>{reflection}</p>
              </div>
            )}

            <PageLink href={`/daodejing/${chapter.number}`} className={styles.readMore}>
              Ganzes Kapitel lesen
            </PageLink>
          </>
        )}
      </div>
    </section>
  );
}
