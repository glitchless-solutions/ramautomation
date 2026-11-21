import Rich from '@/components/ui/Rich';
import Section from '@/components/ui/Section';
import styles from './Tags.module.css';

/** A compact labelled list of short items (e.g. "Also building for"). */
export default function Tags({ section, headingId }) {
  const { heading, items = [] } = section;
  return (
    <Section section={section} labelledBy={headingId}>
      <div className={`${styles.tags} rev`}>
        {heading && (
          <h2 className={styles.head} id={headingId}>
            {heading}
          </h2>
        )}
        <ul>
          {items.map((t) => (
            <li key={t}>
              <Rich text={t} />
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
