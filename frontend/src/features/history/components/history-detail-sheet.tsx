import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Sheet } from '@/components/ui/sheet'
import { entryName, entryTotalMs, entryWhen, formatDuration, outcomeText, patternText, sourceText } from '@/features/history/format'
import type { HistoryEntry } from '@/features/history/types'
import { RingPattern } from '@/features/schedule/components/ring-pattern'
import { formatSeconds } from '@/features/schedule/bell'
import { Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'

type HistoryDetailSheetProps = {
  open: boolean
  entry: HistoryEntry | null
  onClose: () => void
  /** Borra el toque de la campana; si lanza, el modal se cierra y la hoja queda abierta. */
  onDelete: (entry: HistoryEntry) => Promise<void>
}

export function HistoryDetailSheet({ open, entry, onClose, onDelete }: HistoryDetailSheetProps) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  async function confirm() {
    if (!entry) return
    setBusy(true)
    try {
      await onDelete(entry)
    } catch {
      // El error ya se avisó; la hoja sigue abierta con el toque.
    } finally {
      setBusy(false)
      setConfirming(false)
    }
  }

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title="Configuración del toque"
        footer={
          <Button
            variant="line"
            className="min-h-13 w-full rounded-full text-[1rem] text-field-ink"
            onClick={() => setConfirming(true)}
          >
            <Trash2 aria-hidden className="size-4.5" />
            Eliminar del historial
          </Button>
        }
      >
        {entry ? <Detail entry={entry} /> : null}
      </Sheet>
      <ConfirmDialog
        open={confirming}
        title="¿Eliminar este toque?"
        description={entry ? `Se quitará «${entryName(entry)}» del historial de la campana.` : undefined}
        busy={busy}
        onConfirm={() => void confirm()}
        onCancel={() => setConfirming(false)}
      />
    </>
  )
}

function Detail({ entry }: { entry: HistoryEntry }) {
  const when = entryWhen(entry)
  const planned = entryTotalMs(entry)
  const interrupted = entry.outcome !== 'completed'

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[1.25rem] leading-tight font-semibold tracking-[-0.02em] break-words">{entryName(entry)}</p>
        <p className="mt-1 text-[0.95rem] text-muted">{patternText(entry)}</p>
      </div>

      <RingPattern durations={entry.durations} pauses={entry.pauses} />

      <dl className="overflow-hidden rounded-2xl bg-surface">
        <Row term="Fecha" value={when?.date ?? 'Sin hora: el reloj de la campana no estaba en hora'} />
        <Row term="Hora" value={when?.time ?? '—'} />
        <Row term="Origen" value={sourceText(entry)} />
        <Row term="Resultado" value={outcomeText(entry.outcome)} tone={interrupted ? 'warn' : undefined} />
        <Row term="Sonó" value={formatDuration(entry.soundedMs)} />
        {interrupted ? <Row term="Planeado" value={formatDuration(planned)} /> : null}
      </dl>

      <section aria-labelledby="history-rings">
        <h3 id="history-rings" className="mb-2 px-1 text-[0.88rem] font-medium text-muted">
          Toque por toque
        </h3>
        <ol className="overflow-hidden rounded-2xl bg-surface">
          {entry.durations.map((ms, i) => (
            <li key={i} className="border-b border-line/60 px-4 py-2.5 last:border-b-0">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[0.95rem]">Toque {i + 1}</span>
                <span className="font-mono text-[0.92rem] tabular-nums">{formatSeconds(ms)} s</span>
              </div>
              {i < entry.pauses.length ? (
                <p className="mt-0.5 text-[0.8rem] text-muted">Pausa de {formatSeconds(entry.pauses[i])} s</p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

function Row({ term, value, tone }: { term: string; value: ReactNode; tone?: 'warn' }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line/60 px-4 py-2.5 last:border-b-0">
      <dt className="shrink-0 text-[0.92rem] text-muted">{term}</dt>
      <dd className={tone === 'warn' ? 'text-right text-[0.95rem] font-medium text-field-ink' : 'text-right text-[0.95rem] font-medium'}>
        {value}
      </dd>
    </div>
  )
}
