import { formatSeconds } from '@/features/schedule/bell'
import { formatClockText, formatDateKeyShort } from '@/features/schedule/format'
import { toDateKey } from '@/features/schedule/upcoming'
import type { HistoryEntry, HistoryOutcome } from '@/features/history/types'

/** Mismo nombre que usa la campana al buscar (`nombreVisible` en el firmware): lo que se ve se encuentra. */
export function entryName(entry: HistoryEntry) {
  return entry.label.trim() || (entry.source === 'scheduled' ? 'Timbrado' : 'Toque manual')
}

export function sourceText(entry: HistoryEntry) {
  return entry.source === 'scheduled' ? 'Programado' : 'Manual'
}

const OUTCOME_TEXT: Record<HistoryOutcome, string> = {
  completed: 'Completo',
  stopped: 'Detenido',
  replaced: 'Cortado por otro toque',
}

export function outcomeText(outcome: HistoryOutcome) {
  return OUTCOME_TEXT[outcome]
}

/** `9000` → `9 s`; `65000` → `1 min 5 s`. */
export function formatDuration(ms: number) {
  if (ms < 60_000) return `${formatSeconds(ms)} s`
  const minutes = Math.floor(ms / 60_000)
  const seconds = Math.round((ms % 60_000) / 1000)
  return seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} s`
}

export function entryTotalMs(entry: HistoryEntry) {
  const sum = (values: number[]) => values.reduce((total, ms) => total + ms, 0)
  return sum(entry.durations) + sum(entry.pauses)
}

/** Fecha y hora local del teléfono; `null` si la campana no tenía la hora puesta. */
export function entryWhen(entry: HistoryEntry) {
  if (entry.at === null) return null
  const date = new Date(entry.at)
  const clock = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  return { date: formatDateKeyShort(toDateKey(date)), time: formatClockText(clock) }
}

/** `3 toques de 3 s, pausa de 1 s` o `3 toques con duraciones propias`. */
export function patternText(entry: HistoryEntry) {
  const rings = entry.durations.length
  const noun = rings === 1 ? '1 toque' : `${rings} toques`
  const same = (values: number[]) => values.every((ms) => ms === values[0])
  if (!same(entry.durations) || !same(entry.pauses)) return `${noun} con duraciones propias`
  const pause = entry.pauses.length > 0 ? `, pausa de ${formatSeconds(entry.pauses[0])} s` : ''
  return `${noun} de ${formatSeconds(entry.durations[0] ?? 0)} s${pause}`
}
