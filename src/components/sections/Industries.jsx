import Rich from '@/components/ui/Rich';
import Section from '@/components/ui/Section';
import SecHead from '@/components/ui/SecHead';
import styles from './Industries.module.css';

/** Market cards. Each card's id is a deep-link target (/industries/#medical-device). */
export default function Industries({ section, headingId }) {
  const { kicker, heading, intro, items = [], note } = section;
  return (
    <Section section={section} labelledBy={headingId}>
      <SecHead kicker={kicker} heading={heading} intro={intro} id={headingId} />
      <div className={`${styles.grid} rev`}>
        {items.map((m) => (
          <article className={styles.ind} id={m.id} key={m.id}>
            {m.label && <div className={styles.n}>{m.label}</div>}
            <h3>
              <Rich text={m.title} />
            </h3>
            <p>
              <Rich text={m.text} />
            </p>
            {m.reference && (
              <div className={styles.ref}>
                <Rich text={m.reference} />
              </div>
            )}
            {m.requirements && (
              <div className={styles.req}>
                <span className="sr-only">Typical requirements: </span>
                <Rich text={m.requirements} />
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
