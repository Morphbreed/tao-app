import type { Chapter } from "@/lib/types";
import styles from "./ChapterText.module.css";

/**
 * Renders the lines of a chapter. The translation's line breaks are preserved
 * because they carry meaning in the Daodejing.
 */
export default function ChapterText({ chapter }: { chapter: Chapter }) {
  return (
    <div className={styles.lines}>
      {chapter.lines.map((line, index) => (
        // Lines can repeat within a chapter, so the index is the right key.
        <p key={index} className={styles.line}>
          {line}
        </p>
      ))}
    </div>
  );
}
