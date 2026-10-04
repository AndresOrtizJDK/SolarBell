import { formatDateKeyShort } from '@/features/schedule/format'
import { cn } from '@/lib/cn'
import type { InputHTMLAttributes, ReactNode } from 'react'

type FieldProps = {
  label: string
  htmlFor: string
  hint?: ReactNode
  error?: string | null
  children: ReactNode
}

export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[0.88rem] font-medium text-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-[0.86rem] text-field-ink">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[0.86rem] leading-snug text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'min-h-12 w-full rounded-2xl border border-line bg-paper px-4 text-ink placeholder:text-muted/80 transition-[border-color,box-shadow] duration-[var(--duration-ui)] ease-[var(--ease-out-soft)] focus:border-solar focus:outline-none focus:ring-3 focus:ring-solar/25',
        className,
      )}
      {...props}
    />
  )
}

type DateInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
  value: string
  onChange: (value: string) => void
}

/** Fecha en `DD/MM/YYYY` con selector nativo (`value` en `YYYY-MM-DD`). */
export function DateInput({ value, onChange, className, ...props }: DateInputProps) {
  const display = value ? formatDateKeyShort(value) : null

  return (
    <div className="relative">
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 left-4 flex items-center font-mono tabular-nums',
          display ? 'text-ink' : 'text-muted/80',
        )}
      >
        {display ?? 'DD/MM/AAAA'}
      </span>
      <TextInput
        type="date"
        lang="es-CO"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(display && 'text-transparent caret-transparent', 'font-mono tabular-nums', className)}
        {...props}
      />
    </div>
  )
}
