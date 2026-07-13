import { z } from 'zod'
import prisma from '../lib/prisma.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { paginate } from '../utils/paginate.js'

// Validation Schema
const programLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email address'),
  source_page: z.string().optional()
})

// GET /program-leads
export const getProgramLeads = asyncHandler(async (req, res) => {
  const { search } = req.query

  const where = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } }
    ]
  }

  const paginatedResult = await paginate(prisma.program_leads, req.query, {
    where,
    orderBy: { submitted_at: 'desc' }
  })

  res.json({
    data: paginatedResult.data,
    page: paginatedResult.page,
    limit: paginatedResult.limit,
    total: paginatedResult.total
  })
})

// POST /program-leads
export const createProgramLead = asyncHandler(async (req, res) => {
  const parsed = programLeadSchema.parse(req.body)

  // Check if lead already exists by email to prevent duplicate submissions
  const existingLead = await prisma.program_leads.findFirst({
    where: { email: parsed.email }
  })

  if (existingLead) {
    // If it exists, just return success so we don't block the user from proceeding
    return res.status(200).json({ message: 'Lead already captured', data: existingLead })
  }

  const newLead = await prisma.program_leads.create({
    data: {
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email,
      source_page: parsed.source_page || null
    }
  })

  res.status(201).json({ message: 'Lead captured successfully', data: newLead })
})
