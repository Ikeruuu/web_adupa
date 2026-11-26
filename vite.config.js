import { defineConfig } from 'vite';

// base relativa: el mismo build funciona en adupa.es (raíz) y en una subcarpeta (GitHub Pages).
export default defineConfig({
  base: './',
  server: { port: 5173, strictPort: true, host: true },
  build: { target: 'es2020', chunkSizeWarningLimit: 900 },
});
