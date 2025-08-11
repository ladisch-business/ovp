import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../src/lib/api', () => {
  return {
    fetchCsrf: vi.fn().mockResolvedValue(true),
    login: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined)
  }
})

import { useAuth } from '../src/store/auth'
import * as api from '../src/lib/api'

describe('useAuth store (integration with mocked API)', () => {
  beforeEach(() => {
    const { getState, setState } = useAuth
    setState({ ...getState(), loggedIn: false, error: null })
    vi.clearAllMocks()
  })

  it('init fetches csrf', async () => {
    await useAuth.getState().init()
    expect(api.fetchCsrf).toHaveBeenCalledTimes(1)
  })

  it('login success sets loggedIn true and no error', async () => {
    ;(api.login as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(true)
    const ok = await useAuth.getState().login('username', 'password')
    expect(ok).toBe(true)
    expect(useAuth.getState().loggedIn).toBe(true)
    expect(useAuth.getState().error).toBe(null)
    expect(api.login).toHaveBeenCalledWith('username', 'password')
  })

  it('login failure sets error and keeps loggedIn false', async () => {
    ;(api.login as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(false)
    const ok = await useAuth.getState().login('bad', 'creds')
    expect(ok).toBe(false)
    expect(useAuth.getState().loggedIn).toBe(false)
    expect(useAuth.getState().error).toBeTypeOf('string')
  })

  it('logout calls API and resets loggedIn', async () => {
    ;(api.login as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(true)
    await useAuth.getState().login('username', 'password')
    expect(useAuth.getState().loggedIn).toBe(true)

    await useAuth.getState().logout()
    expect(api.logout).toHaveBeenCalledTimes(1)
    expect(useAuth.getState().loggedIn).toBe(false)
  })
})
