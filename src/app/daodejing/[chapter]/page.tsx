import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ChapterTerms from "@/components/ChapterTerms";
import ChapterText from "@/components/ChapterText";
import RelatedArticles from "@/components/RelatedArticles";
import { getBacklinks } from "@/lib/content";
import { CHAPTERS, getChapter, nextChapter, previousChapter } from "@/lib/daodejing";
import styles from "./page.module.css";
import PageLink from "@/components/PageLink";

type Props = { params: Promise<{ chapter: string }> };

export function generateStaticParams() {
  return CHAPTERS.map((chapter) => ({ chapter: String(chapter.number) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapter: raw } = await params;
  const chapter = getChapter(Number(raw));
  if (!chapter) return { title: "Kapitel nicht gefunden" };

  return {
    title: `Daodejing ${chapter.number}`,
    description: chapter.lines.slice(0, 2).join(" "),
  };
}

export default async function ChapterPage({ params }: Props) {
  const { chapter: raw } = await params;
  const number = Number(raw);
  const chapter = getChapter(number);
  if (!chapter) notFound();

  const backlinks = getBacklinks().get(number) ?? [];
  const previous = previousChapter(number);
  const next = nextChapter(number);

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <PageLink href="/daodejing" className={styles.backLink}>
          Daodejing
        </PageLink>
        <p className={styles.number}>{chapter.number}</p>
      </header>

      <ChapterText chapter={chapter} />

      <ChapterTerms chapter={number} />

      <RelatedArticles backlinks={backlinks} />

      <nav className={styles.pager} aria-label="Kapitelnavigation">
        <PageLink href={`/daodejing/${previous}`} className={styles.pagerLink} rel="prev">
          <span className={styles.pagerDirection}>← Vorheriges</span>
          <span className={styles.pagerTarget}>Kapitel {previous}</span>
        </PageLink>
        <PageLink
          href={`/daodejing/${next}`}
          className={`${styles.pagerLink} ${styles.pagerRight}`}
          rel="next"
        >
          <span className={styles.pagerDirection}>Nächstes →</span>
          <span className={styles.pagerTarget}>Kapitel {next}</span>
        </PageLink>
      </nav>
    </article>
  );
}
