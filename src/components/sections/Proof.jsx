import Rich from '@/components/ui/Rich';
import Section from '@/components/ui/Section';
import SecHead from '@/components/ui/SecHead';
import styles from './Proof.module.css';

/** Case-study cards with one headline metric each. */
export default function Proof({ section, headingId }) {
  const { kicker, heading, intro, cards = [], note } = section;
  return (
    <Section section={section} labelledBy={headingId}>
      <SecHead kicker={kicker} heading={heading} intro={intro} id={headingId} />
      <div className={`${styles.proof} rev`}>
        {cards.map((c) => (
          <article className={styles.card} key={c.title}>
            {c.tag && <div className={styles.tag}>{c.tag}</div>}
            <h3>
              <Rich text={c.title} />
            </h3>
            <p>
              <Rich text={c.text} />
            </p>
            {c.metric && (
              <div className={styles.metric}>
                <div className={styles.value}>
                  <Rich text={c.metric.value} />
                </div>
                <div className={styles.label}>
                  <Rich text={c.metric.label} />
                </div>
              </div>
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
