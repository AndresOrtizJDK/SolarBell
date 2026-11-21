import { Page } from '@/components/layout/page'
import { Button } from '@/components/ui/button'
import { TextInput } from '@/components/ui/field'
import { useDevice } from '@/features/device/store'
import { HistoryDetailSheet } from '@/features/history/components/history-detail-sheet'
import { HistoryFilterSheet } from '@/features/history/components/history-filter-sheet'
import { HistoryTable } from '@/features/history/components/history-table'
import { NO_RANGE, type DateRange } from '@/features/history/range'
import type { HistoryEntry } from '@/features/history/types'
import { deleteHistoryEntry } from '@/features/history/api'
import { useHistory } from '@/features/history/use-history'
import { formatDateKeyShort } from '@/features/schedule/format'
import { fromDateKey } from '@/features/schedule/upcoming'
import { useDebounced } from '@/hooks/use-debounced'
import { cn } from '@/lib/cn'
import { toast } from '@/features/feedback/toast'
import { DEVICE_NETWORK, errorText } from '@/lib/device'
import { ChevronLeft, ChevronRight, History, ListFilter, Search, WifiOff, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'

const SEARCH_DELAY_MS = 350

function endOfDay(key: string) {
  const day = fromDateKey(key)
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1).getTime() - 1
}

function rangeText({ from, to }: DateRange) {
  if (from && to) return `${formatDateKeyShort(from)} – ${formatDateKeyShort(to)}`
  if (from) return `Desde ${formatDateKeyShort(from)}`
  return `Hasta ${formatDateKeyShort(to)}`
}

const ICON_BUTTON =
  'relative grid size-12 shrink-0 place-items-center rounded-full border border-line bg-raised transition-[transform,background-color] duration-[var(--duration-press)] ease-[var(--ease-out-soft)] active:scale-[0.94] active:bg-surface'

export function HistoryPage() {
  const { link, status } = useDevice()
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [range, setRange] = useState<DateRange>(NO_RANGE)
  const [filterOpen, setFilterOpen] = useState(false)
  const [detail, setDetail] = useState<HistoryEntry | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const text = useDebounced(search, SEARCH_DELAY_MS)
  const near = link === 'near'
  const history = useHistory(
    {
      text,
      from: range.from ? fromDateKey(range.from).getTime() : null,
      to: range.to ? endOfDay(range.to) : null,
    },
    near,
    status?.historyHead,
  )
  const filtered = text.trim() !== '' || range.from !== '' || range.to !== ''
  const hasRange = range.from !== '' || range.to !== ''

  async function removeEntry(entry: HistoryEntry) {
    try {
      await deleteHistoryEntry(entry.id)
    } catch (error) {
      toast(errorText(error), 'danger')
      throw error
    }
    setDetailOpen(false)
    toast('Toque eliminado')
    history.reload()
  }

  function turn(change: () => void) {
    change()
    window.scrollTo({ top: 0 })
  }
  const first = history.loading && history.entries.length === 0

  return (
    <Page>
      <h1 className="sr-only">Historial</h1>

      <div className="mb-3 flex items-center gap-2">
        {searchOpen ? (
          <div className="relative min-w-0 flex-1">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
            <TextInput
              type="search"
              autoFocus
              aria-label="Buscar por nombre"
              placeholder="Buscar por nombre"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="rounded-full pr-12 pl-11 [&::-webkit-search-cancel-button]:hidden"
            />
            <button
              type="button"
              aria-label="Cerrar búsqueda"
              onClick={() => {
                setSearch('')
                setSearchOpen(false)
              }}
              className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-full text-muted active:bg-surface"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>
        ) : (
          <>
            <span className="flex-1" />
            <button type="button" aria-label="Buscar por nombre" onClick={() => setSearchOpen(true)} className={ICON_BUTTON}>
              <Search aria-hidden className="size-5" />
            </button>
          </>
        )}
        <button
          type="button"
          aria-label={hasRange ? `Filtrar por fecha, activo: ${rangeText(range)}` : 'Filtrar por fecha'}
          onClick={() => setFilterOpen(true)}
          className={cn(ICON_BUTTON, hasRange && 'border-field/50 text-field-ink')}
        >
          <ListFilter aria-hidden className="size-5" />
          {hasRange ? <span aria-hidden className="absolute top-2.5 right-2.5 size-2 rounded-full bg-field" /> : null}
        </button>
      </div>

      {hasRange ? (
        <button
          type="button"
          onClick={() => setRange(NO_RANGE)}
          aria-label={`Quitar el filtro ${rangeText(range)}`}
          className="mb-3 inline-flex min-h-9 items-center gap-1.5 self-start rounded-full bg-surface py-1 pr-2 pl-3.5 text-[0.86rem] font-medium active:scale-[0.97]"
        >
          <span className="font-mono tabular-nums">{rangeText(range)}</span>
          <X aria-hidden className="size-4 text-muted" />
        </button>
      ) : null}

      {link === 'away' ? (
        <Notice icon={<WifiOff aria-hidden className="size-6" />} title="La campana no está al alcance">
          Únete a la red {DEVICE_NETWORK} para ver el historial.
        </Notice>
      ) : link === 'checking' || first ? (
        <Skeleton />
      ) : history.entries.length === 0 ? (
        history.error ? (
          <Notice icon={<History aria-hidden className="size-6" />} title="No se pudo leer el historial">
            {history.error}
            <Button variant="line" className="mt-4 rounded-full px-5" onClick={history.reload}>
              Reintentar
            </Button>
          </Notice>
        ) : (
          <Notice icon={<History aria-hidden className="size-6" />} title={filtered ? 'Sin resultados' : 'Aún no hay toques'}>
            {filtered ? 'Ningún toque coincide con la búsqueda o las fechas.' : 'Cada toque de la campana aparecerá aquí.'}
          </Notice>
        )
      ) : (
        <>
          <HistoryTable
            entries={history.entries}
            stale={history.loading}
            onOpen={(entry) => {
              setDetail(entry)
              setDetailOpen(true)
            }}
          />
          {history.error ? (
            <p role="alert" className="mt-3 px-1 text-[0.88rem] text-field-ink">
              {history.error}
            </p>
          ) : null}
          {history.hasPrev || history.hasNext ? (
            <nav aria-label="Paginación" className="mt-3 flex items-center justify-between gap-2">
              <Button
                variant="line"
                className="rounded-full pr-4 pl-3"
                disabled={!history.hasPrev || history.loading}
                onClick={() => turn(history.goPrev)}
              >
                <ChevronLeft aria-hidden className="size-4.5" />
                Anterior
              </Button>
              <span aria-live="polite" className="text-[0.88rem] text-muted tabular-nums">
                Página {history.page}
                {filtered ? '' : ` de ${history.pages}`}
              </span>
              <Button
                variant="line"
                className="rounded-full pr-3 pl-4"
                disabled={!history.hasNext || history.loading}
                onClick={() => turn(history.goNext)}
              >
                Siguiente
                <ChevronRight aria-hidden className="size-4.5" />
              </Button>
            </nav>
          ) : null}
        </>
      )}

      <HistoryFilterSheet
        open={filterOpen}
        value={range}
        onClose={() => setFilterOpen(false)}
        onApply={(next) => {
          setRange(next)
          setFilterOpen(false)
        }}
      />
      <HistoryDetailSheet open={detailOpen} entry={detail} onClose={() => setDetailOpen(false)} onDelete={removeEntry} />
    </Page>
  )
}

function Notice({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-10 text-center text-muted">
      {icon}
      <p className="mt-2 font-medium text-ink">{title}</p>
      <p className="mt-0.5 flex flex-col items-center text-[0.9rem]">{children}</p>
    </div>
  )
}

function Skeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando historial" className="overflow-hidden rounded-3xl bg-raised shadow-raised">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-line/60 px-4 py-4 last:border-b-0">
          <span className="h-4 flex-1 rounded-full bg-surface motion-safe:animate-pulse" />
          <span className="h-4 w-16 rounded-full bg-surface motion-safe:animate-pulse" />
          <span className="h-4 w-10 rounded-full bg-surface motion-safe:animate-pulse" />
        </div>
      ))}
    </div>
  )
}
