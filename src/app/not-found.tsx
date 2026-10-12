import PageLink from "@/components/PageLink";

export default function NotFoundPage() {
  return (
    <div style={{ maxWidth: "34rem" }}>
      <h1 style={{ fontSize: "1.875rem", marginBottom: "1rem" }}>Nichts gefunden</h1>
      <p style={{ color: "var(--ink-muted)" }}>
        Diese Seite gibt es nicht. Vielleicht hilft der Weg zurück zum{" "}
        <PageLink href="/daodejing">Daodejing</PageLink> oder zur{" "}
        <PageLink href="/">Startseite</PageLink>.
      </p>
    </div>
  );
}
