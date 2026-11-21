import { getPages, getSite } from '@/lib/content';
import { buildLlmsFullTxt } from '@/lib/markdown';

export const dynamic = 'force-static';

/** /llms-full.txt — every page's content as Markdown, generated from content JSON. */
export function GET() {
  return new Response(buildLlmsFullTxt(getSite(), getPages()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
