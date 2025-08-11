export const API_BASE = (import.meta as any).env.VITE_API_BASE || '/api'

let csrfToken: string | null = null

export async function fetchCsrf(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/csrf`, { credentials: 'include' })
    if (!res.ok) return null
    const data = await res.json()
    csrfToken = data.csrfToken ?? null
    return csrfToken
  } catch {
    csrfToken = null
    return null
  }
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {})
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (!csrfToken) await fetchCsrf()
  if (csrfToken) headers.set('x-csrf-token', csrfToken)
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include'
  } as RequestInit)
  return res
}

export async function login(username: string, password: string) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
  return res.ok
}

export async function logout() {
  const res = await apiFetch('/auth/logout', { method: 'POST' })
  return res.ok
}
