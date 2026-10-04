export type Bell = {
  id: string
  label: string
  /** Hora local `HH:MM` en 24 h. */
  time: string
  rings: number
  ringSeconds: number
  /** Duración por toque cuando las opciones avanzadas están activas. Mismo largo que `rings`. */
  customDurations: number[] | null
}

/** Patrón de toques sin hora ni nombre: lo que comparten un timbrado y un toque manual. */
export type RingConfig = Pick<Bell, 'rings' | 'ringSeconds' | 'customDurations'>

export type WeeklySchedule = {
  /** `Date#getDay()`: 0 = domingo … 6 = sábado. */
  days: number[]
  bells: Bell[]
}

export type SpecialDateMode = 'custom' | 'off'

export type SpecialDate = {
  id: string
  /** Fecha local `YYYY-MM-DD`. */
  date: string
  name: string
  mode: SpecialDateMode
  bells: Bell[]
}

export type ScheduleState = {
  weekly: WeeklySchedule
  specials: SpecialDate[]
}

export type BellScope = { kind: 'weekly' } | { kind: 'special'; id: string }
