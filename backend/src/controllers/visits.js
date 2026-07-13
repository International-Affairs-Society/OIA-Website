import { z } from 'zod'
import prisma from '../lib/prisma.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { paginate } from '../utils/paginate.js'

// Zod Validation Schema
const visitCreateSchema = z.object({
  university: z.string().min(1, 'University name is required'),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  purpose: z.string().optional().nullable(),
  highlights: z.array(z.string()).optional(),
  photos: z.array(z.string()).optional(),
  delegations: z.array(z.object({
    name: z.string(),
    designation: z.string(),
    email: z.string(),
    country: z.string(),
    university: z.string().optional()
  })).optional(),
  our_pocs: z.array(z.object({
    name: z.string(),
    designation: z.string(),
    email: z.string(),
    contactNumber: z.string().optional(),
    contact_number: z.string().optional()
  })).optional(),
  reports: z.array(z.object({
    name: z.string(),
    url: z.string()
  })).optional()
})

// Format Helper
function formatVisit(visit) {
  if (!visit) return null
  return {
    id: visit.id,
    university: visit.university,
    date: visit.date,
    status: visit.status,
    purpose: visit.purpose,
    highlights: visit.highlights || [],
    photos: visit.photos || [],
    delegations: visit.delegations || [],
    ourPOCs: (visit.our_pocs || []).map(poc => ({
      id: poc.id,
      name: poc.name,
      designation: poc.designation,
      email: poc.email,
      contactNumber: poc.contact_number
    })),
    reports: visit.reports || [],
    created_by: visit.created_by,
    created_at: visit.created_at,
    updated_at: visit.updated_at
  }
}

// GET /visits
export const getVisits = asyncHandler(async (req, res) => {
  const { search, status } = req.query

  const where = {}
  if (status) {
    where.status = status
  }
  if (search) {
    where.university = { contains: search, mode: 'insensitive' }
  }

  const paginatedResult = await paginate(prisma.visits, req.query, {
    where,
    include: {
      delegations: true,
      our_pocs: true,
      reports: true
    },
    orderBy: { date: 'desc' }
  })

  const formattedData = paginatedResult.data.map(formatVisit)

  res.json({
    data: formattedData,
    page: paginatedResult.page,
    limit: paginatedResult.limit,
    total: paginatedResult.total
  })
})

// GET /visits/:id
export const getVisitById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const visit = await prisma.visits.findUnique({
    where: { id },
    include: {
      delegations: true,
      our_pocs: true,
      reports: true
    }
  })

  if (!visit) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Visit not found' }
    })
  }

  res.json(formatVisit(visit))
})

// POST /visits
export const createVisit = asyncHandler(async (req, res) => {
  const parsed = visitCreateSchema.parse(req.body)

  const { delegations, our_pocs, reports, ...rest } = parsed

  const delegationsData = delegations?.map(del => ({
    name: del.name,
    designation: del.designation,
    email: del.email,
    country: del.country,
    university: del.university || parsed.university
  }))

  const ourPocsData = our_pocs?.map(poc => ({
    name: poc.name,
    designation: poc.designation,
    email: poc.email,
    contact_number: poc.contactNumber || poc.contact_number || ""
  }))

  const status = req.user.role === 'super_admin' ? 'approved' : 'pending'

  const created = await prisma.visits.create({
    data: {
      ...rest,
      status,
      date: new Date(parsed.date),
      created_by: req.user.id,
      delegations: delegationsData ? { create: delegationsData } : undefined,
      our_pocs: ourPocsData ? { create: ourPocsData } : undefined,
      reports: reports ? { create: reports } : undefined
    },
    include: {
      delegations: true,
      our_pocs: true,
      reports: true
    }
  })

  // Create audit log entry
  await prisma.audit_logs.create({
    data: {
      item_id: created.id,
      action: status === 'approved' ? 'Approved' : 'Submitted',
      item_title: created.university,
      item_type: 'MOU', // Using MOU as a generic category in enum since Visit is not in AuditItemType enum
      performed_by_name: req.user.name || req.user.email,
      performed_by_role: req.user.role,
      details: status === 'approved' ? 'Visit recorded and approved' : 'Visit submitted for approval'
    }
  }).catch(err => console.error('Failed to create audit log for visit:', err))

  res.status(201).json(formatVisit(created))
})

// PATCH /visits/:id/approve
export const approveVisit = asyncHandler(async (req, res) => {
  const { id } = req.params

  const visit = await prisma.visits.findUnique({ where: { id } })
  if (!visit) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Visit not found' }
    })
  }

  const updated = await prisma.visits.update({
    where: { id },
    data: {
      status: 'approved',
      updated_at: new Date()
    },
    include: {
      delegations: true,
      our_pocs: true,
      reports: true
    }
  })

  // Create audit log entry
  await prisma.audit_logs.create({
    data: {
      item_id: updated.id,
      action: 'Approved',
      item_title: updated.university,
      item_type: 'MOU',
      performed_by_name: req.user.name || req.user.email,
      performed_by_role: req.user.role,
      details: 'Visit approved by Super Admin'
    }
  }).catch(err => console.error('Failed to create audit log for visit approval:', err))

  res.json(formatVisit(updated))
})
