import Rich from '@/components/ui/Rich';
import Section from '@/components/ui/Section';
import SecHead from '@/components/ui/SecHead';
import styles from './Trio.module.css';

/** Navy band: intro + three columns with mono bullet lists. */
export default function Trio({ section, headingId }) {
  const { eyebrow, heading, intro, columns = [], note } = section;
  return (
    <Section section={section} tone="dark" labelledBy={headingId}>
      <SecHead eyebrow={eyebrow} heading={heading} intro={intro} id={headingId} wide />
      <div className={`${styles.trio} rev`}>
        {columns.map((c) => (
          <div className={styles.col} key={c.title}>
            {c.label && <div className={styles.label}>{c.label}</div>}
            <h3>
              <Rich text={c.title} />
            </h3>
            {c.text && (
              <p>
                <Rich text={c.text} />
              </p>
            )}
            <ul>
              {c.items.map((item) => (
                <li key={item}>
                  <Rich text={item} />
                </li>
              ))}
            </ul>
          </div>
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
