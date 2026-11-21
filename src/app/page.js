import PageView from '@/components/PageView';
import { getPage, getSite, pageUrl } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

/**
 * "/" shows the page named by site.json "homePage" (Control Panels), with its
 * canonical URL pointing at that page so search engines index it once.
 */
export function generateMetadata() {
  const site = getSite();
  const page = getPage(site.homePage);
  return pageMetadata(site, page, { canonicalOverride: pageUrl(site, page) });
}

export default function Home() {
  const site = getSite();
  return <PageView site={site} page={getPage(site.homePage)} />;
}
