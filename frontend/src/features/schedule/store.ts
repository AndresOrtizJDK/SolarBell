import { toast } from '@/features/feedback/toast'
import { cloneBells, sortBells } from '@/features/schedule/bell'
import type {
  Bell,
  BellScope,
  ScheduleState,
  SpecialDate,
} from '@/features/schedule/types'
import { api, ApiError, errorText } from '@/lib/api'
import { createId } from '@/lib/id'
import { onLive } from '@/lib/live'
import { useSyncExternalStore } from 'react'

/** Cache del último estado del servidor: solo sirve para el primer render. */
const KEY = 'solarbell:schedule:v2'
const NAME_DEBOUNCE_MS = 400

const EMPTY: ScheduleState = { weekly: { days: [], bells: [] }, specials: [] }

function load(): ScheduleState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as ScheduleState
  } catch {
    // Storage corrupto o bloqueado: esperar al servidor.
  }
  return EMPTY
}

let state = load()
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function commit(next: ScheduleState) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Sin storage la sesión sigue funcionando en memoria.
  }
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return
    state = load()
    emit()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

const getSnapshot = () => state

export function useSchedule() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

// Las peticiones van en fila para que el servidor las vea en el mismo orden que el usuario
// (crear la fecha antes de agregarle un timbrado). La respuesta solo reemplaza el estado
// cuando no queda nada pendiente: así no pisa lo que el usuario sigue escribiendo.
let queue: Promise<unknown> = Promise.resolve()
let pending = 0
let failed = false

function enqueue<T>(request: () => Promise<T>) {
  const run = queue.then(request)
  queue = run.catch(() => {})
  return run
}

async function mutate(optimistic: ScheduleState, request: () => Promise<ScheduleState>) {
  commit(optimistic)
  pending++
  try {
    const next = await enqueue(request)
    if (pending === 1 && !failed) commit(next)
  } catch (error) {
    failed = true
    if (!(error instanceof ApiError && error.status === 401)) toast(errorText(error), 'danger')
  } finally {
    pending--
    if (pending === 0 && failed) {
      failed = false
      void refreshSchedule()
    }
  }
}

export async function refreshSchedule() {
  try {
    const next = await enqueue(() => api<ScheduleState>('/schedule'))
    if (pending === 0) commit(next)
  } catch {
    // Sin servidor se queda el cache; la reconexión del WebSocket vuelve a pedirlo.
  }
}

onLive((message) => {
  if (message.type === 'open') void refreshSchedule()
})

export function getBells(current: ScheduleState, scope: BellScope) {
  if (scope.kind === 'weekly') return current.weekly.bells
  return current.specials.find((s) => s.id === scope.id)?.bells ?? []
}

function withBells(scope: BellScope, update: (bells: Bell[]) => Bell[]): ScheduleState {
  if (scope.kind === 'weekly') {
    return { ...state, weekly: { ...state.weekly, bells: sortBells(update(state.weekly.bells)) } }
  }
  return {
    ...state,
    specials: state.specials.map((s) =>
      s.id === scope.id ? { ...s, bells: sortBells(update(s.bells)) } : s,
    ),
  }
}

function scopeParam(scope: BellScope) {
  return scope.kind === 'weekly' ? 'weekly' : `special:${scope.id}`
}

export function saveBell(scope: BellScope, bell: Bell) {
  const next = withBells(scope, (bells) =>
    bells.some((b) => b.id === bell.id)
      ? bells.map((b) => (b.id === bell.id ? bell : b))
      : [...bells, bell],
  )
  const path = `/schedule/bells/${encodeURIComponent(bell.id)}?scope=${encodeURIComponent(scopeParam(scope))}`
  void mutate(next, () => api<ScheduleState>(path, { method: 'PUT', body: bell }))
}

export function deleteBell(scope: BellScope, id: string) {
  const next = withBells(scope, (bells) => bells.filter((b) => b.id !== id))
  void mutate(next, () =>
    api<ScheduleState>(`/schedule/bells/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  )
}

export function setWeekdays(days: number[]) {
  const sorted = [...days].sort((a, b) => a - b)
  void mutate({ ...state, weekly: { ...state.weekly, days: sorted } }, () =>
    api<ScheduleState>('/schedule/weekdays', { method: 'PUT', body: { days: sorted } }),
  )
}

export function findSpecialByDate(date: string, current = state) {
  return current.specials.find((s) => s.date === date) ?? null
}

export function createSpecial(input: Omit<SpecialDate, 'id' | 'bells'>) {
  const special: SpecialDate = {
    ...input,
    id: createId(),
    bells: input.mode === 'custom' ? cloneBells(state.weekly.bells) : [],
  }
  void mutate({ ...state, specials: [...state.specials, special] }, () =>
    api<ScheduleState>('/specials', { method: 'POST', body: special }),
  )
  return special.id
}

const nameTimers = new Map<string, number>()

function patchSpecial(id: string, patch: Partial<Omit<SpecialDate, 'id'>>) {
  void mutate(state, () =>
    api<ScheduleState>(`/specials/${encodeURIComponent(id)}`, { method: 'PATCH', body: patch }),
  )
}

export function updateSpecial(id: string, patch: Partial<Omit<SpecialDate, 'id'>>) {
  commit({
    ...state,
    specials: state.specials.map((s) => (s.id === id ? { ...s, ...patch } : s)),
  })

  const onlyName = patch.name !== undefined && Object.keys(patch).length === 1
  if (!onlyName) {
    patchSpecial(id, patch)
    return
  }

  // El nombre se guarda por tecla: se agrupa y se manda el último valor.
  const timer = nameTimers.get(id)
  if (timer === undefined) pending++
  else window.clearTimeout(timer)
  nameTimers.set(
    id,
    window.setTimeout(() => {
      nameTimers.delete(id)
      pending--
      const name = state.specials.find((s) => s.id === id)?.name
      if (name !== undefined) patchSpecial(id, { name })
    }, NAME_DEBOUNCE_MS),
  )
}

export function copyWeeklyInto(id: string) {
  updateSpecial(id, { bells: sortBells(cloneBells(state.weekly.bells)) })
}

export function deleteSpecial(id: string) {
  void mutate({ ...state, specials: state.specials.filter((s) => s.id !== id) }, () =>
    api<ScheduleState>(`/specials/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  )
}
