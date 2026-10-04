import { FormActions } from '@/components/ui/form-actions'
import { Sheet } from '@/components/ui/sheet'
import { toast } from '@/features/feedback/toast'
import { bellLabel, bellSummary, createBell } from '@/features/schedule/bell'
import { BellForm } from '@/features/schedule/components/bell-form'
import { formatClock } from '@/features/schedule/format'
import { deleteBell, saveBell } from '@/features/schedule/store'
import type { Bell, BellScope } from '@/features/schedule/types'
import { BellRing, ChevronRight, Plus } from 'lucide-react'
import { useId, useState } from 'react'

type Editing = { bell: Bell; isNew: boolean; key: number }

function nextSuggestedTime(bells: Bell[]) {
  const last = bells.at(-1)
  if (!last) return '07:00'
  const [h, m] = last.time.split(':').map(Number)
  return `${String(Math.min(h + 1, 23)).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function BellList({ scope, bells }: { scope: BellScope; bells: Bell[] }) {
  const formId = useId()
  const [editing, setEditing] = useState<Editing | null>(null)
  const [open, setOpen] = useState(false)

  const edit = (bell: Bell, isNew: boolean) => {
    setEditing((prev) => ({ bell, isNew, key: (prev?.key ?? 0) + 1 }))
    setOpen(true)
  }

  return (
    <>
      {bells.length > 0 ? (
        <ul className="overflow-hidden rounded-3xl bg-raised shadow-raised">
          {bells.map((bell) => {
            const clock = formatClock(bell.time)
            return (
              <li key={bell.id} className="border-b border-line/60 last:border-b-0">
                <button
                  type="button"
                  onClick={() => edit(bell, false)}
                  className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-[background-color,transform] duration-[var(--duration-press)] ease-[var(--ease-out-soft)] active:scale-[0.99] active:bg-surface"
                >
                  <span className="flex w-14 shrink-0 flex-col items-end">
                    <span className="font-mono text-[1.35rem] leading-none font-medium tracking-[-0.03em] tabular-nums">
                      {clock.time}
                    </span>
                    <span className="mt-1 text-[0.74rem] leading-none text-muted">{clock.period}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[1rem] font-medium">{bellLabel(bell)}</span>
                    <span className="block text-[0.86rem] text-muted">{bellSummary(bell)}</span>
                  </span>
                  <ChevronRight aria-hidden className="size-5 shrink-0 text-muted/70" />
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-8 text-center">
          <BellRing aria-hidden className="size-6 text-muted" />
          <p className="mt-2 font-medium">Sin timbrados</p>
          <p className="mt-0.5 text-[0.9rem] text-muted">Agrega el primero con su hora y sus toques.</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => edit(createBell({ time: nextSuggestedTime(bells) }), true)}
        className="mt-3 flex min-h-13 w-full items-center justify-center gap-2 rounded-full border border-dashed border-field/40 text-[0.98rem] font-medium text-field-ink transition-[transform,background-color] duration-[var(--duration-press)] ease-[var(--ease-out-soft)] active:scale-[0.98] active:bg-field/5"
      >
        <Plus aria-hidden className="size-5" />
        Agregar timbrado
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={editing?.isNew ? 'Nuevo timbrado' : 'Editar timbrado'}
        footer={
          editing ? (
            <FormActions
              form={formId}
              submitLabel={editing.isNew ? 'Agregar timbrado' : 'Guardar cambios'}
              deleteLabel="Eliminar timbrado"
              onDelete={
                editing.isNew
                  ? undefined
                  : () => {
                      deleteBell(scope, editing.bell.id)
                      setOpen(false)
                      toast('Timbrado eliminado')
                    }
              }
            />
          ) : null
        }
      >
        {editing ? (
          <BellForm
            key={editing.key}
            id={formId}
            initial={editing.bell}
            onSave={(bell) => {
              saveBell(scope, bell)
              setOpen(false)
              toast(editing.isNew ? 'Timbrado agregado' : 'Timbrado guardado')
            }}
          />
        ) : null}
      </Sheet>
    </>
  )
}
