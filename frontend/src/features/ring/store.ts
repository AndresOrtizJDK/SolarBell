import type { RingConfig } from '@/features/schedule/types'
import { api } from '@/lib/api'
import { onLive } from '@/lib/live'
import { useSyncExternalStore } from 'react'

const KEY = 'solarbell:ring:v1'

const DEFAULT_CONFIG: RingConfig = { rings: 1, ringSeconds: 3, customDurations: null }

/** Toque en curso según el servidor. Tiempos en ms epoch. */
export type RingRun = {
  id: number
  source: 'manual' | 'scheduled'
  label: string
  durations: number[]
  /** Silencio entre toques consecutivos. */
  pauseMs: number
  startedAt: number
  endsAt: number
  /** `false`: el nodo no estaba conectado y el toque solo quedó registrado. */
  delivered: boolean
}

type RingState = { run: RingRun | null; deviceOnline: boolean }

function load(): RingConfig {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Partial<RingConfig>) }
  } catch {
    // Storage corrupto o bloqueado: arrancar con un toque corto.
  }
  return DEFAULT_CONFIG
}

let config = load()
let run: RingRun | null = null
/** `null` hasta que el servidor responda. */
let deviceOnline: boolean | null = null
let timer = 0
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function setRun(next: RingRun | null) {
  window.clearTimeout(timer)
  run = next
  // Respaldo por si el WebSocket no avisa el final.
  if (next) timer = window.setTimeout(() => setRun(null), Math.max(0, next.endsAt - Date.now()))
  emit()
}

function apply(state: RingState) {
  deviceOnline = state.deviceOnline
  setRun(state.run)
}

onLive((message) => {
  if (message.type === 'ring_state') setRun(message.run as RingRun | null)
  if (message.type === 'device_status') {
    deviceOnline = message.online
    emit()
  }
})

const getConfig = () => config
const getRun = () => run
const getDeviceOnline = () => deviceOnline

export function useRingConfig() {
  return useSyncExternalStore(subscribe, getConfig)
}

export function useRingRun() {
  return useSyncExternalStore(subscribe, getRun)
}

export function useDeviceOnline() {
  return useSyncExternalStore(subscribe, getDeviceOnline)
}

/** Pide el toque al servidor, que lo manda al nodo y lleva el tiempo. */
export async function startRing(next: RingConfig) {
  config = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Sin storage la configuración vive solo en esta sesión.
  }
  emit()
  const state = await api<RingState>('/ring', { method: 'POST', body: next })
  apply(state)
  return state.run
}

export async function stopRing() {
  setRun(null)
  apply(await api<RingState>('/ring/stop', { method: 'POST' }))
}

export async function refreshRing() {
  apply(await api<RingState>('/ring'))
}
