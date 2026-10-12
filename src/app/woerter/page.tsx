import type { Metadata } from "next";
import { GLOSSARY } from "@/lib/glossary";
import styles from "./page.module.css";
import PageLink from "@/components/PageLink";

export const metadata: Metadata = {
  title: "Wilhelms Wörter",
  description:
    "Richard Wilhelm übersetzt 道 als „Sinn“ und 德 als „Leben“. Was die zentralen Begriffe seiner Daodejing-Übersetzung bedeuten.",
};

export default function GlossaryPage() {
  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Wilhelms Wörter</h1>
        <p className={styles.subtitle}>
          Diese Übersetzung ist über hundert Jahre alt, und sie trifft einige eigenwillige
          Entscheidungen. Wer Kapitel 1 aufschlägt und liest „Der Sinn, der sich aussprechen
          läßt“, ahnt nicht, dass dort das Wort steht, das über dieser App als 道 geschrieben
          ist. Zehn Begriffe, die das Lesen leichter machen.
        </p>
      </header>

      <dl className={styles.list}>
        {GLOSSARY.map((entry) => (
          <div key={entry.slug} id={entry.slug} className={styles.entry}>
            <dt className={styles.term}>
              <span className={styles.word}>{entry.term}</span>
              <span className={styles.original}>
                <span lang="zh-Hant" className={styles.chinese}>
                  {entry.chinese}
                </span>
                <span className={styles.pinyin}>{entry.pinyin}</span>
              </span>
            </dt>
            <dd className={styles.body}>
              <p className={styles.usual}>sonst übersetzt als: {entry.usual}</p>
              <p className={styles.text}>{entry.text}</p>
              <p className={styles.chapters}>
                {entry.chapters.map((number, index) => (
                  <span key={number}>
                    {index > 0 && <span aria-hidden="true"> · </span>}
                    <PageLink href={`/daodejing/${number}`} className={styles.chapterLink}>
                      Kapitel {number}
                    </PageLink>
                  </span>
                ))}
              </p>
            </dd>
          </div>
        ))}
      </dl>

      <p className={styles.caveat}>
        Die chinesischen Zeichen stehen hier zur Orientierung, nicht als Beweis. Wilhelms
        Deutsch ist eine Lesart unter mehreren — das ist kein Mangel der Übersetzung,
        sondern die Lage bei einem Text, dessen erste Zeile bestreitet, dass er sich
        aussprechen lässt.
      </p>
    </>
  );
}
