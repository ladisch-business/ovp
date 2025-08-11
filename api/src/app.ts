import express, { type Request, type Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import { execFile } from 'child_process'
import { CORS_ORIGIN, DATA_DIR } from './env.js'
import authRouter, { requireAuth } from './auth.js'
import videosRouter from './routes/videos.js'
import categoriesRouter from './routes/categories.js'
import uploadsRouter from './routes/uploads.js'

export const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true
  })
)

const limiter = rateLimit({
  windowMs: 60_000,
  limit: 100
})
app.use(limiter)

const loginLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5
})
app.use('/api/auth/login', loginLimiter)

app.get('/api/health', (_req: Request, res: Response) => res.json({ ok: true }))

app.use('/api/auth', authRouter)
app.use('/api/videos', requireAuth, videosRouter)
app.use('/api/categories', requireAuth, categoriesRouter)
app.use('/api/uploads', requireAuth, uploadsRouter)

export function getDiskInfo(path: string): Promise<{ total: number; free: number }> {
  return new Promise((resolve, reject) => {
    execFile('df', ['-k', path], (err, stdout) => {
      if (err) return reject(err)
      const lines = stdout.trim().split('\n')
      const parts = lines[lines.length - 1].trim().split(/\s+/)
      const totalKb = Number(parts[1])
      const availKb = Number(parts[3])
      resolve({ total: totalKb * 1024, free: availKb * 1024 })
    })
  })
}

app.get('/api/storage', requireAuth, async (_req: Request, res: Response) => {
  try {
    const info = await getDiskInfo(DATA_DIR)
    res.json(info)
  } catch {
    res.json({ total: null, free: null })
  }
})
