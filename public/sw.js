/*
 * Service worker for offline reading.
 *
 * Strategy: what is cached is answered from the cache, and that is the end of
 * the request. No revalidation on the side.
 *
 * That last part was learnt the hard way. Refreshing every hit in the
 * background looks harmless — the answer goes out first, after all — but with
 * a reachable network and an unreachable server every one of those background
 * calls hangs until its deadline. A browser allows roughly six connections per
 * host; after six hanging calls the pool is spent and everything else queues
 * behind them. That, not the cache, was the three to four seconds per tap, and
 * the reason a link needed tapping twice.
 *
 * Nothing is lost by dropping it. The browser fetches this file past the cache
 * and compares it byte for byte, and VERSION is a checksum over the sources —
 * so a changed text brings a new version along by itself.
 *
 * Only what is not cached goes to the network, under a short deadline, with
 * the start page as a last resort.
 *
 * On install everything listed in /precache.json is taken in, so the app is
 * complete offline without having been browsed first. That file is written by
 * scripts/build-precache.mjs from what the build actually produced, and it
 * includes the .txt payloads Next fetches when following a link — without
 * those, offline navigation inside the app fails even though the pages are
 * cached.
 *
 * VERSION is a checksum over the built content, put in by
 * scripts/build-precache.mjs. The browser fetches this file past the cache and
 * compares it byte for byte; a changed checksum is therefore what sets an
 * update going. Unchanged content means identical bytes and nothing happens.
 * A new VERSION drops the old caches once the new one is filled.
 */

/* Replaced at build time. Left as is, every build would look like a new one. */
const VERSION = "__CONTENT_HASH__";
const CACHE_NAME = `tao-${VERSION}`;

/*
 * Der Pfad, unter dem die App liegt — "/" lokal, "/tao-app/" auf GitHub Pages.
 *
 * Abgeleitet aus dem eigenen Geltungsbereich, nicht fest eingetragen: So
 * bleibt diese Datei unveraendert und stimmt an beiden Orten. Der Wert endet
 * immer auf einem Schraegstrich.
 */
const BASE = new URL(self.registration.scope).pathname;

/** Macht aus "daodejing/" die vollstaendige Adresse unter dem Basispfad. */
function path(relative) {
  return `${BASE}${relative}`;
}

/* Fallback if the precache list is unavailable — the bare minimum that keeps
   the first offline visit from coming up empty. */
const SHELL = [
  "",
  "daodejing/",
  "meditation/",
  "alltag/",
  "geschichten/",
  "ueber/",
  "woerter/",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
].map(path);

/* Tells the open pages how far the download has got. During install this
   worker does not control any client yet, so uncontrolled ones are included. */
async function report(done, total) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
  for (const client of clients) client.postMessage({ type: "precache", done, total });
}

/* Hundreds of requests at once would stall the connection; this keeps a steady
   few in flight. A single missing file must never fail the whole install. */
async function addAll(cache, urls) {
  const BATCH = 12;
  let done = 0;

  await report(0, urls.length);
  for (let start = 0; start < urls.length; start += BATCH) {
    const batch = urls.slice(start, start + BATCH);
    await Promise.all(batch.map((url) => cache.add(url).catch(() => undefined)));
    done += batch.length;
    await report(Math.min(done, urls.length), urls.length);
  }
}

async function precacheList() {
  try {
    const response = await fetch(path("precache.json"), { cache: "no-cache" });
    if (!response.ok) return SHELL;
    const urls = await response.json();
    return Array.isArray(urls) && urls.length > 0 ? urls : SHELL;
  } catch {
    return SHELL;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await addAll(cache, await precacheList());
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
      )
      .then(() => self.clients.claim())
  );
});

/* Ceilings for anything that touches the network. Without them an unreachable
   server — reachable network, dead host — makes every request wait for the
   system timeout. That is seconds per tap, and it was the whole complaint. */
const FETCH_TIMEOUT = 2000;

/** Keeps the last few requests so /diagnose can show what actually happened. */
const LOG_SIZE = 60;
const log = [];

function note(path, hit, started) {
  log.push({ path, hit, ms: Math.round(performance.now() - started) });
  if (log.length > LOG_SIZE) log.shift();
}

async function fetchWithTimeout(request, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/*
 * The router asks for its payloads with a cache-busting parameter — Next calls
 * it _rsc — so "/daodejing/42/index.txt" is requested as
 * "/daodejing/42/index.txt?_rsc=abc123". Cache lookups compare the query too,
 * which turned every one of those into a miss and sent it to the network.
 *
 * The app carries no meaningful query parameters — it is a static text — so
 * the path alone is the right key, both for looking up and for storing.
 */
function cacheKey(request) {
  const url = new URL(request.url);
  return new Request(url.origin + url.pathname, { credentials: "same-origin" });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Only handle our own files.
  if (url.origin !== self.location.origin) return;

  // The precache list must never come from the cache — it is how a new worker
  // learns what to take in.
  if (url.pathname === path("precache.json")) return;

  const started = performance.now();

  event.respondWith(
    (async () => {
      const hit = await caches.match(cacheKey(request), { ignoreSearch: true });

      if (hit) {
        note(url.pathname, true, started);
        return hit;
      }

      try {
        const response = await fetchWithTimeout(request, FETCH_TIMEOUT);
        if (response && response.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(cacheKey(request), response.clone());
        }
        note(url.pathname, false, started);
        return response;
      } catch {
        note(url.pathname, false, started);
        // Nothing cached and no server: show the start page rather than an
        // empty app. Never throw — a rejected response would send the browser
        // back to the network and cost the wait all over again.
        const start = await caches.match(BASE);
        if (request.mode === "navigate" && start) return start;
        return new Response("", { status: 504, statusText: "offline" });
      }
    })()
  );
});

/* Lets /diagnose ask what is going on — which version is in charge, and
   whether requests are being served from the cache or from the network. */
self.addEventListener("message", (event) => {
  if (event.data?.type !== "stats") return;
  event.source?.postMessage({ type: "stats", version: VERSION, log: log.slice() });
});
