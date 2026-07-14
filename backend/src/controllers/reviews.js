import { z } from 'zod'
import prisma from '../lib/prisma.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { paginate } from '../utils/paginate.js'

const createReviewSchema = z.object({
  type: z.enum(['program', 'upcoming_event', 'past_event', 'mou']),
  title: z.string().min(1),
  data: z.record(z.any())
})

const addCommentSchema = z.object({
  text: z.string().min(1)
})

// GET /reviews  (super_admin, admin, editor)
export const getReviews = asyncHandler(async (req, res) => {
  const { status, type } = req.query
  const where = {}

  // Editors can only see their own submissions
  if (req.user.role === 'editor') {
    where.submitted_by = req.user.id
  }

  if (status) where.status = status
  if (type) where.type = type

  const paginatedResult = await paginate(prisma.reviews, req.query, {
    where,
    include: { author: true },
    orderBy: { submitted_at: 'desc' }
  })

  // Override static submitted_by_name with the real name from the DB
  const formatted = paginatedResult.data.map(r => ({
    ...r,
    submitted_by_name: r.author?.name || r.submitted_by_name
  }))

  res.json({
    data: formatted,
    page: paginatedResult.page,
    limit: paginatedResult.limit,
    total: paginatedResult.total
  })
})

// GET /reviews/:id (super_admin, admin, editor-owner)
export const getReviewById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const review = await prisma.reviews.findUnique({
    where: { id },
    include: { author: true }
  })

  if (!review) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Review not found' } })
  }

  // Editors can only view their own
  if (req.user.role === 'editor' && review.submitted_by !== req.user.id) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } })
  }

  res.json({
    ...review,
    submitted_by_name: review.author?.name || review.submitted_by_name
  })
})

// POST /reviews  (admin, editor — submit a change request for review)
export const createReview = asyncHandler(async (req, res) => {
  const parsed = createReviewSchema.parse(req.body)

  const review = await prisma.reviews.create({
    data: {
      type: parsed.type,
      title: parsed.title,
      submitted_by: req.user.id,
      submitted_by_name: req.user.name || req.user.email,
      submitted_by_email: req.user.email,
      submitted_by_role: req.user.role,
      data: parsed.data,
      status: 'pending',
      comments: []
    }
  })

  // Audit log: Submitted
  await prisma.audit_logs.create({
    data: {
      item_id: review.id,
      action: 'Submitted',
      item_title: parsed.title,
      item_type: mapReviewTypeToAuditType(parsed.type),
      performed_by_name: req.user.name || req.user.email,
      performed_by_role: req.user.role
    }
  })

  res.status(201).json(review)
})

// PATCH /reviews/:id/approve  (super_admin only)
export const approveReview = asyncHandler(async (req, res) => {
  const { id } = req.params
  const review = await prisma.reviews.findUnique({ where: { id } })

  if (!review) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Review not found' } })
  }
  if (review.status !== 'pending') {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Review is already processed' } })
  }

  // Retrieve the review data (action, targetId, payload)
  const reviewData = review.data || {}
  const action = reviewData.action
  const targetId = reviewData.targetId
  const payload = reviewData.payload || {}

  // Apply changes to the target table based on type
  if (review.type === 'upcoming_event' || review.type === 'past_event') {
    if (action === 'CREATE') {
      await prisma.events.create({
        data: {
          ...payload,
          status: 'published' // Ensure approved event is published
        }
      })
    } else if (action === 'UPDATE' && targetId) {
      await prisma.events.update({
        where: { id: targetId },
        data: {
          ...payload,
          status: 'published' // Ensure approved event is published
        }
      })
    }
  } else if (review.type === 'program') {
    // Re-cast date strings to Date objects to avoid Prisma type errors
    const dbPayload = { ...payload }
    if (dbPayload.start_date) dbPayload.start_date = new Date(dbPayload.start_date)
    if (dbPayload.last_date_to_apply) dbPayload.last_date_to_apply = new Date(dbPayload.last_date_to_apply)
    if (dbPayload.updated_at) delete dbPayload.updated_at // let Prisma handle timestamps

    if (action === 'CREATE') {
      await prisma.programs.create({
        data: {
          ...dbPayload,
          status: 'published'
        }
      })
    } else if (action === 'UPDATE' && targetId) {
      await prisma.programs.update({
        where: { id: targetId },
        data: {
          ...dbPayload,
          status: 'published',
          updated_at: new Date()
        }
      })
    }
  } else if (review.type === 'mou') {
    if (action === 'CREATE') {
      await prisma.mous.create({
        data: {
          ...payload,
          review_status: 'published'
        }
      })
    } else if (action === 'UPDATE' && targetId) {
      await prisma.mous.update({
        where: { id: targetId },
        data: {
          ...payload,
          review_status: 'published'
        }
      })
    }
  }

  const updated = await prisma.reviews.update({
    where: { id },
    data: { status: 'approved' }
  })

  // Audit log: Approved
  await prisma.audit_logs.create({
    data: {
      item_id: id,
      action: 'Approved',
      item_title: review.title,
      item_type: mapReviewTypeToAuditType(review.type),
      performed_by_name: req.user.name || req.user.email,
      performed_by_role: req.user.role,
      details: `Approved by ${req.user.name || req.user.email}`
    }
  })

  res.json(updated)
})

// PATCH /reviews/:id/reject  (super_admin only)
export const rejectReview = asyncHandler(async (req, res) => {
  const { id } = req.params
  const review = await prisma.reviews.findUnique({ where: { id } })

  if (!review) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Review not found' } })
  }
  if (review.status !== 'pending') {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Review is already processed' } })
  }

  const updated = await prisma.reviews.update({
    where: { id },
    data: { status: 'rejected' }
  })

  // Audit log: Rejected
  await prisma.audit_logs.create({
    data: {
      item_id: id,
      action: 'Rejected',
      item_title: review.title,
      item_type: mapReviewTypeToAuditType(review.type),
      performed_by_name: req.user.name || req.user.email,
      performed_by_role: req.user.role
    }
  })

  res.json(updated)
})

// PATCH /reviews/:id/request-changes  (super_admin, admin)
export const requestChanges = asyncHandler(async (req, res) => {
  const { id } = req.params
  const parsed = addCommentSchema.parse(req.body)

  const review = await prisma.reviews.findUnique({ where: { id } })
  if (!review) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Review not found' } })
  }

  const existingComments = Array.isArray(review.comments) ? review.comments : []
  const newComment = {
    id: `c-${Date.now()}`,
    author: req.user.name || req.user.email,
    role: req.user.role,
    text: parsed.text,
    timestamp: new Date().toISOString()
  }

  const updated = await prisma.reviews.update({
    where: { id },
    data: {
      status: 'changes_requested',
      comments: [...existingComments, newComment]
    }
  })

  // Audit log: Requested Changes
  await prisma.audit_logs.create({
    data: {
      item_id: id,
      action: 'Requested_Changes',
      item_title: review.title,
      item_type: mapReviewTypeToAuditType(review.type),
      performed_by_name: req.user.name || req.user.email,
      performed_by_role: req.user.role,
      details: parsed.text
    }
  })

  res.json(updated)
})

// Helper: map review type to audit item type
function mapReviewTypeToAuditType(reviewType) {
  if (reviewType === 'program') return 'Program'
  if (reviewType === 'mou') return 'MOU'
  return 'Event'
}
