import Link from 'next/link';
import { getNav } from '@/lib/content';

export const metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="kicker">Error 404</div>
        <h1>This page isn&apos;t on the drawing.</h1>
        <p style={{ color: 'var(--muted)', maxWidth: '60ch' }}>
          The page may have moved when we rebuilt the site. Try one of these instead:
        </p>
        <ul>
          {getNav().map((n) => (
            <li key={n.slug}>
              <Link href={n.href}>{n.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
