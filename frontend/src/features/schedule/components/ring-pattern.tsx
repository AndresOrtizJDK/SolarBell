import { formatSeconds } from '@/features/schedule/bell'
import { cn } from '@/lib/cn'
import { Fragment, useEffect, useRef } from 'react'

const NO_PAUSES: number[] = []

type RingPatternProps = {
  /** ms de cada toque. */
  durations: number[]
  /** ms de silencio tras cada toque menos el último. */
  pauses?: number[]
  /** ms epoch del inicio del primer toque. Si llega, cada barra se llena mientras su toque suena. */
  startedAt?: number
  className?: string
}

/** Barras proporcionales a cada toque, separadas por huecos proporcionales a cada pausa. */
export function RingPattern({ durations, pauses = NO_PAUSES, startedAt, className }: RingPatternProps) {
  const total = durations.reduce((sum, ms) => sum + ms, 0)
  const fills = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    if (startedAt === undefined) return
    const elapsed = Date.now() - startedAt
    let delay = 0
    const animations = durations.map((ms, i) => {
      const fill = fills.current[i]
      const start = delay
      delay += ms + (pauses[i] ?? 0)
      if (!fill) return null
      const animation = fill.animate(
        [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
        { duration: ms, delay: start, easing: 'linear', fill: 'both' },
      )
      animation.currentTime = elapsed
      return animation
    })
    return () => animations.forEach((animation) => animation?.cancel())
  }, [durations, pauses, startedAt])

  return (
    <div aria-hidden className={cn('flex h-2.5 w-full items-stretch gap-1', className)}>
      {durations.map((ms, i) => (
        <Fragment key={i}>
          {i > 0 ? <span style={{ flexGrow: pauses[i - 1] ?? 0, flexBasis: 0 }} /> : null}
          <span
            className="relative overflow-hidden rounded-full bg-solar"
            style={{ flexGrow: ms, flexBasis: 0 }}
            title={`${formatSeconds(ms)} s`}
          >
            {startedAt !== undefined ? (
              <span
                ref={(el) => {
                  fills.current[i] = el
                }}
                className="absolute inset-0 origin-left bg-field"
                style={{ transform: 'scaleX(0)' }}
              />
            ) : null}
          </span>
        </Fragment>
      ))}
      {total === 0 ? <span className="flex-1 rounded-full bg-line" /> : null}
    </div>
  )
}
