import { useSyncExternalStore } from 'react'

export type Session = { name: string }

const KEY = 'solarbell:session:v1'

function load(): Session | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

let session = load()
const listeners = new Set<() => void>()

function commit(next: Session | null) {
  session = next
  try {
    if (next) localStorage.setItem(KEY, JSON.stringify(next))
    else localStorage.removeItem(KEY)
  } catch {
    // Sin storage la sesión vive en memoria.
  }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useSession() {
  return useSyncExternalStore(subscribe, () => session)
}

export function signIn(name: string) {
  commit({ name: name.trim() })
}

export function signOut() {
  commit(null)
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
}
