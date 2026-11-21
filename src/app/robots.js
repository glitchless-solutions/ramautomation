import { getSite } from '@/lib/content';

export const dynamic = 'force-static';

/** Allows all crawlers, and names the AI/answer-engine crawlers explicitly (GEO). */
export default function robots() {
  const site = getSite();
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...(site.ai?.allowCrawlers || []).map((ua) => ({ userAgent: ua, allow: '/' })),
    ],
    sitemap: `${site.siteUrl}/sitemap.xml`,
    host: site.siteUrl,
  };
}
