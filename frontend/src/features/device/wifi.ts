import { device } from '@/lib/device'

/** `none` sin red guardada; `connecting` también mientras reintenta tras perder el router. */
export type WifiState = 'none' | 'connecting' | 'connected' | 'failed'

/** Wi-Fi de casa de la campana (`/api/wifi`, firmware 0.6.0+). */
export type WifiStatus = {
  state: WifiState
  ssid: string
  /** IP que le dio el router; solo `connected`. */
  ip: string | null
  rssi?: number
  /** Nombre mDNS, p. ej. `solarbell.local`. */
  hostname: string
  /** Por qué falló la última red; solo `failed`. */
  error?: string
}

export type WifiNetwork = {
  ssid: string
  /** dBm: más cerca de 0, mejor señal. */
  rssi: number
  secure: boolean
}

export type WifiScan = {
  scanning: boolean
  networks: WifiNetwork[]
}

export const getWifi = () => device<WifiStatus>('/wifi')

/** El primer pedido arranca el escaneo y devuelve `scanning: true`; hay que repetirlo. */
export const scanWifi = () => device<WifiScan>('/wifi/scan')

/** Empieza a unirse. Hasta que no obtenga IP la red no se guarda en la campana. */
export const joinWifi = (ssid: string, password: string) =>
  device<WifiStatus>('/wifi', { method: 'PUT', body: { ssid, password } })

export const forgetWifi = () => device<WifiStatus>('/wifi/forget', { method: 'POST' })

/** Barras de señal de 1 a 4 según dBm. */
export function signalBars(rssi: number) {
  if (rssi >= -55) return 4
  if (rssi >= -67) return 3
  if (rssi >= -78) return 2
  return 1
}
