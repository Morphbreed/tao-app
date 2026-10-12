"use client";

import { useEffect } from "react";
import { readTheme, subscribeToTheme, THEME_BACKGROUND } from "@/lib/theme";

/**
 * Keeps the browser's own surfaces — the status bar, and on Android the
 * navigation bar at the bottom — in step with the reading theme.
 *
 * Two things make this necessary. The manifest's theme_color is a single fixed
 * value and cannot ask about dark mode, so the installed app kept a light bar
 * under a dark page. And the theme-color meta tags rendered by the layout ask
 * `prefers-color-scheme`, which is the *system* setting — it knows nothing of
 * the manual switch.
 *
 * The tag itself is created by THEME_SCRIPT before the first paint, so the
 * system bars are right from the outset. What is left for this component is
 * keeping it in step afterwards — with the manual switch and with a system
 * setting that changes while the page is open.
 */
export default function ThemeColor() {
  useEffect(() => {
    const apply = () => {
      let tag = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = "theme-color";
        document.head.appendChild(tag);
      }
      tag.content = THEME_BACKGROUND[readTheme()];
    };

    apply();
    return subscribeToTheme(apply);
  }, []);

  return null;
}
