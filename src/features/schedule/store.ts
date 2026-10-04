import { cloneBells, createBell, sortBells } from '@/features/schedule/bell'
import type {
  Bell,
  BellScope,
  ScheduleState,
  SpecialDate,
} from '@/features/schedule/types'
import { createId } from '@/lib/id'
import { useSyncExternalStore } from 'react'

const KEY = 'solarbell:schedule:v1'

function seed(): ScheduleState {
  return {
    weekly: {
      days: [1, 2, 3, 4, 5],
      bells: [
        createBell({ label: 'Primera hora', time: '08:00' }),
        createBell({ label: 'Segunda hora', time: '10:00' }),
        createBell({ label: 'Tercera hora', time: '12:00' }),
      ],
    },
    specials: [],
  }
}

function load(): ScheduleState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as ScheduleState
  } catch {
    // Storage corrupto o bloqueado: arrancar con el horario base.
  }
  return seed()
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

export function getBells(current: ScheduleState, scope: BellScope) {
  if (scope.kind === 'weekly') return current.weekly.bells
  return current.specials.find((s) => s.id === scope.id)?.bells ?? []
}

function updateBells(scope: BellScope, update: (bells: Bell[]) => Bell[]) {
  if (scope.kind === 'weekly') {
    commit({
      ...state,
      weekly: { ...state.weekly, bells: sortBells(update(state.weekly.bells)) },
    })
    return
  }
  commit({
    ...state,
    specials: state.specials.map((s) =>
      s.id === scope.id ? { ...s, bells: sortBells(update(s.bells)) } : s,
    ),
  })
}

export function saveBell(scope: BellScope, bell: Bell) {
  updateBells(scope, (bells) =>
    bells.some((b) => b.id === bell.id)
      ? bells.map((b) => (b.id === bell.id ? bell : b))
      : [...bells, bell],
  )
}

export function deleteBell(scope: BellScope, id: string) {
  updateBells(scope, (bells) => bells.filter((b) => b.id !== id))
}

export function setWeekdays(days: number[]) {
  commit({ ...state, weekly: { ...state.weekly, days: [...days].sort((a, b) => a - b) } })
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
  commit({ ...state, specials: [...state.specials, special] })
  return special.id
}

export function updateSpecial(id: string, patch: Partial<Omit<SpecialDate, 'id'>>) {
  commit({
    ...state,
    specials: state.specials.map((s) => (s.id === id ? { ...s, ...patch } : s)),
  })
}

export function copyWeeklyInto(id: string) {
  updateSpecial(id, { bells: sortBells(cloneBells(state.weekly.bells)) })
}

export function deleteSpecial(id: string) {
  commit({ ...state, specials: state.specials.filter((s) => s.id !== id) })
}
