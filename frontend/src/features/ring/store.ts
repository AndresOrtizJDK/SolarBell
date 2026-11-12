import { TIME_DEFAULT_MS, ringDurations, ringPauses } from '@/features/schedule/bell'
import type { RingConfig } from '@/features/schedule/types'
import { device, INVERTER_WARMUP_MS, type DeviceRun, type DeviceStatus } from '@/lib/device'
import { useCallback, useMemo, useSyncExternalStore } from 'react'

const KEY = 'solarbell:ring:v2'
/** Diferencia de reloj por debajo de la cual una nueva lectura no mueve la cuenta regresiva. */
const DRIFT_MS = 500
/** Margen tras el fin estimado antes de dar el toque por terminado si la campana no contesta. */
const END_GRACE_MS = 1500
/** Cuánto se empuja el inicio si el inversor sigue arrancando cuando ya debía haber sonado. */
const WARMUP_RECHECK_MS = 250

const DEFAULT_CONFIG: RingConfig = {
  rings: 1,
  ringMs: TIME_DEFAULT_MS,
  pauseMs: TIME_DEFAULT_MS,
  customDurations: null,
  customPauses: null,
}

/**
 * Toque en curso. Tiempos en ms epoch del teléfono. `startedAt` es cuando suena el primer toque:
 * puede estar en el futuro mientras el inversor arranca.
 */
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
  /** Pedido enviado y sin respuesta: la campana todavía no confirmó el toque. */
  pending?: boolean
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
/** Pedidos de toque/detener en vuelo. Mientras haya uno, las lecturas de `/status` se ignoran. */
let busy = 0
/** Cuándo terminó el último pedido: una lectura enviada antes ya no refleja el estado real. */
let settledAt = 0
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

function buildRun(
  base: Pick<RingRun, 'id' | 'source' | 'label' | 'durations' | 'pauses'>,
  startedAt: number,
  pending?: boolean,
): RingRun {
  const { id, source, label, durations, pauses } = base
  const total = [...durations, ...pauses].reduce((sum, ms) => sum + ms, 0)
  return { id, source, label, durations, pauses, startedAt, endsAt: startedAt + total, pending }
}

/** Toque que el teléfono da por hecho en cuanto se pide, antes de que la campana conteste. */
function pendingRun(next: RingConfig, sentAt: number): RingRun {
  const base = {
    id: 0,
    source: 'manual' as const,
    label: '',
    durations: ringDurations(next),
    pauses: ringPauses(next),
  }
  return buildRun(base, sentAt + INVERTER_WARMUP_MS, true)
}

/**
 * Momento en que suena (o sonó) el primer toque. Con `elapsedMs > 0` la campana ya lo dijo.
 * Con 0 el inversor sigue arrancando: se cuenta desde que la app vio el toque y se conserva la
 * estimación en las lecturas siguientes para que no se corra hacia adelante en cada sondeo.
 */
function startedAtFor(remote: DeviceRun, seenAt: number, current: RingRun | null) {
  if (remote.elapsedMs > 0) return seenAt - remote.elapsedMs
  if (current && !current.pending && current.id === remote.id) {
    return current.startedAt > seenAt ? current.startedAt : seenAt + WARMUP_RECHECK_MS
  }
  return seenAt + INVERTER_WARMUP_MS
}

function setRun(next: RingRun | null) {
  window.clearTimeout(timer)
  run = next
  // Si la campana deja de responder, el toque se da por terminado a su hora.
  if (next) timer = window.setTimeout(() => setRun(null), Math.max(0, next.endsAt + END_GRACE_MS - Date.now()))
  emit()
}

/** `settling`: respuesta a un pedido nuestro, que también cierra el toque pendiente. */
function reconcile(remote: DeviceRun | null, sentAt: number, receivedAt: number, settling = false) {
  if (!remote) {
    if (run && (settling || !run.pending)) setRun(null)
    return
  }
  // La campana leyó su estado a mitad del viaje de ida y vuelta.
  const seenAt = (sentAt + receivedAt) / 2
  const next = buildRun(remote, startedAtFor(remote, seenAt, run))
  if (run?.id === next.id && Math.abs(run.startedAt - next.startedAt) < DRIFT_MS) return
  setRun(next)
}

/** Lo llama cada lectura de `/status`. `sentAt` es cuándo se envió el pedido. */
export function applyDeviceRun(remote: DeviceRun | null, sentAt: number, receivedAt = Date.now()) {
  if (busy > 0 || sentAt < settledAt) return
  reconcile(remote, sentAt, receivedAt)
}

/** ms hasta el fin estimado del toque en curso; `null` sin toque. */
export function msUntilRunEnds() {
  return run ? run.endsAt - Date.now() : null
}

const getConfig = () => config
const getRun = () => run

export function useRingConfig() {
  return useSyncExternalStore(subscribe, getConfig)
}

export function useRingRun() {
  return useSyncExternalStore(subscribe, getRun)
}

/** Inicio y fin de cada toque, en ms desde `startedAt`. */
function ringWindows(run: RingRun) {
  let at = 0
  return run.durations.map((ms, i) => {
    const slot = { start: at, end: at + ms }
    at += ms + (run.pauses[i] ?? 0)
    return slot
  })
}

export type RingPhase = 'idle' | 'warming' | 'sounding' | 'pause'

/** Fase y toque actual (1 a N) como texto, para que `useSyncExternalStore` lo compare por valor. */
function progressKey(run: RingRun | null) {
  if (!run) return 'idle:0'
  const elapsed = Date.now() - run.startedAt
  if (elapsed < 0) return 'warming:0'
  const windows = ringWindows(run)
  for (let i = 0; i < windows.length; i++) {
    if (elapsed < windows[i].start) return `pause:${i}`
    if (elapsed < windows[i].end) return `sounding:${i + 1}`
  }
  return `pause:${windows.length}`
}

/**
 * En qué punto va el toque, con el cambio exacto de fase: `warming` mientras arranca el inversor,
 * `sounding` mientras suena un toque y `pause` entre toques.
 */
export function useRingProgress(run: RingRun | null) {
  const subscribeEdges = useCallback(
    (notify: () => void) => {
      if (!run) return () => {}
      const elapsed = Date.now() - run.startedAt
      const timers = ringWindows(run)
        .flatMap(({ start, end }) => [start, end])
        .filter((edge) => edge > elapsed)
        // +2 ms: un timer que dispara un pelo antes del borde no vería el cambio.
        .map((edge) => window.setTimeout(notify, edge - elapsed + 2))
      return () => timers.forEach((timer) => window.clearTimeout(timer))
    },
    [run],
  )
  const key = useSyncExternalStore(subscribeEdges, () => progressKey(run))
  return useMemo(() => {
    const [phase, ring] = key.split(':')
    return { phase: phase as RingPhase, ring: Number(ring) }
  }, [key])
}

/**
 * La campana lleva el tiempo: la app solo pide el toque y lo refleja. El toque se muestra de
 * inmediato como "arrancando" y se corrige con lo que conteste la campana.
 */
export async function startRing(next: RingConfig) {
  config = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Sin storage la configuración vive solo en esta sesión.
  }
  const sentAt = Date.now()
  busy++
  setRun(pendingRun(next, sentAt))
  try {
    const status = await device<DeviceStatus>('/ring', { method: 'POST', body: next })
    reconcile(status.run, sentAt, Date.now(), true)
  } catch (error) {
    if (run?.pending) setRun(null)
    throw error
  } finally {
    busy--
    settledAt = Date.now()
  }
  return run
}

export async function stopRing() {
  const sentAt = Date.now()
  busy++
  setRun(null)
  try {
    const status = await device<DeviceStatus>('/ring/stop', { method: 'POST' })
    reconcile(status.run, sentAt, Date.now(), true)
  } finally {
    busy--
    settledAt = Date.now()
  }
}
