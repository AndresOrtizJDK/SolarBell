import { cn } from '@/lib/cn'
import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'blue' | 'ghost' | 'line' | 'soft'
}

export function Button({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 text-[0.95rem] font-medium tracking-[-0.01em] transition-[transform,background-color,color] duration-[var(--duration-press)] ease-[var(--ease-out-soft)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' && 'bg-field text-on-field',
        variant === 'blue' && 'bg-blue text-on-blue',
        variant === 'ghost' && 'bg-transparent text-ink',
        variant === 'line' && 'border border-line bg-raised text-ink',
        variant === 'soft' && 'bg-surface text-ink',
        className,
      )}
      {...props}
    />
  )
}
