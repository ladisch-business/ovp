import supertest from 'supertest'
import { app } from '../src/app.js'
import { initStore, writeVideos, readVideos, type Video, writeCategories } from '../src/store.js'
import { describe, it, beforeAll, beforeEach, expect } from 'vitest'

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

describe('Videos CRUD and favorite', () => {
  beforeAll(async () => {
    await initStore()
    await writeCategories([{ category: 'Genre', tags: ['Action', 'Drama'] }])
    await ensureLoggedIn()
  })

  beforeEach(async () => {
    await writeVideos([])
  })

  it('POST /api/videos validates body', async () => {
    const token = await csrf()
    const bad = await agent
      .post('/api/videos')
      .set('x-csrf-token', token)
      .send({ title: 'x' })
    expect(bad.status).toBe(400)
  })

  it('POST /api/videos creates video', async () => {
    const token = await csrf()
    const res = await agent
      .post('/api/videos')
      .set('x-csrf-token', token)
      .send({
        title: 'Action Film',
        category: 'Genre',
        tags: ['Action'],
        files: { video: '/path/v.mp4', preview: '/path/p.mp4', cover: '/path/c.jpg' }
      })
    expect(res.status).toBe(201)
    expect(res.body.id).toBeTypeOf('string')
    const all = await readVideos()
    expect(all.length).toBe(1)
    expect(all[0].title).toBe('Action Film')
  })

  it('PUT /api/videos/:id updates existing and 404 for missing', async () => {
    const token = await csrf()
    const created = await agent
      .post('/api/videos')
      .set('x-csrf-token', token)
      .send({
        title: 'A',
        category: 'Genre',
        tags: ['Action'],
        files: { video: '', preview: '', cover: '' }
      })
    const id = created.body.id as string

    const token2 = await csrf()
    const upd = await agent
      .put(`/api/videos/${id}`)
      .set('x-csrf-token', token2)
      .send({ title: 'A2', tags: ['Drama'] })
    expect(upd.status).toBe(200)
    expect(upd.body.title).toBe('A2')
    expect(upd.body.tags).toEqual(['Drama'])

    const token3 = await csrf()
    const notFound = await agent
      .put('/api/videos/does-not-exist')
      .set('x-csrf-token', token3)
      .send({ title: 'Z' })
    expect(notFound.status).toBe(404)
  })

  it('POST /api/videos/:id/favorite toggles flag and 404 for missing', async () => {
    const token = await csrf()
    const created = await agent
      .post('/api/videos')
      .set('x-csrf-token', token)
      .send({
        title: 'Fav',
        category: 'Genre',
        tags: ['Action'],
        files: { video: '', preview: '', cover: '' }
      })
    const id = created.body.id as string

    const token2 = await csrf()
    const fav1 = await agent
      .post(`/api/videos/${id}/favorite`)
      .set('x-csrf-token', token2)
      .send()
    expect(fav1.status).toBe(200)
    expect(fav1.body.favorite).toBe(true)

    const token3 = await csrf()
    const fav2 = await agent
      .post(`/api/videos/${id}/favorite`)
      .set('x-csrf-token', token3)
      .send()
    expect(fav2.status).toBe(200)
    expect(fav2.body.favorite).toBe(false)

    const token4 = await csrf()
    const nf = await agent
      .post('/api/videos/xyz/favorite')
      .set('x-csrf-token', token4)
      .send()
    expect(nf.status).toBe(404)
  })

  it('GET /api/videos filters by category, tag, and query modes', async () => {
    const now = new Date().toISOString()
    await writeVideos([
      { id: '1', title: 'Action Hero', category: 'Genre', tags: ['Action'], favorite: false, files: { video: '', preview: '', cover: '' }, createdAt: now, updatedAt: now },
      { id: '2', title: 'Dramatic Scene', category: 'Genre', tags: ['Drama'], favorite: false, files: { video: '', preview: '', cover: '' }, createdAt: now, updatedAt: now },
      { id: '3', title: 'Random', category: 'Genre', tags: ['Other'], favorite: false, files: { video: '', preview: '', cover: '' }, createdAt: now, updatedAt: now }
    ])

    const catRes = await agent.get('/api/videos?category=Genre')
    expect(catRes.status).toBe(200)
    expect(catRes.body.length).toBe(3)

    const tagRes = await agent.get('/api/videos?tag=Drama')
    expect(tagRes.status).toBe(200)
    expect(tagRes.body.length).toBe(1)
    expect(tagRes.body[0].title).toContain('Dramatic')

    const qTitle = await agent.get('/api/videos?q=hero&mode=title')
    expect(qTitle.status).toBe(200)
    expect(qTitle.body.length).toBe(1)

    const qTags = await agent.get('/api/videos?q=act&mode=tags')
    expect(qTags.status).toBe(200)
    expect(qTags.body.length).toBe(1)

    const qBoth = await agent.get('/api/videos?q=dr')
    expect(qBoth.status).toBe(200)
    expect(qBoth.body.length).toBe(1)
  })

  it('DELETE /api/videos/:id removes entry and returns 404 when missing', async () => {
    const now = new Date().toISOString()
    await writeVideos([
      { id: '1', title: 'ToDelete', category: 'Genre', tags: ['Action'], favorite: false, files: { video: '', preview: '', cover: '' }, createdAt: now, updatedAt: now }
    ])

    const token = await csrf()
    const del = await agent
      .delete('/api/videos/1')
      .set('x-csrf-token', token)
      .send()
    expect(del.status).toBe(200)

    const token2 = await csrf()
    const del2 = await agent
      .delete('/api/videos/unknown')
      .set('x-csrf-token', token2)
      .send()
    expect(del2.status).toBe(404)
  })
})
