import { DateInput, Field, TextInput } from '@/components/ui/field'
import { ModePicker } from '@/features/schedule/components/mode-picker'
import { formatDateKey } from '@/features/schedule/format'
import { createSpecial, findSpecialByDate, useSchedule } from '@/features/schedule/store'
import type { SpecialDateMode } from '@/features/schedule/types'
import { toDateKey } from '@/features/schedule/upcoming'
import { useEffect, useId, useState, type FormEvent } from 'react'
import { Link } from 'react-router'

export function SpecialDateForm({
  id,
  onCreated,
  onReadyChange,
}: {
  id: string
  onCreated: (id: string) => void
  onReadyChange?: (ready: boolean) => void
}) {
  const state = useSchedule()
  const ids = useId()
  const [today] = useState(() => toDateKey(new Date()))
  const [date, setDate] = useState(today)
  const [name, setName] = useState('')
  const [mode, setMode] = useState<SpecialDateMode>('custom')

  const taken = date ? findSpecialByDate(date, state) : null
  const ready = Boolean(date) && !taken

  useEffect(() => {
    onReadyChange?.(ready)
  }, [ready, onReadyChange])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!date || taken) return
    onCreated(createSpecial({ date, name: name.trim(), mode }))
  }

  return (
    <form id={id} onSubmit={submit} className="flex flex-col gap-5">
      <Field
        label="Fecha"
        htmlFor={`${ids}-date`}
        hint={date ? formatDateKey(date) : null}
        error={taken ? `Ya existe “${taken.name || 'Fecha especial'}” ese día.` : null}
      >
        <DateInput
          id={`${ids}-date`}
          required
          min={today}
          value={date}
          onChange={setDate}
        />
      </Field>
      {taken ? (
        <Link to={`/fechas/${taken.id}`} className="-mt-3 px-1 text-[0.92rem] font-medium text-field-ink">
          Abrir esa fecha
        </Link>
      ) : null}

      <Field label="Nombre" htmlFor={`${ids}-name`}>
        <TextInput
          id={`${ids}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acto cívico, Entrega de boletines"
          autoComplete="off"
          maxLength={48}
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <p className="text-[0.88rem] font-medium text-muted">Ese día</p>
        <ModePicker value={mode} onChange={setMode} />
      </div>

      {mode === 'custom' ? (
        <p className="rounded-2xl bg-surface px-4 py-3 text-[0.92rem] leading-snug">
          Empieza con una copia del horario habitual. Luego cambias horas, toques o agregas timbrados.
        </p>
      ) : null}

    </form>
  )
}
