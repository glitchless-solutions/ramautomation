import Rich from '@/components/ui/Rich';
import Section from '@/components/ui/Section';
import SecHead from '@/components/ui/SecHead';
import styles from './Steps.module.css';

/** Numbered process sequence — an <ol> because the order is real. */
export default function Steps({ section, headingId }) {
  const { kicker, heading, intro, items = [] } = section;
  return (
    <Section section={section} labelledBy={headingId}>
      <SecHead kicker={kicker} heading={heading} intro={intro} id={headingId} />
      <ol className={`${styles.steps} rev`}>
        {items.map((s) => (
          <li className={styles.step} key={s.title}>
            <div className={styles.n}>{s.label}</div>
            <h3>
              <Rich text={s.title} />
            </h3>
            <p>
              <Rich text={s.text} />
            </p>
            {s.time && (
              <div className={styles.time}>
                <Rich text={s.time} />
              </div>
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}
