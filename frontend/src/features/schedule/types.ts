export type Bell = {
  id: string
  label: string
  /** Hora local `HH:MM` en 24 h. */
  time: string
  rings: number
  /** Duración de cada toque, en ms. */
  ringMs: number
  /** Silencio entre un toque y el siguiente, en ms. */
  pauseMs: number
  /** Duración por toque con las opciones avanzadas activas. Mismo largo que `rings`. */
  customDurations: number[] | null
  /** Pausa tras cada toque menos el último. Largo `rings - 1`; `null` junto con `customDurations`. */
  customPauses: number[] | null
}

/** Patrón de toques sin hora ni nombre: lo que comparten un timbrado y un toque manual. */
export type RingConfig = Pick<Bell, 'rings' | 'ringMs' | 'pauseMs' | 'customDurations' | 'customPauses'>

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
