import { Router } from 'express'
import { getAuditLogs } from '../controllers/audit.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

router.get('/', authenticate, requireRole('super_admin', 'admin', 'editor'), getAuditLogs)

export default router
