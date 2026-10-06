import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs/promises'
import { r2 } from '../lib/r2.js'
import { fileQueue } from '../lib/queues.js'
import asyncHandler from '../middleware/asyncHandler.js'
import logger from '../lib/logger.js'

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

  // Directly upload to R2 (multi-server safe, independent of worker)
  try {
    const fileBuffer = await fs.readFile(req.file.path)
    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'documents',
      Key: r2Key,
      Body: fileBuffer,
      ContentType: req.file.mimetype
    }))
  } finally {
    await fs.unlink(req.file.path).catch(() => {})
  }

  // Enqueue job for background security scanning if worker is active
  try {
    await fileQueue.add('uploadMedia', {
      documentId: `media-${filename}`,
      r2Key: r2Key,
      mimetype: req.file.mimetype,
      userId: req.user ? req.user.id : 'anonymous'
    })
  } catch (err) {
    logger.warn('Failed to enqueue media security scan job:', err.message)
  }

  // Sanitize BACKEND_URL against common typos (.sapce -> .space), quotes, and trailing slashes
  let backendUrl = (process.env.BACKEND_URL || 'http://localhost:3001').replace(/['"]/g, '').replace(/\/$/, '')
  backendUrl = backendUrl.replace(/\.sapce$/, '.space')

  const publicUrl = `${backendUrl}/api/v1/media/${filename}`

  res.json({
    message: 'Media uploaded successfully',
    url: publicUrl,
    publicUrl: publicUrl,
    key: r2Key
  })
})

// GET /media/:filename (Proxy media from R2 with video streaming Range support)
export const getMedia = asyncHandler(async (req, res) => {
  const { filename } = req.params
  const r2Key = `media/${filename}`

  try {
    const range = req.headers.range
    const commandParams = {
      Bucket: process.env.R2_BUCKET_NAME || 'documents',
      Key: r2Key
    }
    if (range) {
      commandParams.Range = range
    }

    const data = await r2.send(new GetObjectCommand(commandParams))

    res.setHeader('Content-Type', data.ContentType || 'application/octet-stream')
    res.setHeader('Accept-Ranges', 'bytes')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')

    if (data.ContentRange) {
      res.status(206)
      res.setHeader('Content-Range', data.ContentRange)
      if (data.ContentLength) {
        res.setHeader('Content-Length', data.ContentLength)
      }
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000') // Cache for 1 year
      if (data.ContentLength) {
        res.setHeader('Content-Length', data.ContentLength)
      }
    }

    data.Body.pipe(res)
  } catch (err) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Media not found' } })
    }
    throw err
  }
})
