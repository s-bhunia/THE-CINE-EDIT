import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';

const OUT_ROOT = 'public/assets/works';
const TARGET_MEGABYTES = 18;
const AUDIO_KBPS = 96;
const MAX_VIDEO_KBPS = 2200;
const MIN_VIDEO_KBPS = 420;

const LADDER = [
  { minKbps: 900, width: 1280, height: 720 },
  { minKbps: 560, width: 960, height: 540 },
  { minKbps: 0, width: 854, height: 480 },
];

const CLIPS = [
  {
    slug: 'riya-weds-tarun',
    source: 'public/assets/video/WEDDING TEASER/Sequence 06_18.mp4',
    posterAt: 42,
    grabsAt: [12, 42, 96],
    previewStart: 40,
    previewDuration: 6,
  },
  {
    slug: 'wedding-teaser-reception',
    source: 'public/assets/video/WEDDING TEASER/Sequence 06_20.mp4',
    posterAt: 40,
    grabsAt: [15, 40, 92],
    previewStart: 38,
    previewDuration: 6,
  },
  {
    slug: 'biki-debashrita-prewedding',
    source: 'public/assets/video/pre wedding reels/Sequence 06_13.mp4',
    posterAt: 18,
    grabsAt: [6, 18, 34],
    previewStart: 16,
    previewDuration: 6,
  },
  {
    slug: 'prewedding-reel-courtyard',
    source: 'public/assets/video/pre wedding reels/Sequence 02_42.mp4',
    posterAt: 20,
    grabsAt: [7, 20, 38],
    previewStart: 18,
    previewDuration: 6,
  },
  {
    slug: 'prewedding-reel-golden-hour',
    source: 'public/assets/video/pre wedding reels/Sequence 06_14.mp4',
    posterAt: 16,
    grabsAt: [5, 16, 30],
    previewStart: 14,
    previewDuration: 6,
  },
  {
    slug: 'colour-grade-seaside',
    source: 'public/assets/video/pre wedding reels/Sequence 04_7.mp4',
    posterAt: 10,
    grabsAt: [4, 10, 19],
    previewStart: 9,
    previewDuration: 6,
  },
  {
    slug: 'prewedding-film-first-light',
    source: 'public/assets/video/pre wedding video/Sequence 02_44.mp4',
    posterAt: 70,
    grabsAt: [25, 70, 160],
    previewStart: 68,
    previewDuration: 6,
  },
  {
    slug: 'prewedding-film-riverside',
    source: 'public/assets/video/pre wedding video/Sequence 06_17.mp4',
    posterAt: 66,
    grabsAt: [22, 66, 150],
    previewStart: 64,
    previewDuration: 6,
  },
  {
    slug: 'prewedding-film-terrace',
    source: 'public/assets/video/pre wedding video/Sequence 06_19.mp4',
    posterAt: 60,
    grabsAt: [20, 60, 140],
    previewStart: 58,
    previewDuration: 6,
  },
  {
    slug: 'wedding-highlights-reel',
    source: 'public/assets/video/wedding reels/demo.mp4',
    posterAt: 16,
    grabsAt: [5, 16, 30],
    previewStart: 14,
    previewDuration: 6,
  },
  {
    slug: 'wedding-reel-ceremony',
    source: 'public/assets/video/wedding reels/Sequence 05_18.mp4',
    posterAt: 17,
    grabsAt: [6, 17, 31],
    previewStart: 15,
    previewDuration: 6,
  },
  {
    slug: 'wedding-reel-sangeet',
    source: 'public/assets/video/wedding reels/Sequence 06_15.mp4',
    posterAt: 15,
    grabsAt: [5, 15, 29],
    previewStart: 13,
    previewDuration: 6,
  },
  {
    slug: 'wedding-reel-reception',
    source: 'public/assets/video/wedding reels/Sequence 08.mp4',
    posterAt: 18,
    grabsAt: [6, 18, 33],
    previewStart: 16,
    previewDuration: 6,
  },
  {
    slug: 'slog3-colour-grade',
    source: 'public/assets/video/color greding reels/post 2.mp4',
    rotate: 'transpose=2',
    posterAt: 8,
    grabsAt: [2, 8, 20],
    previewStart: 5,
    previewDuration: 6,
  },
  {
    slug: 'colour-grade-comparison',
    source: 'public/assets/video/color greding reels/Sequence 08_3.mp4',
    posterAt: 18,
    grabsAt: [6, 18, 34],
    previewStart: 16,
    previewDuration: 6,
  },
];

function ffprobeDuration(source) {
  const out = execFileSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=nw=1:nk=1',
      source,
    ],
    { encoding: 'utf8' },
  );
  return Number.parseFloat(out.trim());
}

function ffmpeg(args) {
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    stdio: 'inherit',
  });
}

function pickRendition(durationSeconds) {
  const budgetKbps = (TARGET_MEGABYTES * 1024 * 8) / durationSeconds;
  const videoKbps = Math.round(
    Math.min(MAX_VIDEO_KBPS, Math.max(MIN_VIDEO_KBPS, budgetKbps - AUDIO_KBPS)),
  );
  const rung =
    LADDER.find((entry) => videoKbps >= entry.minKbps) ?? LADDER[LADDER.length - 1];
  return { videoKbps, ...rung };
}

function scaleFilter(clip, width, height) {
  const fit = `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black`;
  return clip.rotate ? `${clip.rotate},${fit}` : fit;
}

function encodeFull(clip, outDir, duration) {
  const { videoKbps, width, height } = pickRendition(duration);
  const passlog = path.join(outDir, 'x264');
  const vf = scaleFilter(clip, width, height);
  const common = [
    '-i',
    clip.source,
    '-c:v',
    'libx264',
    '-profile:v',
    'high',
    '-preset',
    'slow',
    '-b:v',
    `${videoKbps}k`,
    '-maxrate',
    `${Math.round(videoKbps * 1.5)}k`,
    '-bufsize',
    `${videoKbps * 2}k`,
    '-vf',
    vf,
    '-pix_fmt',
    'yuv420p',
  ];

  ffmpeg([...common, '-pass', '1', '-passlogfile', passlog, '-an', '-f', 'null', '-']);
  ffmpeg([
    ...common,
    '-pass',
    '2',
    '-passlogfile',
    passlog,
    '-c:a',
    'aac',
    '-b:a',
    `${AUDIO_KBPS}k`,
    '-movflags',
    '+faststart',
    path.join(outDir, 'full.mp4'),
  ]);

  for (const suffix of ['-0.log', '-0.log.mbtree', '.log', '.log.mbtree']) {
    rmSync(`${passlog}${suffix}`, { force: true });
  }

  return { width, height, videoKbps };
}

function encodePreview(clip, outDir) {
  const vf = clip.rotate ? `${clip.rotate},scale=960:-2` : 'scale=960:-2';
  ffmpeg([
    '-ss',
    String(clip.previewStart),
    '-t',
    String(clip.previewDuration),
    '-i',
    clip.source,
    '-an',
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '30',
    '-vf',
    vf,
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    path.join(outDir, 'preview.mp4'),
  ]);
}

function encodeStills(clip, outDir) {
  const vf = clip.rotate ? `${clip.rotate},scale=1600:-2` : 'scale=1600:-2';
  const shot = (time, target) =>
    ffmpeg(['-ss', String(time), '-i', clip.source, '-vframes', '1', '-vf', vf, target]);

  shot(clip.posterAt, path.join(outDir, 'poster.avif'));
  shot(clip.posterAt, path.join(outDir, 'poster.webp'));
  clip.grabsAt.forEach((time, index) => {
    shot(time, path.join(outDir, `grab-${index + 1}.avif`));
  });
}

function megabytes(file) {
  return (statSync(file).size / 1024 / 1024).toFixed(2);
}

const only = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
const selected = only.length ? CLIPS.filter((c) => only.includes(c.slug)) : CLIPS;

for (const clip of selected) {
  if (!existsSync(clip.source)) {
    console.error(`missing source: ${clip.source}`);
    process.exit(1);
  }

  const outDir = path.join(OUT_ROOT, clip.slug);
  mkdirSync(outDir, { recursive: true });

  const duration = ffprobeDuration(clip.source);
  const { width, height, videoKbps } = encodeFull(clip, outDir, duration);
  encodePreview(clip, outDir);
  encodeStills(clip, outDir);

  const size = megabytes(path.join(outDir, 'full.mp4'));
  const flag = Number(size) > 20 ? ' OVER BUDGET' : '';
  console.log(
    `${clip.slug} ${width}x${height} ${videoKbps}kbps ${duration.toFixed(0)}s -> ${size}MB${flag}`,
  );
}
