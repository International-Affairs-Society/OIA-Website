import { Router } from 'express'
import { getDrafts, createOrUpdateDraft, deleteDraft } from '../controllers/drafts.js'
import { authenticate } from '../middleware/authenticate.js'

const router = Router()

// All draft operations require authentication
router.use(authenticate)

router.get('/', getDrafts)
router.post('/', createOrUpdateDraft)
router.delete('/:id', deleteDraft)

export default router
