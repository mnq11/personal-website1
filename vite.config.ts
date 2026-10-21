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
    rollupOptions: {
      output: {
        // Three.js is large and only needed by the canvas, so it ships as its own cacheable chunk.
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'three';
          }
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
