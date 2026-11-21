# Ram Automation — website

React rebuild of ramautomation.com on **Next.js 16 (App Router) with static export**, plain CSS, and all content in JSON. Built from the client's mockup (`docs/client-mockup.html`) in the brand palette `#F47E1F #2D3142 #4F5D75 #BFC0C0 #FFFFFF`.

- **Editing text / images:** see [content/README.md](content/README.md). No code changes needed.
- **Pages:** `/control-panels/` (also served at `/`), `/automation-machines/`, `/wire-harness/`, `/retrofit-integration/`, `/industries/`.

## Commands

| Command | What it does |
|---|---|
| `npm install` | install dependencies (Node 20+) |
| `npm run dev` | local dev server at http://localhost:3000, placeholders highlighted |
| `npm run build` | validate content and write the static site to `out/` |
| `npm run build:review` | same, with `[[placeholder]]` figures highlighted, for client review |
| `npm run preview` | serve `out/` locally |
| `npm run placeholders` | list every unconfirmed `[[value]]` in content |
| `npm run lint` | ESLint |

## Deploying

`npm run build` produces a plain static site in `out/`. Upload the **contents** of `out/` to any static host: cPanel/Apache `public_html`, Netlify, Vercel, Cloudflare Pages, S3+CloudFront. URLs end in `/` and map to `folder/index.html`, so no server rewrites are needed. `out/404.html` is the not-found page (Apache: `ErrorDocument 404 /404.html`).

Before going live:
1. Set `siteUrl` in `content/site.json` to the production domain (used in canonical URLs, sitemap, structured data, llms.txt).
2. Set `forms.endpoint` in `content/site.json` (Formspree, Web3Forms or similar).
3. Confirm or remove every `[[placeholder]]` (`npm run placeholders`). In particular, ISO 9001 and ITAR.
4. Redirect old WordPress URLs to the new pages (old `/control-panel-design-manufacturing/` → `/control-panels/`, `/automated-manufacturing-machines/` → `/automation-machines/`, `/retrofit-upgrade-machinery/` and `/system-integration/` → `/retrofit-integration/`, `/about/` `/contact/` → `/control-panels/#rfq`). Do this in the host's redirect settings or `.htaccess`.
5. After deploy, check pages in Google's Rich Results Test and submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## GEO (Generative Engine Optimization)

Everything is generated from `content/` at build time, so it can't drift from the visible page:

- **Pre-rendered HTML.** All copy, spec tables and FAQ answers are in the HTML; nothing depends on JavaScript. The scroll-reveal animation only hides content once JS has loaded.
- **JSON-LD** (`src/lib/schema.js`): sitewide `Organization`+`LocalBusiness` and `WebSite`; per page `WebPage`/`CollectionPage`, `BreadcrumbList`, `Service` with an `OfferCatalog` built from the spec table, `FAQPage` from the FAQ section, and an `ItemList` of industries.
- **`/llms.txt`** (summary, key facts, page index) and **`/llms-full.txt`** (every page as Markdown) in `src/lib/markdown.js`.
- **`/robots.txt`** allows all crawlers and names the AI crawlers explicitly (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, …; list in `site.json → ai.allowCrawlers`). **`/sitemap.xml`** uses each page's `seo.dateModified`.
- Per-page title, description, canonical URL, OpenGraph and Twitter cards, plus a visible “Updated” date in the title block.
- Semantic HTML: one `h1` per page, real `<table>` with captions and row headers, `<dl>` for key facts, `<details>` FAQs, `<address>` in the footer.

## Code map

```
content/                  all editable text + image references (JSON)
public/images/            photos (work/*) carried over from the WordPress site, logo, share image
public/brochures/         PDF brochures from the WordPress site
src/app/                  routes: layout, "/", [slug], sitemap, robots, llms.txt, llms-full.txt, 404
src/components/
  layout/                 Header (mobile menu), TitleBlock, Footer
  sections/               one component + CSS module per section type
  SectionRenderer.jsx     maps "type" in JSON → component
  PageView.jsx            title block + sections + page JSON-LD
src/lib/
  content.js              loads and validates content at build time
  text.js                 inline markup (*accent*, **bold**, [[placeholder]], links)
  schema.js               JSON-LD builders
  markdown.js             llms.txt / llms-full.txt builders
  seo.js                  per-page metadata
src/styles/globals.css    brand tokens + shared primitives
scripts/placeholders.mjs  lists unconfirmed values
```

**Adding a section type:** create `src/components/sections/MyThing.jsx` (+ `.module.css`), register it in `SectionRenderer.jsx`, add the type name to `SECTION_TYPES` in `src/lib/content.js`, and (optionally) a case in `src/lib/markdown.js` so it appears in llms-full.txt.

> This project uses Next.js 16. APIs differ from older versions, so check `node_modules/next/dist/docs/` before changing framework-level code (see `AGENTS.md`).
