import type { Metadata, Viewport } from "next";
import ServiceWorkerStatus from "@/components/ServiceWorkerStatus";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import ThemeColor from "@/components/ThemeColor";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";
import styles from "./layout.module.css";
import PageLink from "@/components/PageLink";

export const metadata: Metadata = {
  title: {
    default: "Tao — Daodejing, Meditation, Alltag",
    template: "%s · Tao",
  },
  description:
    "Das Daodejing in der Übersetzung von Richard Wilhelm, taoistische Meditationspraktiken und Anregungen, wie sich beides im Alltag anwenden lässt.",
  applicationName: "Tao",
  appleWebApp: {
    capable: true,
    title: "Tao",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  /* Laesst die Seite unter die Systemleisten reichen. Ohne das faerbt Android
     den Streifen hinter der Navigationsleiste aus dem Manifest — und die eine
     feste Farbe dort kann dem Dunkelmodus nicht folgen. */
  viewportFit: "cover",
  /* Kein themeColor hier. Metaangaben mit Medienabfrage folgen der
     SYSTEMeinstellung und wissen nichts vom eigenen Umschalter — und sie
     stehen schon im Dokument, bevor React laeuft. Seit jeder Klick eine ganze
     Seite neu aufbaut, faerbte Android die Systemleiste dadurch bei jedem
     Wechsel kurz hell. Die Farbe setzt darum THEME_SCRIPT, noch vor dem ersten
     Anstrich, dort wo das Thema ohnehin entschieden wird. */
};

/**
 * Applies the stored theme before the first frame is painted.
 * Without this the wrong color scheme flashes briefly on load.
 */
/**
 * Applies the stored theme before the first frame is painted, and colours the
 * browser's own surfaces to match. Without the second part the system bars at
 * the edges of the screen keep the light colour under a dark page.
 *
 * The values must stay in step with --paper in globals.css and with
 * THEME_BACKGROUND in @/lib/theme.
 */
const THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('tao-theme');
    var dark = stored === 'dark' ||
      (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (stored === 'dark' || stored === 'light') {
      document.documentElement.dataset.theme = stored;
    }

    var meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = dark ? '#161614' : '#f7f4ee';
    document.head.appendChild(meta);
  } catch (e) {}
})();
`;

const NAV_ITEMS = [
  { href: "/daodejing", label: "Daodejing" },
  { href: "/meditation", label: "Meditation" },
  { href: "/geschichten", label: "Geschichten" },
  { href: "/alltag", label: "Alltag" },
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a href="#content" className={styles.skipLink}>
          Zum Inhalt springen
        </a>

        <header className={styles.header}>
          <div className={styles.headerInner}>
            <PageLink href="/" className={styles.brand}>
              <span className={styles.brandMark} aria-hidden="true">
                道
              </span>
              <span className={styles.brandText}>Tao</span>
            </PageLink>

            <nav className={styles.nav} aria-label="Hauptbereiche">
              {NAV_ITEMS.map((item) => (
                <PageLink key={item.href} href={item.href} className={styles.navLink}>
                  {item.label}
                </PageLink>
              ))}
            </nav>

            <ThemeToggle />
          </div>
        </header>

        <main id="content" className={styles.content}>
          {children}
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <p className={styles.footerText}>
              Daodejing in der Übersetzung von Richard Wilhelm (1910) — gemeinfrei.
            </p>
            <PageLink href="/ueber" className={styles.footerLink}>
              Über diese App
            </PageLink>
          </div>
        </footer>

        <ThemeColor />
        <ServiceWorkerRegistration />
        <ServiceWorkerStatus />
      </body>
    </html>
  );
}
