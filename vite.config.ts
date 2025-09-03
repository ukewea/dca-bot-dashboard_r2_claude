import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/dca-bot-dashboard_r2_claude/' : '/',
  define: {
    'import.meta.env.VITE_DATA_BASE_PATH': JSON.stringify(process.env.VITE_DATA_BASE_PATH || '/data')
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          utils: ['date-fns']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})