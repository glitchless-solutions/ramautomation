import { toMarkdown, toPlain } from './text';
import { pageUrl } from './content';

/**
 * Builds /llms.txt (index) and /llms-full.txt (all page text) from content JSON.
 * Format follows the llms.txt proposal: H1 name, blockquote summary, H2 link lists.
 */

const cell = (c) => (typeof c === 'string' ? c : c?.text || '');

function sectionToMd(s, site) {
  const md = (t) => toMarkdown(t, site.siteUrl);
  const out = [];
  const head = (h) => h && out.push(`## ${toPlain(h)}`, '');
  const intro = (t) => t && out.push(md(t), '');

  switch (s.type) {
    case 'hero':
      out.push(`# ${toPlain(s.title)}`, '', md(s.text), '');
      if (s.facts?.items?.length) {
        out.push(`### ${toPlain(s.facts.heading)}`, '');
        s.facts.items.forEach((f) => out.push(`- ${toPlain(f.term)}: ${toPlain(f.value)}${f.detail ? ` (${toPlain(f.detail)})` : ''}`));
        out.push('');
      }
      break;
    case 'paths':
      head(s.heading);
      intro(s.intro);
      s.cards.forEach((c) => {
        out.push(`### ${toPlain(c.tag)}: ${toPlain(c.title)}`, '');
        if (c.text) out.push(md(c.text), '');
        (c.lists || []).forEach((l) => {
          if (l.heading) out.push(`${toPlain(l.heading)}:`);
          l.items.forEach((i) => out.push(`- ${md(i)}`));
          out.push('');
        });
        if (c.footnote) out.push(md(c.footnote), '');
      });
      if (s.note) out.push(md(s.note), '');
      break;
    case 'trio':
      head(s.heading);
      intro(s.intro);
      s.columns.forEach((c) => {
        out.push(`### ${toPlain(c.title)}`, '', md(c.text), '');
        c.items.forEach((i) => out.push(`- ${md(i)}`));
        out.push('');
      });
      if (s.note) out.push(md(s.note), '');
      break;
    case 'datasheet': {
      head(s.heading);
      intro(s.intro);
      if (s.caption) out.push(`Table: ${toPlain(s.caption)}`, '');
      out.push(`| ${s.columns.map((c) => toPlain(c) || ' ').join(' | ')} |`);
      out.push(`| ${s.columns.map(() => '---').join(' | ')} |`);
      s.rows.forEach((r) => out.push(`| ${r.map((c) => md(cell(c)).replace(/\|/g, '\\|')).join(' | ')} |`));
      out.push('');
      if (s.note) out.push(md(s.note), '');
      break;
    }
    case 'steps':
      head(s.heading);
      intro(s.intro);
      s.items.forEach((st, i) => out.push(`${i + 1}. **${toPlain(st.title)}** (${toPlain(st.time)}): ${md(st.text)}`));
      out.push('');
      break;
    case 'proof':
      head(s.heading);
      intro(s.intro);
      s.cards.forEach((c) => {
        out.push(`### ${toPlain(c.title)} (${toPlain(c.tag)})`, '', md(c.text));
        if (c.metric) out.push(`Result: ${toPlain(c.metric.value)} ${toPlain(c.metric.label)}`);
        out.push('');
      });
      break;
    case 'stack':
      head(s.heading);
      intro(s.text);
      s.rows.forEach((r) => out.push(`- ${toPlain(r.title)}: ${toPlain(r.meta)}`));
      out.push('');
      break;
    case 'industries':
      head(s.heading);
      intro(s.intro);
      s.items.forEach((m) => {
        out.push(`### ${toPlain(m.title)}`, '', md(m.text), '', `Example: ${md(m.reference)}`, '', `Requirements: ${toPlain(m.requirements)}`, '');
      });
      break;
    case 'tags':
      head(s.heading);
      out.push(s.items.map(toPlain).join(', '), '');
      break;
    case 'features':
      head(s.heading);
      intro(s.intro);
      s.items.forEach((f) => out.push(`- **${toPlain(f.title)}**: ${md(f.text)}`));
      out.push('');
      break;
    case 'faq':
      head(s.heading);
      s.items.forEach((f) => out.push(`### ${toPlain(f.q)}`, '', md(f.a), ''));
      break;
    case 'rfq':
      head(s.heading);
      intro(s.intro);
      s.checklist.forEach((c) => out.push(`- ${toPlain(c.title)}: ${toPlain(c.hint)}`));
      out.push('', `Contact: ${site.contact.phone} · ${site.contact.email}`, '');
      break;
    default:
      break;
  }
  return out.join('\n');
}

export function pageToMarkdown(site, page) {
  const url = pageUrl(site, page, { absolute: true });
  const body = page.sections
    .filter((s) => !s.hidden)
    .map((s) => sectionToMd(s, site))
    .filter(Boolean)
    .join('\n');
  const meta = [`Source: ${url}`];
  if (page.seo.dateModified) meta.push(`Last updated: ${page.seo.dateModified}`);
  return `${body.trim()}\n\n${meta.join(' · ')}\n`;
}

function contactBlock(site) {
  const c = site.contact;
  const a = c.address;
  return [
    '## Contact',
    '',
    `- Address: ${a.street}, ${a.city}, ${a.region} ${a.postalCode}`,
    `- Phone: ${c.phone}`,
    c.fax ? `- Fax: ${c.fax}` : null,
    `- Email: ${c.email}`,
    `- Service area: ${(site.areaServed || []).join(', ')}`,
    site.sister ? `- Sister company: [${site.sister.name}](${site.sister.url}) — ${site.sister.description}` : null,
  ]
    .filter((l) => l !== null)
    .join('\n');
}

export function buildLlmsTxt(site, pages) {
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.ai?.summary || site.description}`,
    '',
    '## Key facts',
    '',
    ...(site.ai?.keyFacts || []).map((f) => `- ${f}`),
    '',
    '## Pages',
    '',
    ...pages.map((p) => `- [${p.nav.label}](${pageUrl(site, p, { absolute: true })}): ${p.seo.description}`),
    '',
    contactBlock(site),
    '',
    '## Optional',
    '',
    `- [Full text of every page](${site.siteUrl}/llms-full.txt): all page content as Markdown, including specification tables and FAQs`,
    `- [Sitemap](${site.siteUrl}/sitemap.xml)`,
    '',
  ];
  return lines.join('\n');
}

export function buildLlmsFullTxt(site, pages) {
  const parts = [
    `# ${site.name} — full site content`,
    '',
    `> ${site.ai?.summary || site.description}`,
    '',
    contactBlock(site),
    '',
  ];
  pages.forEach((p) => parts.push('---', '', pageToMarkdown(site, p)));
  return parts.join('\n');
}
