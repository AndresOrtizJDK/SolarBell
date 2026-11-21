import { entryName, entryWhen, formatDuration, outcomeText, sourceText } from '@/features/history/format'
import type { HistoryEntry } from '@/features/history/types'
import { cn } from '@/lib/cn'
import { Info } from 'lucide-react'

type HistoryTableProps = {
  entries: HistoryEntry[]
  onOpen: (entry: HistoryEntry) => void
  /** Recargando por un filtro nuevo: las filas se atenúan hasta que llegue lo nuevo. */
  stale?: boolean
}

const HEAD = 'px-2 py-3 text-[0.78rem] font-medium text-muted'

export function HistoryTable({ entries, onOpen, stale }: HistoryTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl bg-raised shadow-raised">
      <table className={cn('w-full table-fixed border-collapse text-left transition-opacity duration-[var(--duration-ui)]', stale && 'opacity-50')}>
        <thead>
          <tr className="border-b border-line/60">
            <th scope="col" className={cn(HEAD, 'pl-4')}>
              Nombre
            </th>
            <th scope="col" className={cn(HEAD, 'w-[5.6rem]')}>
              Hora
            </th>
            <th scope="col" className={cn(HEAD, 'w-[4.3rem]')}>
              Duración
            </th>
            <th scope="col" className="w-11">
              <span className="sr-only">Configuración</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <Row key={entry.id} entry={entry} onOpen={onOpen} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Row({ entry, onOpen }: { entry: HistoryEntry; onOpen: (entry: HistoryEntry) => void }) {
  const name = entryName(entry)
  const when = entryWhen(entry)
  const interrupted = entry.outcome !== 'completed'

  return (
    <tr className="border-b border-line/60 align-middle last:border-b-0">
      <td className="min-w-0 py-3 pr-2 pl-4">
        <span className="line-clamp-2 text-[0.95rem] leading-tight font-medium break-words">{name}</span>
        <span className="mt-0.5 block truncate text-[0.76rem] text-muted">
          {sourceText(entry)}
          {interrupted ? <span className="text-field-ink"> · {entry.outcome === 'stopped' ? 'Detenido' : 'Cortado'}</span> : null}
        </span>
      </td>
      <td className="px-2 py-3">
        {when ? (
          <>
            <span className="block text-[0.9rem] leading-tight tabular-nums">{when.time}</span>
            <span className="mt-0.5 block font-mono text-[0.72rem] text-muted tabular-nums">{when.date}</span>
          </>
        ) : (
          <span className="text-[0.84rem] text-muted">Sin hora</span>
        )}
      </td>
      <td className="px-2 py-3 text-[0.9rem] tabular-nums">{formatDuration(entry.soundedMs)}</td>
      <td className="pr-1">
        <button
          type="button"
          onClick={() => onOpen(entry)}
          aria-label={`Ver configuración de ${name}, ${outcomeText(entry.outcome).toLowerCase()}`}
          className="grid size-11 place-items-center rounded-full text-muted transition-[transform,background-color] duration-[var(--duration-press)] ease-[var(--ease-out-soft)] active:scale-[0.92] active:bg-surface"
        >
          <Info aria-hidden className="size-5" />
        </button>
      </td>
    </tr>
  )
}
