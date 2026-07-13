import { z } from 'zod'
import prisma from '../lib/prisma.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { paginate } from '../utils/paginate.js'

const createSchema = z.object({
  targetTable: z.enum(['mous', 'programs', 'events', 'universities', 'users', 'student_records', 'applications', 'documents', 'calendar_events']), // Tables that ADMIN/EDITOR can submit changes for
  targetId: z.string().uuid().nullable().optional(),
  actionType: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  payload: z.record(z.any())
})

// GET /change-requests (SUPER_ADMIN, ADMIN, EDITOR)
export const getChangeRequests = asyncHandler(async (req, res) => {
  const { status, targetTable } = req.query
  const where = {}

  if (status) where.status = status.toUpperCase()
  if (targetTable) where.target_table = targetTable

  // ADMINs and EDITORs can only see their own requests
  if (['EDITOR', 'ADMIN'].includes(req.user.role)) {
    where.requested_by = req.user.id
  }

  const paginatedResult = await paginate(prisma.change_requests, req.query, {
    where,
    include: {
      users_change_requests_requested_byTousers: { select: { id: true, display_name: true, email: true } },
      users_change_requests_reviewed_byTousers: { select: { id: true, display_name: true, email: true } }
    },
    orderBy: { created_at: 'desc' }
  })

  res.json({
    data: paginatedResult.data,
    page: paginatedResult.page,
    limit: paginatedResult.limit,
    total: paginatedResult.total
  })
})

// POST /change-requests (ADMIN, EDITOR)
export const createChangeRequest = asyncHandler(async (req, res) => {
  const parsed = createSchema.parse(req.body)

  if (parsed.actionType !== 'CREATE' && !parsed.targetId) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'targetId is required for UPDATE or DELETE' } })
  }

  const request = await prisma.change_requests.create({
    data: {
      target_table: parsed.targetTable,
      target_id: parsed.targetId || null,
      action_type: parsed.actionType,
      payload: parsed.payload,
      requested_by: req.user.id,
      status: 'PENDING'
    }
  })

  res.status(201).json(request)
})

// PATCH /change-requests/:id/approve (SUPER_ADMIN)
export const approveChangeRequest = asyncHandler(async (req, res) => {
  const { id } = req.params
  const request = await prisma.change_requests.findUnique({ where: { id } })

  if (!request) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Request not found' } })
  if (request.status !== 'PENDING') return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Request is already processed' } })

  const { target_table, target_id, action_type, payload } = request

  await prisma.$transaction(async (tx) => {
    // Dynamically apply changes based on action type
    if (action_type === 'CREATE') {
      await tx[target_table].create({ data: payload })
    } else if (action_type === 'UPDATE') {
      await tx[target_table].update({ where: { id: target_id }, data: payload })
    } else if (action_type === 'DELETE') {
      await tx[target_table].delete({ where: { id: target_id } })
    }

    await tx.change_requests.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewed_by: req.user.id,
        reviewed_at: new Date()
      }
    })
  })

  const updatedRequest = await prisma.change_requests.findUnique({ where: { id } })
  res.json(updatedRequest)
})

// PATCH /change-requests/:id/reject (SUPER_ADMIN)
export const rejectChangeRequest = asyncHandler(async (req, res) => {
  const { id } = req.params
  const request = await prisma.change_requests.findUnique({ where: { id } })

  if (!request) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Request not found' } })
  if (request.status !== 'PENDING') return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Request is already processed' } })

  const updatedRequest = await prisma.change_requests.update({
    where: { id },
    data: {
      status: 'REJECTED',
      reviewed_by: req.user.id,
      reviewed_at: new Date()
    }
  })

  res.json(updatedRequest)
})
