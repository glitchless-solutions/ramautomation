import Link from 'next/link';
import Rich from '@/components/ui/Rich';
import Section from '@/components/ui/Section';
import styles from './Stack.module.css';

function RowInner({ row }) {
  return (
    <>
      <b>{row.label}</b>
      <span className={styles.title}>
        <Rich text={row.title} />
      </span>
      <em>
        <Rich text={row.meta} />
      </em>
    </>
  );
}

/** Navy band: text on the left, numbered stack of rows on the right. */
export default function Stack({ section, headingId }) {
  const { eyebrow, heading, text, rows = [] } = section;
  return (
    <Section section={section} tone="dark" labelledBy={headingId}>
      <div className={styles.grid}>
        <div className="rev">
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h2 id={headingId}>
            <Rich text={heading} />
          </h2>
          {text && (
            <p className={styles.text}>
              <Rich text={text} />
            </p>
          )}
        </div>
        <ul className={`${styles.stack} rev`}>
          {rows.map((row) => {
            if (!row.href) {
              return (
                <li className={styles.row} key={row.title}>
                  <RowInner row={row} />
                </li>
              );
            }
            const external = /^https?:\/\//.test(row.href);
            return (
              <li key={row.title}>
                {external ? (
                  <a className={`${styles.row} ${styles.link}`} href={row.href} rel="noopener" target="_blank">
                    <RowInner row={row} />
                  </a>
                ) : (
                  <Link className={`${styles.row} ${styles.link}`} href={row.href}>
                    <RowInner row={row} />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
