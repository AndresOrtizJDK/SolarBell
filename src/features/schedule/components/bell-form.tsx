import { Field, TextInput } from '@/components/ui/field'
import { RingFields } from '@/features/schedule/components/ring-fields'
import type { Bell } from '@/features/schedule/types'
import { useId, useState, type FormEvent } from 'react'

type BellFormProps = {
  id: string
  initial: Bell
  onSave: (bell: Bell) => void
}

export function BellForm({ id, initial, onSave }: BellFormProps) {
  const [draft, setDraft] = useState(initial)
  const ids = useId()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSave({ ...draft, label: draft.label.trim() })
  }

  return (
    <form id={id} onSubmit={submit} className="flex flex-col gap-5">
      <Field label="Nombre del timbrado" htmlFor={`${ids}-label`}>
        <TextInput
          id={`${ids}-label`}
          value={draft.label}
          onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
          placeholder="Primera hora, Descanso, Acto cívico"
          autoComplete="off"
          enterKeyHint="next"
          maxLength={40}
        />
      </Field>

      <Field label="Hora en que suena" htmlFor={`${ids}-time`}>
        <TextInput
          id={`${ids}-time`}
          type="time"
          required
          value={draft.time}
          onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
          className="font-mono text-[1.35rem] tabular-nums"
        />
      </Field>

      <RingFields value={draft} onChange={(ring) => setDraft((d) => ({ ...d, ...ring }))} />
    </form>
  )
}
