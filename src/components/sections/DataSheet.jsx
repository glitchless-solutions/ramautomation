import Rich from '@/components/ui/Rich';
import Section from '@/components/ui/Section';
import SecHead from '@/components/ui/SecHead';
import styles from './DataSheet.module.css';

const STYLE_CLASS = { mono: 'mono', class: 'cls', check: 'check' };

/**
 * Spec / comparison table. A cell is either a string or { text, style }
 * where style is "mono" | "class" | "check". `monoColumns` sets mono for
 * whole columns (e.g. [1] = the "Capability" column).
 */
export default function DataSheet({ section, headingId }) {
  const { kicker, heading, intro, caption, columns = [], rows = [], monoColumns = [], note } = section;
  return (
    <Section section={section} labelledBy={headingId}>
      <SecHead kicker={kicker} heading={heading} intro={intro} id={headingId} />
      <div className={`${styles.sheet} rev`} role="region" aria-label={caption || heading} tabIndex={0}>
        <table className={styles.table}>
          {caption && <caption>{caption}</caption>}
          <thead>
            <tr>
              {columns.map((c, i) =>
                c ? (
                  <th key={i} scope="col">
                    {c}
                  </th>
                ) : (
                  <td key={i} aria-hidden="true" className={styles.blankHead} />
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, i) => {
                  const text = typeof cell === 'string' ? cell : cell.text;
                  const style = typeof cell === 'string' ? null : STYLE_CLASS[cell.style];
                  const cls = [style && styles[style], monoColumns.includes(i) && styles.mono].filter(Boolean).join(' ');
                  if (i === 0) {
                    return (
                      <th key={i} scope="row" className={cls || undefined}>
                        <Rich text={text} />
                      </th>
                    );
                  }
                  return (
                    <td key={i} className={cls || undefined}>
                      <Rich text={text} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && (
        <p className="prose-note">
          <Rich text={note} />
        </p>
      )}
    </Section>
  );
}
