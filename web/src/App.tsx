import { useEffect, useState } from 'react'

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:8080'

export default function App() {
  const [csrf, setCsrf] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/csrf`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setCsrf(d.csrfToken))
      .catch(() => setCsrf(null))
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrf ?? ''
      },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    })
    if (res.ok) {
      setLoggedIn(true)
    } else {
      setError('Anmeldung fehlgeschlagen')
    }
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <form onSubmit={onSubmit} className="w-full max-w-sm bg-neutral-900 p-6 rounded-lg shadow">
          <h1 className="text-2xl font-semibold mb-6">Anmeldung</h1>
          <div className="mb-4">
            <label className="block mb-1">Benutzername</label>
            <input
              className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 outline-none"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1">Passwort</label>
            <input
              className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 outline-none"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && <div className="text-red-400 text-sm mb-4">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 rounded bg-red-600 hover:bg-red-700 transition"
            disabled={!csrf}
          >
            Einloggen
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-semibold">Start</h1>
      <p className="text-neutral-400 mt-2">Erfolgreich angemeldet.</p>
    </div>
  )
}
