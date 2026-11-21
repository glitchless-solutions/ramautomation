import Rich from '@/components/ui/Rich';
import HeroScene from './HeroScene';
import styles from './Hero.module.css';

function Facts({ facts, strip }) {
  if (!facts?.items?.length) return null;
  return (
    <div className={strip ? styles.strip : styles.facts}>
      {facts.heading && <p className={styles.factsHead}>{facts.heading}</p>}
      <dl>
        {facts.items.map((f) => (
          <div className={styles.fact} key={f.term}>
            <dt>{f.term}</dt>
            <dd>
              <Rich text={f.value} />
              {f.detail && (
                <small>
                  <Rich text={f.detail} />
                </small>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * Page hero: the page's only <h1>, answer-first intro, CTAs and the key facts.
 * With "visual" set, the right column shows the 3D assembly and the facts move
 * into a strip under the hero; without it, the facts panel sits on the right.
 */
export default function Hero({ section }) {
  const { eyebrow, title, text, ctas = [], facts, visual } = section;
  return (
    <header className={styles.hero}>
      <div className={`wrap ${styles.grid} ${visual ? styles.withVisual : ''}`}>
        <div>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1>
            <Rich text={title} />
          </h1>
          {text && (
            <p className={styles.sub}>
              <Rich text={text} />
            </p>
          )}
          {ctas.length > 0 && (
            <div className={styles.cta}>
              {ctas.map((c) => (
                <a key={c.label} className={`btn btn--${c.style || 'accent'}`} href={c.href}>
                  {c.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {visual ? <HeroScene visual={visual} /> : <Facts facts={facts} />}
      </div>
      {visual && (
        <div className="wrap">
          <Facts facts={facts} strip />
        </div>
      )}
    </header>
  );
}
