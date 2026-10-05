import { api, getToken, setToken, setUnauthorizedHandler } from '@/lib/api'
import { useSyncExternalStore } from 'react'

export type Session = { id: number; email: string; name: string }

type TokenResponse = { accessToken: string; user: Session }

const KEY = 'solarbell:session:v1'

function load(): Session | null {
  if (!getToken()) return null
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

export async function signIn(email: string, password: string) {
  const response = await api<TokenResponse>('/auth/login', {
    method: 'POST',
    body: { email: email.trim(), password },
  })
  setToken(response.accessToken)
  commit(response.user)
}

export function signOut() {
  setToken(null)
  commit(null)
}

setUnauthorizedHandler(signOut)

export async function refreshSession() {
  commit(await api<Session>('/auth/me'))
}

export async function rename(name: string) {
  const previous = session
  if (!previous) return
  commit({ ...previous, name: name.trim() })
  try {
    commit(await api<Session>('/auth/me', { method: 'PATCH', body: { name } }))
  } catch (error) {
    commit(previous)
    throw error
  }
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
}
