import '@/features/ring/components/bell-push.css'
import { cn } from '@/lib/cn'
import { useEffect, useRef, useState, type MouseEvent } from 'react'

/** Tiempo mínimo hundido para que un tap rápido alcance a verse. */
const MIN_PRESS_MS = 140

type BellPushProps = {
  label: string
  onPress: () => void
  /** No responde mientras hay un toque en curso. */
  latched?: boolean
  /** Hundido mientras la campana suena; arriba en las pausas. */
  sunk?: boolean
  className?: string
}

export function BellPush({ label, onPress, latched = false, sunk = false, className }: BellPushProps) {
  const [pressed, setPressed] = useState(false)
  const downAt = useRef(0)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const press = () => {
    window.clearTimeout(timer.current)
    downAt.current = performance.now()
    setPressed(true)
  }

  const remaining = () => Math.max(0, MIN_PRESS_MS - (performance.now() - downAt.current))

  const releaseSoon = () => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setPressed(false), remaining())
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (latched) return
    // Teclado: no hubo pointerdown, así que el hundido se hace aquí.
    if (event.detail === 0) press()
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setPressed(false)
      onPress()
    }, remaining())
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled={latched || undefined}
      data-pressed={pressed || sunk ? 'true' : undefined}
      className={cn('bell-push', className)}
      onPointerDown={(e) => {
        if (latched || e.button !== 0) return
        press()
        navigator.vibrate?.(8)
      }}
      onPointerUp={releaseSoon}
      onPointerCancel={() => setPressed(false)}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'touch') releaseSoon()
      }}
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      <svg viewBox="0 30 240 132" aria-hidden className="bell-push__art">
        <g className="bell-push__ink">
          <ellipse cx="120" cy="110" rx="104" ry="46" className="bell-push__base" />
          <ellipse cx="120" cy="96" rx="104" ry="46" className="bell-push__ring" />
          <ellipse cx="120" cy="92" rx="80" ry="32" className="bell-push__side" />
          <g className="bell-push__band">
            <rect x="40" y="70" width="160" height="22" className="bell-push__side" stroke="none" />
            <path d="M40 70V92M200 70V92" fill="none" vectorEffect="non-scaling-stroke" />
          </g>
          <ellipse cx="120" cy="70" rx="80" ry="32" className="bell-push__cap" />
        </g>
      </svg>
    </button>
  )
}
