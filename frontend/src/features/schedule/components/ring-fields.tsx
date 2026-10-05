import { Stepper } from '@/components/ui/stepper'
import { Switch } from '@/components/ui/switch'
import {
  RINGS_MAX,
  RINGS_MIN,
  TIME_MAX_MS,
  TIME_MIN_MS,
  TIME_STEP_MS,
  formatSeconds,
  ringDurations,
  ringPauses,
  totalMs,
} from '@/features/schedule/bell'
import { RingPattern } from '@/features/schedule/components/ring-pattern'
import type { RingConfig } from '@/features/schedule/types'
import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

type RingFieldsProps = {
  value: RingConfig
  onChange: (next: RingConfig) => void
}

const time = {
  min: TIME_MIN_MS,
  max: TIME_MAX_MS,
  step: TIME_STEP_MS,
  scale: 1000,
  decimals: 1,
  unit: 's',
} as const

function resize(values: number[], length: number, fill: number) {
  if (values.length >= length) return values.slice(0, length)
  return [...values, ...Array.from({ length: length - values.length }, () => fill)]
}

/** Veces que suena, duración de cada toque, pausa entre toques y opciones avanzadas. */
export function RingFields({ value, onChange }: RingFieldsProps) {
  const advanced = value.customDurations !== null
  const durations = ringDurations(value)
  const pauses = ringPauses(value)

  const setRings = (rings: number) =>
    onChange({
      ...value,
      rings,
      customDurations: advanced ? resize(durations, rings, value.ringMs) : null,
      customPauses: advanced ? resize(pauses, rings - 1, value.pauseMs) : null,
    })

  const setAdvanced = (on: boolean) =>
    onChange({ ...value, customDurations: on ? durations : null, customPauses: on ? pauses : null })

  const setDurationAt = (index: number, ms: number) =>
    onChange({ ...value, customDurations: durations.map((d, i) => (i === index ? ms : d)), customPauses: pauses })

  const setPauseAt = (index: number, ms: number) =>
    onChange({ ...value, customDurations: durations, customPauses: pauses.map((p, i) => (i === index ? ms : p)) })

  return (
    <>
      <div className="rounded-3xl bg-surface px-4 py-2">
        <SettingRow title="Veces que suena" hint="Toques seguidos de la campana">
          <Stepper label="Veces que suena" value={value.rings} onChange={setRings} min={RINGS_MIN} max={RINGS_MAX} />
        </SettingRow>

        <SettingRow
          title="Duración por toque"
          hint={advanced ? 'Se ajusta toque por toque' : 'Igual para todos'}
          disabled={advanced}
        >
          <Stepper
            {...time}
            label="Duración por toque"
            value={value.ringMs}
            onChange={(ringMs) => onChange({ ...value, ringMs })}
          />
        </SettingRow>

        <SettingRow
          title="Pausa entre toques"
          hint={advanced ? 'Se ajusta pausa por pausa' : value.rings === 1 ? 'Solo hay un toque' : 'Silencio entre uno y otro'}
          disabled={advanced || value.rings === 1}
        >
          <Stepper
            {...time}
            tone="pause"
            label="Pausa entre toques"
            value={value.pauseMs}
            onChange={(pauseMs) => onChange({ ...value, pauseMs })}
          />
        </SettingRow>
      </div>

      <div className="rounded-3xl border border-line/70 px-4 py-3">
        <Switch
          checked={advanced}
          onChange={setAdvanced}
          label="Opciones avanzadas"
          description="Cada toque y cada pausa con su propia duración."
        />
        {advanced ? (
          <ol className="mt-3 flex flex-col border-t border-line/70 pt-1">
            {durations.map((ms, i) => (
              <li key={i}>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[0.95rem]">Toque {i + 1}</span>
                  <Stepper
                    {...time}
                    size="sm"
                    label={`Duración del toque ${i + 1}`}
                    value={ms}
                    onChange={(next) => setDurationAt(i, next)}
                  />
                </div>
                {i < pauses.length ? (
                  <div className="flex items-center justify-between py-1.5 pl-4">
                    <span className="text-[0.9rem] text-muted">Pausa</span>
                    <Stepper
                      {...time}
                      tone="pauseFill"
                      size="sm"
                      label={`Pausa tras el toque ${i + 1}`}
                      value={pauses[i]}
                      onChange={(next) => setPauseAt(i, next)}
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 px-1">
        <div className="flex items-baseline justify-between text-[0.88rem] text-muted">
          <span>Patrón</span>
          <span className="font-mono tabular-nums">{formatSeconds(totalMs(value))} s en total</span>
        </div>
        <RingPattern durations={durations} pauses={pauses} />
      </div>
    </>
  )
}

function SettingRow({
  title,
  hint,
  disabled = false,
  children,
}: {
  title: string
  hint: string
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-line/70 py-2 transition-opacity duration-[var(--duration-ui)] not-first:border-t',
        disabled && 'opacity-40',
      )}
    >
      <div>
        <p className="text-[0.98rem] font-medium">{title}</p>
        <p className="text-[0.86rem] text-muted">{hint}</p>
      </div>
      <fieldset disabled={disabled} className="contents">
        {children}
      </fieldset>
    </div>
  )
}
