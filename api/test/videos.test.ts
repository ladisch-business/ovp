import supertest from 'supertest'
import { app } from '../src/app.js'
import { initStore, writeCategories, writeVideos, type Video } from '../src/store.js'
import { describe, it, beforeAll, expect } from 'vitest'

const request = supertest(app)

async function loginCookies() {
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

describe('Videos routes', () => {
  beforeAll(async () => {
    await initStore()
    await writeCategories([
      { category: 'Genre', tags: ['Action', 'Drama'] },
      { category: 'Farbe', tags: ['Rot', 'Blau'] }
    ])
    const vids: Video[] = [
      {
        id: '1',
        title: 'Action Film',
        category: 'Genre',
        tags: ['Action'],
        favorite: false,
        files: { video: '', preview: '', cover: '' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Blaues Meer',
        category: 'Farbe',
        tags: ['Blau'],
        favorite: false,
        files: { video: '', preview: '', cover: '' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    await writeVideos(vids)
  })

  it('requires auth', async () => {
    const res = await request.get('/api/videos')
    expect(res.status).toBe(401)
  })

  it('filters by category and search', async () => {
    const { cookies } = await loginCookies()
    const res = await request
      .get('/api/videos?category=Genre&q=action&mode=title')
      .set('Cookie', cookies)
    expect(res.status).toBe(200)
    expect(res.body.length).toBe(1)
    expect(res.body[0].title).toContain('Action')
  })
})
