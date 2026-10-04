import { cn } from '@/lib/cn'
import { Minus, Plus } from 'lucide-react'

type StepperProps = {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  unit?: string
  label: string
  size?: 'md' | 'sm'
}

const press =
  'grid place-items-center rounded-full bg-surface text-ink transition-[transform,opacity] duration-[var(--duration-press)] ease-[var(--ease-out-soft)] active:scale-[0.92] disabled:opacity-35 disabled:active:scale-100'

export function Stepper({ value, onChange, min, max, unit, label, size = 'md' }: StepperProps) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-1">
      <button
        type="button"
        aria-label={`Menos ${label.toLowerCase()}`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={cn(press, size === 'md' ? 'size-11' : 'size-9')}
      >
        <Minus aria-hidden className="size-4" strokeWidth={2.2} />
      </button>
      <output
        aria-live="polite"
        className={cn(
          'text-center font-mono tabular-nums',
          size === 'md' ? 'min-w-14 text-[1.05rem]' : 'min-w-12 text-[0.95rem]',
        )}
      >
        {value}
        {unit ? <span className="ml-0.5 text-muted">{unit}</span> : null}
      </output>
      <button
        type="button"
        aria-label={`Más ${label.toLowerCase()}`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={cn(press, size === 'md' ? 'size-11' : 'size-9')}
      >
        <Plus aria-hidden className="size-4" strokeWidth={2.2} />
      </button>
    </div>
  )
}
