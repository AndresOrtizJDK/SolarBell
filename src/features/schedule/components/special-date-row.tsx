import { bellLabel } from '@/features/schedule/bell'
import { formatClockText, formatMonthShort, formatWeekdayShort } from '@/features/schedule/format'
import type { SpecialDate } from '@/features/schedule/types'
import { fromDateKey } from '@/features/schedule/upcoming'
import { cn } from '@/lib/cn'
import { BellOff, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'

function describe(special: SpecialDate) {
  if (special.mode === 'off') return 'Sin timbrado'
  const count = special.bells.length
  if (count === 0) return 'Horario especial sin timbrados'
  const first = special.bells[0]
  const label = count === 1 ? bellLabel(first) : `${count} timbrados`
  return `${label}, desde ${formatClockText(first.time)}`
}

export function SpecialDateRow({ special, muted }: { special: SpecialDate; muted?: boolean }) {
  const date = fromDateKey(special.date)

  return (
    <li className="border-b border-line/60 last:border-b-0">
      <Link
        to={`/fechas/${special.id}`}
        className={cn(
          'flex items-center gap-4 px-4 py-3 transition-[background-color,transform] duration-[var(--duration-press)] ease-[var(--ease-out-soft)] active:scale-[0.99] active:bg-surface',
          muted && 'opacity-60',
        )}
      >
        <span
          className={cn(
            'flex w-13 shrink-0 flex-col items-center rounded-2xl py-1.5',
            special.mode === 'off' ? 'bg-surface text-muted' : 'bg-solar/15 text-solar-deep',
          )}
        >
          <span className="text-[0.68rem] font-semibold">{formatWeekdayShort(date)}</span>
          <span className="text-[1.35rem] leading-none font-semibold tracking-[-0.03em] tabular-nums">
            {date.getDate()}
          </span>
          <span className="text-[0.68rem] font-medium">{formatMonthShort(date)}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[1rem] font-medium">{special.name || 'Fecha especial'}</span>
          <span className="flex items-center gap-1.5 text-[0.86rem] text-muted">
            {special.mode === 'off' ? <BellOff aria-hidden className="size-3.5" /> : null}
            {describe(special)}
          </span>
        </span>
        <ChevronRight aria-hidden className="size-5 shrink-0 text-muted/70" />
      </Link>
    </li>
  )
}
