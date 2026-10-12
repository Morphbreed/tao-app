import { termsInChapter } from "@/lib/glossary";
import styles from "./ChapterTerms.module.css";
import PageLink from "@/components/PageLink";

/**
 * Names the unusual words Wilhelm uses in this chapter and links them to their
 * explanation. Deliberately below the verse and in small type: it is an aid to
 * reading, not part of the text.
 */
export default function ChapterTerms({ chapter }: { chapter: number }) {
  const terms = termsInChapter(chapter);
  if (terms.length === 0) return null;

  return (
    <p className={styles.terms}>
      <span className={styles.label}>Wilhelms Wörter:</span>{" "}
      {terms.map((entry, index) => (
        <span key={entry.slug}>
          {index > 0 && <span aria-hidden="true"> · </span>}
          <PageLink href={`/woerter#${entry.slug}`} className={styles.link}>
            {entry.term}
          </PageLink>
        </span>
      ))}
    </p>
  );
}
