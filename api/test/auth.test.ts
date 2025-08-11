import supertest from 'supertest'
import { app } from '../src/app.js'
import { initStore } from '../src/store.js'
import { AUTH_USER, AUTH_PASS } from '../src/env.js'
import { describe, it, expect, beforeAll } from 'vitest'

describe('Auth', () => {
  beforeAll(async () => {
    await initStore()
  })

  it('should issue csrf token', async () => {
    const agent = supertest.agent(app)
    const res = await agent.get('/api/auth/csrf')
    expect(res.status).toBe(200)
    expect(res.body.csrfToken).toBeTypeOf('string')
    expect(res.headers['set-cookie']).toBeTruthy()
  })

  it('should login with correct creds and logout', async () => {
    const agent = supertest.agent(app)

    const csrfRes = await agent.get('/api/auth/csrf')
    const csrf = csrfRes.body.csrfToken as string

    const login = await agent
      .post('/api/auth/login')
      .set('x-csrf-token', csrf)
      .send({ username: AUTH_USER, password: AUTH_PASS })
    expect(login.status).toBe(200)

    const csrfRes2 = await agent.get('/api/auth/csrf')
    const csrf2 = csrfRes2.body.csrfToken as string

    const logout = await agent
      .post('/api/auth/logout')
      .set('x-csrf-token', csrf2)
      .send()
    expect(logout.status).toBe(200)
  })

  it('should reject invalid creds', async () => {
    const agent = supertest.agent(app)

    const csrfRes = await agent.get('/api/auth/csrf')
    const csrf = csrfRes.body.csrfToken as string

    const login = await agent
      .post('/api/auth/login')
      .set('x-csrf-token', csrf)
      .send({ username: 'x', password: 'y' })
    expect(login.status).toBe(401)
  })
})
