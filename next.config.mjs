/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export: `npm run build` writes a fully pre-rendered site to /out.
  // Every page is real HTML, which is what search engines and AI crawlers (GEO) need.
  output: 'export',
  // /control-panels -> /control-panels/index.html (works on any static host, incl. cPanel/Apache)
  trailingSlash: true,
  images: {
    // Required for static export (no image-optimization server).
    unoptimized: true,
  },
};

export default nextConfig;
