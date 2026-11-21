import Rich from './Rich';

/** Kicker (light) or eyebrow (dark) + h2 + intro paragraph. */
export default function SecHead({ kicker, eyebrow, heading, intro, id, wide = false }) {
  if (!heading && !kicker && !eyebrow) return null;
  return (
    <div className={`sec-head rev${wide ? ' sec-head--wide' : ''}`}>
      {kicker && <div className="kicker">{kicker}</div>}
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      {heading && (
        <h2 id={id}>
          <Rich text={heading} />
        </h2>
      )}
      {intro && (
        <p>
          <Rich text={intro} />
        </p>
      )}
    </div>
  );
}

/** Stable heading id for aria-labelledby. */
export const headingId = (section, index) => `${section.id || section.type}-h-${index}`;
