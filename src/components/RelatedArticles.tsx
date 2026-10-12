import { SECTION_LABEL, SECTION_PATH } from "@/lib/sections";
import type { Backlink } from "@/lib/types";
import styles from "./RelatedArticles.module.css";
import PageLink from "@/components/PageLink";

/** Shows the articles that reference the chapter currently being read. */
export default function RelatedArticles({ backlinks }: { backlinks: Backlink[] }) {
  if (backlinks.length === 0) return null;

  return (
    <section className={styles.block} aria-labelledby="related-heading">
      <h2 id="related-heading" className={styles.heading}>
        Dazu passend
      </h2>
      <ul className={styles.list}>
        {backlinks.map((link) => (
          <li key={`${link.section}/${link.slug}`}>
            <PageLink href={`${SECTION_PATH[link.section]}/${link.slug}`} className={styles.item}>
              <span className={styles.itemSection}>{SECTION_LABEL[link.section]}</span>
              <span className={styles.itemTitle}>{link.title}</span>
              <span className={styles.itemSummary}>{link.summary}</span>
            </PageLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
