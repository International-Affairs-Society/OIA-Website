
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import prisma from '../lib/prisma.js'
import { r2 } from '../lib/r2.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { getSignedR2Url } from '../utils/r2Sign.js'
import { paginate } from '../utils/paginate.js'
import logger from '../lib/logger.js'
import { fileQueue } from '../lib/queues.js'

// Format helper
async function formatDocument(doc, includeUrl = false) {
  if (!doc) return null
  const formatted = {
    id: doc.id,
    userId: doc.user_id,
    applicationId: doc.application_id,
    category: doc.type, // Map DB type to category
    fileName: doc.r2_key.split('/').pop().replace(/^\d+-/, ''), // Extract original filename from key
    status: doc.status,
    verifiedById: doc.verified_by_id,
    verifiedAt: doc.verified_at,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at
  }

  if (includeUrl) {
    formatted.url = await getSignedR2Url(doc.r2_key)
    formatted.urlExpiresAt = new Date(Date.now() + 900 * 1000) // 15 minutes
  }

  return formatted
}

// GET /documents (STAFF, LEADERSHIP, or Owner)
export const getDocuments = asyncHandler(async (req, res) => {
  const { userId, applicationId } = req.query

  const where = {}

  // Enforce access control:
  // - Students and Editors can only view their own documents
  // - SUPER_ADMIN/ADMIN can view all documents
  if (req.user.role === 'student' || req.user.role === 'editor') {
    where.user_id = req.user.id
  } else {
    if (userId) {
      where.user_id = userId
    }
  }

  if (applicationId) {
    where.application_id = applicationId
  }

  const paginatedResult = await paginate(prisma.documents, req.query, {
    where,
    orderBy: { created_at: 'desc' }
  })

  const formattedData = await Promise.all(
    paginatedResult.data.map(doc => formatDocument(doc, false))
  )

  res.json({
    data: formattedData,
    page: paginatedResult.page,
    limit: paginatedResult.limit,
    total: paginatedResult.total
  })
})

// GET /documents/:id (STAFF, LEADERSHIP, or Owner)
export const getDocumentById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const doc = await prisma.documents.findUnique({
    where: { id }
  })

  if (!doc) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Document not found' }
    })
  }

  // Permission check: must be owner, ADMIN, or SUPER_ADMIN (EDITORs act as owner)
  if ((req.user.role === 'STUDENT' || req.user.role === 'EDITOR') && doc.user_id !== req.user.id) {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Access denied' }
    })
  }

  res.json(await formatDocument(doc, true))
})

// POST /documents (Authenticated - Upload a document)
export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: { code: 'BAD_REQUEST', message: 'No file uploaded' }
    })
  }

  const { category, applicationId } = req.body

  // Validate category matching the DB doc_type enum
  const docTypes = ['PASSPORT', 'TRANSCRIPT', 'SOP', 'BANK_STATEMENT', 'PHOTO', 'VACCINATION']
  const upperCategory = (category || '').toUpperCase()
  if (!docTypes.includes(upperCategory)) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid category', fields: { category: `Must be one of: ${docTypes.join(', ')}` } }
    })
  }

  // If application_id is provided, verify it exists and is owned by user (unless staff/leadership)
  if (applicationId) {
    const app = await prisma.applications.findUnique({ where: { id: applicationId } })
    if (!app) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Application not found', fields: { applicationId: 'Application does not exist' } }
      })
    }
    if ((req.user.role === 'STUDENT' || req.user.role === 'EDITOR') && app.user_id !== req.user.id) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Access denied' }
      })
    }
  }

  // Sanitize original filename
  const sanitizedFilename = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
  const r2Key = `documents/${req.user.id}/${Date.now()}-${sanitizedFilename}`

  // Save metadata to DB
  const doc = await prisma.documents.create({
    data: {
      user_id: req.user.id,
      application_id: applicationId || null,
      type: upperCategory,
      r2_key: r2Key,
      status: 'PENDING'
    }
  })

  // Enqueue job for background processing
  await fileQueue.add('uploadDocument', {
    documentId: doc.id,
    filePath: req.file.path,
    r2Key: r2Key,
    mimetype: req.file.mimetype,
    userId: req.user.id
  })

  res.status(201).json(await formatDocument(doc, false))
})

// PATCH /documents/:id/verify (STAFF, LEADERSHIP only)
export const verifyDocument = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { verificationStatus } = req.body

  if (verificationStatus !== 'verified' && verificationStatus !== 'rejected') {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid verificationStatus', fields: { verificationStatus: 'Must be verified or rejected' } }
    })
  }

  const doc = await prisma.documents.findUnique({ where: { id } })
  if (!doc) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Document not found' }
    })
  }

  // Map "verified" -> VERIFIED. If "rejected", we revert/keep status as PENDING since DB has no REJECTED value.
  const dbStatus = verificationStatus === 'verified' ? 'VERIFIED' : 'PENDING'

  const updated = await prisma.documents.update({
    where: { id },
    data: {
      status: dbStatus,
      verified_by_id: req.user.id,
      verified_at: new Date(),
      updated_at: new Date()
    }
  })

  res.json(await formatDocument(updated, false))
})

// DELETE /documents/:id (Owner before verification, or LEADERSHIP)
export const deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params

  const doc = await prisma.documents.findUnique({ where: { id } })
  if (!doc) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Document not found' }
    })
  }

  // Delete permissions:
  // - Students/Editors can only delete their OWN document if it is still PENDING
  // - SUPER_ADMIN and ADMIN can delete any document
  if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') {
    if (doc.user_id !== req.user.id) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Access denied' }
      })
    }
    if (doc.status === 'VERIFIED') {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'Verified documents cannot be deleted' }
      })
    }
  }

  // Delete from Cloudflare R2
  try {
    await r2.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'documents',
      Key: doc.r2_key
    }))
  } catch (err) {
    logger.error('Failed to delete object from R2:', doc.r2_key, err)
  }

  // Delete from DB
  await prisma.documents.delete({
    where: { id }
  })

  res.json({ message: 'Document deleted successfully' })
})
