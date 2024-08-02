import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/client',
  plugins: [react()],
  build: {
    outDir: 'build',
    emptyOutDir: true,
  },
  server: {
    strictPort: true,
    port: 3000,
    host: 'localhost',
    hmr: {
      host: 'display-client.local.itkdev.dk',
      protocol: 'wss',
      clientPort: 443,
      path: '/ws',
    },
  },
});
