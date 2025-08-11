import { create } from 'zustand'
import { login as apiLogin, logout as apiLogout, fetchCsrf } from '../lib/api'

type AuthState = {
  loggedIn: boolean
  error: string | null
  init: () => Promise<void>
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  loggedIn: false,
  error: null,
  init: async () => {
    await fetchCsrf()
  },
  login: async (username: string, password: string) => {
    set({ error: null })
    const ok = await apiLogin(username, password)
    if (ok) set({ loggedIn: true })
    else set({ error: 'Anmeldung fehlgeschlagen' })
    return ok
  },
  logout: async () => {
    await apiLogout()
    set({ loggedIn: false })
  }
}))
