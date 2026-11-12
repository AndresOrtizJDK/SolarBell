import { cn } from '@/lib/cn'

type SignalIconProps = {
  /** Barras encendidas, de 1 a 4. */
  level: number
  className?: string
}

/** Icono de Wi-Fi: punto + 3 arcos. Los arcos por encima de `level` quedan atenuados. */
export function SignalIcon({ level, className }: SignalIconProps) {
  const arc = (from: number) => (level >= from ? 'opacity-100' : 'opacity-25')

  return (
    <svg
      role="img"
      aria-label={`Señal ${level} de 4`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-5 shrink-0', className)}
    >
      <circle cx="12" cy="19" r="1.25" fill="currentColor" stroke="none" />
      <path className={arc(2)} d="M8.5 15.5a5 5 0 0 1 7 0" />
      <path className={arc(3)} d="M5 12a10 10 0 0 1 14 0" />
      <path className={arc(4)} d="M1.5 8.5a15 15 0 0 1 21 0" />
    </svg>
  )
}
