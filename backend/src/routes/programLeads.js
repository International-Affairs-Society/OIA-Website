import { Router } from 'express'
import {
  getProgramLeads,
  createProgramLead
} from '../controllers/programLeads.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

// Public endpoint to capture leads
router.post('/', createProgramLead)

// Protected endpoint for admin dashboard
router.get('/', authenticate, requireRole('super_admin', 'admin'), getProgramLeads)

export default router
