import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE = 'assets/source/headshot.png';
const OUT_DIR = 'public/assets/about';
const ASPECT = 4 / 5;
const WIDTHS = [640, 1080];
const LUMA = [0.2126, 0.7152, 0.0722];
const CHANNEL_GAIN = { r: 1.14, g: 1.0, b: 0.82 };

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)}KB`;
}

async function build() {
  await mkdir(OUT_DIR, { recursive: true });

  const source = sharp(SOURCE);
  const { width, height } = await source.metadata();
  const cropHeight = Math.round(width / ASPECT);

  if (cropHeight > height) {
    throw new Error(
      `source ${width}x${height} is too short to crop to ${ASPECT.toFixed(2)}; need ${cropHeight}px`,
    );
  }

  const graded = sharp(SOURCE)
    .extract({ left: 0, top: 0, width, height: cropHeight })
    .recomb([
      LUMA.map((weight) => weight * CHANNEL_GAIN.r),
      LUMA.map((weight) => weight * CHANNEL_GAIN.g),
      LUMA.map((weight) => weight * CHANNEL_GAIN.b),
    ])
    .linear(1.08, -10);

  const results = [];

  for (const targetWidth of WIDTHS) {
    const resized = graded.clone().resize({ width: targetWidth });
    const suffix = targetWidth === WIDTHS[0] ? '' : `-${targetWidth}`;

    const avifPath = path.join(OUT_DIR, `portrait${suffix}.avif`);
    const webpPath = path.join(OUT_DIR, `portrait${suffix}.webp`);

    await resized.clone().avif({ quality: 62, effort: 6 }).toFile(avifPath);
    await resized.clone().webp({ quality: 78 }).toFile(webpPath);

    results.push(avifPath, webpPath);
  }

  for (const file of results) {
    const { size } = await stat(file);
    console.log(`${file} ${formatKb(size)}`);
  }
}

build().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
