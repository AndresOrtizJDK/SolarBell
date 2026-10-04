import { useSyncExternalStore } from 'react'

export const TOAST_DURATION_MS = 2000

export type ToastTone = 'ok' | 'danger'

export type FeedbackToast = {
  id: number
  title: string
  tone: ToastTone
}

let nextId = 0
let current: FeedbackToast | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => current
const getServerSnapshot = () => null

export function toast(title: string, tone: ToastTone = 'ok') {
  current = { id: ++nextId, title, tone }
  emit()
}

export function useFeedbackToast() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
