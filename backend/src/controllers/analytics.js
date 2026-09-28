import prisma from '../lib/prisma.js'
import asyncHandler from '../middleware/asyncHandler.js'
import redis from '../lib/redis.js'
import { z } from 'zod'

const getCache = async (key) => {
  try {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch (e) {
    return null
  }
}

const setCache = async (key, data, ttl) => {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttl)
  } catch (e) {
    // ignore
  }
}

// GET /analytics/overview (STAFF, LEADERSHIP only)
export const getOverview = asyncHandler(async (req, res) => {
  const cacheKey = 'analytics:overview'
  const cached = await getCache(cacheKey)
  if (cached) return res.json(cached)

  const [
    totalUsers,
    totalApplications,
    pendingApplications,
    acceptedApplications,
    activeStudents,
    upcomingEvents,
    activeMous
  ] = await Promise.all([
    prisma.users.count(),
    prisma.applications.count(),
    prisma.applications.count({ where: { current_stage: 'Submitted' } }),
    prisma.applications.count({ where: { current_stage: 'Enrolled' } }),
    prisma.students.count(),
    prisma.events.count({ where: { date: { gte: new Date() }, status: 'published', is_archived: false } }),
    prisma.mous.count({ where: { status: 'Active', is_archived: false } })
  ])

  const result = {
    totalUsers,
    totalApplications,
    pendingApplications,
    acceptedApplications,
    activeStudents,
    upcomingEvents,
    activeMous
  }
  await setCache(cacheKey, result, 300)
  res.json(result)
})

// GET /analytics/applications (STAFF, LEADERSHIP only)
export const getApplicationsAnalytics = asyncHandler(async (req, res) => {
  const cacheKey = 'analytics:applications'
  const cached = await getCache(cacheKey)
  if (cached) return res.json(cached)

  // Get count by stage
  const stageGrouping = await prisma.applications.groupBy({
    by: ['current_stage'],
    _count: {
      id: true
    }
  })

  // Format stage breakdown
  const stageBreakdown = {}
  stageGrouping.forEach(group => {
    stageBreakdown[group.current_stage] = group._count.id
  })

  // Get count by program
  const programGrouping = await prisma.applications.groupBy({
    by: ['program_id'],
    _count: {
      id: true
    }
  })

  // Fetch program titles to map IDs to names
  const programIds = programGrouping.map(g => g.program_id)
  const programs = await prisma.programs.findMany({
    where: { id: { in: programIds } },
    select: { id: true, name: true }
  })

  const programMap = {}
  programs.forEach(p => {
    programMap[p.id] = p.name
  })

  const programBreakdown = programGrouping.map(group => ({
    programId: group.program_id,
    programName: programMap[group.program_id] || 'Unknown Program',
    count: group._count.id
  }))

  const result = {
    stageBreakdown,
    programBreakdown
  }
  await setCache(cacheKey, result, 300)
  res.json(result)
})

// GET /analytics/events (STAFF, LEADERSHIP only)
export const getEventsAnalytics = asyncHandler(async (req, res) => {
  const cacheKey = 'analytics:events'
  const cached = await getCache(cacheKey)
  if (cached) return res.json(cached)

  const [totalEvents, typeGrouping, statusGrouping] = await Promise.all([
    prisma.events.count(),
    prisma.events.groupBy({
      by: ['event_type'],
      _count: { id: true }
    }),
    prisma.events.groupBy({
      by: ['status'],
      _count: { id: true }
    })
  ])

  const result = {
    totalEvents,
    byType:   typeGrouping.map(g   => ({ type:   g.event_type, count: g._count.id })),
    byStatus: statusGrouping.map(g => ({ status: g.status,     count: g._count.id }))
  }
  await setCache(cacheKey, result, 300)
  res.json(result)
})
