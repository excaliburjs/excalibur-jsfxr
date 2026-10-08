import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, '..');

// Plain dev server for the example pages - no build step. The examples import the plugin by
// its published package name so they read exactly like consumer code; the alias points that
// at the TypeScript source so the example always exercises src/, not a stale dist/.
export default defineConfig({
  resolve: {
    alias: {
      '@excaliburjs/plugin-jsfxr': path.join(repoRoot, 'src/index.ts')
    }
  },
  server: {
    fs: {
      allow: [repoRoot]
    }
  }
});
