// frontend/vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: process.env.VITE_BASE_PATH || "/Project_MovieTicketBooking_NodeJS",
    server: {
      port: 3002,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
