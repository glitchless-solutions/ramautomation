import Hero from './sections/Hero';
import Paths from './sections/Paths';
import Trio from './sections/Trio';
import DataSheet from './sections/DataSheet';
import Steps from './sections/Steps';
import Proof from './sections/Proof';
import Gallery from './sections/Gallery';
import Stack from './sections/Stack';
import Faq from './sections/Faq';
import Rfq from './sections/Rfq';
import Industries from './sections/Industries';
import Tags from './sections/Tags';
import Features from './sections/Features';

/**
 * Maps a section's "type" in the page JSON to its component.
 * To add a new section type: build the component, register it here, and add
 * the type name to SECTION_TYPES in lib/content.js.
 */
const REGISTRY = {
  hero: Hero,
  paths: Paths,
  trio: Trio,
  datasheet: DataSheet,
  steps: Steps,
  proof: Proof,
  gallery: Gallery,
  stack: Stack,
  faq: Faq,
  rfq: Rfq,
  industries: Industries,
  tags: Tags,
  features: Features,
};

export default function SectionRenderer({ sections, site, page }) {
  return sections
    .filter((s) => !s.hidden)
    .map((section, i) => {
      if (section.type === 'divider') return <div className="dim" key={i} role="presentation" />;
      const Component = REGISTRY[section.type];
      if (!Component) return null;
      const headingId = `${section.id || section.type}-heading-${i}`;
      return <Component key={i} section={section} site={site} page={page} headingId={headingId} />;
    });
}
