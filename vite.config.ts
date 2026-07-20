import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, cpSync } from 'fs';

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

// Always pair the bundled PDF.js legacy API with the worker from the exact
// same installed package version. closeBundle runs after public/ is copied,
// so it also replaces any stale worker left there by an older build.
function copyLegacyPdfWorker() {
  return {
    name: 'copy-legacy-pdf-worker',
    closeBundle() {
      copyFileSync(
        resolve(__dirname, 'node_modules/pdfjs-dist/legacy/build/pdf.worker.min.js'),
        resolve(__dirname, 'dist/pdf.worker.min.js'),
      );
      cpSync(
        resolve(__dirname, 'node_modules/pdfjs-dist/cmaps'),
        resolve(__dirname, 'dist/cmaps'),
        { recursive: true },
      );
      cpSync(
        resolve(__dirname, 'node_modules/pdfjs-dist/standard_fonts'),
        resolve(__dirname, 'dist/standard_fonts'),
        { recursive: true },
      );
    },
  };
}

// Vite config for CEP 9 (After Effects 2020, Chromium 57)
// - base: './'  => relative asset paths so the built panel works from any folder
// - target: 'chrome57' => output JS compatible with CEP 9's embedded Chromium
// - copyPublicDir: true => copies /public (CSInterface.js, mimetype, fonts) into /dist
export default defineConfig({
  plugins: [react(), fixCepScriptTags(), copyLegacyPdfWorker()],
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