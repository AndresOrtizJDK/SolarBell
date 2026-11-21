/** Rango de fechas del filtro, como `YYYY-MM-DD` locales. Vacío = sin ese extremo. */
export type DateRange = { from: string; to: string }

export const NO_RANGE: DateRange = { from: '', to: '' }
