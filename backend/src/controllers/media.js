import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { r2 } from '../lib/r2.js'
import asyncHandler from '../middleware/asyncHandler.js'

// POST /media (Upload public media like event posters)
export const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: { code: 'BAD_REQUEST', message: 'No file uploaded' }
    })
  }

  // Sanitize original filename
  const sanitizedFilename = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filename = `${Date.now()}-${sanitizedFilename}`
  const r2Key = `media/${filename}`

  // Upload buffer to Cloudflare R2
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || 'documents',
    Key: r2Key,
    Body: req.file.buffer,
    ContentType: req.file.mimetype
  }))

  const publicUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/v1/media/${filename}`

  res.json({
    message: 'Media uploaded successfully',
    url: publicUrl,
    key: r2Key
  })
})

// GET /media/media/:filename (Proxy media from R2)
export const getMedia = asyncHandler(async (req, res) => {
  const { filename } = req.params
  const r2Key = `media/${filename}`

  try {
    const data = await r2.send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'documents',
      Key: r2Key
    }))

    res.setHeader('Content-Type', data.ContentType)
    res.setHeader('Cache-Control', 'public, max-age=31536000') // Cache for 1 year
    data.Body.pipe(res)
  } catch (err) {
    if (err.name === 'NoSuchKey') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Media not found' } })
    }
    throw err
  }
})
