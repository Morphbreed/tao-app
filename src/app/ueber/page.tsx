import type { Metadata } from "next";
import { CHAPTER_COUNT } from "@/lib/daodejing";
import styles from "./page.module.css";
import PageLink from "@/components/PageLink";

export const metadata: Metadata = {
  title: "Über diese App",
  description: "Quellen, Übersetzung und Hinweise zu dieser App.",
};

export default function AboutPage() {
  return (
    <article className={styles.page}>
      <h1 className={styles.title}>Über diese App</h1>

      <p>
        Diese App versammelt drei Dinge: den vollständigen Text des Daodejing,
        Beschreibungen taoistischer Meditationspraktiken und Anregungen, wie sich beides
        im Alltag anwenden lässt.
      </p>

      <h2 className={styles.heading}>Der Text</h2>
      <p>
        Die {CHAPTER_COUNT} Kapitel stehen in der deutschen Übersetzung von{" "}
        <strong>Richard Wilhelm</strong>, erschienen 1910 bei Eugen Diederichs in Jena.
        Wilhelm starb 1930; die Übersetzung ist damit gemeinfrei und darf frei
        weitergegeben werden.
      </p>
      <p>
        Grundlage der hier verwendeten Textfassung ist die Ausgabe der Reihe{" "}
        <em>METIS German Classics</em> (Zürich 2023). Die Zeilenumbrüche der Übersetzung
        wurden beibehalten, weil sie zur Lesart gehören.
      </p>

      <p>
        Wilhelms Wortwahl ist eigenwillig: Er übersetzt 道 als „Sinn“ und 德 als „Leben“ —
        zusammen über hundertdreißig Stellen im Buch. Ohne diesen Schlüssel liest sich
        schon der erste Satz falsch.{" "}
        <PageLink href="/woerter" className={styles.link}>
          Die wichtigsten Begriffe sind eigens erklärt.
        </PageLink>
      </p>

      <h2 className={styles.heading}>Die Geschichten</h2>
      <p>
        Der Bereich „Geschichten“ bringt eine Auswahl aus dem{" "}
        <em>Wahren Buch vom südlichen Blütenland</em> des Dschuang Dsi, ebenfalls in
        Wilhelms Übersetzung, erschienen 1912 bei Diederichs in Jena. Auch sie ist
        gemeinfrei. Der Wortlaut ist unverändert übernommen; unter jedem Stück steht,
        aus welchem Buch es stammt und welche Überschrift es in der Quelle trägt.
      </p>
      <p>
        Grundlage ist der Scan der Erstausgabe beim{" "}
        <em>Internet Archive</em>. Dessen maschinelle Texterkennung liest den alten
        Satz an manchen Stellen falsch; die wiederkehrenden Verwechslungen sind
        dokumentiert und werden beim Erzeugen der Texte behoben.
      </p>
      <p>
        Es ist bewusst eine Auswahl und nicht das ganze Werk: gesammelt sind die
        Erzählungen, die zu den Kapiteln sprechen, die diese App ohnehin führt.
      </p>

      <h2 className={styles.heading}>Meditation und Alltag</h2>
      <p>
        Die Texte in diesen beiden Bereichen sind eigene Formulierungen. Sie beschreiben
        überlieferte Praktiken und stützen sich auf einzelne Kapitel des Daodejing, die
        jeweils verlinkt sind. Sie sind als Lesehilfe gedacht, nicht als Lehre.
      </p>
      <p>
        Zu den meisten Meditationen gehört ein stiller Übungsbegleiter: ein leiser Ton am
        Anfang und am Ende, dazwischen nichts. Er zählt nichts mit und hält nichts fest.
      </p>

      <h2 className={styles.heading}>Suche und Themen</h2>
      <p>
        Die Kapitelübersicht lässt sich durchsuchen und über Themen einschränken —
        Wasser, Leere, Führen, Genügen und weitere. Die Themenzuordnung ist eine Lesart
        dieser App, keine Einteilung des Textes selbst; die meisten Kapitel stehen unter
        mehreren davon. Gesucht wird im Wortlaut der Übersetzung, im Browser und ohne
        Verbindung nach außen.
      </p>
      <p>
        Unter dem Kapitel des Tages steht jeweils eine Frage. Auch sie ist eine eigene
        Formulierung und kein Teil des Daodejing.
      </p>

      <h2 className={styles.heading}>Hinweis</h2>
      <p>
        Die beschriebenen Übungen ersetzen keine ärztliche oder therapeutische Behandlung.
        Wer gesundheitliche Beschwerden hat — besonders an Knie, Rücken, Kreislauf oder
        Atemwegen —, klärt körperliche Übungen besser vorher ärztlich ab.
      </p>

      <h2 className={styles.heading}>Technisches</h2>
      <p>
        Die App funktioniert ohne Konto und ohne Server. Sie speichert nach wie vor nur
        eine einzige Einstellung lokal im Browser: die Wahl zwischen hellem und dunklem
        Lesemodus. Suchbegriffe, gewählte Themen und Übungszeiten bleiben im Arbeitsspeicher
        und sind nach dem Schließen fort. Es werden keine Daten erhoben und keine externen
        Dienste eingebunden.
      </p>
      <p>
        Nach dem ersten Besuch lässt sich die App auf dem Startbildschirm installieren und
        offline weiterlesen.
      </p>
    </article>
  );
}
