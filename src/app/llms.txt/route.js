import { getPages, getSite } from '@/lib/content';
import { buildLlmsTxt } from '@/lib/markdown';

export const dynamic = 'force-static';

/** /llms.txt — concise, LLM-readable index of the site (https://llmstxt.org). */
export function GET() {
  return new Response(buildLlmsTxt(getSite(), getPages()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
