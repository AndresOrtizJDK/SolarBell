import { applyDeviceRun } from '@/features/ring/store'
import { isScheduleIdle, refreshSchedule } from '@/features/schedule/store'
import { device, type DeviceStatus } from '@/lib/device'
import { useSyncExternalStore } from 'react'

const KEY = 'solarbell:device:last-seen:v1'
const NEAR_POLL_MS = 2000
const AWAY_POLL_MS = 5000
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
  timer = window.setTimeout(poll, state.link === 'near' ? NEAR_POLL_MS : AWAY_POLL_MS)
}

async function poll() {
  if (inFlight) return
  inFlight = true
  try {
    const status = await syncClock(await device<DeviceStatus>('/status'))
    const arrived = state.link !== 'near'
    applyDeviceRun(status.run)
    commit({ link: 'near', status, lastSeen: Date.now() })
    pullScheduleIfChanged(status, arrived)
  } catch {
    seenScheduleRevision = null
    if (state.link !== 'away') commit({ link: 'away' })
  } finally {
    inFlight = false
    scheduleNext()
  }
}

function onVisibility() {
  if (document.hidden) window.clearTimeout(timer)
  else void poll()
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
