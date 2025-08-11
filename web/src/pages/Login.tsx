import { useEffect, useState } from 'react'
import { useAuth } from '../store/auth'
import { fetchCsrf } from '../lib/api'
import { Navigate } from 'react-router-dom'

export default function LoginPage() {
  const { loggedIn, login, error } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [csrf, setCsrf] = useState<string | null>(null)

  useEffect(() => {
    fetchCsrf().then(setCsrf).catch(() => setCsrf(null))
  }, [])

  if (loggedIn) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          await login(username, password)
        }}
        className="w-full max-w-sm bg-neutral-900 p-6 rounded-lg shadow"
      >
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
          className="w-full py-2 rounded bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
          disabled={!csrf}
        >
          Einloggen
        </button>
      </form>
    </div>
  )
}
