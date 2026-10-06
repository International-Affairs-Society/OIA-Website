import { Router } from 'express'
import multer from 'multer'
import {
  getDocuments,
  getDocumentById,
  uploadDocument,
  verifyDocument,
  deleteDocument
} from '../controllers/documents.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'
import { dualRateLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// File filter to restrict allowed MIME types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf', 
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  if (
    allowedMimeTypes.includes(file.mimetype) || 
    file.mimetype.startsWith('image/') || 
    file.mimetype.startsWith('video/')
  ) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only PDF, Images, Videos, and Word documents are allowed.'), false)
  }
}

import os from 'os'

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max file size
  fileFilter
})

router.get('/', authenticate, getDocuments)
router.get('/:id', authenticate, getDocumentById)

// Wrap multer upload to catch and format file size/type errors correctly
// Rate limit raised to (30, 150) to allow full document & photo suites per user without subnet IP blocking
router.post('/', authenticate, dualRateLimiter(30, 150), (req, res, next) => {
  const uploader = upload.single('file')
  uploader(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.message, fields: { file: err.message } } })
    } else if (err) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.message, fields: { file: err.message } } })
    }
    next()
  })
}, uploadDocument)
router.patch('/:id/verify', authenticate, requireRole('super_admin'), verifyDocument)
router.delete('/:id', authenticate, deleteDocument)

export default router
