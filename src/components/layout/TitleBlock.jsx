import Rich from '@/components/ui/Rich';
import styles from './TitleBlock.module.css';

function formatUpdated(date) {
  const d = new Date(`${date}T00:00:00Z`);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/**
 * The engineering "title block" strip under the nav (the mockup's signature).
 * Cells come from page.titleBlock; a "Updated" cell is appended from
 * seo.dateModified as a visible freshness signal.
 */
export default function TitleBlock({ cells = [], dateModified }) {
  return (
    <div className={styles.titleblock}>
      <div className={`wrap ${styles.row}`}>
        {cells.map((c, i) => (
          <div className={styles.cell} key={i}>
            <Rich text={c.text} />
            {c.bold && (
              <>
                {' '}
                <b>
                  <Rich text={c.bold} />
                </b>
              </>
            )}
          </div>
        ))}
        {dateModified && (
          <div className={styles.cell}>
            Updated{' '}
            <b>
              <time dateTime={dateModified}>{formatUpdated(dateModified)}</time>
            </b>
          </div>
        )}
      </div>
    </div>
  );
}
