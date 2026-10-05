import { cn } from '@/lib/cn'
import { spring } from '@/lib/motion'
import { motion } from 'motion/react'
import { useId } from 'react'

type Option<T extends string> = { value: T; label: string }

type SegmentedProps<T extends string> = {
  value: T
  onChange: (value: T) => void
  options: readonly Option<T>[]
  label: string
}

export function Segmented<T extends string>({ value, onChange, options, label }: SegmentedProps<T>) {
  const id = useId()

  return (
    <div role="radiogroup" aria-label={label} className="grid auto-cols-fr grid-flow-col rounded-full bg-surface p-1">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative min-h-10 rounded-full px-3 text-[0.92rem] font-medium transition-colors duration-[var(--duration-ui)] ease-[var(--ease-out-soft)]',
              active ? 'text-ink' : 'text-muted',
            )}
          >
            {active ? (
              <motion.span
                layoutId={`${id}-pill`}
                transition={spring.snappy}
                className="absolute inset-0 rounded-full bg-raised shadow-control"
              />
            ) : null}
            <span className="relative">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
