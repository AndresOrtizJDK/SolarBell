import { Page, PageHeader, Section } from '@/components/layout/page'
import { Button } from '@/components/ui/button'
import { DateInput, Field, TextInput } from '@/components/ui/field'
import { DeleteButton } from '@/components/ui/delete-button'
import { toast } from '@/features/feedback/toast'
import { BellList } from '@/features/schedule/components/bell-list'
import { ModePicker } from '@/features/schedule/components/mode-picker'
import { formatDateKey } from '@/features/schedule/format'
import {
  copyWeeklyInto,
  deleteSpecial,
  findSpecialByDate,
  updateSpecial,
  useSchedule,
} from '@/features/schedule/store'
import type { SpecialDate } from '@/features/schedule/types'
import { BellOff, Copy } from 'lucide-react'
import { useId, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

export function SpecialDateDetailPage() {
  const { id } = useParams()
  const state = useSchedule()
  const special = state.specials.find((s) => s.id === id)

  if (!special) {
    return (
      <Page>
        <PageHeader title="Fecha no encontrada" back={{ to: '/fechas', label: 'Fechas' }} />
        <p className="text-muted">Puede que se haya eliminado.</p>
        <Link to="/fechas" className="mt-4 font-medium text-field-ink">
          Volver a fechas especiales
        </Link>
      </Page>
    )
  }

  return <SpecialDateEditor key={special.id} special={special} />
}

function SpecialDateEditor({ special }: { special: SpecialDate }) {
  const navigate = useNavigate()
  const state = useSchedule()
  const ids = useId()
  const [date, setDate] = useState(special.date)

  const clash = date && date !== special.date ? findSpecialByDate(date, state) : null

  const onDateChange = (value: string) => {
    setDate(value)
    if (value && !findSpecialByDate(value, state)) updateSpecial(special.id, { date: value })
  }

  return (
    <Page className="h-dvh flex-none overflow-hidden pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))]">
      <div className="shrink-0">
        <PageHeader
          title={special.name || 'Fecha especial'}
          back={{ to: '/fechas', label: 'Fechas' }}
          backAside={
            <p className="truncate text-[0.88rem] text-muted">{formatDateKey(special.date)}</p>
          }
          action={
            <DeleteButton
              label="Eliminar fecha especial"
              title="¿Eliminar fecha especial?"
              description={`Se quitará «${special.name || formatDateKey(special.date)}» y ese día vuelve al horario habitual.`}
              onConfirm={() => {
                deleteSpecial(special.id)
                toast('Fecha eliminada')
                navigate('/fechas', { replace: true })
              }}
            />
          }
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
        <div className="flex flex-col gap-5 rounded-3xl bg-raised p-4 shadow-raised">
          <Field label="Nombre" htmlFor={`${ids}-name`}>
            <TextInput
              id={`${ids}-name`}
              value={special.name}
              onChange={(e) => updateSpecial(special.id, { name: e.target.value })}
              placeholder="Acto cívico, Entrega de boletines"
              autoComplete="off"
              maxLength={48}
            />
          </Field>
          <Field
            label="Fecha"
            htmlFor={`${ids}-date`}
            error={clash ? `Ese día ya tiene “${clash.name || 'Fecha especial'}”.` : null}
          >
            <DateInput id={`${ids}-date`} required value={date} onChange={onDateChange} />
          </Field>
          <div className="flex flex-col gap-1.5">
            <p className="text-[0.88rem] font-medium text-muted">Ese día</p>
            <ModePicker value={special.mode} onChange={(mode) => updateSpecial(special.id, { mode })} />
          </div>
        </div>

        {special.mode === 'custom' ? (
          <Section
            title="Timbrados de ese día"
            aside={<span className="font-mono text-[0.82rem] text-muted">{special.bells.length}</span>}
          >
            <BellList scope={{ kind: 'special', id: special.id }} bells={special.bells} />
            {special.bells.length === 0 ? (
              <Button variant="soft" className="mt-2 w-full rounded-full" onClick={() => copyWeeklyInto(special.id)}>
                <Copy aria-hidden className="size-4" />
                Copiar horario habitual
              </Button>
            ) : null}
          </Section>
        ) : (
          <div className="mt-7 flex items-center gap-3 rounded-3xl bg-surface px-4 py-4 shadow-[inset_0_0_0_1px_var(--line)]">
            <BellOff aria-hidden className="size-5 shrink-0 text-muted" />
            <p className="text-[0.95rem] leading-snug">
              Ese día la campana no suena. Los timbrados que tenías guardados se conservan si vuelves a horario
              especial.
            </p>
          </div>
        )}
      </div>
    </Page>
  )
}
