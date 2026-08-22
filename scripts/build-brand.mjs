import { execSync } from 'node:child_process';
import { mkdirSync, existsSync, statSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const INPUT = process.argv[2];
const PUBLIC_DIR = path.resolve('public');
const BRAND_DIR = path.join(PUBLIC_DIR, 'assets/brand');

if (!INPUT || !existsSync(INPUT)) {
  console.error('Usage: node scripts/build-brand.mjs <path-to-mark-image>');
  process.exit(1);
}

mkdirSync(BRAND_DIR, { recursive: true });

/**
 * The supplied mark is white-and-red artwork on a flat black field with a wide
 * margin. Trim the margin, then key the black out so the mark can sit on the
 * site's ink background — or anything else — without a black tile around it.
 *
 * Alpha is max(r, g, b) rather than luminance: luma would read the red stroke as
 * only 30% opaque and wash it out, while the max keeps both the white rules and
 * the red at full strength and still fades the anti-aliased edges correctly.
 */
const TRIMMED = path.join(os.tmpdir(), 'cine-edit-mark-trimmed.png');
const MARK = path.join(BRAND_DIR, 'mark.png');

// The source is a JPEG, so its "black" field carries compression noise; a low
// threshold finds no uniform border at all and trims nothing.
await sharp(INPUT).trim({ threshold: 30 }).png().toFile(TRIMMED);

const trimmed = await sharp(TRIMMED).metadata();
console.log(`trimmed mark: ${trimmed.width}x${trimmed.height}`);

execSync(
  `ffmpeg -i "${TRIMMED}" -vf "format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='max(max(r(X,Y),g(X,Y)),b(X,Y))'" -frames:v 1 "${MARK}" -y`,
  { stdio: 'inherit' },
);

// Square canvas with a little breathing room, for the icon sizes.
const padded = await sharp(MARK)
  .resize({
    width: 448,
    height: 448,
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .extend({
    top: 32,
    bottom: 32,
    left: 32,
    right: 32,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

const ICONS = [
  { size: 32, name: 'favicon-32.png', opaque: false },
  { size: 192, name: 'favicon-192.png', opaque: false },
  { size: 512, name: 'favicon-512.png', opaque: false },
  // Apple ignores transparency and composites on white, so bake the ink field in.
  { size: 180, name: 'apple-touch-icon.png', opaque: true },
];

for (const icon of ICONS) {
  const pipeline = sharp(padded).resize(icon.size, icon.size);
  if (icon.opaque) {
    pipeline.flatten({ background: '#140e0a' });
  }
  const out = path.join(PUBLIC_DIR, icon.name);
  await pipeline.png({ compressionLevel: 9 }).toFile(out);
  console.log(`${icon.name}: ${(statSync(out).size / 1024).toFixed(1)}KB`);
}

// Header lockup: small, transparent, twice the rendered size for hi-dpi.
const headerMark = path.join(BRAND_DIR, 'mark-64.png');
await sharp(MARK)
  .resize({ height: 64, fit: 'inside' })
  .png({ compressionLevel: 9 })
  .toFile(headerMark);
console.log(`mark-64.png: ${(statSync(headerMark).size / 1024).toFixed(1)}KB`);

rmSync(TRIMMED, { force: true });

console.log('Brand assets written to public/ and public/assets/brand/.');
