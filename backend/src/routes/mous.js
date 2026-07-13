import { Router } from 'express'
import {
  getMous,
  getMouById,
  createMou,
  updateMou,
  deleteMou
} from '../controllers/mous.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

router.get('/', authenticate, requireRole('super_admin', 'admin', 'editor', 'viewer'), getMous)
router.get('/:id', authenticate, requireRole('super_admin', 'admin', 'editor', 'viewer'), getMouById)
router.post('/', authenticate, requireRole('super_admin', 'admin', 'editor'), createMou)
router.patch('/:id', authenticate, requireRole('super_admin', 'admin', 'editor'), updateMou)
router.delete('/:id', authenticate, requireRole('super_admin'), deleteMou)

export default router
