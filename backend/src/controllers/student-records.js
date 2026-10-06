import { z } from 'zod'
import prisma from '../lib/prisma.js'
import asyncHandler from '../middleware/asyncHandler.js'
import pick from '../utils/pick.js'
import { paginate } from '../utils/paginate.js'

// Validation Schema
const studentRecordCreateSchema = z.object({
  userId: z.string().uuid(),
  enrollmentId: z.string().min(1),
  department: z.string().min(1).optional().nullable(),
  batchYear: z.number().int().min(1900).optional().nullable(),
  programType: z.string().min(1).optional().nullable()
})

const studentRecordUpdateSchema = studentRecordCreateSchema.partial()

// Format helper
function formatStudentRecord(rec) {
  if (!rec) return null
  return {
    id: rec.id,
    userId: rec.user_id,
    studentName: rec.user?.name || null,
    email: rec.user?.email || null,
    mobile: rec.user?.phone_number || null,
    enrollmentNumber: rec.enrollment_no,
    department: rec.course || '',
    batch: null,
    programType: rec.school || '',
    createdAt: rec.user?.created_at || null,
    updatedAt: rec.user?.updated_at || null,
    applications: rec.applications?.map(app => ({
      id: app.id,
      status: app.status,
      programName: app.program?.name || 'Unknown',
      documents: app.documents?.map(doc => ({
        id: doc.id,
        name: doc.name,
        url: doc.url,
        type: doc.type
      })) || []
    })) || []
  }
}

// GET /student-records (STAFF, LEADERSHIP only)
export const getStudentRecords = asyncHandler(async (req, res) => {
  const { department } = req.query

  const where = {}
  if (department) {
    where.course = { contains: department, mode: 'insensitive' }
  }

  const paginatedResult = await paginate(prisma.students, req.query, {
    where,
    include: { user: true },
    orderBy: { user_id: 'desc' }
  })

  res.json({
    data: paginatedResult.data.map(formatStudentRecord),
    page: paginatedResult.page,
    limit: paginatedResult.limit,
    total: paginatedResult.total
  })
})

// GET /student-records/:id (STAFF, LEADERSHIP, or self)
export const getStudentRecordById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const record = await prisma.students.findUnique({
    where: { id },
    include: { user: true, applications: { include: { program: true } } }
  })

  if (!record) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Student record not found' }
    })
  }

  const userRole = (req.user.role || '').toLowerCase();

  // Permission check: must be SUPER_ADMIN, ADMIN, EDITOR, or self
  if (userRole !== 'admin' && userRole !== 'super_admin' && userRole !== 'editor' && req.user.id !== record.user_id) {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Access denied' }
    })
  }

  res.json(formatStudentRecord(record))
})

// POST /student-records (STAFF, LEADERSHIP only)
export const createStudentRecord = asyncHandler(async (req, res) => {
  const parsed = studentRecordCreateSchema.parse(req.body)

  const allowedKeys = ['userId', 'enrollmentId', 'department', 'batchYear', 'programType']
  const filtered = pick(parsed, allowedKeys)

  // Verify user exists
  const user = await prisma.users.findUnique({ where: { id: filtered.userId } })
  if (!user) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'User not found', fields: { userId: 'User does not exist' } }
    })
  }

  // Verify user does not already have a student record (1-to-1)
  const existingRecord = await prisma.students.findUnique({
    where: { user_id: filtered.userId }
  })
  if (existingRecord) {
    return res.status(409).json({
      error: { code: 'RECORD_ALREADY_EXISTS', message: 'A student record already exists for this user' }
    })
  }

  // Verify enrollmentId is unique
  const existingEnrollment = await prisma.students.findUnique({
    where: { enrollment_no: filtered.enrollmentId }
  })
  if (existingEnrollment) {
    return res.status(409).json({
      error: { code: 'ENROLLMENT_ALREADY_EXISTS', message: 'Enrollment ID is already registered' }
    })
  }

  const dbData = {
    user_id: filtered.userId,
    enrollment_no: filtered.enrollmentId,
    course: filtered.department || null,
    school: filtered.programType || null
  }

  const created = await prisma.students.create({
    data: dbData,
    include: { user: true }
  })

  res.status(201).json(formatStudentRecord(created))
})

// PATCH /student-records/:id (STAFF, LEADERSHIP only)
export const updateStudentRecord = asyncHandler(async (req, res) => {
  const { id } = req.params

  const record = await prisma.students.findUnique({ where: { id } })
  if (!record) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Student record not found' }
    })
  }

  const parsed = studentRecordUpdateSchema.parse(req.body)
  const allowedKeys = ['userId', 'enrollmentId', 'department', 'batchYear', 'programType']
  const filtered = pick(parsed, allowedKeys)

  if (filtered.userId && filtered.userId !== record.user_id) {
    // Check 1-to-1 unique user constraint
    const existing = await prisma.students.findUnique({ where: { user_id: filtered.userId } })
    if (existing) {
      return res.status(409).json({
        error: { code: 'RECORD_ALREADY_EXISTS', message: 'A student record already exists for this user' }
      })
    }
  }

  if (filtered.enrollmentId && filtered.enrollmentId !== record.enrollment_no) {
    // Check enrollment unique constraint
    const existing = await prisma.students.findUnique({ where: { enrollment_no: filtered.enrollmentId } })
    if (existing) {
      return res.status(409).json({
        error: { code: 'ENROLLMENT_ALREADY_EXISTS', message: 'Enrollment ID is already registered' }
      })
    }
  }

  const dbData = {}
  if (filtered.userId !== undefined) dbData.user_id = filtered.userId
  if (filtered.enrollmentId !== undefined) dbData.enrollment_no = filtered.enrollmentId
  if (filtered.department !== undefined) dbData.course = filtered.department
  if (filtered.programType !== undefined) dbData.school = filtered.programType

  const updated = await prisma.students.update({
    where: { id },
    data: dbData,
    include: { user: true }
  })

  res.json(formatStudentRecord(updated))
})
