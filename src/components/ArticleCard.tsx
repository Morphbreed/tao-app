import styles from "./ArticleCard.module.css";
import PageLink from "@/components/PageLink";

type Props = {
  href: string;
  title: string;
  summary: string;
  /** Small extras such as duration or referenced chapters. */
  meta?: string[];
};

/** Entry in the Meditation and Everyday overview lists. */
export default function ArticleCard({ href, title, summary, meta = [] }: Props) {
  return (
    <PageLink href={href} className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.summary}>{summary}</p>
      {meta.length > 0 && (
        <p className={styles.meta}>
          {meta.map((entry, index) => (
            <span key={entry}>
              {index > 0 && <span aria-hidden="true"> · </span>}
              {entry}
            </span>
          ))}
        </p>
      )}
    </PageLink>
  );
}
