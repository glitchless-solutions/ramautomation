import Link from 'next/link';
import Rich from '@/components/ui/Rich';
import styles from './Footer.module.css';

function FooterLink({ link }) {
  if (!link.href) return null; // kept in JSON, hidden until it has a destination
  const external = link.external || /^https?:\/\//.test(link.href);
  const isFile = /\.(pdf|zip|dwg)$/i.test(link.href);
  if (external || isFile) {
    return (
      <a href={link.href} {...(external ? { rel: 'noopener', target: '_blank' } : {})}>
        {link.label}
      </a>
    );
  }
  return <Link href={link.href}>{link.label}</Link>;
}

export default function Footer({ site }) {
  const { contact, footer, brand, certifications, sister } = site;
  const a = contact.address;
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div className={styles.grid}>
          <div>
            <div className={styles.brand}>
              {brand.wordmark.left}
              <span>{brand.wordmark.separator}</span>
              {brand.wordmark.right}
            </div>
            <address className={styles.address}>
              {a.street}
              <br />
              {a.city}, {a.region} {a.postalCode}
              <br />
              <a href={`tel:${contact.phoneHref}`}>{contact.phone}</a>
              <br />
              {contact.fax && (
                <>
                  Fax {contact.fax}
                  <br />
                </>
              )}
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </address>
            <ul className={styles.certs} aria-label="Certifications">
              {certifications.map((c) => (
                <li key={c} className={styles.cert}>
                  <Rich text={c} />
                </li>
              ))}
            </ul>
          </div>

          {footer.columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className={styles.colHead}>{col.heading}</h2>
              <ul className={styles.list}>
                {col.links
                  .filter((l) => l.href)
                  .map((l) => (
                    <li key={l.label}>
                      <FooterLink link={l} />
                    </li>
                  ))}
              </ul>
            </nav>
          ))}
        </div>

        {sister && (
          <p className={styles.sister}>
            <span>{footer.sisterLabel}</span>{' '}
            <a href={sister.url} rel="noopener" target="_blank">
              {sister.name}
            </a>{' '}
            — {sister.description}
          </p>
        )}

        <div className={styles.bottom}>
          <span>{footer.bottomLeft.replace('{year}', year)}</span>
          <span>{footer.bottomRight}</span>
        </div>
      </div>
    </footer>
  );
}
