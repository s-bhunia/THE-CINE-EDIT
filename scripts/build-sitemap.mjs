import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ORIGIN = 'https://the-cine-edit.vercel.app';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const worksFile = path.join(root, 'src', 'content', 'works.ts');
const outFile = path.join(root, 'public', 'sitemap.xml');

if (!fs.existsSync(worksFile)) {
  console.error(`build-sitemap: cannot find ${path.relative(root, worksFile)}`);
  process.exit(1);
}

const source = fs.readFileSync(worksFile, 'utf-8');
const slugs = [...source.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1]);

if (slugs.length === 0) {
  console.error(
    "build-sitemap: no work slugs matched /slug: '...'/ in src/content/works.ts. " +
      'The file format changed — update the regex in scripts/build-sitemap.mjs.',
  );
  process.exit(1);
}

const lastmod = fs.statSync(worksFile).mtime.toISOString().slice(0, 10);

const staticRoutes = [
  { path: '/', changefreq: 'monthly', priority: '1.0' },
  { path: '/work', changefreq: 'monthly', priority: '0.9' },
  { path: '/stills', changefreq: 'monthly', priority: '0.7' },
  { path: '/experience', changefreq: 'yearly', priority: '0.6' },
  { path: '/about', changefreq: 'yearly', priority: '0.6' },
  { path: '/contact', changefreq: 'yearly', priority: '0.8' },
];

const workRoutes = slugs.map((slug) => ({
  path: `/work/${slug}`,
  changefreq: 'yearly',
  priority: '0.8',
}));

const entries = [...staticRoutes, ...workRoutes];

const body = entries
  .map(
    (entry) =>
      `  <url>\n` +
      `    <loc>${ORIGIN}${entry.path}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <changefreq>${entry.changefreq}</changefreq>\n` +
      `    <priority>${entry.priority}</priority>\n` +
      `  </url>`,
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, xml, 'utf-8');

console.log(
  `build-sitemap: wrote ${path.relative(root, outFile)} with ${entries.length} URLs (${slugs.length} works).`,
);
