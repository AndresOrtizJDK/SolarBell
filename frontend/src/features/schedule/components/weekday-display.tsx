import { WORKDAYS } from '@/features/schedule/format'
import { cn } from '@/lib/cn'

type WeekdayDisplayProps = {
  value: number[]
}

export function WeekdayDisplay({ value }: WeekdayDisplayProps) {
  return (
    <div aria-hidden className="flex justify-between gap-1.5">
      {WORKDAYS.map(({ day, short }) => {
        const active = value.includes(day)
        return (
          <span
            key={day}
            className={cn(
              'chip grid aspect-square w-full max-w-12 place-items-center rounded-full text-[0.95rem] font-semibold',
              active
                ? 'bg-field text-on-field'
                : 'bg-raised text-muted shadow-[inset_0_0_0_1px_var(--line)]',
            )}
          >
            {short}
          </span>
        )
      })}
    </div>
  )
}
