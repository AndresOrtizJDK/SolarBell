import { Capacitor } from '@capacitor/core'
import { AP_ADDRESS, MDNS_ADDRESS, lanAddress } from '@/lib/device'

const QUICK_TIMEOUT_MS = 1500
const SCAN_TIMEOUT_MS = 900
/** Pedidos simultáneos al recorrer una subred: más hace que Android descarte conexiones. */
const SCAN_BATCH = 32

/** `true` si en `base` contesta una campana (`/api/status` con `firmware`). */
async function probe(base: string, timeoutMs: number) {
  let timer = 0
  try {
    // El fetch nativo de Capacitor no respeta `AbortSignal`: el tiempo se corta aquí.
    const response = await Promise.race([
      fetch(`${base}/api/status`),
      new Promise<never>((_, reject) => {
        timer = window.setTimeout(() => reject(new Error('timeout')), timeoutMs)
      }),
    ])
    if (!response.ok) return false
    const body = (await response.json()) as { firmware?: unknown }
    return typeof body.firmware === 'string'
  } catch {
    return false
  } finally {
    window.clearTimeout(timer)
  }
}

/** Primer candidato que conteste, sin esperar a los demás. */
function firstAlive(candidates: string[], timeoutMs: number) {
  return new Promise<string | null>((resolve) => {
    let pending = candidates.length
    if (pending === 0) resolve(null)
    for (const base of candidates) {
      void probe(base, timeoutMs).then((alive) => {
        if (alive) resolve(base)
        else if (--pending === 0) resolve(null)
      })
    }
  })
}

/** Direcciones `.1` a `.254` de la subred de `address` (`http://192.168.1.81` → `192.168.1.*`). */
function subnetHosts(address: string | null) {
  const match = address?.match(/^http:\/\/(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}(?::\d+)?$/)
  if (!match) return []
  return Array.from({ length: 254 }, (_, i) => `http://${match[1]}.${i + 1}`)
}

/**
 * Busca la campana cuando la dirección guardada ya no contesta (cambió la red o la IP). Prueba,
 * en paralelo, su última IP de casa, su red propia y `solarbell.local`; con `scan` recorre además
 * la subred de la última IP. Devuelve la dirección que contestó, o `null`. Solo en la app
 * instalada: en el navegador `/api` pasa por el proxy de Vite.
 */
export async function discoverDevice(scan: boolean) {
  if (!Capacitor.isNativePlatform()) return null

  const lan = lanAddress()
  const quick = await firstAlive([...(lan ? [lan] : []), AP_ADDRESS, MDNS_ADDRESS], QUICK_TIMEOUT_MS)
  if (quick || !scan) return quick

  const hosts = subnetHosts(lan).filter((host) => host !== lan)
  for (let i = 0; i < hosts.length; i += SCAN_BATCH) {
    const found = await firstAlive(hosts.slice(i, i + SCAN_BATCH), SCAN_TIMEOUT_MS)
    if (found) return found
  }
  return null
}
