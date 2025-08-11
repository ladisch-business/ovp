import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import { mkdir, writeFile, appendFile, readdir, readFile, stat } from 'fs/promises'
import { join, extname } from 'path'
import { DATA_DIR } from '../env.js'
import { nanoid } from 'nanoid'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }
})

const UPLOAD_DIR = join(DATA_DIR, 'upload')

router.get('/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params
  const dir = join(UPLOAD_DIR, id)
  try {
    const files = await readdir(dir)
    const parts = files.filter(f => f.startsWith('part-')).length
    return res.json({ exists: true, parts })
  } catch {
    return res.json({ exists: false, parts: 0 })
  }
})

router.post('/init', async (req: Request, res: Response) => {
  const { filename, size, mime } = req.body as { filename?: string; size?: number; mime?: string }
  if (!filename || typeof size !== 'number') return res.status(400).json({ ok: false })
  const id = nanoid()
  const dir = join(UPLOAD_DIR, id)
  await mkdir(dir, { recursive: true })
  await writeFile(
    join(dir, 'meta.json'),
    JSON.stringify({ filename, size, mime: mime || null, received: 0 }),
    'utf8'
  )
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
  const parts = (await readdir(dir)).filter(f => f.startsWith('part-')).length
  res.json({ ok: true, part: Number(index), parts })
})

router.post('/:id/concat', async (req: Request, res: Response) => {
  const { id } = req.params
  const { parts } = req.body as { parts?: number }
  if (typeof parts !== 'number') return res.status(400).json({ ok: false })
  const dir = join(UPLOAD_DIR, id)
  const metaPath = join(dir, 'meta.json')
  let outName = 'video.bin'
  try {
    const meta = JSON.parse(await readFile(metaPath, 'utf8')) as { filename?: string }
    if (meta.filename) outName = meta.filename
  } catch {}
  const out = join(dir, outName)
  for (let i = 0; i < parts; i++) {
    const partPath = join(dir, `part-${i}`)
    const buf = await readFile(partPath)
    await appendFile(out, buf)
  }
  res.json({ ok: true, path: out, filename: outName })
})

export default router
