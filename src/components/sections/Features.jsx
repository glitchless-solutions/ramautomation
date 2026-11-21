import Rich from '@/components/ui/Rich';
import Section from '@/components/ui/Section';
import SecHead from '@/components/ui/SecHead';
import styles from './Features.module.css';

/** Light grid of short claim cards ("Why Ram") with corner registration marks. */
export default function Features({ section, headingId }) {
  const { kicker, heading, intro, items = [], note } = section;
  return (
    <Section section={section} labelledBy={headingId}>
      <SecHead kicker={kicker} heading={heading} intro={intro} id={headingId} />
      <ul className={`${styles.grid} rev`}>
        {items.map((f) => (
          <li className={styles.card} key={f.title}>
            {f.label && <div className={styles.label}>{f.label}</div>}
            <h3>
              <Rich text={f.title} />
            </h3>
            <p>
              <Rich text={f.text} />
            </p>
          </li>
        ))}
      </ul>
      {note && (
        <p className="note">
          <Rich text={note} />
        </p>
      )}
    </Section>
  );
}
