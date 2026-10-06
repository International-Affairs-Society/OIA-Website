import { Router } from 'express'
import {
  getApplications,
  getMyApplications,
  getApplicationById,
  createApplication,
  updateApplicationStage,
  bulkUpdateApplicationStage
} from '../controllers/applications.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'
import { dualRateLimiter } from '../middleware/rateLimiter.js'

const router = Router()

router.get('/', authenticate, requireRole('super_admin', 'admin', 'editor'), getApplications)
router.get('/me', authenticate, getMyApplications)
router.get('/:id', authenticate, getApplicationById)
router.post('/', authenticate, dualRateLimiter(20, 100), createApplication)
router.patch('/bulk/status', authenticate, requireRole('super_admin', 'admin', 'editor'), bulkUpdateApplicationStage)
router.patch('/:id/stage', authenticate, requireRole('super_admin', 'admin', 'editor'), updateApplicationStage)
router.patch('/:id/status', authenticate, requireRole('super_admin', 'admin', 'editor'), updateApplicationStage) // Support both status and stage endpoints

export default router
