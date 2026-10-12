/*
 * Abmeldung des frueheren Service Workers.
 *
 * Die App hatte einen Worker, der alle Seiten vorhielt, damit sie offline
 * lesbar blieb. Dieser Teil ist entfallen.
 *
 * Diese Datei darf deshalb NICHT einfach geloescht werden: Ein bereits
 * installierter Worker verschwindet nicht dadurch, dass seine Datei fehlt —
 * er laeuft weiter und wuerde fuer immer den alten, zwischengespeicherten
 * Stand ausliefern. Der Browser holt sie von sich aus regelmaessig neu; dann
 * uebernimmt diese Fassung, raeumt alles ab und meldet sich selbst ab.
 *
 * Sie kann entfernt werden, wenn absehbar jedes Geraet sie einmal geladen
 * hat — im Zweifel einfach stehen lassen, sie kostet nichts.
 */

self.addEventListener("install", () => {
  // Nicht auf das Schliessen der alten Seiten warten.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Alles Vorgehaltene verwerfen.
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));

      // Sich selbst abmelden.
      await self.registration.unregister();

      // Offene Seiten neu laden, damit sie ohne Worker weiterlaufen —
      // sonst haengen sie bis zum naechsten Aufruf in der alten Fassung.
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) client.navigate(client.url);
    })()
  );
});

/* Kein fetch-Handler: Anfragen gehen unveraendert ins Netz. */
