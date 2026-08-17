import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGETS = {
  initialJsGzip: 130 * 1024,
  glChunkGzip: 180 * 1024,
  cssGzip: 20 * 1024,
  fontsTotal: 120 * 1024,
  heroVideo: 2.5 * 1024 * 1024,
};

const distDir = path.join(process.cwd(), 'dist');
const manifestPath = path.join(distDir, '.vite', 'manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error('No dist/.vite/manifest.json found. Run `pnpm build` first.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

function gzipSize(relativeFile) {
  const filePath = path.join(distDir, relativeFile);
  if (!fs.existsSync(filePath)) return 0;
  return gzipSync(fs.readFileSync(filePath)).length;
}

function collectStaticGraph(chunkKey, visited = new Set()) {
  if (visited.has(chunkKey)) return visited;
  visited.add(chunkKey);
  const chunk = manifest[chunkKey];
  if (!chunk) return visited;
  for (const importedKey of chunk.imports ?? []) {
    collectStaticGraph(importedKey, visited);
  }
  return visited;
}

const entryKey = Object.keys(manifest).find((key) => manifest[key].isEntry);
if (!entryKey) {
  console.error('No entry chunk found in manifest.');
  process.exit(1);
}

const initialChunkKeys = collectStaticGraph(entryKey);

let initialJsGzip = 0;
let cssGzip = 0;
const initialFiles = [];

for (const key of initialChunkKeys) {
  const chunk = manifest[key];
  initialJsGzip += gzipSize(chunk.file);
  initialFiles.push(chunk.file);
  for (const cssFile of chunk.css ?? []) {
    cssGzip += gzipSize(cssFile);
  }
}

const allJsFiles = fs
  .readdirSync(path.join(distDir, 'assets'))
  .filter((f) => f.endsWith('.js'));
const GL_CHUNK_PATTERN =
  /(three|react-three|fiber|drei|postprocessing|GlCanvas|ReelScene)/;
const glChunkFiles = allJsFiles.filter(
  (f) => GL_CHUNK_PATTERN.test(f) && !initialFiles.includes(`assets/${f}`),
);
const glChunkGzip = glChunkFiles.reduce((sum, f) => sum + gzipSize(`assets/${f}`), 0);

const lazyRouteFiles = allJsFiles.filter(
  (f) => !initialFiles.includes(`assets/${f}`) && !glChunkFiles.includes(f),
);
const lazyRouteGzip = lazyRouteFiles.reduce((sum, f) => sum + gzipSize(`assets/${f}`), 0);

let failed = false;

function report(label, actual, budget) {
  const kb = (actual / 1024).toFixed(2);
  const budgetKb = (budget / 1024).toFixed(0);
  if (actual > budget) {
    console.error(`FAIL ${label}: ${kb}KB (budget: ${budgetKb}KB)`);
    failed = true;
  } else {
    console.log(`OK   ${label}: ${kb}KB (budget: ${budgetKb}KB)`);
  }
}

function walk(dir, match) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full, match);
    return match(entry.name) ? [full] : [];
  });
}

const fontFiles = walk(distDir, (name) => name.endsWith('.woff2'));
const fontsTotal = fontFiles.reduce((sum, f) => sum + fs.statSync(f).size, 0);

const heroFile = path.join(distDir, 'assets', 'hero', 'loop-1080p.mp4');
if (!fs.existsSync(heroFile)) {
  console.error(`Hero loop missing from the build at ${heroFile}.`);
  process.exit(1);
}
const heroSize = fs.statSync(heroFile).size;

if (fontFiles.length === 0) {
  console.error('No woff2 fonts found in the build; the font budget cannot be verified.');
  process.exit(1);
}

console.log('--- Build Budgets (gzip) ---');
report('Initial JS (entry + static imports)', initialJsGzip, BUDGETS.initialJsGzip);
report('CSS', cssGzip, BUDGETS.cssGzip);
report('GL chunk (three/R3F, lazy)', glChunkGzip, BUDGETS.glChunkGzip);
report(`Fonts (${fontFiles.length} woff2, uncompressed)`, fontsTotal, BUDGETS.fontsTotal);
report('Hero loop 1080p (uncompressed)', heroSize, BUDGETS.heroVideo);
console.log(
  `INFO Lazy route chunks (not budgeted individually): ${(lazyRouteGzip / 1024).toFixed(2)}KB across ${lazyRouteFiles.length} files`,
);

if (failed) {
  console.error('\nBudget exceeded.');
  process.exit(1);
}
