import { Router } from 'express'
import {
  getVisits,
  getVisitById,
  createVisit,
  approveVisit
} from '../controllers/visits.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

router.get('/', authenticate, getVisits)
router.get('/:id', authenticate, getVisitById)
router.post('/', authenticate, requireRole('super_admin', 'admin', 'editor'), createVisit)
router.patch('/:id', authenticate, requireRole('super_admin', 'admin', 'editor'), updateVisit)
router.delete('/:id', authenticate, requireRole('super_admin', 'admin', 'editor'), deleteVisit)
router.patch('/:id/approve', authenticate, requireRole('super_admin'), approveVisit)

export default router
