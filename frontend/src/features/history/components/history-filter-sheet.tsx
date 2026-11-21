import { Button } from '@/components/ui/button'
import { DateInput, Field } from '@/components/ui/field'
import { Sheet } from '@/components/ui/sheet'
import { NO_RANGE, type DateRange } from '@/features/history/range'
import { useId, useState } from 'react'

type HistoryFilterSheetProps = {
  open: boolean
  value: DateRange
  onClose: () => void
  onApply: (range: DateRange) => void
}

export function HistoryFilterSheet({ open, value, onClose, onApply }: HistoryFilterSheetProps) {
  const ids = useId()
  const [draft, setDraft] = useState(value)
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setDraft(value)
  }

  const invalid = draft.from !== '' && draft.to !== '' && draft.from > draft.to

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Filtrar por fecha"
      footer={
        <div className="flex items-center gap-2.5">
          <Button variant="line" className="min-h-13 rounded-full px-5 text-[1rem]" onClick={() => onApply(NO_RANGE)}>
            Quitar
          </Button>
          <Button className="min-h-13 flex-1 rounded-full text-[1rem]" disabled={invalid} onClick={() => onApply(draft)}>
            Aplicar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Fecha inicial" htmlFor={`${ids}-from`}>
          <DateInput id={`${ids}-from`} value={draft.from} onChange={(from) => setDraft((d) => ({ ...d, from }))} />
        </Field>
        <Field
          label="Fecha final"
          htmlFor={`${ids}-to`}
          error={invalid ? 'La fecha final no puede ser anterior a la inicial' : null}
        >
          <DateInput id={`${ids}-to`} value={draft.to} onChange={(to) => setDraft((d) => ({ ...d, to }))} />
        </Field>
      </div>
    </Sheet>
  )
}
