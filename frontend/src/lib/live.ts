import { getToken } from '@/lib/api'

/** Mensajes de `/ws/app`. `open` lo emite el cliente en cada (re)conexión. */
export type LiveMessage =
  | { type: 'open' }
  | { type: 'ring_state'; run: unknown }
  | { type: 'device_status'; online: boolean }

const MAX_DELAY_MS = 30_000
const CLOSE_UNAUTHORIZED = 4401

const listeners = new Set<(message: LiveMessage) => void>()
let socket: WebSocket | null = null
let wanted = false
let attempt = 0
let retryTimer = 0

function dispatch(message: LiveMessage) {
  for (const listener of listeners) listener(message)
}

function scheduleRetry() {
  window.clearTimeout(retryTimer)
  const delay = Math.min(MAX_DELAY_MS, 1000 * 2 ** attempt++)
  retryTimer = window.setTimeout(open, delay)
}

function open() {
  const token = getToken()
  if (!wanted || !token || socket) return
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
  const ws = new WebSocket(`${protocol}://${location.host}/ws/app?token=${encodeURIComponent(token)}`)
  socket = ws

  ws.onopen = () => {
    attempt = 0
    dispatch({ type: 'open' })
  }
  ws.onmessage = (event) => {
    try {
      dispatch(JSON.parse(String(event.data)) as LiveMessage)
    } catch {
      // Mensaje no JSON: se ignora.
    }
  }
  ws.onclose = (event) => {
    if (socket !== ws) return
    socket = null
    if (wanted && event.code !== CLOSE_UNAUTHORIZED) scheduleRetry()
  }
}

export function connectLive() {
  wanted = true
  attempt = 0
  open()
}

export function disconnectLive() {
  wanted = false
  window.clearTimeout(retryTimer)
  const ws = socket
  socket = null
  ws?.close()
}

export function onLive(listener: (message: LiveMessage) => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
