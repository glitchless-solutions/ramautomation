import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Loads content/site.json and content/pages/*.json at build time and validates
 * them. Any problem fails `npm run build` with a readable list, so a broken
 * JSON edit can never be published.
 */

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content');
const PUBLIC_DIR = path.join(ROOT, 'public');

export const SECTION_TYPES = [
  'hero',
  'paths',
  'trio',
  'datasheet',
  'steps',
  'proof',
  'gallery',
  'stack',
  'faq',
  'rfq',
  'industries',
  'tags',
  'features',
  'divider',
];

let placeholderCount = 0;

function readJson(file) {
  const raw = fs.readFileSync(file, 'utf8');
  placeholderCount += (raw.match(/\[\[/g) || []).length;
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in ${path.relative(ROOT, file)}: ${err.message}`);
  }
}

function checkImage(img, where, errors) {
  if (!img || img.placeholder) return;
  if (!img.src) errors.push(`${where}: image is missing "src"`);
  if (!img.alt || !String(img.alt).trim()) errors.push(`${where}: image "${img.src}" is missing "alt" text`);
  if (!img.width || !img.height) errors.push(`${where}: image "${img.src}" needs "width" and "height"`);
  if (img.src && img.src.startsWith('/') && !fs.existsSync(path.join(PUBLIC_DIR, img.src))) {
    errors.push(`${where}: image file not found: public${img.src}`);
  }
}

function validateSite(site, errors) {
  for (const key of ['siteUrl', 'name', 'description', 'pages', 'homePage', 'contact']) {
    if (!site[key]) errors.push(`site.json: "${key}" is required`);
  }
  if (site.siteUrl && /\/$/.test(site.siteUrl)) errors.push('site.json: "siteUrl" must not end with "/"');
  if (site.pages && !site.pages.includes(site.homePage)) {
    errors.push(`site.json: "homePage" (${site.homePage}) must be one of "pages"`);
  }
  checkImage(site.brand?.logo, 'site.json brand.logo', errors);
  checkImage(site.seo?.ogImage, 'site.json seo.ogImage', errors);
}

function validatePage(page, file, errors) {
  const where = `pages/${file}`;
  const slug = file.replace(/\.json$/, '');
  if (page.slug !== slug) errors.push(`${where}: "slug" must be "${slug}" (matches the file name)`);
  if (!page.nav?.label) errors.push(`${where}: "nav.label" is required`);
  if (!page.seo?.title) errors.push(`${where}: "seo.title" is required`);
  if (!page.seo?.description) errors.push(`${where}: "seo.description" is required`);
  if (page.seo?.dateModified && Number.isNaN(Date.parse(page.seo.dateModified))) {
    errors.push(`${where}: "seo.dateModified" must be a date like 2026-11-21`);
  }
  if (!Array.isArray(page.sections) || page.sections.length === 0) {
    errors.push(`${where}: "sections" must be a non-empty array`);
    return;
  }
  const visible = page.sections.filter((s) => !s.hidden);
  if (visible[0]?.type !== 'hero') errors.push(`${where}: the first section must be a "hero" (it holds the page's only <h1>)`);
  if (visible.filter((s) => s.type === 'hero').length > 1) errors.push(`${where}: only one "hero" section is allowed per page`);

  const ids = new Set();
  page.sections.forEach((s, i) => {
    const sw = `${where} sections[${i}] (${s.type})`;
    if (!SECTION_TYPES.includes(s.type)) {
      errors.push(`${sw}: unknown section type. Use one of: ${SECTION_TYPES.join(', ')}`);
    }
    if (s.id) {
      if (ids.has(s.id)) errors.push(`${sw}: duplicate id "${s.id}"`);
      ids.add(s.id);
    }
    if (s.type === 'gallery') (s.items || []).forEach((img, j) => checkImage(img, `${sw} items[${j}]`, errors));
    if (s.type === 'datasheet' && s.rows?.some((r) => r.length !== s.columns?.length)) {
      errors.push(`${sw}: every row must have ${s.columns?.length} cells (one per column)`);
    }
    if (s.type === 'faq') (s.items || []).forEach((f, j) => (!f.q || !f.a) && errors.push(`${sw} items[${j}]: needs "q" and "a"`));
  });
  if (page.seo?.ogImage) checkImage(page.seo.ogImage, `${where} seo.ogImage`, errors);
}

let cache;

function load() {
  // Cache only in production builds. In `next dev` the JSON is re-read on every
  // request, so content edits show up on refresh without restarting the server.
  if (cache && process.env.NODE_ENV === 'production') return cache;
  const errors = [];
  const site = readJson(path.join(CONTENT_DIR, 'site.json'));
  validateSite(site, errors);

  const pages = [];
  for (const slug of site.pages || []) {
    const file = `${slug}.json`;
    const full = path.join(CONTENT_DIR, 'pages', file);
    if (!fs.existsSync(full)) {
      errors.push(`site.json lists page "${slug}" but content/pages/${file} does not exist`);
      continue;
    }
    const page = readJson(full);
    validatePage(page, file, errors);
    pages.push(page);
  }

  if (errors.length) {
    throw new Error(`Content validation failed:\n  - ${errors.join('\n  - ')}`);
  }
  if (placeholderCount && process.env.NODE_ENV === 'production' && !globalThis.__raPlaceholderWarned) {
    globalThis.__raPlaceholderWarned = true;
    console.warn(`\n⚠  ${placeholderCount} unconfirmed [[placeholder]] values in content/. Run "npm run placeholders" to list them.\n`);
  }
  cache = { site, pages };
  return cache;
}

export function getSite() {
  return load().site;
}

export function getPages() {
  return load().pages;
}

export function getPage(slug) {
  return load().pages.find((p) => p.slug === slug) || null;
}

export function pageUrl(site, page, { absolute = false } = {}) {
  const rel = `/${page.slug}/`;
  return absolute ? `${site.siteUrl}${rel}` : rel;
}

/** Nav entries for the header (plain data so it can go to a client component). */
export function getNav() {
  const site = getSite();
  return getPages().map((p) => ({ slug: p.slug, label: p.nav.label, href: pageUrl(site, p) }));
}
