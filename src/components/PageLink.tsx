import type { AnchorHTMLAttributes } from "react";

import { withBasePath } from "@/lib/base-path";

/**
 * A plain link — a real page load, not a client-side route change.
 *
 * Next's router is deliberately not used here. In this static export a tap
 * rewrote the address while the page stayed put, and only a second tap brought
 * the new content; the link in the header was the exception, because being
 * permanently on screen it was always prefetched in time. The machinery is
 * built for a server that streams, and there is none.
 *
 * Nothing is lost by dropping it. Every page is held in the cache, so a plain
 * load comes out of local storage. What goes is a preserved scroll position —
 * and a whole class of failure.
 *
 * Should a later version of Next fix this, swapping the implementation back to
 * next/link is a change in this one file.
 */
/**
 * Brings a target into the form the site is actually served in.
 *
 * With trailingSlash the pages live at /daodejing/42/, and that is the address
 * held in the cache. next/link used to append the slash on its own; a plain
 * anchor prints whatever it is given. Without this the links would survive
 * online — the server redirects — and every one of them would break offline,
 * where nothing does the redirecting.
 *
 * Anything carrying a file extension is left alone, as are fragments, which
 * are reattached after the slash.
 */
function withTrailingSlash(href: string): string {
  if (!href.startsWith("/")) return href;

  const [path, fragment] = href.split("#");
  const lastSegment = path.slice(path.lastIndexOf("/") + 1);
  const normalised =
    path.endsWith("/") || lastSegment.includes(".") ? path : `${path}/`;

  return fragment === undefined ? normalised : `${normalised}#${fragment}`;
}

export default function PageLink({
  href,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  // withBasePath zuletzt: der Basispfad traegt keinen abschliessenden
  // Schraegstrich und soll von withTrailingSlash nicht angefasst werden.
  return (
    <a href={withBasePath(withTrailingSlash(href))} {...rest}>
      {children}
    </a>
  );
}
