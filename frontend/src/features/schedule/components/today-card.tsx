import { bellLabel } from '@/features/schedule/bell'
import { formatClockText, WEEKDAYS } from '@/features/schedule/format'
import { atTime, type DayPlan } from '@/features/schedule/upcoming'
import { cn } from '@/lib/cn'
import { BellOff } from 'lucide-react'

type TodayCardProps = {
  now: Date
  plan: DayPlan
  upcomingSpecials: number
}

const BEFORE_MIN = 2 * 60
const AFTER_MIN = 60
const DAY_MIN = 24 * 60

function minutesOf(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function axisLabel(minutes: number) {
  const h = Math.floor(minutes / 60) % 24
  const m = Math.round(minutes % 60) % 60
  const hour = h % 12 || 12
  const period = h < 12 ? 'a. m.' : 'p. m.'
  if (m === 0) return `${hour} ${period}`
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

/** Etiquetas separadas para que no se pisen en el ancho del teléfono. */
function axisTicks(start: number, end: number) {
  const step = end - start > 6 * 60 ? 120 : 60
  const ticks = [start]
  for (let m = Math.ceil(start / 60) * 60; m < end; m += step) {
    if (m <= start) continue
    const last = ticks[ticks.length - 1]
    if (m - last >= 90 && end - m >= 70) ticks.push(m)
  }
  ticks.push(end)
  return ticks
}

export function TodayCard({ now, plan, upcomingSpecials }: TodayCardProps) {
  const remaining = plan.bells.filter((b) => atTime(now, b.time) > now).length

  return (
    <section
      aria-label="Resumen de hoy"
      className="rounded-[1.75rem] bg-raised px-5 pt-5 pb-4 shadow-float"
    >
      <dl className="grid grid-cols-3 text-center">
        <Stat label="Hoy" value={plan.bells.length} />
        <Stat label="Restantes" value={remaining} divided />
        <Stat label="Especiales" value={upcomingSpecials} divided />
      </dl>

      <div className="mt-5">
        {plan.bells.length > 0 ? (
          <DayTimeline now={now} plan={plan} />
        ) : (
          <EmptyDay now={now} plan={plan} />
        )}
      </div>
    </section>
  )
}

function Stat({ label, value, divided }: { label: string; value: number; divided?: boolean }) {
  return (
    <div className={cn('flex flex-col gap-0.5', divided && 'border-l border-line/80')}>
      <dt className="text-[0.86rem] font-medium text-muted">{label}</dt>
      <dd className="text-[1.6rem] leading-tight font-semibold tracking-[-0.03em] tabular-nums">{value}</dd>
    </div>
  )
}

function EmptyDay({ now, plan }: { now: Date; plan: DayPlan }) {
  const dayName = WEEKDAYS.find((w) => w.day === now.getDay())?.name ?? 'Hoy'
  const text =
    plan.kind === 'off'
      ? `${plan.special?.name || 'Fecha especial'}: la campana no suena hoy.`
      : plan.kind === 'special'
        ? `${plan.special?.name || 'Fecha especial'} no tiene timbrados.`
        : `${dayName} no está en el horario habitual.`

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-3.5">
      <BellOff aria-hidden className="size-5 shrink-0 text-muted" />
      <p className="text-[0.95rem] leading-snug">{text}</p>
    </div>
  )
}

function DayTimeline({ now, plan }: { now: Date; plan: DayPlan }) {
  const minutes = plan.bells.map((b) => minutesOf(b.time))
  const start = Math.max(0, minutes[0] - BEFORE_MIN)
  const end = Math.min(DAY_MIN, minutes[minutes.length - 1] + AFTER_MIN)
  const span = Math.max(end - start, 1)
  const nowMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60
  const progress = Math.min(1, Math.max(0, (nowMinutes - start) / span))
  const position = (m: number) => ((m - start) / span) * 100
  const nextIndex = plan.bells.findIndex((b) => atTime(now, b.time) > now)
  const next = nextIndex >= 0 ? plan.bells[nextIndex] : null
  const ticks = axisTicks(start, end)
  const glide = 'transition-transform duration-1000 ease-linear motion-reduce:transition-none'

  return (
    <figure>
      <figcaption className="sr-only">
        Desde {axisLabel(start)} hasta {axisLabel(end)} Timbrados:{' '}
        {plan.bells.map((b) => `${bellLabel(b)} a las ${b.time}`).join(', ')}. La barra avanza con la
        hora actual.
      </figcaption>
      <div aria-hidden className="@container relative h-11">
        {plan.bells.map((bell, i) => {
          const past = nextIndex === -1 || i < nextIndex
          const isNext = i === nextIndex
          return (
            <span
              key={bell.id}
              className="absolute bottom-2 -translate-x-1/2"
              style={{ left: `${position(minutes[i])}%` }}
            >
              <span
                className={cn(
                  'block w-2 rounded-full',
                  isNext ? 'h-5 bg-solar' : past ? 'h-3.5 bg-line' : 'h-4 bg-field/70',
                )}
              />
            </span>
          )
        })}

        <div className="absolute inset-x-0 bottom-0 h-1.5 overflow-hidden rounded-full bg-line/80">
          <div
            className={cn('h-full w-full origin-left bg-solar', glide)}
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
        <span
          className={cn(
            'absolute bottom-0 left-0 size-3 rounded-full bg-solar shadow-[0_0_0_3px_var(--raised)]',
            glide,
          )}
          style={{ transform: `translate3d(calc(${progress} * 100cqi - 50%), -2px, 0)` }}
        />
      </div>
      <div aria-hidden className="relative mt-1.5 h-4 font-mono text-[0.66rem] text-muted">
        {ticks.map((m, i) => (
          <span
            key={m}
            className={cn(
              'absolute whitespace-nowrap',
              i === 0 ? 'left-0' : i === ticks.length - 1 ? 'right-0' : '-translate-x-1/2',
            )}
            style={i > 0 && i < ticks.length - 1 ? { left: `${position(m)}%` } : undefined}
          >
            {axisLabel(m)}
          </span>
        ))}
      </div>
      <p className="mt-3 text-center text-[0.95rem] leading-snug text-muted">
        {next
          ? `Próximo timbrado ${bellLabel(next)}, ${formatClockText(next.time)}`
          : 'Hoy no quedan timbrados'}
      </p>
    </figure>
  )
}
