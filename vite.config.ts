import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild'
  },
  server: {
    // Bind to all interfaces (0.0.0.0) so the dev server is reachable from
    // other devices via Tailscale/LAN, not just localhost on the host box.
    host: true,
    port: 3000,
    open: true
  }
});
