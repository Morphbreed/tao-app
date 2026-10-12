import type { Section } from "./types";

/**
 * URL segment per content section. The routes stay German because they are
 * user-facing, while the section identifiers used in code are English.
 */
export const SECTION_PATH: Record<Section, string> = {
  meditation: "/meditation",
  everyday: "/alltag",
  stories: "/geschichten",
};

/** Label shown to the reader. */
export const SECTION_LABEL: Record<Section, string> = {
  meditation: "Meditation",
  everyday: "Alltag",
  stories: "Geschichten",
};

/** Directory under src/content holding a section's Markdown files. */
export const SECTION_DIR: Record<Section, string> = {
  meditation: "meditation",
  everyday: "everyday",
  stories: "stories",
};
