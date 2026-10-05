import { formatSeconds } from '@/features/schedule/bell'
import { cn } from '@/lib/cn'
import { Fragment } from 'react'

type RingPatternProps = {
  /** ms de cada toque. */
  durations: number[]
  /** ms de silencio tras cada toque menos el último. */
  pauses?: number[]
  className?: string
}

/** Barras proporcionales a cada toque, separadas por huecos proporcionales a cada pausa. */
export function RingPattern({ durations, pauses = [], className }: RingPatternProps) {
  const total = durations.reduce((sum, ms) => sum + ms, 0)

  return (
    <div aria-hidden className={cn('flex h-2.5 w-full items-stretch gap-1', className)}>
      {durations.map((ms, i) => (
        <Fragment key={i}>
          {i > 0 ? <span style={{ flexGrow: pauses[i - 1] ?? 0, flexBasis: 0 }} /> : null}
          <span
            className="rounded-full bg-solar"
            style={{ flexGrow: ms, flexBasis: 0 }}
            title={`${formatSeconds(ms)} s`}
          />
        </Fragment>
      ))}
      {total === 0 ? <span className="flex-1 rounded-full bg-line" /> : null}
    </div>
  )
}
