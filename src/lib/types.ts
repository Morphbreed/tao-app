/** A single chapter of the Daodejing. */
export type Chapter = {
  /** 1..81 */
  number: number;
  /** One entry per line — the line structure carries meaning. */
  lines: string[];
  /** Optional, can be filled in later. */
  title?: string;
  /** Placeholder for the Chinese source text (not included yet). */
  chinese?: string[];
};

/** Fields shared by every Markdown-backed article. */
export type ArticleBase = {
  slug: string;
  title: string;
  summary: string;
  /** Cross-references into the Daodejing. */
  chapters: number[];
  order: number;
  /** Body rendered from Markdown to HTML. */
  html: string;
};

export type Meditation = ArticleBase & {
  duration: string;
  level: "beginner" | "advanced";
  /** Whether the silent practice timer is offered. Set to false for
      sequences that are not practised against a clock. */
  timer: boolean;
};

export type EverydayTopic = ArticleBase;

export type Story = ArticleBase & {
  /** Which book of Dschuang Dsi the piece comes from, e.g. "Buch III". */
  book: string;
  /** The heading it carries in the source, kept for honest provenance. */
  source: string;
};

/** Content section an article belongs to. */
export type Section = "meditation" | "everyday" | "stories";

/** A reference from a chapter back to an article that mentions it. */
export type Backlink = {
  section: Section;
  slug: string;
  title: string;
  summary: string;
};
