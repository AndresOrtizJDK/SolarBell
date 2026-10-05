import { sortBells } from '@/features/schedule/bell'
import type { Bell, ScheduleState, SpecialDate } from '@/features/schedule/types'

export type DayPlan = {
  bells: Bell[]
  special: SpecialDate | null
  /** `rest`: día fuera del horario semanal. `off`: fecha especial sin timbrado. */
  kind: 'weekly' | 'special' | 'off' | 'rest'
}

export type Occurrence = {
  bell: Bell
  at: Date
  special: SpecialDate | null
}

const DAY_MS = 86_400_000

export function toDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromDateKey(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function atTime(day: Date, time: string) {
  const [h, m] = time.split(':').map(Number)
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m)
}

function addDays(day: Date, amount: number) {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + amount)
}

export function dayPlan(state: ScheduleState, day: Date): DayPlan {
  const special = state.specials.find((s) => s.date === toDateKey(day)) ?? null
  if (special?.mode === 'off') return { bells: [], special, kind: 'off' }
  if (special) return { bells: sortBells(special.bells), special, kind: 'special' }
  if (state.weekly.days.includes(day.getDay())) {
    return { bells: sortBells(state.weekly.bells), special: null, kind: 'weekly' }
  }
  return { bells: [], special: null, kind: 'rest' }
}

export function upcomingFrom(state: ScheduleState, now: Date, limit: number, horizonDays = 21) {
  const result: Occurrence[] = []
  for (let offset = 0; offset < horizonDays && result.length < limit; offset++) {
    const day = addDays(now, offset)
    const plan = dayPlan(state, day)
    for (const bell of plan.bells) {
      const at = atTime(day, bell.time)
      if (at <= now) continue
      result.push({ bell, at, special: plan.special })
      if (result.length === limit) break
    }
  }
  return result
}

export function previousBefore(state: ScheduleState, now: Date, horizonDays = 7) {
  for (let offset = 0; offset < horizonDays; offset++) {
    const day = addDays(now, -offset)
    const bells = dayPlan(state, day).bells
    for (let i = bells.length - 1; i >= 0; i--) {
      const at = atTime(day, bells[i].time)
      if (at <= now) return at
    }
  }
  return null
}

export function upcomingSpecials(state: ScheduleState, now: Date) {
  const today = toDateKey(now)
  return [...state.specials]
    .filter((s) => s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function pastSpecials(state: ScheduleState, now: Date) {
  const today = toDateKey(now)
  return [...state.specials]
    .filter((s) => s.date < today)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function daysBetween(from: Date, to: Date) {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime()
  return Math.round((b - a) / DAY_MS)
}
