
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs/promises'
import prisma from '../lib/prisma.js'
import { r2 } from '../lib/r2.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { getSignedR2Url } from '../utils/r2Sign.js'
import { paginate } from '../utils/paginate.js'
import logger from '../lib/logger.js'
import { fileQueue } from '../lib/queues.js'
import { validateFileSignature } from '../services/fileValidationService.js'
import { writeAudit } from '../services/auditService.js'

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

  // SEC-01 FIX: role comparisons use lowercase (matches authenticate.js storage)
  if ((req.user.role === 'student' || req.user.role === 'editor') && doc.user_id !== req.user.id) {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Access denied' }
    })
  }

  // AUDIT-01: log document view when a signed URL is generated
  await writeAudit({
    itemId:      doc.id,
    action:      'Updated', // closest AuditAction — 'Viewed' not in enum; extend enum if needed
    itemTitle:   doc.r2_key.split('/').pop(),
    itemType:    'Program', // placeholder — extend AuditItemType enum to include 'Document'
    performedBy: req.user,
    details:     `Document viewed by ${req.user.email}`
  })

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

  // SEC-01 FIX: lowercase role comparison
  if (applicationId) {
    const app = await prisma.applications.findUnique({ where: { id: applicationId } })
    if (!app) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Application not found', fields: { applicationId: 'Application does not exist' } }
      })
    }
    if ((req.user.role === 'student' || req.user.role === 'editor') && app.student?.user_id !== req.user.id) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Access denied' }
      })
    }
  }

  // SEC-02 FIX: server-side file signature validation before anything else
  const validation = await validateFileSignature(
    req.file.path,
    req.file.mimetype,
    req.file.originalname
  )
  if (!validation.valid) {
    // Clean up the rejected temp file immediately
    await fs.unlink(req.file.path).catch(() => {})
    return res.status(400).json({
      error: { code: 'INVALID_FILE', message: 'File failed security validation', details: validation.errors }
    })
  }

  const sanitizedFilename = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
  const r2Key = `documents/${req.user.id}/${Date.now()}-${sanitizedFilename}`

  // SEC-06 FIX: upload directly to R2 in the API handler (not in the worker)
  // This makes the flow multi-server safe — workers never touch local disk paths.
  let fileBuffer
  try {
    fileBuffer = await fs.readFile(req.file.path)
    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'documents',
      Key: r2Key,
      Body: fileBuffer,
      ContentType: req.file.mimetype
    }))
  } finally {
    // Always clean up temp file regardless of outcome
    await fs.unlink(req.file.path).catch(() => {})
  }

  // Persist to DB — file is now safely in R2
  const doc = await prisma.documents.create({
    data: {
      user_id:        req.user.id,
      application_id: applicationId || null,
      type:           upperCategory,
      r2_key:         r2Key,
      status:         'PENDING'
    }
  })

  // Enqueue post-processing job with R2 key (not local path)
  await fileQueue.add('scanDocument', {
    documentId: doc.id,
    r2Key:      r2Key,
    userId:     req.user.id
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
      status:         dbStatus,
      verified_by_id: req.user.id,
      verified_at:    new Date(),
      updated_at:     new Date()
    }
  })

  // AUDIT-01: log verification
  await writeAudit({
    itemId:        doc.id,
    action:        verificationStatus === 'verified' ? 'Approved' : 'Rejected',
    itemTitle:     doc.r2_key.split('/').pop(),
    itemType:      'Program', // placeholder — extend AuditItemType to include 'Document'
    performedBy:   req.user,
    previousValue: doc.status,
    newValue:      dbStatus,
    details:       `Document ${verificationStatus} by ${req.user.email}`
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
  // SEC-01 FIX: use lowercase role names
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
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

  // DATA-02 FIX: soft delete — set deleted_at instead of hard deleting
  await prisma.documents.update({
    where: { id },
    data: { deleted_at: new Date(), updated_at: new Date() }
  })

  // AUDIT-01: log deletion
  await writeAudit({
    itemId:      doc.id,
    action:      'Deleted',
    itemTitle:   doc.r2_key.split('/').pop(),
    itemType:    'Program', // placeholder — extend AuditItemType to include 'Document'
    performedBy: req.user,
    details:     `Document deleted by ${req.user.email}`
  })

  res.json({ message: 'Document deleted successfully' })
})
