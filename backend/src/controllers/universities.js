import { z } from 'zod'
import prisma from '../lib/prisma.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { getSignedR2Url } from '../utils/r2Sign.js'
import pick from '../utils/pick.js'
import { paginate } from '../utils/paginate.js'
import { getCached, setCached, invalidateCache } from '../lib/cache.js'

// Validation Schema for creation
const universityCreateSchema = z.object({
  name: z.string().min(1),
  country: z.string().min(1),
  logoR2Key: z.string().optional().nullable(),
  mapLat: z.number().optional().nullable(),
  mapLng: z.number().optional().nullable()
})

const universityUpdateSchema = universityCreateSchema.partial()

// Format helper
async function formatUniversity(uni) {
  if (!uni) return null
  return {
    id: uni.id,
    name: uni.name,
    country: uni.country,
    logoUrl: await getSignedR2Url(uni.logo_r2_key),
    mapLat: uni.map_lat ? parseFloat(uni.map_lat.toString()) : null,
    mapLng: uni.map_lng ? parseFloat(uni.map_lng.toString()) : null,
    createdAt: uni.created_at,
    updatedAt: uni.updated_at
  }
}

// GET /universities (Public)
export const getUniversities = asyncHandler(async (req, res) => {
  const { search } = req.query

  const cacheKey = `universities:${req.url}`
  const cached = getCached(cacheKey)
  if (cached) return res.json(cached)

  const where = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { country: { contains: search, mode: 'insensitive' } }
    ]
  }

  const paginatedResult = await paginate(prisma.universities, req.query, {
    where,
    orderBy: { name: 'asc' }
  })

  // Format with async signed URLs
  const formattedData = await Promise.all(paginatedResult.data.map(formatUniversity))

  const response = {
    data: formattedData,
    page: paginatedResult.page,
    limit: paginatedResult.limit,
    total: paginatedResult.total
  }

  setCached(cacheKey, response, 60_000)
  res.json(response)
})

// GET /universities/:id (Public)
export const getUniversityById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const cacheKey = `university:${id}`
  const cached = getCached(cacheKey)
  if (cached) return res.json(cached)

  const uni = await prisma.universities.findUnique({
    where: { id }
  })

  if (!uni) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'University not found' }
    })
  }

  const response = await formatUniversity(uni)
  setCached(cacheKey, response, 60_000)
  res.json(response)
})

// POST /universities (LEADERSHIP only)
export const createUniversity = asyncHandler(async (req, res) => {
  const parsed = universityCreateSchema.parse(req.body)

  const allowedKeys = ['name', 'country', 'logoR2Key', 'mapLat', 'mapLng']
  const filtered = pick(parsed, allowedKeys)

  const dbData = {
    name: filtered.name,
    country: filtered.country,
    logo_r2_key: filtered.logoR2Key,
    map_lat: filtered.mapLat,
    map_lng: filtered.mapLng
  }

  const created = await prisma.universities.create({
    data: dbData
  })

  res.status(201).json(await formatUniversity(created))
  invalidateCache('universities:')
})

// PATCH /universities/:id (LEADERSHIP only)
export const updateUniversity = asyncHandler(async (req, res) => {
  const { id } = req.params

  const uni = await prisma.universities.findUnique({ where: { id } })
  if (!uni) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'University not found' }
    })
  }

  const parsed = universityUpdateSchema.parse(req.body)
  const allowedKeys = ['name', 'country', 'logoR2Key', 'mapLat', 'mapLng']
  const filtered = pick(parsed, allowedKeys)

  const dbData = {}
  if (filtered.name !== undefined) dbData.name = filtered.name
  if (filtered.country !== undefined) dbData.country = filtered.country
  if (filtered.logoR2Key !== undefined) dbData.logo_r2_key = filtered.logoR2Key
  if (filtered.mapLat !== undefined) dbData.map_lat = filtered.mapLat
  if (filtered.mapLng !== undefined) dbData.map_lng = filtered.mapLng

  dbData.updated_at = new Date()

  const updated = await prisma.universities.update({
    where: { id },
    data: dbData
  })

  res.json(await formatUniversity(updated))
  invalidateCache('universities:')
  invalidateCache(`university:${id}`)
})
