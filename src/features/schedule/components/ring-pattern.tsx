import { cn } from '@/lib/cn'

/** Barras proporcionales a la duración de cada toque. */
export function RingPattern({ durations, className }: { durations: number[]; className?: string }) {
  const total = durations.reduce((sum, s) => sum + s, 0)

  return (
    <div
      aria-hidden
      className={cn('flex h-2.5 w-full items-stretch gap-1', className)}
    >
      {durations.map((seconds, i) => (
        <span
          key={i}
          className="rounded-full bg-solar"
          style={{ flexGrow: seconds, flexBasis: 0 }}
          title={`${seconds} s`}
        />
      ))}
      {total === 0 ? <span className="flex-1 rounded-full bg-line" /> : null}
    </div>
  )
}
