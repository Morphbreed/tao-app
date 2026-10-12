import type { Metadata } from "next";
import ArticleCard from "@/components/ArticleCard";
import { getStories } from "@/lib/content";
import styles from "../section.module.css";

export const metadata: Metadata = {
  title: "Geschichten",
  description:
    "Ausgewählte Geschichten aus Dschuang Dsi in der Übersetzung von Richard Wilhelm (1912) — der Koch, der unnütze Baum, der Schmetterlingstraum.",
};

export default function StoriesIndexPage() {
  const stories = getStories();

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Geschichten</h1>
        <p className={styles.subtitle}>
          Das Daodejing spricht in Sätzen, Dschuang Dsi in Geschichten. {stories.length}{" "}
          Stücke aus dem „Wahren Buch vom südlichen Blütenland“, übersetzt von Richard
          Wilhelm — ein Koch, der einen Ochsen zerlegt, ein Baum, den niemand fällt, weil
          er zu nichts taugt, ein Mann, der nicht mehr weiß, ob er von einem Schmetterling
          geträumt hat oder umgekehrt.
        </p>
      </header>

      <ul className={styles.list}>
        {stories.map((story) => (
          <li key={story.slug}>
            <ArticleCard
              href={`/geschichten/${story.slug}`}
              title={story.title}
              summary={story.summary}
              meta={[story.book]}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
