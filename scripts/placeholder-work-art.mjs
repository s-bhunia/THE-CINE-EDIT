import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const ABOUT_OUT_DIR = path.resolve('public/assets/about');
const PROCESS_OUT_DIR = path.resolve('public/assets/process');
const OG_OUT_DIR = path.resolve('public/og');

const INK = '#0A0908';
const INK_LINE = '#262220';
const BONE_DIM = '#948C81';
const SAFELIGHT = '#D4703A';

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function frame({ width, height, label, sub }) {
  label = escapeXml(label);
  sub = escapeXml(sub);
  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="vignette" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#1a1614" />
      <stop offset="100%" stop-color="${INK}" />
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#vignette)" />
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" fill="none" stroke="${INK_LINE}" stroke-width="1" />
  <line x1="${width * 0.08}" y1="${height * 0.62}" x2="${width * 0.34}" y2="${height * 0.62}" stroke="${SAFELIGHT}" stroke-width="2" />
  <text x="${width * 0.08}" y="${height * 0.56}" font-family="monospace" font-size="${Math.round(height * 0.052)}" fill="${BONE_DIM}" letter-spacing="2">${sub}</text>
  <text x="${width * 0.08}" y="${height * 0.74}" font-family="serif" font-size="${Math.round(height * 0.11)}" fill="#E9E2D6">${label}</text>
</svg>`;
}

const targets = [
  {
    name: 'ingest',
    width: 1200,
    height: 800,
    label: 'Ingest',
    sub: 'CHECKSUM — MIRROR — PROXY',
    dir: PROCESS_OUT_DIR,
    formats: ['avif'],
  },
  {
    name: 'assembly',
    width: 1200,
    height: 800,
    label: 'Assembly',
    sub: 'STRUCTURE — PACE — MUSIC',
    dir: PROCESS_OUT_DIR,
    formats: ['avif'],
  },
  {
    name: 'grade',
    width: 1200,
    height: 800,
    label: 'Grade',
    sub: 'ACES — VISION3 — MASTER',
    dir: PROCESS_OUT_DIR,
    formats: ['avif'],
  },
  {
    name: 'default',
    width: 1200,
    height: 630,
    label: 'The Cine Edit',
    sub: 'MANAS BERA — WEDDING & CINEMATIC EDITOR',
    dir: OG_OUT_DIR,
    formats: ['jpg'],
  },
];

await mkdir(ABOUT_OUT_DIR, { recursive: true });
await mkdir(PROCESS_OUT_DIR, { recursive: true });
await mkdir(OG_OUT_DIR, { recursive: true });

for (const t of targets) {
  const svg = Buffer.from(frame(t));
  if (t.formats.includes('avif')) {
    await sharp(svg)
      .avif({ quality: 60 })
      .toFile(path.join(t.dir, `${t.name}.avif`));
  }
  if (t.formats.includes('webp')) {
    await sharp(svg)
      .webp({ quality: 70 })
      .toFile(path.join(t.dir, `${t.name}.webp`));
  }
  if (t.formats.includes('jpg')) {
    await sharp(svg)
      .flatten({ background: '#0A0908' })
      .jpeg({ quality: 82 })
      .toFile(path.join(t.dir, `${t.name}.jpg`));
  }
  console.log(`${t.name} written to ${path.relative(process.cwd(), t.dir)}`);
}
