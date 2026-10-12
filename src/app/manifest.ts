import type { MetadataRoute } from "next";

import { withBasePath } from "@/lib/base-path";

/*
 * Das Manifest wird erzeugt statt statisch abgelegt, weil jede Adresse darin
 * den Basispfad tragen muss: Auf GitHub Pages liegt die App unter /tao-app/,
 * lokal unter /. Eine feste Datei in public/ koennte das nicht leisten.
 */
/* Beim statischen Export muss die Route ausdruecklich als statisch
   gekennzeichnet sein — sonst bricht next build ab. */
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tao — Daodejing, Meditation, Alltag",
    short_name: "Tao",
    description:
      "Das Daodejing in der Übersetzung von Richard Wilhelm, taoistische Meditationspraktiken und Anregungen für den Alltag.",
    lang: "de",
    dir: "ltr",
    start_url: withBasePath("/"),
    scope: withBasePath("/"),
    display: "fullscreen",
    display_override: ["fullscreen", "standalone", "minimal-ui"],
    orientation: "portrait-primary",
    background_color: "#f7f4ee",
    categories: ["books", "lifestyle", "education"],
    icons: [
      {
        src: withBasePath("/icon-192.png"),
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: withBasePath("/icon-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: withBasePath("/icon-maskable-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Daodejing",
        url: withBasePath("/daodejing/"),
        description: "Alle 81 Kapitel",
      },
      {
        name: "Meditation",
        url: withBasePath("/meditation/"),
        description: "Taoistische Praktiken",
      },
    ],
  };
}
