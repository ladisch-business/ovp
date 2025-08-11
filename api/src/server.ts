import express, { type Request, type Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import { PORT, CORS_ORIGIN } from './env.js'
import authRouter, { requireAuth } from './auth.js'
import { initStore } from './store.js'
import videosRouter from './routes/videos.js'
import categoriesRouter from './routes/categories.js'
import uploadsRouter from './routes/uploads.js'

const app = express()

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

app.get('/api/health', (_req: Request, res: Response) => res.json({ ok: true }))

app.use('/api/auth', authRouter)
app.use('/api/videos', requireAuth, videosRouter)
app.use('/api/categories', requireAuth, categoriesRouter)
app.use('/api/uploads', requireAuth, uploadsRouter)

app.get('/api/storage', requireAuth, async (_req: Request, res: Response) => {
  res.json({ total: null, free: null })
})

app.listen(PORT, async () => {
  await initStore()
})
