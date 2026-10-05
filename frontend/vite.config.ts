import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

/** El PC se une a la red de la campana; en el navegador `/api` sale por este proxy. */
const DEVICE = process.env.SOLARBELL_DEVICE ?? 'http://192.168.4.1'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': { target: DEVICE, changeOrigin: true },
    },
  },
  preview: {
    proxy: {
      '/api': { target: DEVICE, changeOrigin: true },
    },
  },
})
