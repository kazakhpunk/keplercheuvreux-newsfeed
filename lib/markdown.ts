/**
 * Flattens markdown into a single line of readable text.
 *
 * Feed cards clamp the description to two lines, where raw markdown syntax
 * (##, **, image URLs) reads as noise — so the card shows this excerpt while
 * the modal renders the real markdown.
 */
export function toPlainText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images: drop them entirely
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links: keep the label
    .replace(/^\s{0,3}#{1,6}\s+/gm, '') // heading markers
    .replace(/^\s{0,3}>\s?/gm, '') // blockquote markers
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, '') // list markers
    .replace(/^\s*```.*$/gm, '') // fenced code delimiters
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // strong
    .replace(/(\*|_)(.*?)\1/g, '$2') // emphasis
    .replace(/`([^`]*)`/g, '$1') // inline code
    .replace(/\s+/g, ' ')
    .trim();
}
