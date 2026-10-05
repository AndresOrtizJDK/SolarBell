import { createId } from '@/lib/id'
import type { Bell, RingConfig } from '@/features/schedule/types'

export const RINGS_MIN = 1
export const RINGS_MAX = 10
/** Límites de un toque o una pausa, en ms. La app los muestra en segundos. */
export const TIME_MIN_MS = 100
export const TIME_MAX_MS = 30_000
export const TIME_STEP_MS = 100
export const TIME_DEFAULT_MS = 1000

export function createBell(partial: Partial<Bell> = {}): Bell {
  return {
    id: createId(),
    label: '',
    time: '07:00',
    rings: 3,
    ringMs: TIME_DEFAULT_MS,
    pauseMs: TIME_DEFAULT_MS,
    customDurations: null,
    customPauses: null,
    ...partial,
  }
}

export function ringDurations(config: RingConfig) {
  return config.customDurations ?? Array.from({ length: config.rings }, () => config.ringMs)
}

export function ringPauses(config: RingConfig) {
  return config.customPauses ?? Array.from({ length: Math.max(config.rings - 1, 0) }, () => config.pauseMs)
}

export function totalMs(config: RingConfig) {
  const sum = (values: number[]) => values.reduce((total, ms) => total + ms, 0)
  return sum(ringDurations(config)) + sum(ringPauses(config))
}

const secondsFormat = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })

/** `1500` → `1,5`. */
export function formatSeconds(ms: number) {
  return secondsFormat.format(ms / 1000)
}

export function sortBells(bells: Bell[]) {
  return [...bells].sort((a, b) => a.time.localeCompare(b.time))
}

export function cloneBells(bells: Bell[]) {
  return bells.map((bell) => ({
    ...bell,
    id: createId(),
    customDurations: bell.customDurations ? [...bell.customDurations] : null,
    customPauses: bell.customPauses ? [...bell.customPauses] : null,
  }))
}

export function bellLabel(bell: Bell) {
  return bell.label.trim() || 'Timbrado'
}

export function bellSummary(bell: Bell) {
  const toques = bell.rings === 1 ? '1 toque' : `${bell.rings} toques`
  if (bell.customDurations) return `${toques}, ${formatSeconds(totalMs(bell))} s en total`
  return `${toques} de ${formatSeconds(bell.ringMs)} s`
}
