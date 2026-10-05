const TOKEN_KEY = 'solarbell:token:v1'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

let token = readToken()
let onUnauthorized = () => {}

export function getToken() {
  return token
}

export function setToken(next: string | null) {
  token = next
  try {
    if (next) localStorage.setItem(TOKEN_KEY, next)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Sin storage el token vive solo en esta pestaña.
  }
}

/** Lo registra la sesión: evita el import circular api ↔ session. */
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

async function errorMessage(response: Response) {
  try {
    const body = (await response.json()) as { detail?: unknown }
    if (typeof body.detail === 'string') return body.detail
    if (Array.isArray(body.detail)) return 'Datos inválidos'
  } catch {
    // Respuesta sin JSON (proxy caído, HTML de error).
  }
  return response.status >= 500 ? 'El servidor no responde' : 'No se pudo completar'
}

type RequestOptions = { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown }

export async function api<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Sin conexión con el servidor')
  }

  if (response.status === 401 && token) onUnauthorized()
  if (!response.ok) throw new ApiError(response.status, await errorMessage(response))
  return (await response.json()) as T
}

export function errorText(error: unknown) {
  return error instanceof ApiError ? error.message : 'Algo salió mal'
}
