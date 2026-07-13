import { Router } from 'express'
import {
  getCalendar,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from '../controllers/calendar.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

router.get('/', authenticate, getCalendar)
router.post('/', authenticate, requireRole('super_admin'), createCalendarEvent)
router.patch('/:id', authenticate, requireRole('super_admin'), updateCalendarEvent)
router.delete('/:id', authenticate, requireRole('super_admin'), deleteCalendarEvent)

export default router
