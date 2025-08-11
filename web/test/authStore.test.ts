import { describe, it, expect } from 'vitest'
import { create } from 'zustand'
import type { StateCreator } from 'zustand'

type AuthState = {
  isAuthenticated: boolean
  username: string | null
  login: (u: string) => void
  logout: () => void
}

const createAuthStore = (initial?: Partial<AuthState>) => {
  const initializer: StateCreator<AuthState> = (set) => ({
    isAuthenticated: initial?.isAuthenticated ?? false,
    username: initial?.username ?? null,
    login: (u: string) => set({ isAuthenticated: true, username: u }),
    logout: () => set({ isAuthenticated: false, username: null })
  })
  return create<AuthState>()(initializer)
}

describe('auth store', () => {
  it('logs in and out', () => {
    const useAuth = createAuthStore()
    useAuth.getState().login('username')
    expect(useAuth.getState().isAuthenticated).toBe(true)
    expect(useAuth.getState().username).toBe('username')

    useAuth.getState().logout()
    expect(useAuth.getState().isAuthenticated).toBe(false)
    expect(useAuth.getState().username).toBe(null)
  })
})
