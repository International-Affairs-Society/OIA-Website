import express from 'express'
import multer from 'multer'
import { authenticate } from '../middleware/authenticate.js'
import { uploadMedia, getMedia } from '../controllers/media.js'

import os from 'os'

const router = express.Router()
const upload = multer({
  dest: os.tmpdir(), // Use disk storage for background processing
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max to support high-res photos and videos
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/ogg', 'video/3gpp',
      'application/pdf', 
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
      cb(new Error('Only images, videos, PDFs, and Word documents are allowed'))
    }
  }
})

// Wrap multer upload to catch and format errors
const uploadMiddleware = (req, res, next) => {
  const uploader = upload.single('file')
  uploader(req, res, function (err) {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'File too large. Maximum size is 100MB.' } })
      }
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: err.message } })
    }
    next()
  })
}

// Routes
router.post('/', authenticate, uploadMiddleware, uploadMedia)
router.get('/:filename', getMedia) // public proxy route

export default router
