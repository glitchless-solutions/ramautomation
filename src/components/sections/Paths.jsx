import Rich from '@/components/ui/Rich';
import Section from '@/components/ui/Section';
import SecHead from '@/components/ui/SecHead';
import styles from './Paths.module.css';

/** Two (or more) side-by-side cards: "Path A / Path B", "worth it / not worth it", etc. */
export default function Paths({ section, headingId }) {
  const { kicker, heading, intro, cards = [], note } = section;
  return (
    <Section section={section} labelledBy={headingId}>
      <SecHead kicker={kicker} heading={heading} intro={intro} id={headingId} />
      <div className={`${styles.paths} rev`}>
        {cards.map((c) => (
          <article key={c.title} className={`${styles.path} ${c.accent ? styles.accent : ''}`}>
            {c.tag && <div className={styles.tag}>{c.tag}</div>}
            <h3>
              <Rich text={c.title} />
            </h3>
            {c.text && (
              <p>
                <Rich text={c.text} />
              </p>
            )}
            {(c.lists || []).map((l, i) => (
              <div key={i}>
                {l.heading && <h4>{l.heading}</h4>}
                <ul>
                  {l.items.map((item) => (
                    <li key={item}>
                      <Rich text={item} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {c.footnote && (
              <p className={styles.footnote}>
                <Rich text={c.footnote} />
              </p>
            )}
          </article>
        ))}
      </div>
      {note && (
        <p className="note">
          <Rich text={note} />
        </p>
      )}
    </Section>
  );
}
