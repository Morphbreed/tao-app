import type { Metadata } from "next";
import ChapterFinder from "@/components/ChapterFinder";
import { CHAPTERS } from "@/lib/daodejing";
import styles from "./page.module.css";
import PageLink from "@/components/PageLink";

export const metadata: Metadata = {
  title: "Daodejing",
  description:
    "Alle 81 Kapitel des Daodejing in der Übersetzung von Richard Wilhelm (1910).",
};

export default function DaodejingIndexPage() {
  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Daodejing</h1>
        <p className={styles.subtitle}>
          {CHAPTERS.length} Kapitel, übersetzt von Richard Wilhelm. Durchsuchbar, und über
          Themen erschlossen. Wilhelm schreibt „Sinn“, wo sonst „Tao“ steht —{" "}
          <PageLink href="/woerter" className={styles.subtitleLink}>
            seine Wörter erklärt
          </PageLink>
          .
        </p>
      </header>

      <ChapterFinder />
    </>
  );
}
