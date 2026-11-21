import { pageUrl } from './content';

/** Next.js Metadata object for one page, from its "seo" block. */
export function pageMetadata(site, page, { canonicalOverride } = {}) {
  const og = page.seo.ogImage || site.seo.ogImage;
  const canonical = canonicalOverride || pageUrl(site, page);
  return {
    title: page.seo.title,
    description: page.seo.description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: site.name,
      locale: site.seo.locale,
      title: page.seo.title,
      description: page.seo.description,
      images: [{ url: og.src, width: og.width, height: og.height, alt: og.alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.seo.title,
      description: page.seo.description,
      images: [og.src],
    },
    other: page.seo.dateModified ? { 'article:modified_time': page.seo.dateModified } : undefined,
  };
}
