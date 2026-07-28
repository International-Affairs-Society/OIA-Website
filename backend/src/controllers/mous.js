import { z } from 'zod'
import prisma from '../lib/prisma.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { paginate } from '../utils/paginate.js'

// Validation Schema for creation
const mouBaseSchema = z.object({
  name: z.string().min(1),
  partner_university: z.string().min(1),
  country: z.string().min(1),
  type: z.enum(['Semester Exchange', 'Global Immersion', 'Inbound Immersion', 'Pathways Program', 'Progression Arrangement', 'International Internship', 'Inbound Semester Exchange', 'Summer Program', 'Winter Program', 'Study Tour', 'Dual Degree', 'Articulation', 'Other']),
  status: z.enum(['Active', 'Draft', 'Expired', 'Dormant', 'Expiring in 30 days', 'Expiring in 90 days', 'Expiring in 120 days']).optional(),
  duration: z.string().optional().nullable(),
  start_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  expiry_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  applicable_semesters: z.array(z.string()).optional(),
  eligible_schools: z.array(z.string()).optional(),
  eligible_courses: z.array(z.string()).optional(),
  notes: z.string().optional().nullable(),
  review_status: z.enum(['draft', 'pending_approval', 'published']).optional(),
  our_pocs: z.array(z.object({
    name: z.string(),
    designation: z.string(),
    email: z.string(),
    contact_number: z.string()
  })).optional(),
  partner_pocs: z.array(z.object({
    name: z.string(),
    designation: z.string(),
    email: z.string(),
    contact_number: z.string()
  })).optional(),
  documents: z.array(z.object({
    name: z.string(),
    url: z.string()
  })).optional()
})

const mouCreateSchema = mouBaseSchema
const mouUpdateSchema = mouBaseSchema.partial()

function calculateDuration(startDate, expiryDate) {
  if (!startDate || !expiryDate) return null
  const start = new Date(startDate)
  const end = new Date(expiryDate)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null

  let years = end.getFullYear() - start.getFullYear()
  let months = end.getMonth() - start.getMonth()
  let days = end.getDate() - start.getDate()

  if (days < 0) {
    months -= 1
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0)
    days += prevMonth.getDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }

  const parts = []
  if (years > 0) {
    parts.push(`${years} ${years === 1 ? 'Year' : 'Years'}`)
  }
  if (months > 0) {
    parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`)
  }
  if (parts.length === 0) {
    if (days > 0) {
      parts.push(`${days} ${days === 1 ? 'Day' : 'Days'}`)
    } else {
      parts.push('0 Days')
    }
  }

  return parts.join(' ')
}

// Format helper
async function formatMou(mou) {
  if (!mou) return null
  return {
    id: mou.id,
    name: mou.name,
    partner_university: mou.partner_university,
    country: mou.country,
    type: mou.type ? mou.type.replace(/_/g, ' ') : mou.type,
    status: mou.status,
    duration: mou.duration || calculateDuration(mou.start_date, mou.expiry_date),
    start_date: mou.start_date,
    expiry_date: mou.expiry_date,
    applicable_semesters: mou.applicable_semesters || [],
    eligible_schools: mou.eligible_schools || [],
    eligible_courses: mou.eligible_courses || [],
    notes: mou.notes,
    is_archived: mou.is_archived,
    review_status: mou.review_status,
    created_by: mou.created_by,
    our_pocs: mou.our_pocs || [],
    partner_pocs: mou.partner_pocs || [],
    documents: mou.documents || [],
    created_at: mou.created_at,
    updated_at: mou.updated_at
  }
}

// GET /mous (STAFF, LEADERSHIP only)
export const getMous = asyncHandler(async (req, res) => {
  const { status, partnerUniversityId, is_archived } = req.query

  const where = {}
  if (status) {
    where.status = status // MOUStatus enum values are mixed-case e.g. 'Active', 'Draft'
  }
  if (partnerUniversityId) {
    where.partner_university_id = partnerUniversityId
  }
  if (is_archived !== undefined) {
    where.is_archived = is_archived === 'true'
  }

  const paginatedResult = await paginate(prisma.mous, req.query, {
    where,
    include: {
      our_pocs: true,
      partner_pocs: true,
      documents: true
    },
    orderBy: { created_at: 'desc' }
  })

  const formattedData = await Promise.all(paginatedResult.data.map(formatMou))

  res.json({
    data: formattedData,
    page: paginatedResult.page,
    limit: paginatedResult.limit,
    total: paginatedResult.total
  })
})

// GET /mous/:id (STAFF, LEADERSHIP only)
export const getMouById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const mou = await prisma.mous.findUnique({
    where: { id },
    include: { our_pocs: true, partner_pocs: true, documents: true }
  })

  if (!mou) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'MOU not found' }
    })
  }

  res.json(await formatMou(mou))
})

// POST /mous (LEADERSHIP only)
export const createMou = asyncHandler(async (req, res) => {
  const parsed = mouCreateSchema.parse(req.body)

  const { our_pocs, partner_pocs, documents, ...rest } = parsed

  const duration = calculateDuration(parsed.start_date, parsed.expiry_date)

  // Intercept Admin/Editor requests and route to reviews queue
  if (['admin', 'editor'].includes(req.user.role)) {
    const review = await prisma.reviews.create({
      data: {
        type: 'mou',
        title: parsed.name,
        submitted_by: req.user.id,
        submitted_by_name: req.user.name || req.user.email.split('@')[0],
        submitted_by_email: req.user.email,
        submitted_by_role: req.user.role,
        status: 'pending',
        data: {
          action: 'CREATE',
          payload: {
            ...rest,
            duration,
            type: rest.type ? rest.type.replace(/ /g, '_') : rest.type,
            start_date: parsed.start_date,
            expiry_date: parsed.expiry_date,
            our_pocs: our_pocs ? { create: our_pocs } : undefined,
            partner_pocs: partner_pocs ? { create: partner_pocs } : undefined,
            documents: documents ? { create: documents } : undefined
          }
        }
      }
    })
    return res.status(202).json({
      message: 'MOU creation submitted for review',
      reviewId: review.id,
      status: 'pending'
    })
  }

  const created = await prisma.mous.create({
    data: {
      ...rest,
      duration,
      type: rest.type ? rest.type.replace(/ /g, '_') : rest.type,
      start_date: new Date(parsed.start_date),
      expiry_date: new Date(parsed.expiry_date),
      created_by: req.user.id,
      our_pocs: our_pocs ? { create: our_pocs } : undefined,
      partner_pocs: partner_pocs ? { create: partner_pocs } : undefined,
      documents: documents ? { create: documents } : undefined
    },
    include: { our_pocs: true, partner_pocs: true, documents: true }
  })

  await prisma.audit_logs.create({
    data: {
      item_id: created.id,
      action: "Created",
      item_title: created.name,
      item_type: "MOU",
      performed_by_name: req.user.name || "Unknown",
      performed_by_role: req.user.role || "Unknown",
      details: "Created a new MOU."
    }
  })

  res.status(201).json(await formatMou(created))
})

// PATCH /mous/:id (LEADERSHIP only)
export const updateMou = asyncHandler(async (req, res) => {
  const { id } = req.params

  const parsed = mouUpdateSchema.parse(req.body)

  const { our_pocs, partner_pocs, documents, ...rest } = parsed

  const dataToUpdate = { ...rest }
  if (dataToUpdate.type) dataToUpdate.type = dataToUpdate.type.replace(/ /g, '_')
  
  let existing = null
  if (parsed.start_date || parsed.expiry_date || ['admin', 'editor'].includes(req.user.role)) {
    existing = await prisma.mous.findUnique({ where: { id } })
    if (existing && (parsed.start_date || parsed.expiry_date)) {
      const startDate = parsed.start_date || existing.start_date
      const expiryDate = parsed.expiry_date || existing.expiry_date
      dataToUpdate.duration = calculateDuration(startDate, expiryDate)
    }
  } else {
    delete dataToUpdate.duration
  }

  if (parsed.start_date) dataToUpdate.start_date = new Date(parsed.start_date)
  if (parsed.expiry_date) dataToUpdate.expiry_date = new Date(parsed.expiry_date)
  dataToUpdate.updated_at = new Date()

  // For relations, Prisma update requires nested writes (deleteMany then create)
  if (our_pocs) {
    dataToUpdate.our_pocs = {
      deleteMany: {},
      create: our_pocs
    }
  }
  if (partner_pocs) {
    dataToUpdate.partner_pocs = {
      deleteMany: {},
      create: partner_pocs
    }
  }
  if (documents) {
    dataToUpdate.documents = {
      deleteMany: {},
      create: documents
    }
  }

  // Intercept Admin/Editor requests and route to reviews queue
  if (['admin', 'editor'].includes(req.user.role)) {
    const reviewPayload = { ...dataToUpdate }
    if (parsed.start_date) reviewPayload.start_date = parsed.start_date
    if (parsed.expiry_date) reviewPayload.expiry_date = parsed.expiry_date

    const review = await prisma.reviews.create({
      data: {
        type: 'mou',
        title: parsed.name || existing?.name || id,
        submitted_by: req.user.id,
        submitted_by_name: req.user.name || req.user.email.split('@')[0],
        submitted_by_email: req.user.email,
        submitted_by_role: req.user.role,
        status: 'pending',
        data: {
          action: 'UPDATE',
          targetId: id,
          payload: reviewPayload
        }
      }
    })
    return res.status(202).json({
      message: 'MOU update submitted for review',
      reviewId: review.id,
      status: 'pending'
    })
  }

  const updated = await prisma.mous.update({
    where: { id },
    data: dataToUpdate,
    include: { our_pocs: true, partner_pocs: true, documents: true }
  })

  await prisma.audit_logs.create({
    data: {
      item_id: updated.id,
      action: "Updated",
      item_title: updated.name,
      item_type: "MOU",
      performed_by_name: req.user.name || "Unknown",
      performed_by_role: req.user.role || "Unknown",
      details: "Updated the MOU record."
    }
  })

  res.json(await formatMou(updated))
})

// DELETE /mous/:id (LEADERSHIP only)
export const deleteMou = asyncHandler(async (req, res) => {
  const { id } = req.params

  const mou = await prisma.mous.findUnique({ where: { id } })
  if (!mou) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'MOU not found' }
    })
  }

  // Hard delete since mou table does not have deleted_at
  await prisma.mous.delete({
    where: { id }
  })

  await prisma.audit_logs.create({
    data: {
      item_id: id,
      action: "Deleted",
      item_title: mou.name,
      item_type: "MOU",
      performed_by_name: req.user.name || "Unknown",
      performed_by_role: req.user.role || "Unknown",
      details: "Deleted the MOU."
    }
  })

  res.json({ message: 'MOU deleted successfully' })
})
