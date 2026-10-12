/**
 * Der Pfad, unter dem die App ausgeliefert wird.
 *
 * Leer bei lokaler Entwicklung, "/tao-app" auf GitHub Pages. Der Wert kommt
 * aus NEXT_PUBLIC_BASE_PATH und wird von Next zur Bauzeit eingesetzt, steht
 * also auch im Browser zur Verfuegung.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Stellt einer absoluten Adresse den Basispfad voran.
 *
 * Noetig ueberall dort, wo ein gewoehnlicher Anker oder ein roher Pfad
 * entsteht: Next schreibt nur next/link und eigene Assets um.
 * Fremde Adressen (http://, mailto:) und Fragmente bleiben unberuehrt.
 */
export function withBasePath(href: string): string {
  if (!href.startsWith("/")) return href;
  return `${BASE_PATH}${href}`;
}
