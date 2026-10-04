import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const KEY = 'solarbell:theme:v1'

const listeners = new Set<() => void>()

function load(): Theme | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw === 'light' || raw === 'dark' ? raw : null
  } catch {
    return null
  }
}

function systemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

let explicit = load()

function notify() {
  for (const listener of listeners) listener()
}

function apply() {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (explicit) {
    root.dataset.theme = explicit
    root.style.colorScheme = explicit
    return
  }
  delete root.dataset.theme
  root.style.colorScheme = ''
}

function resolved(): Theme {
  return explicit ?? systemTheme()
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getTheme() {
  return resolved()
}

export function setTheme(next: Theme) {
  explicit = next
  try {
    localStorage.setItem(KEY, next)
  } catch {
    // Sin storage el tema vive en memoria.
  }
  apply()
  notify()
}

export function useTheme() {
  return useSyncExternalStore(subscribeTheme, getTheme, () => 'light' as const)
}

let booted = false

export function bootTheme() {
  apply()
  if (booted || typeof window === 'undefined') return
  booted = true
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (explicit) return
    apply()
    notify()
  })
}

bootTheme()
