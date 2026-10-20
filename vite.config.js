import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true
    })
  ],
  server: {
    port: 5173,
    host: '127.0.0.1',
    strictPort: false,
    // No hardcoded hmr.port: it must follow the port the server actually
    // binds to. Pinning it made the HMR websocket dial the wrong server
    // whenever 5173 was taken, which made Vite full-reload the page every
    // second ("server connection lost. Polling for restart...").
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    sourcemap: false
  },
  define: {
    'process.env': {}
  }
});
