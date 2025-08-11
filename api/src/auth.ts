import { Router } from 'express'
import cookieParser from 'cookie-parser'
import csrf from 'csurf'
import type { Request, Response, NextFunction } from 'express'
import { AUTH_PASS, AUTH_USER } from './env.js'

const router = Router()
const csrfProtection = csrf({ cookie: true })

router.use(cookieParser())

router.post('/login', csrfProtection, (req: Request, res: Response) => {
  const { username, password } = req.body || {}
  if (username === AUTH_USER && password === AUTH_PASS) {
    res.cookie('ovp_sid', '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false
    })
    return res.json({ ok: true })
  }
  return res.status(401).json({ ok: false })
})

router.post('/logout', csrfProtection, (req: Request, res: Response) => {
  res.clearCookie('ovp_sid')
  res.json({ ok: true })
})

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.cookies && req.cookies['ovp_sid'] === '1') return next()
  res.status(401).json({ ok: false })
}

router.get('/csrf', csrfProtection, (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken() })
})

export default router
