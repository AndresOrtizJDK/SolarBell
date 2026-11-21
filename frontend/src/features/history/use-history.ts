import { fetchHistory, HISTORY_PAGE } from '@/features/history/api'
import type { HistoryEntry, HistoryQuery } from '@/features/history/types'
import { DeviceError, errorText } from '@/lib/device'
import { useCallback, useEffect, useRef, useState } from 'react'

type Nav = {
  filterKey: string
  /** `before` con el que se pide cada página; la primera no tiene. Se llena a medida que se avanza. */
  cursors: (number | null)[]
  index: number
}

type Data = {
  /** Pedido al que pertenece lo cargado: si no coincide con el actual, se está cargando otra página. */
  key: string
  entries: HistoryEntry[]
  next: number | null
  total: number
  error: string | null
}

const INITIAL: Data = { key: '', entries: [], next: null, total: 0, error: null }

function failure(error: unknown) {
  // Firmware anterior a 0.7: no conoce la ruta.
  if (error instanceof DeviceError && error.status === 404) return 'Actualiza el firmware de la campana para ver el historial'
  return errorText(error)
}

/**
 * Historial de la campana, de a `HISTORY_PAGE` por página. Los ids no cambian al llegar toques
 * nuevos, así que una página lejana sigue siendo la misma; solo la primera se recarga cuando la
 * campana anota un toque (`head`). Al cambiar el filtro vuelve a la primera. Mientras carga deja a
 * la vista lo anterior.
 */
export function useHistory(query: HistoryQuery, enabled: boolean, head: number | undefined) {
  const { text, from, to } = query
  const filterKey = `${text}|${from}|${to}`
  const [nav, setNav] = useState<Nav>({ filterKey, cursors: [null], index: 0 })
  const [data, setData] = useState<Data>(INITIAL)
  const [attempt, setAttempt] = useState(0)
  // Cada carga nueva invalida a la anterior: una respuesta tardía no pisa la página actual.
  const run = useRef(0)

  if (nav.filterKey !== filterKey) setNav({ filterKey, cursors: [null], index: 0 })

  const { index } = nav
  const cursor = nav.cursors[index] ?? null
  const key = `${filterKey}|${index}|${cursor}|${index === 0 ? head : ''}|${attempt}`

  useEffect(() => {
    if (!enabled) return
    const id = ++run.current
    fetchHistory({ text, from, to }, cursor)
      .then((page) => {
        if (run.current !== id) return
        // Se borró lo último de esta página: se vuelve a la anterior.
        if (page.records.length === 0 && index > 0) {
          setNav((prev) => ({ ...prev, cursors: prev.cursors.slice(0, index), index: index - 1 }))
          return
        }
        setData({ key, entries: page.records, next: page.next, total: page.total, error: null })
      })
      .catch((error: unknown) => {
        if (run.current === id) setData((prev) => ({ ...prev, key, error: failure(error) }))
      })
  }, [enabled, key, text, from, to, cursor, index])

  const loaded = data.key === key
  const next = loaded ? data.next : null

  const goNext = useCallback(() => {
    if (next === null) return
    setNav((prev) => ({
      ...prev,
      cursors: [...prev.cursors.slice(0, prev.index + 1), next],
      index: prev.index + 1,
    }))
  }, [next])

  const goPrev = useCallback(() => {
    setNav((prev) => (prev.index > 0 ? { ...prev, index: prev.index - 1 } : prev))
  }, [])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  return {
    entries: data.entries,
    error: data.error,
    loading: enabled && !loaded,
    /** Página actual, desde 1. */
    page: index + 1,
    /** Cuántas páginas hay en total; solo es exacto sin filtros. */
    pages: Math.max(1, Math.ceil(data.total / HISTORY_PAGE)),
    hasPrev: index > 0,
    hasNext: next !== null,
    goNext,
    goPrev,
    reload,
  } as const
}
