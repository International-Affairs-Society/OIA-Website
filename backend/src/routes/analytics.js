import { Router } from 'express'
import {
  getOverview,
  getApplicationsAnalytics,
  getEventsAnalytics
} from '../controllers/analytics.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

router.get('/overview', authenticate, requireRole('super_admin', 'admin', 'editor', 'viewer'), getOverview)
router.get('/applications', authenticate, requireRole('super_admin', 'admin', 'editor', 'viewer'), getApplicationsAnalytics)
router.get('/events', authenticate, requireRole('super_admin', 'admin', 'editor', 'viewer'), getEventsAnalytics)

export default router
