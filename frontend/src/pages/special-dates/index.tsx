import { Page, Section } from '@/components/layout/page'
import { FormActions } from '@/components/ui/form-actions'
import { Sheet } from '@/components/ui/sheet'
import { toast } from '@/features/feedback/toast'
import { SpecialDateForm } from '@/features/schedule/components/special-date-form'
import { SpecialDateRow } from '@/features/schedule/components/special-date-row'
import { useSchedule } from '@/features/schedule/store'
import { pastSpecials, upcomingSpecials } from '@/features/schedule/upcoming'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Plus } from 'lucide-react'
import { useId, useState } from 'react'
import { useNavigate } from 'react-router'

const listClass = 'overflow-hidden rounded-3xl bg-raised shadow-raised'

export function SpecialDatesPage() {
  const state = useSchedule()
  const navigate = useNavigate()
  const [now] = useState(() => new Date())
  const formId = useId()
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [canCreate, setCanCreate] = useState(true)
  const upcoming = upcomingSpecials(state, now)
  const past = pastSpecials(state, now)
  const empty = upcoming.length === 0 && past.length === 0
  const reduceMotion = usePrefersReducedMotion()

  const add = () => {
    setFormKey((key) => key + 1)
    setOpen(true)
  }

  const addButton = (
    <button
      type="button"
      onClick={add}
      className="mt-3 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-solar/15 text-[0.98rem] font-medium text-solar-deep transition-[transform,background-color] duration-[var(--duration-press)] ease-[var(--ease-out-soft)] active:scale-[0.98] active:bg-solar/25"
    >
      <Plus aria-hidden className="size-5" />
      Agregar fecha
    </button>
  )

  return (
    <Page>
      {empty ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          <div className="flex w-full flex-col items-center rounded-3xl border border-dashed border-line px-6 py-8 text-center">
            <div className="size-28" aria-hidden>
              <DotLottieReact
                src="/calendar-date.lottie"
                autoplay={!reduceMotion}
                loop={!reduceMotion}
                className="size-full"
              />
            </div>
            <p className="mt-1 font-medium">Sin fechas especiales</p>
            <p className="mt-0.5 text-[0.9rem] text-muted">
              Úsalas para un acto cívico a otra hora, una entrega de boletines o un día sin campana.
            </p>
          </div>
          {addButton}
        </div>
      ) : (
        <>
          <Section title="Próximas" aside={<span className="font-mono text-[0.82rem] text-muted">{upcoming.length}</span>}>
            {upcoming.length > 0 ? (
              <ul className={listClass}>
                {upcoming.map((special) => (
                  <SpecialDateRow key={special.id} special={special} />
                ))}
              </ul>
            ) : (
              <p className="rounded-3xl bg-raised px-4 py-4 text-[0.95rem] text-muted">No hay fechas próximas.</p>
            )}
          </Section>
          {past.length > 0 ? (
            <Section title="Pasadas">
              <ul className={listClass}>
                {past.map((special) => (
                  <SpecialDateRow key={special.id} special={special} muted />
                ))}
              </ul>
            </Section>
          ) : null}
          {addButton}
        </>
      )}

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva fecha especial"
        footer={
          <FormActions form={formId} submitLabel="Crear fecha" submitDisabled={!canCreate} />
        }
      >
        <SpecialDateForm
          key={formKey}
          id={formId}
          onReadyChange={setCanCreate}
          onCreated={(id) => {
            setOpen(false)
            toast('Fecha creada')
            navigate(`/fechas/${id}`)
          }}
        />
      </Sheet>
    </Page>
  )
}
