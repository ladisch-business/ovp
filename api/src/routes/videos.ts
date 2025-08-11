import { Router, type Request, type Response } from 'express'
import { readVideos, writeVideos, type Video, pathJoin } from '../store.js'
import { nanoid } from 'nanoid'
import { rm } from 'fs/promises'
import { DATA_DIR } from '../env.js'
const router = Router()

router.get('/', async (req: Request, res: Response) => {
  const { q, mode = 'both', category, tag } = req.query as {
    q?: string
    mode?: 'title' | 'tags' | 'both'
    category?: string
    tag?: string
  }
  let list = await readVideos()
  if (category) list = list.filter(v => v.category === category)
  if (tag) list = list.filter(v => v.tags.includes(tag))
  if (q) {
    const query = q.toLowerCase()
    list = list.filter(v => {
      const inTitle = v.title.toLowerCase().includes(query)
      const inTags = v.tags.some(t => t.toLowerCase().includes(query))
      if (mode === 'title') return inTitle
      if (mode === 'tags') return inTags
      return inTitle || inTags
    })
  }
  res.json(list)
})

router.post('/', async (req: Request, res: Response) => {
  const { title, category, tags, files } = req.body as Partial<Video>
  if (!title || !category || !Array.isArray(tags) || !files) return res.status(400).json({ ok: false })
  const id = nanoid()
  const now = new Date().toISOString()
  const video: Video = {
    id,
    title,
    category,
    tags,
    favorite: false,
    files: {
      video: files.video || '',
      preview: files.preview || '',
      cover: files.cover || ''
    },
    createdAt: now,
    updatedAt: now
  }
  const list = await readVideos()
  list.push(video)
  await writeVideos(list)
  res.status(201).json(video)
})

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const patch = req.body as Partial<Video>
  const list = await readVideos()
  const i = list.findIndex(v => v.id === id)
  if (i === -1) return res.status(404).json({ ok: false })
  list[i] = { ...list[i], ...patch, updatedAt: new Date().toISOString() }
  await writeVideos(list)
  res.json(list[i])
})

router.post('/:id/favorite', async (req: Request, res: Response) => {
  const { id } = req.params
  const list = await readVideos()
  const i = list.findIndex(v => v.id === id)
  if (i === -1) return res.status(404).json({ ok: false })
  list[i].favorite = !list[i].favorite
  list[i].updatedAt = new Date().toISOString()
  await writeVideos(list)
  res.json({ favorite: list[i].favorite })
})

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const list = await readVideos()
  const i = list.findIndex(v => v.id === id)
  if (i === -1) return res.status(404).json({ ok: false })
  const v = list[i]
  const next = list.filter(x => x.id !== id)
  await writeVideos(next)
  try {
    await rm(pathJoin(DATA_DIR, 'upload', id), { recursive: true, force: true })
  } catch {}
  res.json({ ok: true })
})

export default router
