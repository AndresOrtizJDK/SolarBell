import { Capacitor } from '@capacitor/core'

/** IP fija de la red que crea la campana (`ESP32/solarbell_local`). */
const NATIVE_BASE = 'http://192.168.4.1'
/** En el navegador `/api` va por el proxy de Vite (`SOLARBELL_DEVICE`). */
const DEFAULT_BASE = import.meta.env.VITE_DEVICE_URL ?? (Capacitor.isNativePlatform() ? NATIVE_BASE : '')
const ADDRESS_KEY = 'solarbell:device:address:v1'
const TIMEOUT_MS = 4000

export const DEVICE_NETWORK = 'SolarBell'

/**
 * Lo que tarda el inversor en arrancar antes del primer toque (`ARRANQUE_INVERSOR_MS` del
 * firmware). Mientras arranca, `/status` reporta `elapsedMs: 0`. Si el firmware tarda más, la
 * app lo nota porque `elapsedMs` sigue en 0 y espera, pero este valor es lo que muestra al inicio.
 */
export const INVERTER_WARMUP_MS = 2000

/** Dirección guardada en este teléfono (p. ej. la IP de la campana en el Wi-Fi de casa), o la de fábrica. */
export function deviceAddress() {
  try {
    return localStorage.getItem(ADDRESS_KEY) || DEFAULT_BASE
  } catch {
    return DEFAULT_BASE
  }
}

/** IP de la red propia de la campana: no sirve como dirección en la red de casa. */
export const AP_ADDRESS = 'http://192.168.4.1'
/** Nombre que anuncia la campana por mDNS en cualquier red a la que se una. */
export const MDNS_ADDRESS = 'http://solarbell.local'
const LAN_KEY = 'solarbell:device:lan:v1'
const IPV4_ADDRESS = /^http:\/\/\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?$/

/**
 * Última IP conocida de la campana en una red de casa/colegio (no la de su Wi-Fi propio). Se usa
 * para volver a encontrarla cuando el teléfono cambia de red.
 */
export function lanAddress() {
  try {
    return localStorage.getItem(LAN_KEY)
  } catch {
    return null
  }
}

export function setLanAddress(address: string) {
  if (!IPV4_ADDRESS.test(address) || address === AP_ADDRESS) return
  try {
    localStorage.setItem(LAN_KEY, address)
  } catch {
    // Sin storage solo se pierde la pista para encontrarla después.
  }
}

/** Acepta `192.168.1.81` o `http://192.168.1.81`. Vacío restablece la de fábrica. */
export function setDeviceAddress(input: string) {
  const raw = input.trim().replace(/\/+$/, '')
  const value = raw && !/^https?:\/\//i.test(raw) ? `http://${raw}` : raw
  try {
    if (value) localStorage.setItem(ADDRESS_KEY, value)
    else localStorage.removeItem(ADDRESS_KEY)
  } catch {
    // Sin storage la dirección vale solo hasta cerrar la app.
  }
  if (value) setLanAddress(value)
}

/** Toque en curso según la campana. Su reloj puede no estar en hora: cuenta en ms transcurridos. */
export type DeviceRun = {
  id: number
  source: 'manual' | 'scheduled'
  label: string
  /** ms de cada toque. */
  durations: number[]
  /** ms de silencio tras cada toque menos el último. */
  pauses: number[]
  elapsedMs: number
}

export type DeviceStatus = {
  firmware: string
  clockSet: boolean
  /** ms epoch del reloj de la campana; `null` si nunca se puso en hora. */
  now: number | null
  offsetMinutes: number
  /** Sube en cada PUT /schedule. Ausente en firmware anterior a 0.3.1. */
  scheduleRevision?: number
  run: DeviceRun | null
}

export class DeviceError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'DeviceError'
    this.status = status
  }
}

async function errorMessage(response: Response) {
  try {
    const body = (await response.json()) as { detail?: unknown }
    if (typeof body.detail === 'string') return body.detail
  } catch {
    // Respuesta sin JSON.
  }
  return 'La campana no pudo completar el cambio'
}

function withTimeout<T>(promise: Promise<T>) {
  // El fetch nativo de Capacitor no respeta `AbortSignal`.
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
    promise.then(resolve, reject).finally(() => window.clearTimeout(timer))
  })
}

type RequestOptions = { method?: 'GET' | 'POST' | 'PUT'; body?: unknown }

export async function device<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
  let response: Response
  try {
    response = await withTimeout(
      fetch(`${deviceAddress()}/api${path}`, {
        method,
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    )
  } catch {
    throw new DeviceError(0, 'La campana no está al alcance')
  }
  if (!response.ok) throw new DeviceError(response.status, await errorMessage(response))
  return (await response.json()) as T
}

export function errorText(error: unknown) {
  return error instanceof DeviceError ? error.message : 'Algo salió mal'
}
