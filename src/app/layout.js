import { Barlow_Condensed, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import JsonLd from '@/components/ui/JsonLd';
import RevealObserver from '@/components/ui/RevealObserver';
import { getNav, getSite } from '@/lib/content';
import { siteGraph } from '@/lib/schema';
import '@/styles/globals.css';

const disp = Barlow_Condensed({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-disp', display: 'swap' });
const body = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono', display: 'swap' });

const site = getSite();

export const metadata = {
  metadataBase: new URL(site.siteUrl),
  title: { default: site.seo.defaultTitle, template: site.seo.titleTemplate },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.siteUrl }],
  publisher: site.name,
  formatDetection: { telephone: true, email: true, address: true },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
};

export const viewport = {
  themeColor: site.seo.themeColor,
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: the inline script below adds `js` to <html>, and browser
    // extensions (e.g. ColorZilla's cz-shortcut-listen) inject attributes on <body> pre-hydration.
    // Only silences attribute diffs on these two elements, not their children.
    <html lang="en" className={`${disp.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Marks JS as available so scroll-reveal can hide content; without JS everything stays visible. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <link rel="alternate" type="text/plain" title="LLM-readable site summary" href="/llms.txt" />
      </head>
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <JsonLd data={siteGraph(site)} />
        <Header
          nav={getNav()}
          homeSlug={site.homePage}
          wordmark={site.brand.wordmark}
          phone={site.contact.phone}
          phoneHref={site.contact.phoneHref}
          cta={site.header.cta}
        />
        <main id="main">{children}</main>
        <Footer site={site} />
        <RevealObserver />
      </body>
    </html>
  );
}
