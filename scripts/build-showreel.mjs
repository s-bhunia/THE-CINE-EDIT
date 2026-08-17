import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const SOURCE = path.resolve('public/assets/video/wedding reels/Sequence 06_16.mp4');
const OUTPUT_DIR = path.resolve('public/assets/showreel');

const SEGMENT_START_SECONDS = 0;
const SEGMENT_DURATION_SECONDS = 75.3;
const POSTER_TIME_SECONDS = 40;

const AUDIO_KBPS = 128;
const GOP_FRAMES = 60;

const RENDITIONS = [
  {
    name: 'showreel-1080p.mp4',
    width: 1920,
    targetMegabytes: 23,
    preset: 'slow',
    level: '4.2',
  },
  {
    name: 'showreel-720p.mp4',
    width: 1280,
    targetMegabytes: 11.5,
    preset: 'slow',
    level: '3.1',
  },
];

const POSTERS = [
  {
    name: 'poster.avif',
    args: [
      '-c:v',
      'libaom-av1',
      '-still-picture',
      '1',
      '-crf',
      '30',
      '-cpu-used',
      '4',
      '-pix_fmt',
      'yuv420p',
      '-f',
      'avif',
    ],
  },
  {
    name: 'poster.jpg',
    args: ['-q:v', '3', '-f', 'mjpeg'],
  },
];

const force = process.argv.includes('--force');

function run(bin, args, { capture = false } = {}) {
  const result = spawnSync(bin, args, {
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    encoding: 'utf8',
  });
  if (result.error) {
    throw new Error(`${bin} could not be started: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const detail = capture ? `\n${result.stderr ?? ''}` : '';
    throw new Error(`${bin} exited with ${result.status}${detail}`);
  }
  return capture ? (result.stdout ?? '').trim() : '';
}

function probe(file, entries) {
  return run(
    'ffprobe',
    [
      '-v',
      'error',
      '-show_entries',
      entries,
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      file,
    ],
    { capture: true },
  )
    .split(/\r?\n/)
    .filter(Boolean);
}

function isFresh(target) {
  if (force || !fs.existsSync(target)) return false;
  return fs.statSync(target).mtimeMs >= fs.statSync(SOURCE).mtimeMs;
}

function videoKilobitsPerSecond(targetMegabytes, durationSeconds) {
  const targetKilobits = (targetMegabytes * 1024 * 1024 * 8) / 1000;
  const audioKilobits = AUDIO_KBPS * durationSeconds;
  return Math.floor((targetKilobits - audioKilobits) / durationSeconds);
}

function encode(rendition, durationSeconds) {
  const target = path.join(OUTPUT_DIR, rendition.name);
  if (isFresh(target)) {
    console.log(`${rendition.name} is up to date`);
    return;
  }

  const kbps = videoKilobitsPerSecond(rendition.targetMegabytes, durationSeconds);
  const passLog = path.join(os.tmpdir(), `showreel-${rendition.width}`);

  const shared = [
    '-y',
    '-v',
    'error',
    '-stats',
    '-ss',
    String(SEGMENT_START_SECONDS),
    '-t',
    String(SEGMENT_DURATION_SECONDS),
    '-i',
    SOURCE,
    '-vf',
    `scale=${rendition.width}:-2:flags=lanczos,format=yuv420p`,
    '-c:v',
    'libx264',
    '-profile:v',
    'high',
    '-level:v',
    rendition.level,
    '-preset',
    rendition.preset,
    '-b:v',
    `${kbps}k`,
    '-maxrate',
    `${Math.round(kbps * 1.5)}k`,
    '-bufsize',
    `${Math.round(kbps * 3)}k`,
    '-g',
    String(GOP_FRAMES),
    '-passlogfile',
    passLog,
  ];

  console.log(`encoding ${rendition.name} at ${kbps}k video / ${AUDIO_KBPS}k audio`);
  run('ffmpeg', [...shared, '-pass', '1', '-an', '-f', 'null', '-']);
  run('ffmpeg', [
    ...shared,
    '-pass',
    '2',
    '-c:a',
    'aac',
    '-b:a',
    `${AUDIO_KBPS}k`,
    '-ac',
    '2',
    '-ar',
    '48000',
    '-movflags',
    '+faststart',
    target,
  ]);

  for (const suffix of ['-0.log', '-0.log.mbtree', '.log', '.log.mbtree']) {
    fs.rmSync(`${passLog}${suffix}`, { force: true });
  }
}

function extractPoster(poster) {
  const target = path.join(OUTPUT_DIR, poster.name);
  if (isFresh(target)) {
    console.log(`${poster.name} is up to date`);
    return;
  }

  console.log(`extracting ${poster.name} at ${POSTER_TIME_SECONDS}s`);
  run('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-ss',
    String(POSTER_TIME_SECONDS),
    '-i',
    SOURCE,
    '-frames:v',
    '1',
    ...poster.args,
    target,
  ]);
}

function report() {
  console.log('\nbuilt files');
  for (const name of [...RENDITIONS.map((r) => r.name), ...POSTERS.map((p) => p.name)]) {
    const target = path.join(OUTPUT_DIR, name);
    const megabytes = (fs.statSync(target).size / (1024 * 1024)).toFixed(2);
    console.log(`  ${name.padEnd(20)} ${megabytes.padStart(7)} MB`);
  }

  const [duration] = probe(path.join(OUTPUT_DIR, RENDITIONS[0].name), 'format=duration');
  console.log(`\nmeasured duration ${Number(duration).toFixed(3)}s`);
}

function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`Source clip is missing: ${SOURCE}`);
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const [sourceDuration] = probe(SOURCE, 'format=duration');
  const durationSeconds = Math.min(Number(sourceDuration), SEGMENT_DURATION_SECONDS);

  for (const rendition of RENDITIONS) encode(rendition, durationSeconds);
  for (const poster of POSTERS) extractPoster(poster);

  report();
}

main();
