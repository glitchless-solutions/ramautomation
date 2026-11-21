import { getPages, getSite, pageUrl } from '@/lib/content';

export const dynamic = 'force-static';

export default function sitemap() {
  const site = getSite();
  return getPages().map((p) => ({
    url: pageUrl(site, p, { absolute: true }),
    lastModified: p.seo.dateModified ? new Date(p.seo.dateModified) : new Date(),
    changeFrequency: 'monthly',
    priority: p.slug === site.homePage ? 1 : 0.8,
  }));
}
