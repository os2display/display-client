import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from "vite-plugin-svgr";

export default defineConfig({
  base: '/client',
  plugins: [
    react(),
    svgr({
      // svgr options: https://react-svgr.com/docs/options/
      svgrOptions: { exportType: "default", ref: true, svgo: false, titleProp: true },
      include: "**/*.svg",
    })
  ],
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
