import { Router } from 'express'
import { getChangeRequests, createChangeRequest, approveChangeRequest, rejectChangeRequest } from '../controllers/change-requests.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

router.get('/', authenticate, requireRole('super_admin', 'admin', 'editor'), getChangeRequests)
router.post('/', authenticate, requireRole('admin', 'editor'), createChangeRequest)
router.patch('/:id/approve', authenticate, requireRole('super_admin'), approveChangeRequest)
router.patch('/:id/reject', authenticate, requireRole('super_admin'), rejectChangeRequest)

export default router
