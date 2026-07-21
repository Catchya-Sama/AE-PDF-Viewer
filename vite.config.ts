  import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Custom plugin: fix script tags for CEP 9 (Chromium 57) compatibility
// CEP 9 loads from file:// protocol where:
// 1. crossorigin attribute causes CORS check failure
// 2. type="module" causes strict MIME type checking failure (no MIME header from file://)
// Solution: remove crossorigin, change type="module" to type="text/javascript" defer
function fixCepScriptTags() {
  return {
    name: 'fix-cep-script-tags',
    transformIndexHtml(html: string) {
      return html
        // Remove crossorigin attribute
        .replace(/\s+crossorigin/g, '')
        // Change type="module" to type="text/javascript" defer
        // This fixes the "non-JavaScript MIME type" error in CEP 9
        .replace(/<script type="module"/g, '<script type="text/javascript" defer');
    },
  };
}

// Vite config for CEP 9 (After Effects 2020, Chromium 57)
// - base: './'  => relative asset paths so the built panel works from any folder
// - target: 'chrome57' => output JS compatible with CEP 9's embedded Chromium
// - copyPublicDir: true => copies /public (CSInterface.js, mimetype, fonts) into /dist
export default defineConfig({
  plugins: [react(), fixCepScriptTags()],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: true,
    target: 'chrome57',
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});