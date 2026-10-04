import { bellLabel } from '@/features/schedule/bell'
import { countdownParts, countdownText, formatClockText } from '@/features/schedule/format'
import type { Occurrence } from '@/features/schedule/upcoming'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/cn'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { CalendarClock } from 'lucide-react'
import { Link } from 'react-router'

type NextBellHeroProps = {
  now: Date
  upcoming: Occurrence[]
  previous: Date | null
}

export function NextBellHero({ now, upcoming, previous }: NextBellHeroProps) {
  return (
    <section aria-label="Próximo timbrado" className="px-4">
      <CountdownSlide now={now} next={upcoming[0] ?? null} previous={previous} />
    </section>
  )
}

function CountdownSlide({
  now,
  next,
  previous,
}: {
  now: Date
  next: Occurrence | null
  previous: Date | null
}) {
  const reduceMotion = usePrefersReducedMotion()

  if (!next) {
    return (
      <div className="flex h-full flex-col items-center pt-6 text-center">
        <p className="text-[1.05rem] font-medium text-hero-ink/85">Cuenta regresiva</p>
        <p className="mt-2 text-[2.6rem] leading-none font-semibold tracking-[-0.03em]">Sin timbrados</p>
        <Link
          to="/horario"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-hero-ink/12 px-5 text-[0.98rem] font-medium shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--hero-ink)_22%,transparent)] transition-transform duration-[var(--duration-press)] ease-[var(--ease-out-soft)] active:scale-[0.97]"
        >
          <CalendarClock aria-hidden className="size-4.5" />
          Configurar horario
        </Link>
      </div>
    )
  }

  const remaining = next.at.getTime() - now.getTime()
  const span = previous ? next.at.getTime() - previous.getTime() : 0
  const progress = span > 0 ? Math.min(1, Math.max(0, 1 - remaining / span)) : 0
  const parts = countdownParts(remaining)

  return (
    <div className="flex flex-col items-center pt-4 text-center">
      <p className="text-[1.05rem] font-medium text-hero-ink/85">Cuenta regresiva</p>
      <p
        className={cn(
          'mt-1 leading-none font-semibold tracking-[-0.04em] tabular-nums',
          parts.length >= 4
            ? 'text-[clamp(1.7rem,8.2vw,2.7rem)]'
            : parts.length === 3
              ? 'text-[clamp(2.15rem,10.5vw,3.4rem)]'
              : 'text-[clamp(3.6rem,19vw,5.4rem)]',
        )}
        aria-label={`Faltan ${countdownText(remaining)}`}
      >
        {parts.map((part) => (
          <span key={part.unit} className="mr-[0.12em] last:mr-0">
            {part.value}
            <span className="text-[0.62em] tracking-[-0.02em]">{part.unit}</span>
          </span>
        ))}
      </p>
      <div className="mt-5 inline-flex max-w-full items-center gap-3 rounded-2xl bg-surface py-2.5 pr-4 pl-2.5 text-left">
        <span
          className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-field text-on-field shadow-[0_2px_6px_-2px_color-mix(in_oklab,var(--field)_60%,transparent)]"
          aria-hidden
        >
          <DotLottieReact
            src="/bell.lottie"
            autoplay={!reduceMotion}
            loop={!reduceMotion}
            className="size-7 brightness-0 invert"
          />
        </span>
        <span className="flex min-w-[9.5rem] flex-1 flex-col gap-1.5">
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="truncate text-[1rem] leading-tight font-semibold tracking-[-0.01em]">
              {bellLabel(next.bell)}
            </span>
            <span aria-hidden className="h-3 w-px shrink-0 self-center bg-hero-ink/20" />
            <span className="sr-only">, </span>
            <span className="shrink-0 font-mono text-[0.9rem] leading-tight font-medium text-hero-ink/80 tabular-nums">
              {formatClockText(next.bell.time)}
            </span>
          </span>
          <span aria-hidden className="h-[3px] overflow-hidden rounded-full bg-sky">
            <span
              className="block h-full origin-left rounded-full bg-solar transition-transform duration-[var(--duration-ui)] ease-[var(--ease-out-soft)] motion-reduce:transition-none"
              style={{ transform: `scaleX(${progress})` }}
            />
          </span>
        </span>
      </div>
      {next.special ? (
        <p className="mt-2 text-[0.88rem] text-hero-ink/75">Fecha especial: {next.special.name}</p>
      ) : null}
    </div>
  )
}
