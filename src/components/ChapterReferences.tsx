import { getChapter } from "@/lib/daodejing";
import styles from "./ChapterReferences.module.css";
import PageLink from "@/components/PageLink";

/** Links from an article to the Daodejing chapters it builds on. */
export default function ChapterReferences({ chapters }: { chapters: number[] }) {
  if (chapters.length === 0) return null;

  return (
    <section className={styles.block} aria-labelledby="chapter-refs-heading">
      <h2 id="chapter-refs-heading" className={styles.heading}>
        Zugehörige Kapitel
      </h2>
      <ul className={styles.list}>
        {chapters.map((number) => {
          const chapter = getChapter(number);
          return (
            <li key={number}>
              <PageLink href={`/daodejing/${number}`} className={styles.item}>
                <span className={styles.number}>{number}</span>
                <span className={styles.line}>{chapter?.lines[0] ?? ""}</span>
              </PageLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
