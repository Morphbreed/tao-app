import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleBody from "@/components/ArticleBody";
import ChapterReferences from "@/components/ChapterReferences";
import { getStories } from "@/lib/content";
import styles from "../../section.module.css";
import PageLink from "@/components/PageLink";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getStories().map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = getStories().find((entry) => entry.slug === slug);
  if (!story) return { title: "Nicht gefunden" };
  return { title: story.title, description: story.summary };
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params;
  const story = getStories().find((entry) => entry.slug === slug);
  if (!story) notFound();

  return (
    <article className={styles.article}>
      <header className={styles.articleHeader}>
        <PageLink href="/geschichten" className={styles.backLink}>
          Geschichten
        </PageLink>
        <h1 className={styles.articleTitle}>{story.title}</h1>
        <p className={styles.meta}>
          Dschuang Dsi, {story.book}
          <span aria-hidden="true"> · </span>
          übersetzt von Richard Wilhelm, 1912
        </p>
      </header>

      <ArticleBody html={story.html} />

      <p className={styles.provenance}>
        Überschrift in der Quelle: „{story.source}“. Die Übersetzung ist gemeinfrei; der
        Wortlaut ist unverändert übernommen.
      </p>

      <ChapterReferences chapters={story.chapters} />
    </article>
  );
}
