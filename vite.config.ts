import { copyFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const SOURCE_ONLY_PUBLIC_DIRS = ['assets/video', 'assets/photo'];
export const BUILD_MANIFEST_PATH = '.build-manifest.json';

function pruneSourceMedia(): Plugin {
  return {
    name: 'prune-source-media',
    apply: 'build',
    async closeBundle() {
      const outDir = path.resolve('dist');

      // The manifest exists only so scripts/check-budgets.mjs can walk the chunk
      // graph. Lift it out of dist first so the deployment does not serve the
      // build's module map at /.vite/manifest.json.
      const manifest = path.join(outDir, '.vite', 'manifest.json');
      if (existsSync(manifest)) {
        await copyFile(manifest, path.resolve(BUILD_MANIFEST_PATH));
      }

      await Promise.all([
        ...SOURCE_ONLY_PUBLIC_DIRS.map((dir) =>
          rm(path.join(outDir, dir), { recursive: true, force: true }),
        ),
        rm(path.join(outDir, '.vite'), { recursive: true, force: true }),
      ]);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), pruneSourceMedia()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: false,
  },
  preview: {
    port: process.env.PORT ? Number(process.env.PORT) : 4173,
    strictPort: false,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    manifest: true,
    modulePreload: {
      resolveDependencies: (_filename, deps) =>
        deps.filter((dep) => !dep.includes('motion') && !dep.includes('hls')),
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/node_modules\/hls\.js/.test(id)) return 'hls';
        },
      },
    },
    target: 'esnext',
    minify: 'oxc',
  },
});
