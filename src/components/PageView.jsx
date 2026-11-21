import TitleBlock from './layout/TitleBlock';
import SectionRenderer from './SectionRenderer';
import JsonLd from './ui/JsonLd';
import { pageGraph } from '@/lib/schema';

/** Full page body for one content/pages/*.json file. */
export default function PageView({ site, page }) {
  return (
    <>
      <JsonLd data={pageGraph(site, page)} />
      <TitleBlock cells={page.titleBlock} dateModified={page.seo.dateModified} />
      <SectionRenderer sections={page.sections} site={site} page={page} />
    </>
  );
}
