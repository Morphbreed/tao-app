import type { Metadata } from "next";
import ArticleCard from "@/components/ArticleCard";
import { getMeditations } from "@/lib/content";
import styles from "../section.module.css";

export const metadata: Metadata = {
  title: "Meditation",
  description:
    "Taoistische Meditationspraktiken — Zuowang, Zhan Zhuang, Atemarbeit, Baduanjin und mehr, jeweils Schritt für Schritt beschrieben.",
};

export default function MeditationIndexPage() {
  const meditations = getMeditations();

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Meditation</h1>
        <p className={styles.subtitle}>
          Taoistische Praktiken zum Nachlesen — vom stillen Sitzen bis zu ruhigen
          Bewegungsfolgen. Jede Beschreibung nennt Haltung, Ablauf und die üblichen
          Stolpersteine.
        </p>
      </header>

      <ul className={styles.list}>
        {meditations.map((meditation) => (
          <li key={meditation.slug}>
            <ArticleCard
              href={`/meditation/${meditation.slug}`}
              title={meditation.title}
              summary={meditation.summary}
              meta={[
                meditation.duration,
                meditation.level === "beginner" ? "Einstieg" : "Fortgeschritten",
              ]}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
