import Rich from '@/components/ui/Rich';
import Section from '@/components/ui/Section';
import SecHead from '@/components/ui/SecHead';
import styles from './Faq.module.css';

/**
 * FAQ as native <details>. Answers are in the HTML even when collapsed, and the
 * same items feed the FAQPage structured data (lib/schema.js).
 */
export default function Faq({ section, headingId }) {
  const { kicker, heading, intro, items = [] } = section;
  return (
    <Section section={{ ...section, flushBottom: true }} wrap={false} labelledBy={headingId}>
      <div className="wrap">
        <SecHead kicker={kicker} heading={heading} intro={intro} id={headingId} />
      </div>
      <div className={styles.faq}>
        <div className={`wrap ${styles.inner}`}>
          {items.map((f) => (
            <details key={f.q} className={styles.item}>
              <summary>
                <Rich text={f.q} />
              </summary>
              <p>
                <Rich text={f.a} />
              </p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
