import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import http from 'node:http'
import { fileURLToPath, URL } from 'node:url'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'

/** El PC se une a la red de la campana; en el navegador `/api` sale por este proxy. */
const DEVICE = process.env.SOLARBELL_DEVICE ?? 'http://192.168.4.1'
const TARGET = new URL(DEVICE)
const PROXY_MS = 1500
const DOWN_COOLDOWN_MS = 4000

function away(res: http.ServerResponse) {
  res.statusCode = 504
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ detail: 'La campana no está al alcance' }))
}

/** Proxy propio: si la campana no está, responde 504 en silencio (Vite no loguea ETIMEDOUT). */
function deviceProxy(): Plugin {
  let downUntil = 0

  const toDevice = (req: http.IncomingMessage, res: http.ServerResponse, next: () => void) => {
    if (!req.url?.startsWith('/api')) {
      next()
      return
    }
    if (Date.now() < downUntil) {
      away(res)
      return
    }

    const outgoing = http.request(
      {
        hostname: TARGET.hostname,
        port: TARGET.port || 80,
        path: req.url,
        method: req.method,
        headers: { ...req.headers, host: TARGET.host },
      },
      (incoming) => {
        res.writeHead(incoming.statusCode ?? 502, incoming.headers)
        incoming.pipe(res)
      },
    )

    const timer = setTimeout(() => outgoing.destroy(), PROXY_MS)
    outgoing.on('close', () => clearTimeout(timer))
    outgoing.on('error', () => {
      downUntil = Date.now() + DOWN_COOLDOWN_MS
      if (!res.headersSent) away(res)
    })
    req.pipe(outgoing)
  }

  return {
    name: 'solarbell-device-proxy',
    configureServer(server) {
      server.middlewares.use(toDevice)
    },
    configurePreviewServer(server) {
      server.middlewares.use(toDevice)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), deviceProxy()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
})
