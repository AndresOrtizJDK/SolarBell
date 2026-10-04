import { Page } from '@/components/layout/page'
import { Button } from '@/components/ui/button'
import { toast } from '@/features/feedback/toast'
import { BellPush } from '@/features/ring/components/bell-push'
import { RingSheet } from '@/features/ring/components/ring-sheet'
import { startRing, stopRing, useRingConfig, useRingRun, type RingRun } from '@/features/ring/store'
import { RingPattern } from '@/features/schedule/components/ring-pattern'
import { useNow } from '@/hooks/use-now'
import { Square } from 'lucide-react'
import { useState } from 'react'

export function RingPage() {
  const config = useRingConfig()
  const run = useRingRun()
  const [open, setOpen] = useState(false)

  return (
    <Page>
      <h1 className="sr-only">Tocar</h1>
      <section className="grid flex-1 grid-rows-[1fr_auto_1fr] justify-items-center">
        <BellPush
          label={run ? 'La campana está sonando' : 'Configurar y tocar la campana'}
          latched={run !== null}
          onPress={() => setOpen(true)}
          className="row-start-2 w-[72%]"
        />
        <div className="row-start-3 flex w-full justify-center pt-6">
          {run ? <RingStatus key={run.id} run={run} /> : (
            <p className="text-[0.95rem] text-muted">Presiona el botón para elegir cómo suena</p>
          )}
        </div>
      </section>

      <RingSheet
        open={open}
        initial={config}
        onClose={() => setOpen(false)}
        onRing={(next) => {
          setOpen(false)
          startRing(next)
          toast('Campana sonando')
        }}
      />
    </Page>
  )
}

function RingStatus({ run }: { run: RingRun }) {
  const now = useNow().getTime()
  const left = Math.max(0, Math.ceil((run.endsAt - now) / 1000))
  const elapsed = (now - run.startedAt) / 1000
  let ring = 0
  for (let end = 0; ring < run.durations.length && end <= elapsed; ring++) end += run.durations[ring]

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-3">
      <p aria-live="polite" className="text-[0.95rem] font-medium">
        Toque {ring} de {run.durations.length}
        <span className="ml-2 font-mono text-muted tabular-nums">{left} s</span>
      </p>
      <RingPattern durations={run.durations} />
      <Button variant="line" className="mt-1 rounded-full px-5" onClick={stopRing}>
        <Square aria-hidden className="size-3.5 fill-current" />
        Detener
      </Button>
    </div>
  )
}
