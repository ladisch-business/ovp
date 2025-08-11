import supertest from 'supertest'
import { app } from '../src/app.js'
import { describe, it, beforeAll, expect } from 'vitest'

const agent = supertest.agent(app)

async function ensureLoggedIn() {
  const csrfRes = await agent.get('/api/auth/csrf')
  const csrf = csrfRes.body.csrfToken as string
  const res = await agent
    .post('/api/auth/login')
    .set('x-csrf-token', csrf)
    .send({ username: 'username', password: 'password' })
  expect(res.status).toBe(200)
}

async function csrf() {
  const res = await agent.get('/api/auth/csrf')
  return res.body.csrfToken as string
}

describe('Uploads status', () => {
  beforeAll(async () => {
    await ensureLoggedIn()
  })

  it('reports status before and after chunk uploads', async () => {
    const init = await agent
      .post('/api/uploads/init')
      .send({ filename: 'clip.bin', size: 4 })
    expect(init.status).toBe(200)
    const id = init.body.id as string

    const before = await agent.get(`/api/uploads/${id}/status`)
    expect(before.status).toBe(200)
    expect(before.body.exists).toBe(true)
    expect(before.body.parts).toBe(0)

    const token = await csrf()
    const p1 = await agent
      .patch(`/api/uploads/${id}`)
      .set('x-csrf-token', token)
      .field('index', '0')
      .attach('chunk', Buffer.from([0, 1]), { filename: 'p1' })
    expect(p1.status).toBe(200)

    const token2 = await csrf()
    const p2 = await agent
      .patch(`/api/uploads/${id}`)
      .set('x-csrf-token', token2)
      .field('index', '1')
      .attach('chunk', Buffer.from([2, 3]), { filename: 'p2' })
    expect(p2.status).toBe(200)

    const after = await agent.get(`/api/uploads/${id}/status`)
    expect(after.status).toBe(200)
    expect(after.body.exists).toBe(true)
    expect(after.body.parts).toBe(2)
  })
})
