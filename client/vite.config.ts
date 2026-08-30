import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true, proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: true } } },
  build: { sourcemap: true, chunkSizeWarningLimit: 850 },
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' },
});
