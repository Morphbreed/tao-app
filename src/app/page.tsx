import ChapterOfTheDay from "@/components/ChapterOfTheDay";
import { getEverydayTopics, getMeditations, getStories } from "@/lib/content";
import { CHAPTER_COUNT } from "@/lib/daodejing";
import styles from "./page.module.css";
import PageLink from "@/components/PageLink";

export default function HomePage() {
  const meditations = getMeditations();
  const everyday = getEverydayTopics();
  const stories = getStories();

  const sections = [
    {
      href: "/daodejing",
      title: "Daodejing",
      text: `Alle ${CHAPTER_COUNT} Kapitel in der Übersetzung von Richard Wilhelm.`,
    },
    {
      href: "/meditation",
      title: "Meditation",
      text: `${meditations.length} taoistische Praktiken, Schritt für Schritt beschrieben.`,
    },
    {
      href: "/geschichten",
      title: "Geschichten",
      text: `${stories.length} Stücke aus Dschuang Dsi — was das Daodejing behauptet, erzählen sie.`,
    },
    {
      href: "/alltag",
      title: "Im Alltag",
      text: `${everyday.length} Themen, die zeigen, wie sich die Kapitel anwenden lassen.`,
    },
  ];

  return (
    <>
      <section className={styles.intro}>
        <h1 className={styles.title}>Tao</h1>
        <p className={styles.subtitle}>
          Das Daodejing zum Nachlesen, taoistische Meditationspraktiken und Anregungen,
          wie sich beides im Alltag anwenden lässt.
        </p>
      </section>

      <ChapterOfTheDay />

      <nav className={styles.sections} aria-label="Bereiche">
        {sections.map((section) => (
          <PageLink key={section.href} href={section.href} className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            <p className={styles.sectionText}>{section.text}</p>
          </PageLink>
        ))}
      </nav>
    </>
  );
}
