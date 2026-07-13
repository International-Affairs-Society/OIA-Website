import { Router } from 'express'
import {
  getMyNotifications,
  getNotifications,
  createNotification,
  markNotificationRead
} from '../controllers/notifications.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

router.get('/me', authenticate, getMyNotifications)
router.get('/', authenticate, requireRole('super_admin', 'admin', 'editor'), getNotifications)
router.post('/', authenticate, requireRole('super_admin', 'admin', 'editor'), createNotification)
router.patch('/:id/read', authenticate, markNotificationRead)

export default router
