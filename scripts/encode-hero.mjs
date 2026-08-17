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

function encodeSilentLoop({ width, crf, maxrate, bufsize, level, outputName }) {
  const levelFlag = level ? `-level:v ${level} ` : '';
  execSync(
    `ffmpeg -i "${INPUT}" -an -c:v libx264 -profile:v high ${levelFlag}-preset slow -crf ${crf} -maxrate ${maxrate} -bufsize ${bufsize} -vf "scale=${width}:-2" -pix_fmt yuv420p "${OUTPUT_DIR}/${outputName}" -y`,
    { stdio: 'inherit' },
  );
}

function extractFirstFramePoster() {
  execSync(`ffmpeg -i "${INPUT}" -vframes 1 -q:v 2 "${OUTPUT_DIR}/poster.jpg" -y`, {
    stdio: 'inherit',
  });
}

encodeSilentLoop({
  width: 1920,
  crf: 24,
  maxrate: '4M',
  bufsize: '8M',
  level: '4.2',
  outputName: 'loop-1080p.mp4',
});

encodeSilentLoop({
  width: 1280,
  crf: 26,
  maxrate: '2M',
  bufsize: '4M',
  outputName: 'loop-720p.mp4',
});

extractFirstFramePoster();

console.log('Hero loop encoded successfully.');
