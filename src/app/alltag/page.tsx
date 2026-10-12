import type { Metadata } from "next";
import ArticleCard from "@/components/ArticleCard";
import { getEverydayTopics } from "@/lib/content";
import styles from "../section.module.css";

export const metadata: Metadata = {
  title: "Im Alltag",
  description:
    "Wie sich die Gedanken des Daodejing im Alltag anwenden lassen — mit konkreten Übungen und Reflexionsfragen.",
};

export default function EverydayIndexPage() {
  const topics = getEverydayTopics();

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Im Alltag</h1>
        <p className={styles.subtitle}>
          Kein Kommentar zum Text, sondern der Versuch, ihn zu gebrauchen. Jedes Thema geht
          von einzelnen Kapiteln aus und endet mit einer Übung für die Woche.
        </p>
      </header>

      <ul className={styles.list}>
        {topics.map((topic) => (
          <li key={topic.slug}>
            <ArticleCard
              href={`/alltag/${topic.slug}`}
              title={topic.title}
              summary={topic.summary}
              meta={[`Kapitel ${topic.chapters.join(", ")}`]}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
