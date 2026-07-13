import { Router } from 'express'
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/users.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

router.get('/', authenticate, requireRole('super_admin', 'admin'), getUsers)
router.get('/:id', authenticate, getUserById)
router.post('/', authenticate, requireRole('super_admin'), createUser)
router.patch('/:id', authenticate, updateUser)
router.delete('/:id', authenticate, requireRole('super_admin'), deleteUser)

export default router
