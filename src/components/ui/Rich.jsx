import { Fragment } from 'react';
import { tokenize } from '@/lib/text';

const SHOW_PLACEHOLDERS = process.env.NEXT_PUBLIC_SHOW_PLACEHOLDERS === 'true';

/**
 * Renders a content string with the inline markup from lib/text.js.
 * <Rich text="Built to your print.\nOr *engineered* from your process." />
 */
export default function Rich({ text }) {
  return tokenize(text).map((t, i) => {
    switch (t.type) {
      case 'br':
        return <br key={i} />;
      case 'em':
        return <em key={i}>{t.value}</em>;
      case 'bold':
        return <strong key={i}>{t.value}</strong>;
      case 'ph':
        return SHOW_PLACEHOLDERS ? (
          <span key={i} className="ph" title="Placeholder — confirm this figure">
            {t.value}
          </span>
        ) : (
          <Fragment key={i}>{t.value}</Fragment>
        );
      case 'link': {
        const external = /^https?:\/\//.test(t.href);
        return (
          <a key={i} className="rich-link" href={t.href} {...(external ? { rel: 'noopener' } : {})}>
            {t.value}
          </a>
        );
      }
      default:
        return <Fragment key={i}>{t.value}</Fragment>;
    }
  });
}
