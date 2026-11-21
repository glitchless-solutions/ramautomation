# Editing site content

All text and image references on the site live in this folder. You never need to touch the React code to change wording, swap a photo, add an FAQ, or reorder sections.

```
content/
  site.json                    company details, nav order, footer, certifications, form settings, AI/SEO summary
  pages/control-panels.json    one file per page
  pages/automation-machines.json
  pages/wire-harness.json
  pages/retrofit-integration.json
  pages/industries.json
```

After editing, run `npm run build`. The build **checks every file** and stops with a clear message if something is wrong (bad JSON, missing alt text, an image file that doesn't exist, an unknown section type).

## Text conventions

Content is plain text with a few markers — no HTML:

| Write | Result |
|---|---|
| `*engineered*` | orange accent word (used in headlines) |
| `**Not sure?**` | bold |
| `[[4–6 weeks]]` | an **unconfirmed figure** from the mockup (see below) |
| `[Wire Harness](/wire-harness/)` | link |
| `\n` | line break (headlines only) |

Quotes inside text: use curly quotes `“ ”` or escape straight ones as `\"`.

## Placeholder figures `[[ ]]`

Every number or claim the client still needs to confirm is wrapped in `[[ ]]` (lead times, SCCR rating, UL file number, ISO/ITAR status, case-study metrics, years in business…).

- `npm run placeholders` lists every one with file and line number.
- `npm run dev` and `npm run build:review` show them highlighted in orange on the page.
- A normal `npm run build` shows them as plain text and prints a warning with the count.
- To confirm a value, replace `[[4–6 weeks]]` with `4–6 weeks`.

**Before launch:** ISO 9001 and ITAR appear as `[[ ]]` in the footer badges, title blocks and Industries page. Confirm or delete them; don't publish unverified certification claims.

## Images

Put image files in `public/images/…` and reference them from JSON with a path starting at `/images/`:

```json
{ "src": "/images/work/panels/03.jpg", "alt": "Open control panel with labeled terminal blocks", "width": 550, "height": 350 }
```

`alt` (a description of the photo for screen readers and search/AI engines), `width` and `height` (the file's pixel size) are required. Prefer JPG, at least 1200px wide for new photography.

## Page files

```json
{
  "slug": "control-panels",          // must match the file name; becomes the URL /control-panels/
  "nav": { "label": "Control Panels" },
  "seo": {
    "title": "…",                    // browser tab + search result title (≈60 chars)
    "description": "…",              // search result snippet + AI summary (≈150–160 chars)
    "ogImage": null,                 // optional share image, else site default
    "dateModified": "2026-11-21"     // update when you change the page (shown as “Updated”, used in sitemap)
  },
  "schema": { "type": "Service", "name": "…", "serviceType": "…" },   // structured data for search/AI
  "titleBlock": [ { "text": "Capability", "bold": "01" } ],           // the strip under the nav
  "sections": [ … ]                  // rendered top to bottom
}
```

Any key starting with `_` (e.g. `"_editorNote"`) is a note for editors and is never shown on the site.

### Section types

Every section needs a `"type"`. Optional on all: `"id"` (anchor for `#links`), `"flushTop": true` (remove top spacing, to sit tight under the previous section), `"hidden": true` (keep in the file but don't show).

| type | What it is | Main fields |
|---|---|---|
| `hero` | Dark top banner with the page's only H1. **Must be first.** | `eyebrow`, `title`, `text`, `ctas[{label, href, style: accent\|ghost}]`, `facts{heading, items[{term, value, detail}]}`, `visual` (optional: interactive 3D assembly on the right, facts move to a strip below — `{label, alt, hint, tags{topRight, bottomRight}, hotspots[{part: cabinet|robot|harness|fixture, label, href, side: left|right}]}`; hotspots are links pinned to the moving model) |
| `paths` | Side-by-side cards (Path A / Path B) | `kicker`, `heading`, `intro`, `cards[{tag, title, text, accent, lists[{heading, items[]}], footnote}]`, `note` |
| `trio` | Dark band with three columns | `eyebrow`, `heading`, `intro`, `columns[{label, title, text, items[]}]`, `note` |
| `datasheet` | Spec / comparison table | `kicker`, `heading`, `intro`, `caption`, `columns[]`, `rows[[…]]`, `monoColumns[1]`, `note`. A cell can be `"text"` or `{ "text": "…", "style": "mono" \| "class" \| "check" }` |
| `steps` | Numbered process | `kicker`, `heading`, `intro`, `items[{label, title, text, time}]` |
| `proof` | Case-study cards | `kicker`, `heading`, `intro`, `cards[{tag, title, text, metric{value, label}}]` |
| `gallery` | Photo grid | `kicker`, `heading`, `intro`, `items[{src, alt, width, height, caption}]` or `{ "placeholder": "shot description" }` |
| `stack` | Dark band, text + numbered rows | `eyebrow`, `heading`, `text`, `rows[{label, title, meta, href}]` |
| `faq` | Questions (also published as FAQ structured data) | `kicker`, `heading`, `items[{q, a}]` |
| `rfq` | Quote checklist + form | `kicker`, `heading`, `intro`, `checklist[{title, hint}]`, `form{subject, fields[], submitLabel, note}` |
| `industries` | Market cards (each `id` is a link target) | `kicker`, `heading`, `intro`, `items[{id, label, title, text, reference, requirements}]` |
| `tags` | Labelled row of short items (items can be links) | `heading`, `items[]` |
| `features` | Grid of short claim cards with corner marks (“Why us”) | `kicker`, `heading`, `intro`, `items[{label, title, text}]`, `note` |
| `divider` | Thin dimension-line rule | — |

**Form fields** (`rfq.form.fields`): `{ "name", "label", "type": "text|email|tel|select|radio|textarea|file", "options": [] , "placeholder", "required": true }`. `radio` shows each option as a selectable card; an option can be a string or `{ "value": "…", "hint": "…" }`. `file` is a drag-and-drop zone; optional `"accept": ".dwg,.dxf,.pdf,.zip,image/*"` and `"hint"` (text under the zone). Put two fields in an array `[ {…}, {…} ]` to show them side by side. Name, company, email and phone are added automatically from `site.json → forms.contactFields`.

## Adding a page

1. Copy an existing file in `pages/`, rename it (e.g. `about.json`) and set `"slug": "about"`.
2. Add `"about"` to the `pages` list in `site.json` (the order there is the nav order).
3. Build. The page, nav link, sitemap entry, llms.txt entry and structured data are all generated.

## Forms

The site is static, so forms post to a form service. Set `site.json → forms.endpoint` to the service URL (e.g. a Formspree or Web3Forms form URL). Until then, “Send” opens the visitor's email app addressed to `forms.mailto`. File attachments only work once an endpoint that accepts files is set.
