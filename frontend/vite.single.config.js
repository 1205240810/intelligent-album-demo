import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'single-dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
