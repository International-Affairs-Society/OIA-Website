import { Router } from 'express'
import {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram
} from '../controllers/programs.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

router.get('/', getPrograms)
router.get('/:id', getProgramById)
router.post('/', authenticate, requireRole('super_admin', 'admin', 'editor'), createProgram)
router.patch('/:id', authenticate, requireRole('super_admin', 'admin', 'editor'), updateProgram)
router.delete('/:id', authenticate, requireRole('super_admin'), deleteProgram)

export default router
