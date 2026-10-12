/**
 * The reading theme as shared state.
 *
 * It lives in the DOM — set before the first paint by the inline script in the
 * layout — rather than in React, because it has to be right before React
 * exists. Both the toggle and the browser-chrome colour read it from here so
 * the rule lives in one place.
 */
export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "tao-theme";
export const THEME_CHANGE_EVENT = "tao-theme-change";

/** Must stay in step with --paper in globals.css. */
export const THEME_BACKGROUND: Record<Theme, string> = {
  light: "#f7f4ee",
  dark: "#161614",
};

/** Fires on a manual switch and when the system setting changes. */
export function subscribeToTheme(onChange: () => void) {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", onChange);
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => {
    query.removeEventListener("change", onChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  };
}

/** A manual choice wins; otherwise the system decides. */
export function readTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "dark" || chosen === "light") return chosen;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
