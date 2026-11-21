/**
 * Tiny inline markup used in content JSON (no HTML in content files):
 *   *text*         accent (orange) emphasis — used in headlines
 *   **text**       bold
 *   [[text]]       placeholder figure from the client mockup (highlighted in review builds)
 *   [label](href)  link
 *   \n             line break
 *
 * tokenize() is shared by the React renderer (components/ui/Rich.jsx) and by
 * toPlain()/toMarkdown(), which feed structured data and llms.txt.
 */

const TOKEN = /(\*\*[^*]+?\*\*|\*[^*\n]+?\*|\[\[[^\]]+?\]\]|\[[^\]]+?\]\([^)\s]+?\)|\n)/g;

export function tokenize(text) {
  if (text == null) return [];
  const out = [];
  const str = String(text);
  let last = 0;
  for (const m of str.matchAll(TOKEN)) {
    if (m.index > last) out.push({ type: 'text', value: str.slice(last, m.index) });
    const t = m[0];
    if (t === '\n') out.push({ type: 'br' });
    else if (t.startsWith('**')) out.push({ type: 'bold', value: t.slice(2, -2) });
    else if (t.startsWith('[[')) out.push({ type: 'ph', value: t.slice(2, -2) });
    else if (t.startsWith('[')) {
      const [, label, href] = t.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      out.push({ type: 'link', value: label, href });
    } else out.push({ type: 'em', value: t.slice(1, -1) });
    last = m.index + t.length;
  }
  if (last < str.length) out.push({ type: 'text', value: str.slice(last) });
  return out;
}

/** Plain text: markers removed, line breaks become spaces. */
export function toPlain(text) {
  return tokenize(text)
    .map((t) => (t.type === 'br' ? ' ' : t.value))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Markdown for llms-full.txt. Links are made absolute against siteUrl. */
export function toMarkdown(text, siteUrl = '') {
  return tokenize(text)
    .map((t) => {
      switch (t.type) {
        case 'br':
          return ' ';
        case 'bold':
          return `**${t.value}**`;
        case 'link':
          return `[${t.value}](${t.href.startsWith('/') ? siteUrl + t.href : t.href})`;
        default:
          return t.value;
      }
    })
    .join('')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export function hasPlaceholder(text) {
  return typeof text === 'string' && text.includes('[[');
}
