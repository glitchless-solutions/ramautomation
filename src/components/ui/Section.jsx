/**
 * Standard section wrapper. Props come straight from the section JSON:
 * id, flushTop, flushBottom. `tone="dark"` for navy bands.
 */
export default function Section({ section = {}, tone, className = '', children, wrap = true, labelledBy }) {
  const cls = [
    'section',
    tone === 'dark' && 'section--dark',
    section.flushTop && 'section--flush-top',
    section.flushBottom && 'section--flush-bottom',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <section id={section.id} className={cls} aria-labelledby={labelledBy}>
      {wrap ? <div className="wrap">{children}</div> : children}
    </section>
  );
}
