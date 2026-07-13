import { Router } from 'express'
import {
  getReviews,
  getReviewById,
  createReview,
  approveReview,
  rejectReview,
  requestChanges
} from '../controllers/reviews.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

router.get('/', authenticate, requireRole('super_admin', 'admin', 'editor'), getReviews)
router.get('/:id', authenticate, requireRole('super_admin', 'admin', 'editor'), getReviewById)
router.post('/', authenticate, requireRole('admin', 'editor'), createReview)
router.patch('/:id/approve', authenticate, requireRole('super_admin'), approveReview)
router.patch('/:id/reject', authenticate, requireRole('super_admin'), rejectReview)
router.patch('/:id/request-changes', authenticate, requireRole('super_admin', 'admin'), requestChanges)

export default router
