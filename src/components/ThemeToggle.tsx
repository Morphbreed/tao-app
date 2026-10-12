"use client";

import { useSyncExternalStore } from "react";
import {
  readTheme,
  subscribeToTheme,
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme";
import styles from "./ThemeToggle.module.css";

/**
 * The active theme lives in the DOM (set by the inline script in the layout)
 * or follows the system setting. That makes it external state, so it is read
 * through useSyncExternalStore instead of being mirrored into React state.
 * The reading itself sits in @/lib/theme, shared with ThemeColor.
 */
const subscribe = subscribeToTheme;
const getSnapshot = readTheme;

/** The theme is unknown while rendering on the server. */
function getServerSnapshot(): Theme | null {
  return null;
}

/** Switches between light and dark reading mode and remembers the choice. */
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode and friends — the choice then lasts for this session only.
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  const label =
    theme === "dark" ? "Zum hellen Lesemodus wechseln" : "Zum dunklen Lesemodus wechseln";

  return (
    <button
      type="button"
      className={styles.button}
      onClick={toggle}
      aria-label={label}
      title={theme === "dark" ? "Heller Lesemodus" : "Dunkler Lesemodus"}
    >
      {/* Stays empty until hydration so nothing flashes. */}
      <span aria-hidden="true">{theme === null ? "" : theme === "dark" ? "☾" : "☀"}</span>
    </button>
  );
}
