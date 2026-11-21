import type { HistoryEntry, HistoryPage, HistoryQuery } from '@/features/history/types'
import { device } from '@/lib/device'

/** Toques por página de la tabla. */
export const HISTORY_PAGE = 15
/** La campana revisa un máximo de registros por pedido: con filtros puede devolver pocos y un `next`. */
const MAX_REQUESTS = 12

function path(query: HistoryQuery, before: number | null, limit: number) {
  const params = new URLSearchParams({ limit: String(limit) })
  if (before !== null) params.set('before', String(before))
  if (query.from !== null) params.set('from', String(query.from))
  if (query.to !== null) params.set('to', String(query.to))
  if (query.text.trim()) params.set('q', query.text.trim())
  return `/history?${params}`
}

/**
 * Una página de `HISTORY_PAGE` toques que empieza justo antes de `before`. Si la campana se corta por
 * su límite de revisión antes de juntarlos, sigue pidiendo desde donde quedó. `next` es el `before`
 * de la página siguiente.
 */
export async function fetchHistory(query: HistoryQuery, before: number | null = null): Promise<HistoryPage> {
  const records: HistoryEntry[] = []
  let page = await device<HistoryPage>(path(query, before, HISTORY_PAGE))
  records.push(...page.records)
  for (let i = 1; i < MAX_REQUESTS && records.length < HISTORY_PAGE && page.next !== null; i++) {
    page = await device<HistoryPage>(path(query, page.next, HISTORY_PAGE - records.length))
    records.push(...page.records)
  }
  return { ...page, records }
}

export function deleteHistoryEntry(id: number) {
  return device<{ id: number; total: number }>('/history/delete', { method: 'POST', body: { id } })
}
