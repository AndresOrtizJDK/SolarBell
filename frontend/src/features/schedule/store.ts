import { toast } from '@/features/feedback/toast'
import { cloneBells, sortBells } from '@/features/schedule/bell'
import type {
  Bell,
  BellScope,
  ScheduleState,
  SpecialDate,
} from '@/features/schedule/types'
import { device, errorText } from '@/lib/device'
import { createId } from '@/lib/id'
import { useSyncExternalStore } from 'react'

/** Última copia leída de la campana. La que manda es la guardada en el ESP32. */
const KEY = 'solarbell:schedule:local:v2'
const NAME_DEBOUNCE_MS = 400

const EMPTY: ScheduleState = { weekly: { days: [], bells: [] }, specials: [] }

function load(): ScheduleState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as ScheduleState
  } catch {
    // Storage corrupto o bloqueado: esperar a la campana.
  }
  return EMPTY
}

let state = load()
/** Lo último que la campana confirmó: a esto se vuelve si un cambio no llega. */
let confirmed = state
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

// Cada cambio manda el horario completo. Van en fila para que la campana guarde el último.
// La respuesta solo reemplaza el estado cuando no queda nada pendiente: así no pisa lo que
// el usuario sigue escribiendo.
let queue: Promise<unknown> = Promise.resolve()
let pending = 0
let failed = false

function enqueue<T>(request: () => Promise<T>) {
  const run = queue.then(request)
  queue = run.catch(() => {})
  return run
}

const saveOnDevice = (next: ScheduleState) =>
  device<ScheduleState>('/schedule', { method: 'PUT', body: next })

async function mutate(next: ScheduleState) {
  commit(next)
  pending++
  try {
    const saved = await enqueue(() => saveOnDevice(next))
    confirmed = saved
    if (pending === 1 && !failed) commit(saved)
  } catch (error) {
    if (!failed) toast(errorText(error), 'danger')
    failed = true
  } finally {
    pending--
    if (pending === 0 && failed) {
      failed = false
      commit(confirmed)
    }
  }
}

export function isScheduleIdle() {
  return pending === 0
}

export async function refreshSchedule() {
  try {
    const next = await enqueue(() => device<ScheduleState>('/schedule'))
    confirmed = next
    if (pending === 0) commit(next)
  } catch {
    // Fuera de alcance se queda la última copia; al volver la campana se pide de nuevo.
  }
}

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

export function saveBell(scope: BellScope, bell: Bell) {
  void mutate(
    withBells(scope, (bells) =>
      bells.some((b) => b.id === bell.id)
        ? bells.map((b) => (b.id === bell.id ? bell : b))
        : [...bells, bell],
    ),
  )
}

export function deleteBell(scope: BellScope, id: string) {
  void mutate(withBells(scope, (bells) => bells.filter((b) => b.id !== id)))
}

export function setWeekdays(days: number[]) {
  const sorted = [...days].sort((a, b) => a - b)
  void mutate({ ...state, weekly: { ...state.weekly, days: sorted } })
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
  void mutate({ ...state, specials: [...state.specials, special] })
  return special.id
}

const nameTimers = new Map<string, number>()

export function updateSpecial(id: string, patch: Partial<Omit<SpecialDate, 'id'>>) {
  const next = {
    ...state,
    specials: state.specials.map((s) => (s.id === id ? { ...s, ...patch } : s)),
  }

  const onlyName = patch.name !== undefined && Object.keys(patch).length === 1
  if (!onlyName) {
    void mutate(next)
    return
  }
  commit(next)

  // El nombre se guarda por tecla: se agrupa y se manda el último valor.
  const timer = nameTimers.get(id)
  if (timer === undefined) pending++
  else window.clearTimeout(timer)
  nameTimers.set(
    id,
    window.setTimeout(() => {
      nameTimers.delete(id)
      pending--
      void mutate(state)
    }, NAME_DEBOUNCE_MS),
  )
}

export function copyWeeklyInto(id: string) {
  updateSpecial(id, { bells: sortBells(cloneBells(state.weekly.bells)) })
}

export function deleteSpecial(id: string) {
  void mutate({ ...state, specials: state.specials.filter((s) => s.id !== id) })
}
