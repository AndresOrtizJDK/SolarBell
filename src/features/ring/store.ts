import { ringDurations, totalSeconds } from '@/features/schedule/bell'
import type { RingConfig } from '@/features/schedule/types'
import { useSyncExternalStore } from 'react'

const KEY = 'solarbell:ring:v1'

const DEFAULT_CONFIG: RingConfig = { rings: 1, ringSeconds: 3, customDurations: null }

export type RingRun = {
  id: number
  durations: number[]
  startedAt: number
  endsAt: number
}

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
let nextId = 0
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

const getConfig = () => config
const getRun = () => run

export function useRingConfig() {
  return useSyncExternalStore(subscribe, getConfig)
}

export function useRingRun() {
  return useSyncExternalStore(subscribe, getRun)
}

/**
 * Arranca un toque manual. El envío al nodo LoRa todavía no existe (ver PRODUCT.md):
 * por ahora solo se lleva el tiempo en el cliente.
 */
export function startRing(next: RingConfig) {
  config = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Sin storage la configuración vive solo en esta sesión.
  }
  window.clearTimeout(timer)
  const startedAt = Date.now()
  const ms = totalSeconds(next) * 1000
  run = { id: ++nextId, durations: ringDurations(next), startedAt, endsAt: startedAt + ms }
  timer = window.setTimeout(stopRing, ms)
  emit()
}

export function stopRing() {
  window.clearTimeout(timer)
  if (!run) return
  run = null
  emit()
}
