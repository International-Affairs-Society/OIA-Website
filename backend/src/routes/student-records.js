import { Router } from 'express'
import {
  getStudentRecords,
  getStudentRecordById,
  createStudentRecord,
  updateStudentRecord
} from '../controllers/student-records.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

router.get('/', authenticate, requireRole('super_admin', 'admin', 'editor'), getStudentRecords)
router.get('/:id', authenticate, getStudentRecordById)
router.post('/', authenticate, requireRole('super_admin'), createStudentRecord)
router.patch('/:id', authenticate, requireRole('super_admin'), updateStudentRecord)

export default router
