import { notFound } from 'next/navigation';
import PageView from '@/components/PageView';
import { getPage, getPages, getSite } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

// Only the pages listed in content/site.json exist; everything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getPages().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = getPage(slug);
  return page ? pageMetadata(getSite(), page) : {};
}

export default async function Page({ params }) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) notFound();
  return <PageView site={getSite()} page={page} />;
}
