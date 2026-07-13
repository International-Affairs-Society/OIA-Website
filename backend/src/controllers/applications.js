import { z } from 'zod'
import prisma from '../lib/prisma.js'
import asyncHandler from '../middleware/asyncHandler.js'
import pick from '../utils/pick.js'
import { paginate } from '../utils/paginate.js'

// Validation Schemas
const applicationCreateSchema = z.object({
  programId: z.string().uuid(),
  customFieldResponses: z.any().optional()
})

const applicationStageUpdateSchema = z.object({
  stage: z.string(),
  status: z.string().optional()
})

const bulkApplicationStageUpdateSchema = z.object({
  applicationIds: z.array(z.string().uuid()),
  stage: z.string(),
  status: z.string().optional()
})

// Helper to format application number dynamically
function generateAppNumber(app) {
  const year = new Date(app.submitted_at).getFullYear()
  const shortId = app.id.split('-')[0].toUpperCase()
  return `APP-${year}-${shortId}`
}

// Maps raw DB stage string to the new 4-stage pipeline model
function mapDbStage(raw) {
  if (!raw) return 'received'
  const s = raw.toLowerCase().trim()
  if (s === 'submitted' || s.includes('receive') || s.includes('submit') || s.includes('applied') || s.includes('init')) return 'received'
  if (s.includes('review') || s.includes('document') || s.includes('verify') || s.includes('interview') || s.includes('process')) return 'under_review'
  if (s === 'accepted' || s.includes('accept') || s.includes('select')) return 'accepted'
  if (s.includes('offer') || s.includes('letter')) return 'offer_letter'
  if (s.includes('complet') || s.includes('enroll')) return 'completed'
  if (s.includes('reject') || s.includes('denied') || s.includes('declined')) return 'rejected'
  return 'received'
}

function formatApplication(app) {
  if (!app) return null
  const pipelineStage = mapDbStage(app.current_stage)
  return {
    id: app.id,
    applicationNumber: generateAppNumber(app),
    studentId: app.student_id,
    studentName: app.student?.user?.name || null,
    userId: app.student?.user_id || null,
    programId: app.program_id,
    programName: app.program?.name || null,
    status: app.status,
    currentStage: app.current_stage,
    pipelineStage,
    customFieldResponses: app.custom_field_responses,
    submittedAt: app.submitted_at,
    updatedAt: app.updated_at,
    gender: app.student?.gender || null,
    school: app.student?.school || null,
    course: app.student?.course || null,
    semester: app.student?.semester || null,
    cgpa: app.student?.cgpa ? parseFloat(app.student.cgpa.toString()) : null,
    passportNumber: app.student?.passport_number || null,
    hasPassport: app.student?.has_passport || false,
    program: app.program ? {
      id: app.program.id,
      name: app.program.name,
      title: app.program.name
    } : null
  }
}

// GET /applications (STAFF, LEADERSHIP only)
export const getApplications = asyncHandler(async (req, res) => {
  const { stage, programId, userId, search } = req.query

  const where = {}
  if (stage) {
    where.current_stage = stage
  }
  if (programId) {
    where.program_id = programId
  }
  if (userId) {
    where.student = { user_id: userId }
  }

  if (search) {
    where.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { student: { user: { name: { contains: search, mode: 'insensitive' } } } }
    ]
  }

  const paginatedResult = await paginate(prisma.applications, req.query, {
    where,
    include: {
      student: { include: { user: true } },
      program: true
    },
    orderBy: { submitted_at: 'desc' }
  })

  res.json({
    data: paginatedResult.data.map(formatApplication),
    page: paginatedResult.page,
    limit: paginatedResult.limit,
    total: paginatedResult.total
  })
})

// GET /applications/me (STUDENT only)
export const getMyApplications = asyncHandler(async (req, res) => {
  const student = await prisma.students.findUnique({ where: { user_id: req.user.id } })
  if (!student) {
    return res.json({ data: [], page: 1, limit: 10, total: 0 })
  }

  const where = { student_id: student.id }

  const paginatedResult = await paginate(prisma.applications, req.query, {
    where,
    include: {
      student: { include: { user: true } },
      program: true
    },
    orderBy: { submitted_at: 'desc' }
  })

  res.json({
    data: paginatedResult.data.map(formatApplication),
    page: paginatedResult.page,
    limit: paginatedResult.limit,
    total: paginatedResult.total
  })
})

// GET /applications/:id (STAFF, LEADERSHIP, or Owner)
export const getApplicationById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const app = await prisma.applications.findUnique({
    where: { id },
    include: {
      student: { include: { user: true } },
      program: true
    }
  })

  if (!app) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Application not found' }
    })
  }

  // Permission check: must be SUPER_ADMIN, ADMIN, EDITOR, or owner
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'editor' && req.user.id !== app.student?.user_id) {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Access denied' }
    })
  }

  res.json(formatApplication(app))
})

// POST /applications (STUDENT only)
export const createApplication = asyncHandler(async (req, res) => {
  const parsed = applicationCreateSchema.parse(req.body)
  const programId = parsed.programId

  // Check if program exists
  const program = await prisma.programs.findUnique({ where: { id: programId } })
  if (!program) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Program not found', fields: { programId: 'Program does not exist' } }
    })
  }

  let student = await prisma.students.findUnique({ where: { user_id: req.user.id } })
  if (!student) {
    const enrollmentNo = req.user.email.split('@')[0].toLowerCase()
    student = await prisma.students.create({
      data: {
        user_id: req.user.id,
        enrollment_no: enrollmentNo
      }
    })
  }

  // Check if student already applied (UNIQUE constraint)
  const existingApp = await prisma.applications.findUnique({
    where: {
      student_id_program_id: {
        student_id: student.id,
        program_id: programId
      }
    }
  })

  if (existingApp) {
    return res.status(409).json({
      error: { code: 'ALREADY_APPLIED', message: 'You have already applied for this program' }
    })
  }

  const createdApp = await prisma.applications.create({
    data: {
      student_id: student.id,
      program_id: programId,
      current_stage: 'Submitted',
      status: 'Application Submitted',
      custom_field_responses: parsed.customFieldResponses || null
    },
    include: { student: { include: { user: true } }, program: true }
  })

  res.status(201).json(formatApplication(createdApp))
})

// PATCH /applications/:id/stage (STAFF, LEADERSHIP only)
export const updateApplicationStage = asyncHandler(async (req, res) => {
  const { id } = req.params
  const parsed = applicationStageUpdateSchema.parse(req.body)

  const app = await prisma.applications.findUnique({
    where: { id }
  })

  if (!app) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Application not found' }
    })
  }

  const updatedApp = await prisma.applications.update({
    where: { id },
    data: {
      current_stage: parsed.stage,
      status: parsed.status || app.status,
      updated_at: new Date()
    },
    include: { student: { include: { user: true } }, program: true }
  })

  res.json(formatApplication(updatedApp))
})

// POST /applications/bulk-stage (STAFF, LEADERSHIP only)
export const bulkUpdateApplicationStage = asyncHandler(async (req, res) => {
  const parsed = bulkApplicationStageUpdateSchema.parse(req.body)
  const newStage = parsed.stage
  const status = parsed.status

  const dataToUpdate = { current_stage: newStage, updated_at: new Date() }
  if (status) {
    dataToUpdate.status = status
  }

  await prisma.applications.updateMany({
    where: { id: { in: parsed.applicationIds } },
    data: dataToUpdate
  })

  res.json({ message: 'Applications updated successfully' })
})
