import { mkdir, rm, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'fonts');
const workDir = path.join(os.tmpdir(), 'cutting-room-fonts');

const UNICODES = [
  'U+0000-00FF',
  'U+0131',
  'U+0152-0153',
  'U+02BB-02BC',
  'U+02C6',
  'U+02DA',
  'U+02DC',
  'U+0304',
  'U+0308',
  'U+0329',
  'U+2000-206F',
  'U+20AC',
  'U+2122',
  'U+2191',
  'U+2193',
  'U+2212',
  'U+2215',
  'U+FEFF',
  'U+FFFD',
].join(',');

const FONTS = [
  {
    from: '@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2',
    to: 'fraunces-variable.woff2',
    pinnedAxes: ['opsz=144'],
  },
  {
    from: '@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2',
    to: 'instrument-sans-variable.woff2',
    pinnedAxes: [],
  },
  {
    from: '@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2',
    to: 'geist-mono-variable.woff2',
    pinnedAxes: [],
  },
];

const PYTHON = process.env.PYTHON ?? 'python';

function python(args) {
  execFileSync(PYTHON, args, { stdio: ['ignore', 'ignore', 'pipe'] });
}

try {
  python(['-c', 'import fontTools']);
} catch {
  console.error(
    'fontTools is required. Install it with: python -m pip install "fonttools[woff]"',
  );
  process.exit(1);
}

await mkdir(outDir, { recursive: true });
await mkdir(workDir, { recursive: true });

let total = 0;

for (const font of FONTS) {
  const source = path.join(root, 'node_modules', font.from);
  const target = path.join(outDir, font.to);
  const before = (await stat(source)).size;

  let subsetInput = source;

  if (font.pinnedAxes.length > 0) {
    const pinned = path.join(workDir, `${font.to}.pinned.ttf`);
    python([
      '-m',
      'fontTools.varLib.instancer',
      source,
      ...font.pinnedAxes,
      '--output',
      pinned,
    ]);
    subsetInput = pinned;
  }

  python([
    '-m',
    'fontTools.subset',
    subsetInput,
    `--unicodes=${UNICODES}`,
    '--layout-features=*',
    '--flavor=woff2',
    `--output-file=${target}`,
  ]);

  const after = (await stat(target)).size;
  total += after;
  const saved = (((before - after) / before) * 100).toFixed(0);
  console.log(
    `${font.to}: ${(before / 1024).toFixed(1)}KB -> ${(after / 1024).toFixed(1)}KB (-${saved}%)`,
  );
}

await rm(workDir, { recursive: true, force: true });

const BUDGET = 120 * 1024;
console.log(`total: ${(total / 1024).toFixed(1)}KB (budget ${BUDGET / 1024}KB)`);

if (total > BUDGET) {
  console.error('Font budget exceeded.');
  process.exit(1);
}
