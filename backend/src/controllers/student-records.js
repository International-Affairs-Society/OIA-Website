import { z } from 'zod'
import prisma from '../lib/prisma.js'
import asyncHandler from '../middleware/asyncHandler.js'
import pick from '../utils/pick.js'
import { paginate } from '../utils/paginate.js'

// Validation Schema
const studentRecordCreateSchema = z.object({
  userId: z.string().uuid(),
  enrollmentId: z.string().min(1),
  department: z.string().min(1),
  batchYear: z.number().int().min(1900),
  programType: z.string().min(1)
})

const studentRecordUpdateSchema = studentRecordCreateSchema.partial()

// Format helper
function formatStudentRecord(rec) {
  if (!rec) return null
  return {
    id: rec.id,
    userId: rec.user_id,
    studentName: rec.users?.display_name || null,
    email: rec.users?.email || null,
    mobile: rec.users?.mobile || null,
    enrollmentNumber: rec.enrollment_id,
    department: rec.department,
    batch: rec.batch_year,
    programType: rec.program_type,
    createdAt: rec.created_at,
    updatedAt: rec.updated_at
  }
}

// GET /student-records (STAFF, LEADERSHIP only)
export const getStudentRecords = asyncHandler(async (req, res) => {
  const { department, batchYear } = req.query

  const where = {}
  if (department) {
    where.department = { contains: department, mode: 'insensitive' }
  }
  if (batchYear) {
    where.batch_year = parseInt(batchYear)
  }

  const paginatedResult = await paginate(prisma.student_records, req.query, {
    where,
    include: { users: true },
    orderBy: { created_at: 'desc' }
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

  const record = await prisma.student_records.findUnique({
    where: { id },
    include: { users: true }
  })

  if (!record) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Student record not found' }
    })
  }

  // Permission check: must be SUPER_ADMIN, ADMIN, EDITOR, or self
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'EDITOR' && req.user.id !== record.user_id) {
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
  const existingRecord = await prisma.student_records.findUnique({
    where: { user_id: filtered.userId }
  })
  if (existingRecord) {
    return res.status(409).json({
      error: { code: 'RECORD_ALREADY_EXISTS', message: 'A student record already exists for this user' }
    })
  }

  // Verify enrollmentId is unique
  const existingEnrollment = await prisma.student_records.findUnique({
    where: { enrollment_id: filtered.enrollmentId }
  })
  if (existingEnrollment) {
    return res.status(409).json({
      error: { code: 'ENROLLMENT_ALREADY_EXISTS', message: 'Enrollment ID is already registered' }
    })
  }

  const dbData = {
    user_id: filtered.userId,
    enrollment_id: filtered.enrollmentId,
    department: filtered.department,
    batch_year: filtered.batchYear,
    program_type: filtered.programType
  }

  const created = await prisma.student_records.create({
    data: dbData,
    include: { users: true }
  })

  res.status(201).json(formatStudentRecord(created))
})

// PATCH /student-records/:id (STAFF, LEADERSHIP only)
export const updateStudentRecord = asyncHandler(async (req, res) => {
  const { id } = req.params

  const record = await prisma.student_records.findUnique({ where: { id } })
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
    const existing = await prisma.student_records.findUnique({ where: { user_id: filtered.userId } })
    if (existing) {
      return res.status(409).json({
        error: { code: 'RECORD_ALREADY_EXISTS', message: 'A student record already exists for this user' }
      })
    }
  }

  if (filtered.enrollmentId && filtered.enrollmentId !== record.enrollment_id) {
    // Check enrollment unique constraint
    const existing = await prisma.student_records.findUnique({ where: { enrollment_id: filtered.enrollmentId } })
    if (existing) {
      return res.status(409).json({
        error: { code: 'ENROLLMENT_ALREADY_EXISTS', message: 'Enrollment ID is already registered' }
      })
    }
  }

  const dbData = {}
  if (filtered.userId !== undefined) dbData.user_id = filtered.userId
  if (filtered.enrollmentId !== undefined) dbData.enrollment_id = filtered.enrollmentId
  if (filtered.department !== undefined) dbData.department = filtered.department
  if (filtered.batchYear !== undefined) dbData.batch_year = filtered.batchYear
  if (filtered.programType !== undefined) dbData.program_type = filtered.programType

  dbData.updated_at = new Date()

  const updated = await prisma.student_records.update({
    where: { id },
    data: dbData,
    include: { users: true }
  })

  res.json(formatStudentRecord(updated))
})
