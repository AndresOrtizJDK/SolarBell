import { Stepper } from '@/components/ui/stepper'
import { Switch } from '@/components/ui/switch'
import {
  RINGS_MAX,
  RINGS_MIN,
  SECONDS_MAX,
  SECONDS_MIN,
  ringDurations,
  totalSeconds,
} from '@/features/schedule/bell'
import { RingPattern } from '@/features/schedule/components/ring-pattern'
import type { RingConfig } from '@/features/schedule/types'
import { cn } from '@/lib/cn'

type RingFieldsProps = {
  value: RingConfig
  onChange: (next: RingConfig) => void
}

function resize(durations: number[], length: number, fill: number) {
  if (durations.length >= length) return durations.slice(0, length)
  return [...durations, ...Array.from({ length: length - durations.length }, () => fill)]
}

/** Veces que suena, duración por toque y opciones avanzadas, con el patrón resultante. */
export function RingFields({ value, onChange }: RingFieldsProps) {
  const advanced = value.customDurations !== null

  const setRings = (rings: number) =>
    onChange({
      ...value,
      rings,
      customDurations: value.customDurations ? resize(value.customDurations, rings, value.ringSeconds) : null,
    })

  const setAdvanced = (on: boolean) =>
    onChange({ ...value, customDurations: on ? ringDurations(value) : null })

  const setRingAt = (index: number, seconds: number) =>
    onChange({
      ...value,
      customDurations: ringDurations(value).map((s, i) => (i === index ? seconds : s)),
    })

  return (
    <>
      <div className="rounded-3xl bg-surface px-4 py-2">
        <div className="flex items-center justify-between gap-3 py-2">
          <div>
            <p className="text-[0.98rem] font-medium">Veces que suena</p>
            <p className="text-[0.86rem] text-muted">Toques seguidos de la campana</p>
          </div>
          <Stepper label="Veces que suena" value={value.rings} onChange={setRings} min={RINGS_MIN} max={RINGS_MAX} />
        </div>

        <div
          className={cn(
            'flex items-center justify-between gap-3 border-t border-line/70 py-2 transition-opacity duration-[var(--duration-ui)]',
            advanced && 'opacity-40',
          )}
        >
          <div>
            <p className="text-[0.98rem] font-medium">Duración por toque</p>
            <p className="text-[0.86rem] text-muted">{advanced ? 'Se ajusta toque por toque' : 'Igual para todos'}</p>
          </div>
          <fieldset disabled={advanced} className="contents">
            <Stepper
              label="Duración por toque"
              value={value.ringSeconds}
              onChange={(ringSeconds) => onChange({ ...value, ringSeconds })}
              min={SECONDS_MIN}
              max={SECONDS_MAX}
              unit="s"
            />
          </fieldset>
        </div>
      </div>

      <div className="rounded-3xl border border-line/70 px-4 py-3">
        <Switch
          checked={advanced}
          onChange={setAdvanced}
          label="Opciones avanzadas"
          description="Cada toque con su propia duración."
        />
        {advanced ? (
          <ol className="mt-3 flex flex-col border-t border-line/70 pt-1">
            {ringDurations(value).map((seconds, i) => (
              <li key={i} className="flex items-center justify-between py-1.5">
                <span className="text-[0.95rem]">Toque {i + 1}</span>
                <Stepper
                  size="sm"
                  label={`Duración del toque ${i + 1}`}
                  value={seconds}
                  onChange={(next) => setRingAt(i, next)}
                  min={SECONDS_MIN}
                  max={SECONDS_MAX}
                  unit="s"
                />
              </li>
            ))}
          </ol>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 px-1">
        <div className="flex items-baseline justify-between text-[0.88rem] text-muted">
          <span>Patrón</span>
          <span className="font-mono tabular-nums">{totalSeconds(value)} s de campana</span>
        </div>
        <RingPattern durations={ringDurations(value)} />
      </div>
    </>
  )
}
