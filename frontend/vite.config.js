import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'localhost',
      port: 5173,
      // Overlay errors in the browser instead of failing silently
      overlay: true,
      // Increase timeout so brief network blips don't kill the HMR socket
      timeout: 10000,
    },
  },
})
