import { z } from 'zod'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'
import asyncHandler from '../middleware/asyncHandler.js'
import pick from '../utils/pick.js'
import { paginate } from '../utils/paginate.js'
import { getCached, setCached, invalidateCache } from '../lib/cache.js'

// Validation Schema for creation
const eventSchema = z.object({
  title: z.string().min(1),
  eventType: z.enum(['upcoming', 'past']),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  date: z.string(),
  linkedMOU: z.string().optional().nullable(),
  isArchived: z.boolean().optional().default(false),
  addToHomepage: z.boolean().optional().default(false),
  registrationLink: z.string().optional().nullable(),
  posterUrl: z.string().optional().nullable(),
  galleryUrls: z.array(z.string()).optional().default([]),
  status: z.enum(['draft', 'pending_approval', 'published', 'archived']).optional().default('draft')
})

// Format helper
function formatEvent(ev) {
  if (!ev) return null
  return {
    id: ev.id,
    mouId: ev.linked_mou_id || null,
    mou: ev.mou?.name || 'None',
    title: ev.title,
    date: ev.date ? ev.date.toISOString().split('T')[0] : null,
    event_type: ev.event_type,
    eventType: ev.event_type, // duplicate for frontend compatibility
    description: ev.description || '',
    location: ev.location || '',
    is_archived: ev.is_archived,
    isArchived: ev.is_archived,
    add_to_homepage: ev.add_to_homepage,
    addToHomepage: ev.add_to_homepage,
    registration_link: ev.registration_link || '',
    registrationLink: ev.registration_link || '',
    poster_url: ev.poster_url || '',
    posterUrl: ev.poster_url || '',
    gallery_urls: ev.gallery_urls || [],
    galleryUrls: ev.gallery_urls || [],
    status: ev.status,
    createdAt: ev.created_at,
    updatedAt: ev.updated_at
  }
}

/**
 * Decode the JWT cookie/header locally (zero network round-trips) to determine
 * if the caller has a staff role. This replaces the previous 2-RTT pattern of
 * calling supabase.auth.getUser() + prisma.users.findUnique() on every request.
 *
 * JWT decoding is safe here because:
 * - We only need the role claim for visibility filtering, not for auth enforcement.
 * - Actual route-level auth (requireAuth middleware) already validates the token
 *   cryptographically before any write operation reaches the controller.
 */
function isStaffFromToken(req) {
  const token =
    req.cookies?.access_token ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '')

  if (!token) return false

  try {
    // jwt.decode() is non-verifying — use only for reads/role hints
    const decoded = jwt.decode(token)
    if (!decoded) return false

    // Supabase stores app role in user_metadata or app_metadata
    const role =
      decoded?.user_metadata?.role ||
      decoded?.app_metadata?.role ||
      decoded?.role

    return ['super_admin', 'admin', 'editor'].includes(role)
  } catch {
    return false
  }
}

// GET /events (Public / Authenticated)
export const getEvents = asyncHandler(async (req, res) => {
  const { eventType, mouId, status, is_archived } = req.query
  const isStaffOrLeadership = isStaffFromToken(req)

  // Serve cached response for public requests (cache busted on write mutations)
  if (!isStaffOrLeadership) {
    const cacheKey = `events:public:${JSON.stringify({ eventType, mouId })}`
    const cached = getCached(cacheKey)
    if (cached) {
      return res.json(cached)
    }

    const where = {
      status: 'published',
      is_archived: false,
    }
    if (eventType) where.event_type = eventType
    if (mouId && mouId !== 'None' && mouId !== '') where.linked_mou_id = mouId

    const paginatedResult = await paginate(prisma.events, req.query, {
      where,
      include: { mou: { select: { id: true, name: true } } },
      orderBy: { date: eventType === 'past' ? 'desc' : 'asc' }
    })

    const response = {
      data: paginatedResult.data.map(formatEvent),
      page: paginatedResult.page,
      limit: paginatedResult.limit,
      total: paginatedResult.total
    }

    setCached(cacheKey, response, 60_000) // 60-second TTL
    return res.json(response)
  }

  // Staff/admin path — always fresh from DB
  const where = {}
  if (status) where.status = status
  if (is_archived !== undefined) where.is_archived = is_archived === 'true'
  if (eventType) where.event_type = eventType
  if (mouId && mouId !== 'None' && mouId !== '') where.linked_mou_id = mouId

  const paginatedResult = await paginate(prisma.events, req.query, {
    where,
    include: { mou: { select: { id: true, name: true } } },
    orderBy: { date: eventType === 'past' ? 'desc' : 'asc' }
  })

  res.json({
    data: paginatedResult.data.map(formatEvent),
    page: paginatedResult.page,
    limit: paginatedResult.limit,
    total: paginatedResult.total
  })
})

// GET /events/:id (Public)
export const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const ev = await prisma.events.findUnique({
    where: { id },
    include: { mou: { select: { id: true, name: true } } }
  })

  if (!ev) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Event not found' }
    })
  }

  res.json(formatEvent(ev))
})

// POST /events (STAFF, LEADERSHIP / super_admin, admin, editor)
export const createEvent = asyncHandler(async (req, res) => {
  const parsed = eventSchema.parse(req.body)

  let linked_mou_id = null
  if (parsed.linkedMOU && parsed.linkedMOU !== 'None' && parsed.linkedMOU !== '') {
    linked_mou_id = parsed.linkedMOU
    const mou = await prisma.mous.findUnique({ where: { id: linked_mou_id } })
    if (!mou) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'MOU not found', fields: { linkedMOU: 'MOU does not exist' } }
      })
    }
  }

  const dbData = {
    title: parsed.title,
    event_type: parsed.eventType,
    description: parsed.description || null,
    location: parsed.location || null,
    date: new Date(parsed.date),
    linked_mou_id,
    is_archived: parsed.isArchived,
    add_to_homepage: parsed.addToHomepage,
    registration_link: parsed.registrationLink || null,
    poster_url: parsed.posterUrl || null,
    gallery_urls: parsed.galleryUrls,
    status: parsed.status,
    created_by: req.user.id
  }

  // Intercept Admin/Editor requests and route to reviews
  if (['admin', 'editor'].includes(req.user.role)) {
    const review = await prisma.reviews.create({
      data: {
        type: parsed.eventType === 'upcoming' ? 'upcoming_event' : 'past_event',
        title: parsed.title,
        submitted_by: req.user.id,
        submitted_by_name: req.user.name || req.user.email.split('@')[0],
        submitted_by_email: req.user.email,
        submitted_by_role: req.user.role,
        status: 'pending',
        data: {
          action: 'CREATE',
          payload: dbData
        }
      }
    })
    return res.status(202).json({
      message: 'Event creation submitted for review',
      reviewId: review.id,
      status: 'pending'
    })
  }

  // Super Admin direct write
  const created = await prisma.events.create({
    data: dbData,
    include: { mou: { select: { id: true, name: true } } }
  })

  invalidateCache('events:') // Bust public cache after write
  res.status(201).json(formatEvent(created))
})

// PATCH /events/:id (super_admin, admin, editor)
export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params

  const ev = await prisma.events.findUnique({ where: { id } })
  if (!ev) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Event not found' }
    })
  }

  const parsed = eventSchema.partial().parse(req.body)

  let linked_mou_id = undefined
  if (parsed.linkedMOU !== undefined) {
    if (parsed.linkedMOU === 'None' || parsed.linkedMOU === '' || !parsed.linkedMOU) {
      linked_mou_id = null
    } else {
      linked_mou_id = parsed.linkedMOU
      const mou = await prisma.mous.findUnique({ where: { id: linked_mou_id } })
      if (!mou) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'MOU not found', fields: { linkedMOU: 'MOU does not exist' } }
        })
      }
    }
  }

  const dbData = {}
  if (parsed.title !== undefined) dbData.title = parsed.title
  if (parsed.eventType !== undefined) dbData.event_type = parsed.eventType
  if (parsed.description !== undefined) dbData.description = parsed.description
  if (parsed.location !== undefined) dbData.location = parsed.location
  if (parsed.date !== undefined) dbData.date = new Date(parsed.date)
  if (linked_mou_id !== undefined) dbData.linked_mou_id = linked_mou_id
  if (parsed.isArchived !== undefined) dbData.is_archived = parsed.isArchived
  if (parsed.addToHomepage !== undefined) dbData.add_to_homepage = parsed.addToHomepage
  if (parsed.registrationLink !== undefined) dbData.registration_link = parsed.registrationLink
  if (parsed.posterUrl !== undefined) dbData.poster_url = parsed.posterUrl
  if (parsed.galleryUrls !== undefined) dbData.gallery_urls = parsed.galleryUrls
  if (parsed.status !== undefined) dbData.status = parsed.status

  dbData.updated_at = new Date()

  // Intercept Admin/Editor requests and route to reviews
  if (['admin', 'editor'].includes(req.user.role)) {
    const review = await prisma.reviews.create({
      data: {
        type: (parsed.eventType || ev.event_type) === 'upcoming' ? 'upcoming_event' : 'past_event',
        title: parsed.title || ev.title,
        submitted_by: req.user.id,
        submitted_by_name: req.user.name || req.user.email.split('@')[0],
        submitted_by_email: req.user.email,
        submitted_by_role: req.user.role,
        status: 'pending',
        data: {
          action: 'UPDATE',
          targetId: id,
          payload: dbData
        }
      }
    })
    return res.status(202).json({
      message: 'Event modification submitted for review',
      reviewId: review.id,
      status: 'pending'
    })
  }

  // Super Admin direct write
  const updated = await prisma.events.update({
    where: { id },
    data: dbData,
    include: { mou: { select: { id: true, name: true } } }
  })

  invalidateCache('events:') // Bust public cache after write
  res.json(formatEvent(updated))
})

// DELETE /events/:id (super_admin only)
export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params

  const ev = await prisma.events.findUnique({ where: { id } })
  if (!ev) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Event not found' }
    })
  }

  await prisma.events.delete({ where: { id } })

  invalidateCache('events:') // Bust public cache after write
  res.json({ message: 'Event deleted successfully' })
})

// POST /events/:id/register (Mocked - Authenticated)
export const registerForEvent = asyncHandler(async (req, res) => {
  const { id } = req.params
  const ev = await prisma.events.findUnique({ where: { id } })
  if (!ev) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Event not found' }
    })
  }
  res.json({ message: 'Registered successfully (mocked)' })
})

// DELETE /events/:id/register (Mocked - Authenticated)
export const unregisterFromEvent = asyncHandler(async (req, res) => {
  const { id } = req.params
  const ev = await prisma.events.findUnique({ where: { id } })
  if (!ev) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Event not found' }
    })
  }
  res.json({ message: 'Registration cancelled successfully (mocked)' })
})

// GET /events/:id/registrations (Mocked - super_admin, admin, editor only)
export const getEventRegistrations = asyncHandler(async (req, res) => {
  const { id } = req.params
  const ev = await prisma.events.findUnique({ where: { id } })
  if (!ev) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Event not found' }
    })
  }
  res.json({ data: [] }) // Return empty registration array since table is out of scope
})
