import express from 'express'
import multer from 'multer'
import { authenticate } from '../middleware/authenticate.js'
import { uploadMedia, getMedia } from '../controllers/media.js'

const router = express.Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only images, PDFs, and Word documents are allowed'))
    }
  }
})

// Wrap multer upload to catch and format errors
const uploadMiddleware = (req, res, next) => {
  const uploader = upload.single('file')
  uploader(req, res, function (err) {
    if (err) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: err.message } })
    }
    next()
  })
}

// Routes
router.post('/', authenticate, uploadMiddleware, uploadMedia)
router.get('/:filename', getMedia) // public proxy route

export default router
