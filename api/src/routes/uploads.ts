import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import { mkdir, writeFile, appendFile, rename, stat } from 'fs/promises'
import { createWriteStream } from 'fs'
import { join } from 'path'
import { DATA_DIR } from '../env.js'
import { nanoid } from 'nanoid'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 20 } })

const UPLOAD_DIR = join(DATA_DIR, 'upload')

router.post('/init', async (req: Request, res: Response) => {
  const { filename, size } = req.body as { filename?: string; size?: number }
  if (!filename || typeof size !== 'number') return res.status(400).json({ ok: false })
  const id = nanoid()
  const dir = join(UPLOAD_DIR, id)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, 'meta.json'), JSON.stringify({ filename, size, received: 0 }), 'utf8')
  res.json({ id })
})

router.patch('/:id', upload.single('chunk'), async (req: Request, res: Response) => {
  const { id } = req.params
  const { index } = req.body as { index?: string }
  if (!req.file || typeof index === 'undefined') return res.status(400).json({ ok: false })
  const dir = join(UPLOAD_DIR, id)
  await mkdir(dir, { recursive: true })
  const partPath = join(dir, `part-${index}`)
  await writeFile(partPath, req.file.buffer)
  const parts = Number(index) + 1
  res.json({ ok: true, part: Number(index), parts })
})

router.post('/:id/concat', async (req: Request, res: Response) => {
  const { id } = req.params
  const { parts } = req.body as { parts?: number }
  if (typeof parts !== 'number') return res.status(400).json({ ok: false })
  const dir = join(UPLOAD_DIR, id)
  const out = join(dir, 'video.bin')
  for (let i = 0; i < parts; i++) {
    const partPath = join(dir, `part-${i}`)
    const buf = await (await import('fs/promises')).readFile(partPath)
    await appendFile(out, buf)
  }
  res.json({ ok: true, path: out })
})

export default router
