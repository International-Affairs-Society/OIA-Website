import { Router } from 'express'
import { getMe, setCookie, logout } from '../controllers/auth.js'
import { authenticate } from '../middleware/authenticate.js'

const router = Router()


router.get('/me', authenticate, getMe)
router.post('/set-cookie', setCookie)
router.post('/logout', logout)

export default router
