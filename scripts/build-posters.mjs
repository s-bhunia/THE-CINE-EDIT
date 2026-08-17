import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const INPUT_DIR = path.resolve('assets/raw-posters');
const OUTPUT_DIR = path.resolve('public/assets/works');
const WIDTHS = [400, 800, 1600];

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function processImages() {
  if (!fs.existsSync(INPUT_DIR)) return;
  const files = fs.readdirSync(INPUT_DIR).filter((f) => f.match(/\.(jpg|jpeg|png)$/i));

  for (const file of files) {
    const name = path.parse(file).name;
    const inputPath = path.join(INPUT_DIR, file);

    for (const width of WIDTHS) {
      await sharp(inputPath)
        .resize(width)
        .avif({ effort: 6, quality: 65 })
        .toFile(path.join(OUTPUT_DIR, `${name}-${width}.avif`));

      await sharp(inputPath)
        .resize(width)
        .webp({ effort: 6, quality: 75 })
        .toFile(path.join(OUTPUT_DIR, `${name}-${width}.webp`));
    }
  }
}

processImages().then(() => console.log('Posters built.'));
