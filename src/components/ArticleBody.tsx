import styles from "./ArticleBody.module.css";

/**
 * Renders the article body produced from Markdown.
 * The only source is the project's own files under src/content, so injecting
 * it as HTML is safe here.
 */
export default function ArticleBody({ html }: { html: string }) {
  return <div className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />;
}
