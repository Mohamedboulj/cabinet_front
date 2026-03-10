import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'
import { writeFileSync } from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
  {
    name: 'generate-redirects',
    closeBundle() {
      writeFileSync('dist/_redirects', '/*    /index.html   200\n')
    }
  }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
