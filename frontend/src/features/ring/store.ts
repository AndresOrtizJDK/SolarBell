import { TIME_DEFAULT_MS } from '@/features/schedule/bell'
import type { RingConfig } from '@/features/schedule/types'
import { device, type DeviceRun, type DeviceStatus } from '@/lib/device'
import { useSyncExternalStore } from 'react'

const KEY = 'solarbell:ring:v2'
/** Diferencia de reloj por debajo de la cual una nueva lectura no mueve la cuenta regresiva. */
const DRIFT_MS = 500

const DEFAULT_CONFIG: RingConfig = {
  rings: 1,
  ringMs: TIME_DEFAULT_MS,
  pauseMs: TIME_DEFAULT_MS,
  customDurations: null,
  customPauses: null,
}

/** Toque en curso. Tiempos en ms epoch del teléfono. */
export type RingRun = {
  id: number
  source: 'manual' | 'scheduled'
  label: string
  /** ms de cada toque. */
  durations: number[]
  /** ms de silencio tras cada toque menos el último. */
  pauses: number[]
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

function toRun(remote: DeviceRun, receivedAt: number): RingRun {
  const startedAt = receivedAt - remote.elapsedMs
  const total = [...remote.durations, ...remote.pauses].reduce((sum, ms) => sum + ms, 0)
  return {
    id: remote.id,
    source: remote.source,
    label: remote.label,
    durations: remote.durations,
    pauses: remote.pauses,
    startedAt,
    endsAt: startedAt + total,
  }
}

function setRun(next: RingRun | null) {
  window.clearTimeout(timer)
  run = next
  // Si la campana deja de responder, el toque se da por terminado a su hora.
  if (next) timer = window.setTimeout(() => setRun(null), Math.max(0, next.endsAt - Date.now()))
  emit()
}

/** Lo llama cada lectura de `/status`. */
export function applyDeviceRun(remote: DeviceRun | null, receivedAt = Date.now()) {
  if (!remote) {
    if (run) setRun(null)
    return
  }
  const next = toRun(remote, receivedAt)
  if (run?.id === next.id && Math.abs(run.startedAt - next.startedAt) < DRIFT_MS) return
  setRun(next)
}

const getConfig = () => config
const getRun = () => run

export function useRingConfig() {
  return useSyncExternalStore(subscribe, getConfig)
}

export function useRingRun() {
  return useSyncExternalStore(subscribe, getRun)
}

/** La campana lleva el tiempo: la app solo pide el toque y lo refleja. */
export async function startRing(next: RingConfig) {
  config = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Sin storage la configuración vive solo en esta sesión.
  }
  emit()
  const status = await device<DeviceStatus>('/ring', { method: 'POST', body: next })
  applyDeviceRun(status.run)
  return run
}

export async function stopRing() {
  setRun(null)
  const status = await device<DeviceStatus>('/ring/stop', { method: 'POST' })
  applyDeviceRun(status.run)
}
