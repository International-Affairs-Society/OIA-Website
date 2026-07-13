import { Router } from 'express'
import {
  getUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity
} from '../controllers/universities.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

router.get('/', getUniversities)
router.get('/:id', getUniversityById)
router.post('/', authenticate, requireRole('super_admin'), createUniversity)
router.patch('/:id', authenticate, requireRole('super_admin'), updateUniversity)

export default router
