import { Router } from 'express'
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getEventRegistrations
} from '../controllers/events.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

router.get('/', getEvents)
router.get('/:id', getEventById)
router.post('/', authenticate, requireRole('super_admin', 'admin', 'editor'), createEvent)
router.patch('/:id', authenticate, requireRole('super_admin', 'admin', 'editor'), updateEvent)
router.delete('/:id', authenticate, requireRole('super_admin'), deleteEvent)
router.post('/:id/register', authenticate, registerForEvent)
router.delete('/:id/register', authenticate, unregisterFromEvent)
router.get('/:id/registrations', authenticate, requireRole('super_admin', 'admin', 'editor'), getEventRegistrations)

export default router
