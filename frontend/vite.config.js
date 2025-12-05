import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite proxy ensures frontend and backend appear same-site for cookie (SameSite=lax)
const backendTarget = process.env.BACKEND_TARGET || 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5174,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: backendTarget,
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
