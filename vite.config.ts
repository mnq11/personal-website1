/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative base keeps the build portable: custom domain, Vercel or a GitHub Pages sub-path.
  base: './',
  build: {
    target: 'es2022',
    sourcemap: true,
    // The Three.js chunk is ~250 kB gzipped but is lazy-loaded after the page renders.
    chunkSizeWarningLimit: 1000,
    // No manual chunking: a forced `three` chunk made the entry bundle import (and preload) it, delaying first paint.
    // Left to Rollup, Three.js stays in lazy chunks that load after the page renders.
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
