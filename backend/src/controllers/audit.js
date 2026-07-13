import prisma from '../lib/prisma.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { paginate } from '../utils/paginate.js'

// GET /audit  (super_admin, admin, editor)
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { action, itemType, search, startDate, endDate } = req.query

  const where = {}
  if (action) where.action = action
  if (itemType) where.item_type = itemType
  if (search) {
    where.OR = [
      { item_title: { contains: search, mode: 'insensitive' } },
      { performed_by_name: { contains: search, mode: 'insensitive' } }
    ]
  }
  if (startDate || endDate) {
    where.timestamp = {}
    if (startDate) where.timestamp.gte = new Date(startDate)
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      where.timestamp.lte = end
    }
  }

  const paginatedResult = await paginate(prisma.audit_logs, req.query, {
    where,
    orderBy: { timestamp: 'desc' }
  })

  res.json({
    data: paginatedResult.data,
    page: paginatedResult.page,
    limit: paginatedResult.limit,
    total: paginatedResult.total
  })
})
