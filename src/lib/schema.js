import { toPlain } from './text';
import { pageUrl } from './content';

/**
 * schema.org JSON-LD built from the same JSON that renders the pages, so the
 * structured data AI/search engines read can never drift from visible content.
 */

const orgId = (site) => `${site.siteUrl}/#organization`;
const websiteId = (site) => `${site.siteUrl}/#website`;

export function organizationSchema(site) {
  const c = site.contact;
  const org = {
    '@type': ['Organization', 'LocalBusiness'],
    '@id': orgId(site),
    name: site.name,
    legalName: site.legalName || site.name,
    url: `${site.siteUrl}/`,
    description: site.description,
    telephone: c.phoneHref || c.phone,
    email: c.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: c.address.street,
      addressLocality: c.address.city,
      addressRegion: c.address.region,
      postalCode: c.address.postalCode,
      addressCountry: c.address.country,
    },
    areaServed: (site.areaServed || []).map((name) => ({ '@type': 'Place', name })),
    knowsAbout: site.knowsAbout,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: c.phoneHref || c.phone,
      email: c.email,
      areaServed: 'US',
      availableLanguage: 'English',
    },
  };
  if (c.fax) org.faxNumber = c.fax;
  if (c.geo?.latitude != null) org.geo = { '@type': 'GeoCoordinates', latitude: c.geo.latitude, longitude: c.geo.longitude };
  if (site.brand?.logo) org.logo = `${site.siteUrl}${site.brand.logo.src}`;
  if (site.seo?.ogImage) org.image = `${site.siteUrl}${site.seo.ogImage.src}`;
  if (site.foundingYear) org.foundingDate = String(site.foundingYear);
  const certs = (site.certifications || []).filter((c) => !c.includes('[['));
  if (certs.length) {
    org.hasCredential = certs.map((name) => ({ '@type': 'EducationalOccupationalCredential', name }));
  }
  return org;
}

export function websiteSchema(site) {
  return {
    '@type': 'WebSite',
    '@id': websiteId(site),
    url: `${site.siteUrl}/`,
    name: site.name,
    description: site.description,
    publisher: { '@id': orgId(site) },
    inLanguage: 'en-US',
  };
}

/** Sitewide graph, rendered once in the root layout. */
export function siteGraph(site) {
  return { '@context': 'https://schema.org', '@graph': [organizationSchema(site), websiteSchema(site)] };
}

function sections(page, type) {
  return page.sections.filter((s) => s.type === type && !s.hidden);
}

function cellText(cell) {
  return toPlain(typeof cell === 'string' ? cell : cell.text);
}

/** Per-page graph: WebPage + Breadcrumb + Service/ItemList + FAQPage. */
export function pageGraph(site, page) {
  const url = pageUrl(site, page, { absolute: true });
  const hero = sections(page, 'hero')[0];
  const graph = [];

  const webPage = {
    '@type': page.schema?.type === 'CollectionPage' ? 'CollectionPage' : 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: page.seo.title,
    description: page.seo.description,
    isPartOf: { '@id': websiteId(site) },
    about: { '@id': page.schema?.type === 'Service' ? `${url}#service` : orgId(site) },
    breadcrumb: { '@id': `${url}#breadcrumb` },
    inLanguage: 'en-US',
    primaryImageOfPage: { '@type': 'ImageObject', url: `${site.siteUrl}${(page.seo.ogImage || site.seo.ogImage).src}` },
  };
  if (page.seo.dateModified) webPage.dateModified = page.seo.dateModified;
  graph.push(webPage);

  graph.push({
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: site.name, item: `${site.siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: page.nav.label, item: url },
    ],
  });

  if (page.schema?.type === 'Service') {
    const service = {
      '@type': 'Service',
      '@id': `${url}#service`,
      name: page.schema.name,
      serviceType: page.schema.serviceType,
      description: hero ? toPlain(hero.text) : page.seo.description,
      url,
      provider: { '@id': orgId(site) },
      areaServed: (site.areaServed || []).map((name) => ({ '@type': 'Place', name })),
    };
    // The first spec-style datasheet becomes an offer catalog of capabilities.
    const sheet = sections(page, 'datasheet').find((d) => d.monoColumns);
    if (sheet) {
      service.hasOfferCatalog = {
        '@type': 'OfferCatalog',
        name: toPlain(sheet.caption || sheet.heading),
        itemListElement: sheet.rows.map((row) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: cellText(row[0]),
            description: row.slice(1).map(cellText).filter(Boolean).join(' — '),
          },
        })),
      };
    }
    graph.push(service);
  }

  const markets = sections(page, 'industries')[0];
  if (markets) {
    graph.push({
      '@type': 'ItemList',
      '@id': `${url}#industries`,
      name: toPlain(markets.heading),
      itemListElement: markets.items.map((m, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${url}#${m.id}`,
        name: toPlain(m.title),
        description: `${toPlain(m.text)} ${toPlain(m.reference)}`.trim(),
      })),
    });
  }

  const faqs = sections(page, 'faq').flatMap((f) => f.items);
  if (faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: toPlain(f.q),
        acceptedAnswer: { '@type': 'Answer', text: toPlain(f.a) },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

/** Safe serialization for <script type="application/ld+json"> (per Next.js JSON-LD guide). */
export function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
