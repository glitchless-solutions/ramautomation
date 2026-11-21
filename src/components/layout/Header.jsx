'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

/**
 * Site header. All data (nav items, phone, CTA, wordmark) comes from
 * content/site.json via the root layout.
 */
export default function Header({ nav, homeSlug, wordmark, phone, phoneHref, cta }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (item) => pathname === item.href || (pathname === '/' && item.slug === homeSlug);

  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label={`${wordmark.left} ${wordmark.right} — home`}>
          {wordmark.left}
          <span>{wordmark.separator}</span>
          {wordmark.right}
        </Link>

        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className={styles.bars} aria-hidden="true" />
        </button>

        <div id="site-menu" className={`${styles.menu} ${open ? styles.open : ''}`}>
          <nav aria-label="Main">
            <ul className={styles.links}>
              {nav.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={item.href}
                    className={isActive(item) ? styles.on : undefined}
                    aria-current={isActive(item) ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.right}>
            <a className={styles.tel} href={`tel:${phoneHref}`}>
              {phone}
            </a>
            {cta && (
              <a className="btn btn--accent" href={cta.href} onClick={() => setOpen(false)}>
                {cta.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
