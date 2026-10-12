import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleBody from "@/components/ArticleBody";
import ChapterReferences from "@/components/ChapterReferences";
import { getEverydayTopics } from "@/lib/content";
import styles from "../../section.module.css";
import PageLink from "@/components/PageLink";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getEverydayTopics().map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = getEverydayTopics().find((entry) => entry.slug === slug);
  if (!topic) return { title: "Nicht gefunden" };
  return { title: topic.title, description: topic.summary };
}

export default async function EverydayPage({ params }: Props) {
  const { slug } = await params;
  const topic = getEverydayTopics().find((entry) => entry.slug === slug);
  if (!topic) notFound();

  return (
    <article className={styles.article}>
      <header className={styles.articleHeader}>
        <PageLink href="/alltag" className={styles.backLink}>
          Im Alltag
        </PageLink>
        <h1 className={styles.articleTitle}>{topic.title}</h1>
        <p className={styles.articleSummary}>{topic.summary}</p>
      </header>

      <ArticleBody html={topic.html} />
      <ChapterReferences chapters={topic.chapters} />
    </article>
  );
}
