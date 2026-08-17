import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

const OUT_DIR = path.resolve('public/audio');
const TMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-sprite-'));

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

const SPRITE_DURATION = 3.0;

const clips = [
  {
    name: 'tape-click',
    start: 0,
    gen: `-f lavfi -i "sine=frequency=3000:duration=0.15" -af "afade=t=out:st=0.02:d=0.13,volume=0.35"`,
  },
  {
    name: 'reel-spool',
    start: 0.5,
    gen: `-f lavfi -i "anoisesrc=d=0.4:c=pink:a=0.5" -af "bandpass=f=1100:width_type=h:w=800,tremolo=f=18:d=0.6,afade=t=in:st=0:d=0.05,afade=t=out:st=0.3:d=0.1,volume=0.3"`,
  },
  {
    name: 'shutter',
    start: 1.2,
    gen: `-f lavfi -i "anoisesrc=d=0.2:c=white:a=0.8" -af "highpass=f=2200,afade=t=in:st=0:d=0.005,afade=t=out:st=0.05:d=0.15,volume=0.3"`,
  },
  {
    name: 'sub-thud',
    start: 1.8,
    gen: `-f lavfi -i "sine=frequency=80:duration=0.35" -af "afade=t=out:st=0.05:d=0.3,volume=0.4"`,
  },
  {
    name: 'slate-clap',
    start: 2.5,
    gen: `-f lavfi -i "anoisesrc=d=0.2:c=white:a=0.9" -af "bandpass=f=2000:width_type=h:w=3000,afade=t=in:st=0:d=0.002,afade=t=out:st=0.03:d=0.17,volume=0.4"`,
  },
];

for (const clip of clips) {
  const file = path.join(TMP_DIR, `${clip.name}.wav`);
  run(`ffmpeg -y ${clip.gen} -ar 48000 -ac 1 "${file}"`);
}

const delayedInputs = clips
  .map((clip) => `-i "${path.join(TMP_DIR, `${clip.name}.wav`)}"`)
  .join(' ');

const filterParts = clips
  .map(
    (clip, i) =>
      `[${i}]adelay=${Math.round(clip.start * 1000)}|${Math.round(clip.start * 1000)}[d${i}]`,
  )
  .join('; ');
const mixInputs = clips.map((_, i) => `[d${i}]`).join('');
const filterComplex = `${filterParts}; ${mixInputs}amix=inputs=${clips.length}:duration=longest:normalize=0[mixed]; [mixed]apad=whole_dur=${SPRITE_DURATION}[out]`;

const mixedWav = path.join(TMP_DIR, 'mixed.wav');
run(
  `ffmpeg -y ${delayedInputs} -filter_complex "${filterComplex}" -map "[out]" -ar 48000 -ac 1 "${mixedWav}"`,
);

run(
  `ffmpeg -y -i "${mixedWav}" -c:a libopus -b:a 48k "${path.join(OUT_DIR, 'ui-sprite.webm')}"`,
);
run(
  `ffmpeg -y -i "${mixedWav}" -c:a aac -b:a 64k "${path.join(OUT_DIR, 'ui-sprite.m4a')}"`,
);

fs.rmSync(TMP_DIR, { recursive: true, force: true });

console.log('UI sprite written to public/audio/ui-sprite.webm + .m4a');
