import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/session-files': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    },
    allowedHosts: ['23cb-128-197-28-179.ngrok-free.app']
  }
})