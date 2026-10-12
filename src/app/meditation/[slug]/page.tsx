import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleBody from "@/components/ArticleBody";
import ChapterReferences from "@/components/ChapterReferences";
import PracticeTimer from "@/components/PracticeTimer";
import { getMeditations } from "@/lib/content";
import { parseDuration } from "@/lib/duration";
import styles from "../../section.module.css";
import PageLink from "@/components/PageLink";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getMeditations().map((meditation) => ({ slug: meditation.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meditation = getMeditations().find((entry) => entry.slug === slug);
  if (!meditation) return { title: "Nicht gefunden" };
  return { title: meditation.title, description: meditation.summary };
}

export default async function MeditationPage({ params }: Props) {
  const { slug } = await params;
  const meditation = getMeditations().find((entry) => entry.slug === slug);
  if (!meditation) notFound();

  const minutes = meditation.timer ? parseDuration(meditation.duration) : [];

  return (
    <article className={styles.article}>
      <header className={styles.articleHeader}>
        <PageLink href="/meditation" className={styles.backLink}>
          Meditation
        </PageLink>
        <h1 className={styles.articleTitle}>{meditation.title}</h1>
        <p className={styles.articleSummary}>{meditation.summary}</p>
        <p className={styles.meta}>
          {meditation.duration}
          <span aria-hidden="true"> · </span>
          {meditation.level === "beginner" ? "Für den Einstieg geeignet" : "Fortgeschritten"}
        </p>
      </header>

      <ArticleBody html={meditation.html} />

      {minutes.length > 0 && <PracticeTimer minutes={minutes} />}

      <ChapterReferences chapters={meditation.chapters} />
    </article>
  );
}
