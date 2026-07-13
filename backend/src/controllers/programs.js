import { z } from 'zod'
import prisma from '../lib/prisma.js'
import asyncHandler from '../middleware/asyncHandler.js'
import pick from '../utils/pick.js'
import { paginate } from '../utils/paginate.js'
import supabase from '../lib/supabase.js'

const programBaseSchema = z.object({
  name: z.string().min(1),
  duration: z.string().optional().nullable(),
  partner: z.string().optional().nullable(),
  mou: z.string().optional().nullable(),
  program_type: z.string().min(1),
  country: z.string().min(1),
  start_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  last_date_to_apply: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  schools_eligible: z.array(z.string()).optional(),
  semesters_eligible: z.array(z.string()).optional(),
  courses_eligible: z.array(z.string()).optional(),
  overview: z.string().optional().nullable(),
  highlights: z.array(z.string()).optional(),
  fee_summary: z.string().optional().nullable(),
  fee_breakdown: z.string().optional().nullable(),
  show_living_cost: z.boolean().optional(),
  estimated_stay_cost: z.string().optional().nullable(),
  living_cost_details: z.string().optional().nullable(),
  use_default_form: z.boolean().optional(),
  custom_fields: z.any().optional(),
  status: z.enum(['draft', 'pending_approval', 'published', 'archived']).optional()
})

const programCreateSchema = programBaseSchema

const programUpdateSchema = programBaseSchema.partial()

function formatProgram(prog) {
  if (!prog) return null
  return {
    id: prog.id,
    name: prog.name,
    title: prog.name, // compatibility
    duration: prog.duration,
    partner: prog.partner,
    mou: prog.mou,
    program_type: prog.program_type,
    type: prog.program_type, // compatibility
    country: prog.country,
    start_date: prog.start_date,
    last_date_to_apply: prog.last_date_to_apply,
    schools_eligible: prog.schools_eligible || [],
    semesters_eligible: prog.semesters_eligible || [],
    courses_eligible: prog.courses_eligible || [],
    overview: prog.overview,
    highlights: prog.highlights || [],
    fee_summary: prog.fee_summary,
    fee_breakdown: prog.fee_breakdown,
    show_living_cost: prog.show_living_cost,
    estimated_stay_cost: prog.estimated_stay_cost,
    living_cost_details: prog.living_cost_details,
    use_default_form: prog.use_default_form,
    custom_fields: prog.custom_fields,
    is_archived: prog.is_archived,
    status: prog.status,
    created_by: prog.created_by,
    created_at: prog.created_at,
    updatedAt: prog.updated_at,
    poc: prog.author ? {
      name: prog.author.name || 'OIA Admin',
      designation: prog.author.role === 'super_admin' ? 'Super Admin' : (prog.author.role === 'admin' ? 'OIA Admin' : 'Program Coordinator'),
      email: prog.author.email,
      contactNumber: prog.author.phone_number || '+91 9876543210'
    } : {
      name: 'OIA Admin',
      designation: 'Program Coordinator',
      email: 'oia@bennett.edu.in',
      contactNumber: '+91 9876543210'
    }
  }
}

// GET /programs (Public / Authenticated)
export const getPrograms = asyncHandler(async (req, res) => {
  const { status, programType, search, is_archived } = req.query

  const where = {}

  // Basic role check (could be improved with proper middleware)
  let isStaffOrLeadership = false
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    isStaffOrLeadership = true // simplify for now, assuming authenticated admin/editor gets here
  }

  // Public can only see published programs by default
  if (!isStaffOrLeadership) {
    where.status = 'published'
    where.is_archived = false
  } else {
    if (status) where.status = status
    if (is_archived !== undefined) where.is_archived = is_archived === 'true'
  }

  if (programType) {
    where.program_type = { contains: programType, mode: 'insensitive' }
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { country: { contains: search, mode: 'insensitive' } }
    ]
  }

  const paginatedResult = await paginate(prisma.programs, req.query, {
    where,
    include: { author: true },
    orderBy: { created_at: 'desc' }
  })

  res.json({
    data: paginatedResult.data.map(formatProgram),
    page: paginatedResult.page,
    limit: paginatedResult.limit,
    total: paginatedResult.total
  })
})

// GET /programs/:id (Public)
export const getProgramById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const prog = await prisma.programs.findUnique({
    where: { id },
    include: { author: true }
  })

  if (!prog) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Program not found' }
    })
  }

  res.json(formatProgram(prog))
})

// POST /programs (STAFF, LEADERSHIP only)
export const createProgram = asyncHandler(async (req, res) => {
  const parsed = programCreateSchema.parse(req.body)

  const newProgram = await prisma.programs.create({
    data: {
      ...parsed,
      start_date: new Date(parsed.start_date),
      last_date_to_apply: new Date(parsed.last_date_to_apply),
      created_by: req.user.id
    }
  })

  res.status(201).json(formatProgram(newProgram))
})

// PATCH /programs/:id (STAFF, LEADERSHIP only)
export const updateProgram = asyncHandler(async (req, res) => {
  const { id } = req.params
  const parsed = programUpdateSchema.parse(req.body)

  const dataToUpdate = { ...parsed }
  if (parsed.start_date) dataToUpdate.start_date = new Date(parsed.start_date)
  if (parsed.last_date_to_apply) dataToUpdate.last_date_to_apply = new Date(parsed.last_date_to_apply)
  dataToUpdate.updated_at = new Date()

  const updated = await prisma.programs.update({
    where: { id },
    data: dataToUpdate
  })

  res.json(formatProgram(updated))
})

// DELETE /programs/:id (LEADERSHIP only)
export const deleteProgram = asyncHandler(async (req, res) => {
  const { id } = req.params

  const prog = await prisma.programs.findUnique({ where: { id } })
  if (!prog) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Program not found' }
    })
  }

  // Hard delete since programs table does not have deleted_at
  await prisma.programs.delete({
    where: { id }
  })

  res.json({ message: 'Program deleted successfully' })
})
