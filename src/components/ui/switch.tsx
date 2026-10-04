import { cn } from '@/lib/cn'

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}

export function Switch({ checked, onChange, label, description }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 py-1 text-left"
    >
      <span>
        <span className="block text-[0.98rem] font-medium">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-[0.88rem] leading-snug text-muted">{description}</span>
        ) : null}
      </span>
      <span
        aria-hidden
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full transition-colors duration-[var(--duration-ui)] ease-[var(--ease-out-soft)]',
          checked ? 'bg-field' : 'bg-line',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-6 rounded-full bg-raised shadow-control transition-transform duration-[var(--duration-ui)] ease-[var(--ease-out-soft)]',
            checked && 'translate-x-5',
          )}
        />
      </span>
    </button>
  )
}
