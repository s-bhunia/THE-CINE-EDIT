import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const INPUT = process.argv[2];
const OUTPUT_DIR = path.resolve('public/assets/hero');

if (!INPUT || !fs.existsSync(INPUT)) {
  console.error('Provide a valid input video file.');
  process.exit(1);
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * The plate is a silent background loop, so audio is stripped and the frame rate
 * is pinned to the 24fps the whole site is built around. Sources come off a 50fps
 * timeline, and halving the frame count is most of how a 24-second hero fits a
 * sane download at all.
 */
const TARGET_FPS = 24;

function encodeSilentLoop({ width, crf, maxrate, bufsize, level, outputName }) {
  const levelFlag = level ? `-level:v ${level} ` : '';
  execSync(
    `ffmpeg -i "${INPUT}" -an -c:v libx264 -profile:v high ${levelFlag}-preset slow ` +
      `-crf ${crf} -maxrate ${maxrate} -bufsize ${bufsize} ` +
      `-vf "fps=${TARGET_FPS},scale=${width}:-2" -pix_fmt yuv420p ` +
      `-movflags +faststart "${OUTPUT_DIR}/${outputName}" -y`,
    { stdio: 'inherit' },
  );
}

function extractPoster() {
  // A frame a beat in, rather than frame zero, which is usually a fade from black.
  const seek = '-ss 1.5';
  execSync(
    `ffmpeg ${seek} -i "${INPUT}" -vframes 1 -q:v 6 "${OUTPUT_DIR}/poster.jpg" -y`,
    { stdio: 'inherit' },
  );
  // index.html preloads the avif, so it has to be regenerated alongside the jpg.
  execSync(
    `ffmpeg ${seek} -i "${INPUT}" -vframes 1 -vf "scale=1920:-2" -c:v libaom-av1 -still-picture 1 -crf 32 -cpu-used 6 "${OUTPUT_DIR}/poster.avif" -y`,
    { stdio: 'inherit' },
  );
}

encodeSilentLoop({
  width: 1920,
  crf: 22,
  maxrate: '3200k',
  bufsize: '6400k',
  level: '4.2',
  outputName: 'loop-1080p.mp4',
});

encodeSilentLoop({
  width: 1280,
  crf: 29,
  maxrate: '900k',
  bufsize: '1800k',
  outputName: 'loop-720p.mp4',
});

extractPoster();

console.log('Hero loop encoded successfully.');
