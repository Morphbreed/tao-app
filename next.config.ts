import type { NextConfig } from "next";

/*
 * Basispfad fuer GitHub Pages.
 *
 * Die App liegt dort nicht unter "/", sondern unter "/tao-app/". Lokal
 * (npm run dev) ist die Variable leer, dann bleibt alles unter "/".
 * Gesetzt wird sie beim Deploy — siehe scripts/deploy.sh.
 *
 * Wichtig: basePath schreibt nur next/link und Nexts eigene Assets um.
 * Dieses Projekt navigiert bewusst mit gewoehnlichen Ankern (PageLink),
 * die den Pfad selbst voranstellen muessen. Deshalb wird derselbe Wert
 * zusaetzlich als NEXT_PUBLIC_BASE_PATH in den Browser gereicht.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  /* Statischer Export: erzeugt reine HTML/CSS/JS-Dateien in out/.
     Dadurch laeuft die App auf jedem Webserver und der Service Worker
     kann alles vorhalten, was fuer den Offline-Betrieb noetig ist. */
  output: "export",

  /* Erzeugt /daodejing/1/index.html statt /daodejing/1.html — noetig,
     damit einfache Static-Hosts die Routen ohne Sonderregeln ausliefern. */
  trailingSlash: true,

  basePath,
  assetPrefix: basePath,

  images: {
    /* Die Bildoptimierung braucht einen Server; beim Export entfaellt sie. */
    unoptimized: true,
  },
};

export default nextConfig;
