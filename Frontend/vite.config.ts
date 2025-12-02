import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'frontend',      // Allow internal docker hostname
      'localhost',     // Allow local access
      '127.0.0.1',
      'nginx'
    ],
    host: '0.0.0.0',   // Ensure it listens on all interfaces
    port: 5173
  }
})
