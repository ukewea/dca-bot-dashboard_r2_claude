import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const base = process.env.VITE_BASE_PATH || '/';
  return {
    plugins: [react()],
    base,
    define: {
      'import.meta.env.VITE_DATA_BASE_PATH': JSON.stringify(process.env.VITE_DATA_BASE_PATH || '')
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
  }
})
