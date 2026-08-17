import { execSync } from 'child_process';
import { mkdirSync, rmSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

const WORKS = [
  {
    slug: 'riya-weds-tarun',
    source: 'public/assets/video/WEDDING TEASER/Sequence 06_18.mp4',
    posterAt: 92,
    grabsAt: [20, 60, 130],
    previewStart: 15,
    previewDuration: 7,
  },
  {
    slug: 'biki-debashrita-prewedding',
    source: 'public/assets/video/pre wedding reels/Sequence 06_13.mp4',
    posterAt: 5,
    grabsAt: [5, 20, 35],
    previewStart: 2,
    previewDuration: 7,
  },
  {
    slug: 'wedding-highlights-reel',
    source: 'public/assets/video/wedding reels/demo.mp4',
    posterAt: 30,
    grabsAt: [1, 15, 30],
    previewStart: 25,
    previewDuration: 7,
  },
  {
    slug: 'slog3-colour-grade',
    source: 'public/assets/video/color greding reels/post 2.mp4',
    posterAt: 8,
    grabsAt: [2, 8, 20],
    previewStart: 5,
    previewDuration: 6,
  },
];

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

for (const work of WORKS) {
  const outDir = path.resolve('public/assets/works', work.slug);
  mkdirSync(outDir, { recursive: true });

  console.log(`\n=== ${work.slug} ===`);

  run(
    `ffmpeg -y -i "${work.source}" -c:v libx264 -preset slow -crf 25 -maxrate 4M -bufsize 8M -c:a aac -b:a 128k -movflags +faststart "${outDir}/full.mp4"`,
  );

  run(
    `ffmpeg -y -ss ${work.previewStart} -t ${work.previewDuration} -i "${work.source}" -an -c:v libx264 -preset slow -crf 30 -vf "scale=960:-2" -movflags +faststart "${outDir}/preview.mp4"`,
  );

  const posterJpg = path.join(outDir, 'poster-source.jpg');
  run(
    `ffmpeg -y -ss ${work.posterAt} -i "${work.source}" -vframes 1 -q:v 2 "${posterJpg}"`,
  );
  await sharp(posterJpg).avif({ quality: 60 }).toFile(path.join(outDir, 'poster.avif'));
  await sharp(posterJpg).webp({ quality: 70 }).toFile(path.join(outDir, 'poster.webp'));
  rmSync(posterJpg);

  for (const [idx, timestamp] of work.grabsAt.entries()) {
    const grabJpg = path.join(outDir, `grab-${idx + 1}-source.jpg`);
    run(`ffmpeg -y -ss ${timestamp} -i "${work.source}" -vframes 1 -q:v 2 "${grabJpg}"`);
    await sharp(grabJpg)
      .avif({ quality: 60 })
      .toFile(path.join(outDir, `grab-${idx + 1}.avif`));
    rmSync(grabJpg);
  }

  console.log(`${work.slug} done -> ${path.relative(process.cwd(), outDir)}`);
}

console.log('\nAll real works processed.');
