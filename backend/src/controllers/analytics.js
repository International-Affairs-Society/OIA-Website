import prisma from '../lib/prisma.js'
import asyncHandler from '../middleware/asyncHandler.js'

// GET /analytics/overview (STAFF, LEADERSHIP only)
export const getOverview = asyncHandler(async (req, res) => {
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

  res.json({
    totalUsers,
    totalApplications,
    pendingApplications,
    acceptedApplications,
    activeStudents,
    upcomingEvents,
    activeMous
  })
})

// GET /analytics/applications (STAFF, LEADERSHIP only)
export const getApplicationsAnalytics = asyncHandler(async (req, res) => {
  // Get count by stage
  const stageGrouping = await prisma.applications.groupBy({
    by: ['current_stage'],  // DB-02 FIX: was 'stage'
    _count: {
      id: true
    }
  })

  // Format stage breakdown
  const stageBreakdown = {}
  stageGrouping.forEach(group => {
    stageBreakdown[group.current_stage] = group._count.id  // DB-02 FIX: was group.stage
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
    select: { id: true, name: true }  // DB-02 FIX: was 'title' (field doesn't exist in schema)
  })

  const programMap = {}
  programs.forEach(p => {
    programMap[p.id] = p.name  // DB-02 FIX: was p.title
  })

  const programBreakdown = programGrouping.map(group => ({
    programId: group.program_id,
    programName: programMap[group.program_id] || 'Unknown Program',
    count: group._count.id
  }))

  res.json({
    stageBreakdown,
    programBreakdown
  })
})

// GET /analytics/events (STAFF, LEADERSHIP only)
export const getEventsAnalytics = asyncHandler(async (req, res) => {
  const [totalEvents, typeGrouping, statusGrouping] = await Promise.all([
    prisma.events.count(),
    prisma.events.groupBy({
      by: ['event_type'],  // DB-02 FIX: was 'type'
      _count: { id: true }
    }),
    prisma.events.groupBy({
      by: ['status'],  // DB-02 FIX: was 'visibility'
      _count: { id: true }
    })
  ])

  res.json({
    totalEvents,
    byType:   typeGrouping.map(g   => ({ type:   g.event_type, count: g._count.id })),
    byStatus: statusGrouping.map(g => ({ status: g.status,     count: g._count.id }))
  })
})
