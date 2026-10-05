import { cn } from '@/lib/cn'
import { Minus, Plus } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'

type StepperProps = {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  /** Unidades de `value` por unidad mostrada: `1000` guarda ms y muestra segundos. */
  scale?: number
  decimals?: number
  unit?: string
  label: string
  size?: 'md' | 'sm'
  /** `pause`: signos rojos. `pauseFill`: botón rojo y signos blancos. */
  tone?: 'ink' | 'pause' | 'pauseFill'
}

const press =
  'grid place-items-center rounded-full transition-[transform,opacity] duration-[var(--duration-press)] ease-[var(--ease-out-soft)] active:scale-[0.92] disabled:opacity-35 disabled:active:scale-100'

const tones = {
  ink: 'bg-surface text-ink',
  pause: 'bg-surface text-field',
  pauseFill: 'bg-field text-on-field',
} as const

export function Stepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  scale = 1,
  decimals = 0,
  unit,
  label,
  size = 'md',
  tone = 'ink',
}: StepperProps) {
  /** Texto mientras se escribe; `null` muestra `value`. */
  const [draft, setDraft] = useState<string | null>(null)

  const text =
    draft ??
    (value / scale).toLocaleString('es-CO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: false,
    })
  const settle = (next: number) => onChange(Math.min(max, Math.max(min, Math.round(next / step) * step)))

  const commit = () => {
    if (draft === null) return
    setDraft(null)
    const typed = Number(draft.replace(',', '.'))
    if (draft.trim() !== '' && Number.isFinite(typed)) settle(typed * scale)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    // Dentro de un `<form>`, Enter lo enviaría.
    event.preventDefault()
    event.currentTarget.blur()
  }

  return (
    <div role="group" aria-label={label} className="flex items-center gap-1">
      <button
        type="button"
        aria-label={`Menos ${label.toLowerCase()}`}
        disabled={value <= min}
        onClick={() => settle(value - step)}
        className={cn(press, tones[tone], size === 'md' ? 'size-11' : 'size-9')}
      >
        <Minus aria-hidden className="size-4" strokeWidth={2.2} />
      </button>
      <label
        className={cn(
          'flex cursor-text items-baseline justify-center font-mono tabular-nums',
          size === 'md' ? 'min-w-14 text-[1.05rem]' : 'min-w-12 text-base',
        )}
      >
        <input
          type="text"
          inputMode={decimals > 0 ? 'decimal' : 'numeric'}
          enterKeyHint="done"
          autoComplete="off"
          aria-label={label}
          value={text}
          onFocus={(event) => {
            const input = event.currentTarget
            setDraft(text)
            requestAnimationFrame(() => input.select())
          }}
          onChange={(event) => setDraft(event.target.value.replace(/[^\d.,]/g, ''))}
          onBlur={commit}
          onKeyDown={onKeyDown}
          style={{ width: `${Math.max(text.length, 1)}ch` }}
          className="border-0 bg-transparent p-0 text-center text-ink caret-solar outline-none"
        />
        {unit ? <span className="ml-0.5 text-muted">{unit}</span> : null}
      </label>
      <button
        type="button"
        aria-label={`Más ${label.toLowerCase()}`}
        disabled={value >= max}
        onClick={() => settle(value + step)}
        className={cn(press, tones[tone], size === 'md' ? 'size-11' : 'size-9')}
      >
        <Plus aria-hidden className="size-4" strokeWidth={2.2} />
      </button>
    </div>
  )
}
