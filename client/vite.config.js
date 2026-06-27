import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Listen on all network interfaces (0.0.0.0) so the dev server is reachable
    // from other hosts by IP, not just localhost. Set HOST=127.0.0.1 to restrict.
    host: process.env.HOST || true,
    // Proxy API calls to the backend during development so the frontend can use
    // same-origin '/api/...' requests (no CORS, no hardcoded host).
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
