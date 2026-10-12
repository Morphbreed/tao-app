import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { withBasePath } from "./base-path";
import { CHAPTER_COUNT } from "./daodejing";
import { SECTION_DIR } from "./sections";
import type { ArticleBase, Backlink, EverydayTopic, Meditation, Section, Story } from "./types";

const CONTENT_DIR = join(process.cwd(), "src/content");

/** Mentions of the form "Kapitel 63" in body copy. */
const CHAPTER_MENTION = /\bKapitel\s+(\d{1,2})\b/g;

/**
 * Turns chapter mentions in body copy into links so the referenced verse can
 * be read straight away.
 *
 * Only the text between tags is rewritten: the string is split on tags so that
 * neither attributes are touched nor nested links produced (an <a> inside an
 * <a> would be invalid).
 */
function linkChapterMentions(source: string): string {
  const parts = source.split(/(<[^>]+>)/);
  let insideLink = false;

  return parts
    .map((part) => {
      if (part.startsWith("<")) {
        if (/^<a\b/i.test(part)) insideLink = true;
        else if (/^<\/a\s*>/i.test(part)) insideLink = false;
        return part;
      }

      if (insideLink) return part;

      return part.replace(CHAPTER_MENTION, (match, digits: string) => {
        const number = Number(digits);
        if (number < 1 || number > CHAPTER_COUNT) return match;
        const href = withBasePath(`/daodejing/${number}/`);
        return `<a href="${href}" class="chapter-link">${match}</a>`;
      });
    })
    .join("");
}

type RawArticle = {
  slug: string;
  frontmatter: Record<string, unknown>;
  html: string;
};

/** Reads every Markdown file of a section and renders its body. */
function readSection(section: Section): RawArticle[] {
  const dir = join(CONTENT_DIR, SECTION_DIR[section]);
  return readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = readFileSync(join(dir, file), "utf8");
      const { data, content } = matter(raw);
      return {
        slug: file.replace(/\.md$/, ""),
        frontmatter: data,
        html: linkChapterMentions(remark().use(html).processSync(content).toString()),
      };
    });
}

function toNumberList(value: unknown): number[] {
  return Array.isArray(value) ? value.filter((n): n is number => typeof n === "number") : [];
}

function byOrder<T extends { order: number }>(a: T, b: T): number {
  return a.order - b.order;
}

/** Maps the fields every article shares. */
function toArticleBase({ slug, frontmatter, html: body }: RawArticle): ArticleBase {
  return {
    slug,
    title: String(frontmatter.title ?? slug),
    summary: String(frontmatter.summary ?? ""),
    chapters: toNumberList(frontmatter.chapters),
    order: Number(frontmatter.order ?? 99),
    html: body,
  };
}

export function getMeditations(): Meditation[] {
  return readSection("meditation")
    .map((article) => ({
      ...toArticleBase(article),
      duration: String(article.frontmatter.duration ?? ""),
      level: article.frontmatter.level === "advanced" ? ("advanced" as const) : ("beginner" as const),
      // Offered unless a practice explicitly opts out.
      timer: article.frontmatter.timer !== false,
    }))
    .sort(byOrder);
}

export function getEverydayTopics(): EverydayTopic[] {
  return readSection("everyday").map(toArticleBase).sort(byOrder);
}

/**
 * The Dschuang Dsi pieces. Unlike the other two sections these are not our own
 * words but Wilhelm's translation, so the source heading travels with them.
 */
export function getStories(): Story[] {
  return readSection("stories")
    .map((article) => ({
      ...toArticleBase(article),
      book: String(article.frontmatter.book ?? ""),
      source: String(article.frontmatter.source ?? ""),
    }))
    .sort(byOrder);
}

/**
 * Reverse index chapter number -> articles referencing it. Built once at build
 * time and rendered on the chapter page.
 */
export function getBacklinks(): Map<number, Backlink[]> {
  const index = new Map<number, Backlink[]>();

  const add = (section: Section, article: ArticleBase) => {
    for (const number of article.chapters) {
      const entries = index.get(number) ?? [];
      entries.push({
        section,
        slug: article.slug,
        title: article.title,
        summary: article.summary,
      });
      index.set(number, entries);
    }
  };

  for (const article of getMeditations()) add("meditation", article);
  for (const article of getEverydayTopics()) add("everyday", article);
  for (const article of getStories()) add("stories", article);

  return index;
}
