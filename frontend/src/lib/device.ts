import { Capacitor } from '@capacitor/core'

/** IP fija de la red que crea la campana (`ESP32/solarbell_local`). */
const NATIVE_BASE = 'http://192.168.4.1'
/** En el navegador `/api` va por el proxy de Vite (`SOLARBELL_DEVICE`). */
const BASE = import.meta.env.VITE_DEVICE_URL ?? (Capacitor.isNativePlatform() ? NATIVE_BASE : '')
const TIMEOUT_MS = 4000

export const DEVICE_NETWORK = 'SolarBell'

/** Toque en curso según la campana. Su reloj puede no estar en hora: cuenta en ms transcurridos. */
export type DeviceRun = {
  id: number
  source: 'manual' | 'scheduled'
  label: string
  durations: number[]
  pauseMs: number
  elapsedMs: number
}

export type DeviceStatus = {
  firmware: string
  clockSet: boolean
  /** ms epoch del reloj de la campana; `null` si nunca se puso en hora. */
  now: number | null
  offsetMinutes: number
  pauseMs: number
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
      fetch(`${BASE}/api${path}`, {
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
