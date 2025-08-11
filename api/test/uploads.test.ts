import supertest from 'supertest'
import { app } from '../src/app.js'
import { describe, it, expect } from 'vitest'

const request = supertest(app)

async function authCookies() {
  const csrfRes = await request.get('/api/auth/csrf')
  const csrf = csrfRes.body.csrfToken as string
  const cookies = csrfRes.headers['set-cookie'] as string[]
  const login = await request
    .post('/api/auth/login')
    .set('Cookie', cookies)
    .set('x-csrf-token', csrf)
    .send({ username: 'username', password: 'password' })
  return { cookies: login.headers['set-cookie'] as string[] }
}

describe('Uploads', () => {
  it('uploads chunks and concatenates', async () => {
    const { cookies } = await authCookies()
    const init = await request
      .post('/api/uploads/init')
      .set('Cookie', cookies)
      .send({ filename: 'video.mp4', size: 6 })
    expect(init.status).toBe(200)
    const id = init.body.id as string

    const chunk1 = Buffer.from([0, 1, 2])
    const chunk2 = Buffer.from([3, 4, 5])
    const p1 = await request
      .patch(`/api/uploads/${id}`)
      .set('Cookie', cookies)
      .field('index', '0')
      .attach('chunk', chunk1, { filename: 'c1.bin' })
    expect(p1.status).toBe(200)
    const p2 = await request
      .patch(`/api/uploads/${id}`)
      .set('Cookie', cookies)
      .field('index', '1')
      .attach('chunk', chunk2, { filename: 'c2.bin' })
    expect(p2.status).toBe(200)

    const concat = await request
      .post(`/api/uploads/${id}/concat`)
      .set('Cookie', cookies)
      .send({ parts: 2 })
    expect(concat.status).toBe(200)
    expect(concat.body.ok).toBe(true)
  })
})
