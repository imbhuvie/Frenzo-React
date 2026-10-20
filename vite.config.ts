import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://localhost:7172',
        changeOrigin: true,
        secure: false,
      },
      // SignalR hub (WebSocket + negotiate) rides the same bridge; ws: true keeps sockets proxied.
      '/hubs': {
        target: 'https://localhost:7172',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
