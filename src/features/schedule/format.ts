import { daysBetween, fromDateKey } from '@/features/schedule/upcoming'

export const WEEKDAYS = [
  { day: 1, short: 'L', name: 'Lunes' },
  { day: 2, short: 'M', name: 'Martes' },
  { day: 3, short: 'X', name: 'Miércoles' },
  { day: 4, short: 'J', name: 'Jueves' },
  { day: 5, short: 'V', name: 'Viernes' },
  { day: 6, short: 'S', name: 'Sábado' },
  { day: 0, short: 'D', name: 'Domingo' },
] as const

export const WORKDAYS = WEEKDAYS.filter((w) => w.day >= 1 && w.day <= 5)

const longDate = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const weekdayName = new Intl.DateTimeFormat('es-CO', { weekday: 'long' })
const weekdayShort = new Intl.DateTimeFormat('es-CO', { weekday: 'short' })
const monthShort = new Intl.DateTimeFormat('es-CO', { month: 'short' })

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatLongDate(date: Date) {
  return capitalize(longDate.format(date).replace(',', ''))
}

export function formatDateKey(key: string) {
  return formatLongDate(fromDateKey(key))
}

/** `YYYY-MM-DD` → `DD/MM/YYYY` (día, mes, año). */
export function formatDateKeyShort(key: string) {
  const [y, m, d] = key.split('-')
  if (!y || !m || !d) return key
  return `${d}/${m}/${y}`
}

export function formatMonthShort(date: Date) {
  return monthShort.format(date).replace('.', '')
}

export function formatWeekdayShort(date: Date) {
  return capitalize(weekdayShort.format(date).replace('.', ''))
}

/** `08:00` → `{ time: '8:00', period: 'a. m.' }` */
export function formatClock(time: string) {
  const [h, m] = time.split(':').map(Number)
  const hour = h % 12 || 12
  return {
    time: `${hour}:${String(m).padStart(2, '0')}`,
    period: h < 12 ? 'a. m.' : 'p. m.',
  }
}

export function formatClockText(time: string) {
  const { time: t, period } = formatClock(time)
  return `${t} ${period}`
}

export type CountdownPart = { value: string; unit: string }

export function countdownParts(ms: number): CountdownPart[] {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const days = Math.floor(total / 86_400)
  const hours = Math.floor((total % 86_400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60

  const sec = { value: String(seconds).padStart(2, '0'), unit: 's' }

  if (days > 0) {
    return [
      { value: `${days}`, unit: 'd' },
      { value: `${hours}`, unit: 'h' },
      { value: String(minutes).padStart(2, '0'), unit: 'min' },
      sec,
    ]
  }
  if (hours > 0) {
    return [
      { value: `${hours}`, unit: 'h' },
      { value: String(minutes).padStart(2, '0'), unit: 'min' },
      sec,
    ]
  }
  if (minutes > 0) return [{ value: `${minutes}`, unit: 'min' }, sec]
  return [{ value: `${seconds}`, unit: 's' }]
}

export function countdownText(ms: number) {
  return countdownParts(ms)
    .map((p) => `${p.value} ${p.unit}`)
    .join(' ')
}

/** "hoy", "mañana", "lunes", o "17 dic" si queda a más de una semana. */
export function relativeDay(now: Date, at: Date) {
  const diff = daysBetween(now, at)
  if (diff === 0) return 'hoy'
  if (diff === 1) return 'mañana'
  if (diff < 7) return weekdayName.format(at)
  return `${at.getDate()} ${formatMonthShort(at)}`
}
