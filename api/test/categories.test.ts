import supertest from 'supertest'
import { app } from '../src/app.js'
import { initStore, writeCategories, readCategories, type Category } from '../src/store.js'
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

describe('Categories routes', () => {
  beforeAll(async () => {
    await initStore()
    await writeCategories([])
    await ensureLoggedIn()
  })

  beforeEach(async () => {
    await writeCategories([])
  })

  it('GET /api/categories returns list', async () => {
    const seed: Category[] = [
      { category: 'Genre', tags: ['Action', 'Drama'] },
      { category: 'Farbe', tags: ['Rot', 'Blau'] }
    ]
    await writeCategories(seed)
    const res = await agent.get('/api/categories')
    expect(res.status).toBe(200)
    expect(res.body.length).toBe(2)
    expect(res.body[0].category).toBe('Genre')
  })

  it('POST /api/categories creates category with tags', async () => {
    const token = await csrf()
    const res = await agent
      .post('/api/categories')
      .set('x-csrf-token', token)
      .send({ category: 'Genre', tags: ['Action', 'Drama'] })
    expect(res.status).toBe(201)
    const all = await readCategories()
    expect(all.find(c => c.category === 'Genre')?.tags).toEqual(['Action', 'Drama'])
  })

  it('POST /api/categories rejects duplicate category', async () => {
    await writeCategories([{ category: 'Genre', tags: [] }])
    const token = await csrf()
    const res = await agent
      .post('/api/categories')
      .set('x-csrf-token', token)
      .send({ category: 'Genre', tags: [] })
    expect(res.status).toBe(409)
  })

  it('POST /api/categories validates body', async () => {
    const token = await csrf()
    const res = await agent
      .post('/api/categories')
      .set('x-csrf-token', token)
      .send({ category: 'Empty' })
    expect(res.status).toBe(400)
  })

  it('PUT /api/categories/:category updates tags', async () => {
    await writeCategories([{ category: 'Genre', tags: ['Old'] }])
    const token = await csrf()
    const res = await agent
      .put('/api/categories/Genre')
      .set('x-csrf-token', token)
      .send({ tags: ['Neu', 'Drama'] })
    expect(res.status).toBe(200)
    const all = await readCategories()
    expect(all.find(c => c.category === 'Genre')?.tags).toEqual(['Neu', 'Drama'])
  })

  it('PUT /api/categories/:category returns 404 when missing', async () => {
    const token = await csrf()
    const res = await agent
      .put('/api/categories/Unknown')
      .set('x-csrf-token', token)
      .send({ tags: [] })
    expect(res.status).toBe(404)
  })

  it('PUT /api/categories/:category validates body', async () => {
    await writeCategories([{ category: 'Genre', tags: [] }])
    const token = await csrf()
    const res = await agent
      .put('/api/categories/Genre')
      .set('x-csrf-token', token)
      .send({ invalid: true })
    expect(res.status).toBe(400)
  })

  it('DELETE /api/categories/:category deletes existing', async () => {
    await writeCategories([{ category: 'Genre', tags: [] }])
    const token = await csrf()
    const res = await agent
      .delete('/api/categories/Genre')
      .set('x-csrf-token', token)
      .send()
    expect(res.status).toBe(200)
    const all = await readCategories()
    expect(all.find(c => c.category === 'Genre')).toBeUndefined()
  })

  it('DELETE /api/categories/:category returns 404 when not found', async () => {
    await writeCategories([{ category: 'Genre', tags: [] }])
    const token = await csrf()
    const res = await agent
      .delete('/api/categories/Unknown')
      .set('x-csrf-token', token)
      .send()
    expect(res.status).toBe(404)
  })
})
