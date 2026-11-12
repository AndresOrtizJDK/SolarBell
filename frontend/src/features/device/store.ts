import { applyDeviceRun, msUntilRunEnds } from '@/features/ring/store'
import { isScheduleIdle, refreshSchedule } from '@/features/schedule/store'
import { device, setDeviceAddress, type DeviceStatus } from '@/lib/device'
import { discoverDevice } from '@/lib/discovery'
import { useSyncExternalStore } from 'react'

const KEY = 'solarbell:device:last-seen:v1'
const NEAR_POLL_MS = 2000
/** Mientras suena un toque se pregunta más seguido para que el botón siga a la campana. */
const RUN_POLL_MS = 600
/** Mínimo entre lecturas, aunque el fin estimado del toque ya haya pasado. */
const RUN_POLL_MIN_MS = 300
/** Margen tras el fin estimado para leer que la campana ya terminó. */
const RUN_END_MARGIN_MS = 120
const AWAY_POLL_MS = 5000
/** Cada cuánto, fuera de alcance, se prueban las direcciones conocidas (IP de casa, red propia, mDNS). */
const QUICK_FIND_MS = 15_000
/** Cada cuánto se recorre además la subred entera: son cientos de pedidos, no se hace seguido. */
const SCAN_FIND_MS = 120_000
const CLOCK_TOLERANCE_MS = 5000

export type DeviceLink = 'checking' | 'near' | 'away'

export type DeviceState = {
  /** `checking` hasta la primera respuesta (o el primer fallo). */
  link: DeviceLink
  status: DeviceStatus | null
  /** Última respuesta de la campana, ms epoch. Sobrevive entre sesiones. */
  lastSeen: number | null
}

function loadLastSeen() {
  try {
    const raw = Number(localStorage.getItem(KEY))
    return raw > 0 ? raw : null
  } catch {
    return null
  }
}

let state: DeviceState = { link: 'checking', status: null, lastSeen: loadLastSeen() }
const listeners = new Set<() => void>()

function commit(patch: Partial<DeviceState>) {
  state = { ...state, ...patch }
  if (patch.lastSeen) {
    try {
      localStorage.setItem(KEY, String(patch.lastSeen))
    } catch {
      // Sin storage solo se pierde el "visto por última vez".
    }
  }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => state

export function useDevice() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

/** La campana toca el horario con su propio reloj: el teléfono lo corrige en cada conexión. */
async function syncClock(status: DeviceStatus) {
  const offsetMinutes = -new Date().getTimezoneOffset()
  const drifted = status.now === null || Math.abs(status.now - Date.now()) > CLOCK_TOLERANCE_MS
  if (status.clockSet && !drifted && status.offsetMinutes === offsetMinutes) return status
  try {
    return await device<DeviceStatus>('/clock', {
      method: 'POST',
      body: { now: Date.now(), offsetMinutes },
    })
  } catch {
    return status
  }
}

let running = false
let inFlight = false
let timer = 0
/** Última revisión vista en `/status`. `null` hasta el primer poll cerca. */
let seenScheduleRevision: number | null = null

function pullScheduleIfChanged(status: DeviceStatus, arrived: boolean) {
  const revision = status.scheduleRevision
  if (arrived) {
    void refreshSchedule()
    if (typeof revision === 'number') seenScheduleRevision = revision
    return
  }
  if (typeof revision !== 'number' || revision === seenScheduleRevision || !isScheduleIdle()) return
  seenScheduleRevision = revision
  void refreshSchedule()
}

function scheduleNext() {
  window.clearTimeout(timer)
  if (!running || document.hidden) return
  timer = window.setTimeout(poll, pollDelay())
}

function pollDelay() {
  if (state.link !== 'near') return AWAY_POLL_MS
  const untilEnd = msUntilRunEnds()
  if (untilEnd === null) return NEAR_POLL_MS
  return Math.min(RUN_POLL_MS, Math.max(RUN_POLL_MIN_MS, untilEnd + RUN_END_MARGIN_MS))
}

async function poll() {
  if (inFlight) return
  inFlight = true
  try {
    const sentAt = Date.now()
    const reading = await device<DeviceStatus>('/status')
    // Antes de sincronizar el reloj: ese pedido extra no debe retrasar el toque en pantalla.
    applyDeviceRun(reading.run, sentAt)
    const status = await syncClock(reading)
    const arrived = state.link !== 'near'
    commit({ link: 'near', status, lastSeen: Date.now() })
    pullScheduleIfChanged(status, arrived)
  } catch {
    seenScheduleRevision = null
    if (state.link !== 'away') commit({ link: 'away' })
    void findDevice().then((found) => {
      if (found) recheckDevice()
    })
  } finally {
    inFlight = false
    scheduleNext()
  }
}

function onVisibility() {
  if (document.hidden) window.clearTimeout(timer)
  else void poll()
}

let finding = false
let lastQuickFind = 0
let lastScanFind = 0

/**
 * La dirección guardada ya no contesta (otra red u otra IP): busca la campana y guarda donde
 * conteste. `force` salta los intervalos y recorre la subred (botón "Buscar campana").
 */
async function findDevice(force = false) {
  const now = Date.now()
  if (finding || (!force && now - lastQuickFind < QUICK_FIND_MS)) return false
  const scan = force || now - lastScanFind >= SCAN_FIND_MS
  finding = true
  lastQuickFind = now
  if (scan) lastScanFind = now
  try {
    const found = await discoverDevice(scan)
    if (found) setDeviceAddress(found)
    return found !== null
  } finally {
    finding = false
  }
}

/** Búsqueda a pedido del usuario. `true` si encontró la campana. */
export async function searchDevice() {
  const found = await findDevice(true)
  if (found) recheckDevice()
  return found
}

/** Vuelve a buscar la campana ya (p. ej. tras cambiar su dirección). */
export function recheckDevice() {
  seenScheduleRevision = null
  void poll()
}

export function startDeviceSync() {
  if (running) return
  running = true
  document.addEventListener('visibilitychange', onVisibility)
  void poll()
}

export function stopDeviceSync() {
  running = false
  window.clearTimeout(timer)
  document.removeEventListener('visibilitychange', onVisibility)
}
