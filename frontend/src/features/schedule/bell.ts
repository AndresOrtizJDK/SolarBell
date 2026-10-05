import { createId } from '@/lib/id'
import type { Bell, RingConfig } from '@/features/schedule/types'

export const RINGS_MIN = 1
export const RINGS_MAX = 10
export const SECONDS_MIN = 1
export const SECONDS_MAX = 30

export function createBell(partial: Partial<Bell> = {}): Bell {
  return {
    id: createId(),
    label: '',
    time: '07:00',
    rings: 3,
    ringSeconds: 3,
    customDurations: null,
    ...partial,
  }
}

export function ringDurations(config: RingConfig) {
  return config.customDurations ?? Array.from({ length: config.rings }, () => config.ringSeconds)
}

export function totalSeconds(config: RingConfig) {
  return ringDurations(config).reduce((sum, s) => sum + s, 0)
}

export function sortBells(bells: Bell[]) {
  return [...bells].sort((a, b) => a.time.localeCompare(b.time))
}

export function cloneBells(bells: Bell[]) {
  return bells.map((bell) => ({
    ...bell,
    id: createId(),
    customDurations: bell.customDurations ? [...bell.customDurations] : null,
  }))
}

export function bellLabel(bell: Bell) {
  return bell.label.trim() || 'Timbrado'
}

export function bellSummary(bell: Bell) {
  const toques = bell.rings === 1 ? '1 toque' : `${bell.rings} toques`
  if (bell.customDurations) return `${toques}, ${totalSeconds(bell)} s en total`
  return `${toques} de ${bell.ringSeconds} s`
}
