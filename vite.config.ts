import { rm } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const SOURCE_ONLY_PUBLIC_DIRS = ['assets/video', 'assets/photo'];
function pruneSourceMedia(): Plugin {
  return {
    name: 'prune-source-media',
    apply: 'build',
    async closeBundle() {
      const outDir = path.resolve('dist');
      await Promise.all(
        SOURCE_ONLY_PUBLIC_DIRS.map((dir) =>
          rm(path.join(outDir, dir), { recursive: true, force: true }),
        ),
      );
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
