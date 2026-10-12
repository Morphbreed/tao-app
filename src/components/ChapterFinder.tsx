"use client";

import { useMemo, useState } from "react";
import { CHAPTERS, openingLine } from "@/lib/daodejing";
import { fold } from "@/lib/search";
import { chaptersOfThemes, THEMES } from "@/lib/themes";
import styles from "./ChapterFinder.module.css";
import PageLink from "@/components/PageLink";

type Result = { number: number; line: string };

/**
 * Two ways into the 81 chapters besides counting: a theme register and a plain
 * full-text search.
 *
 * Everything happens in the browser. The chapters already travel to the client
 * for the chapter of the day, so searching them costs no extra download — and
 * it keeps working offline, which a server-side search would not.
 */
export default function ChapterFinder() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  // Folding all 81 chapters once, not on every keystroke.
  const haystack = useMemo(() => CHAPTERS.map((chapter) => chapter.lines.map(fold)), []);
  const allowed = useMemo(
    () => (selected.length === 0 ? null : chaptersOfThemes(selected)),
    [selected]
  );

  const needle = fold(query.trim());

  const results = useMemo(() => {
    const found: Result[] = [];

    CHAPTERS.forEach((chapter, index) => {
      if (allowed && !allowed.has(chapter.number)) return;

      if (!needle) {
        found.push({ number: chapter.number, line: openingLine(chapter) });
        return;
      }

      // Show the line that matched rather than the opening line — otherwise the
      // reader cannot see why a chapter is in the list.
      const hit = haystack[index].findIndex((line) => line.includes(needle));
      if (hit !== -1) found.push({ number: chapter.number, line: chapter.lines[hit] });
    });

    return found;
  }, [allowed, needle, haystack]);

  const toggle = (slug: string) =>
    setSelected((current) =>
      current.includes(slug) ? current.filter((entry) => entry !== slug) : [...current, slug]
    );

  const filtered = needle.length > 0 || selected.length > 0;

  return (
    <>
      <div className={styles.controls}>
        <input
          type="search"
          className={styles.search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Im Text suchen"
          aria-label="Im Text des Daodejing suchen"
        />

        <div className={styles.themes} role="group" aria-label="Themen">
          {THEMES.map((theme) => (
            <button
              key={theme.slug}
              type="button"
              className={styles.theme}
              aria-pressed={selected.includes(theme.slug)}
              onClick={() => toggle(theme.slug)}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.count} role="status" aria-live="polite">
        {filtered
          ? `${results.length} von ${CHAPTERS.length} Kapiteln`
          : `Alle ${CHAPTERS.length} Kapitel`}
      </p>

      {results.length === 0 ? (
        <p className={styles.empty}>
          Nichts gefunden. Die Suche vergleicht den Wortlaut der Übersetzung — ein anderes
          Wort führt vielleicht weiter.
        </p>
      ) : (
        <ul className={styles.grid}>
          {results.map((result) => (
            <li key={result.number}>
              <PageLink href={`/daodejing/${result.number}`} className={styles.item}>
                <span className={styles.number}>{result.number}</span>
                <span className={styles.line}>{result.line}</span>
              </PageLink>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
