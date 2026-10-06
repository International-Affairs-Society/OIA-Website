import { Router } from 'express'
import { getMe, setCookie, logout } from '../controllers/auth.js'
import { authenticate } from '../middleware/authenticate.js'
import { authLimiter } from '../middleware/rateLimiter.js'

const router = Router()

router.get('/me', authenticate, getMe)
router.post('/set-cookie', authLimiter, setCookie)
router.post('/logout', authLimiter, logout)

export default router
