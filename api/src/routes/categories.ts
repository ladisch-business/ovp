import { Router, type Request, type Response } from 'express'
import { readCategories, writeCategories, type Category } from '../store.js'
import { nanoid } from 'nanoid'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  const cats = await readCategories()
  res.json(cats)
})

router.post('/', async (req: Request, res: Response) => {
  const { category, tags } = req.body as Partial<Category>
  if (!category || !Array.isArray(tags)) return res.status(400).json({ ok: false })
  const cats = await readCategories()
  if (cats.find(c => c.category === category)) return res.status(409).json({ ok: false })
  cats.push({ category, tags })
  await writeCategories(cats)
  res.status(201).json({ ok: true })
})

router.put('/:category', async (req: Request, res: Response) => {
  const { category } = req.params
  const { tags } = req.body as Partial<Category>
  const cats = await readCategories()
  const i = cats.findIndex(c => c.category === category)
  if (i === -1) return res.status(404).json({ ok: false })
  if (!Array.isArray(tags)) return res.status(400).json({ ok: false })
  cats[i] = { category, tags }
  await writeCategories(cats)
  res.json({ ok: true })
})

router.delete('/:category', async (req: Request, res: Response) => {
  const { category } = req.params
  const cats = await readCategories()
  const next = cats.filter(c => c.category !== category)
  if (next.length === cats.length) return res.status(404).json({ ok: false })
  await writeCategories(next)
  res.json({ ok: true })
})

export default router
