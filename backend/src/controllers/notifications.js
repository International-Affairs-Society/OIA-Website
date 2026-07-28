import prisma from '../lib/prisma.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { paginate } from '../utils/paginate.js'

// Format helper
function formatNotification(notif) {
  if (!notif) return null
  return {
    id: notif.id,
    type: notif.type,
    recipientFilter: notif.recipient_filter,
    subject: notif.subject,
    bodyHtml: notif.body_html,
    sentById: notif.sent_by_id,
    recipientCount: notif.recipient_count,
    sentAt: notif.sent_at,
    read: false // Default to false since read state is not tracked in the final schema
  }
}

// GET /notifications/me (Authenticated - Get own notifications)
export const getMyNotifications = asyncHandler(async (req, res) => {
  const roleFilter = `role:${req.user.role}`
  const userFilter = `user:${req.user.id}`

  const where = {
    OR: [
      { recipient_filter: 'all' },
      { recipient_filter: roleFilter },
      { recipient_filter: userFilter }
    ]
  }

  const paginatedResult = await paginate(prisma.notifications, req.query, {
    where,
    orderBy: { sent_at: 'desc' }
  })

  res.json({
    data: paginatedResult.data.map(formatNotification),
    page: paginatedResult.page,
    limit: paginatedResult.limit,
    total: paginatedResult.total
  })
})

// GET /notifications (STAFF, LEADERSHIP only - List all sent notifications)
export const getNotifications = asyncHandler(async (req, res) => {
  const { type, recipientFilter } = req.query

  const where = {}
  if (type) {
    where.type = type.toUpperCase()
  }
  if (recipientFilter) {
    where.recipient_filter = recipientFilter
  }

  const paginatedResult = await paginate(prisma.notifications, req.query, {
    where,
    orderBy: { sent_at: 'desc' }
  })

  res.json({
    data: paginatedResult.data.map(formatNotification),
    page: paginatedResult.page,
    limit: paginatedResult.limit,
    total: paginatedResult.total
  })
})

// PATCH /notifications/:id/read (Authenticated - Mark notification as read)
export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params

  const notif = await prisma.notifications.findUnique({ where: { id } })
  if (!notif) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Notification not found' }
    })
  }

  // Since read status is not in final schema, we return a mock success
  res.json({
    id,
    read: true,
    message: 'Notification marked as read (mocked)'
  })
})

// POST /notifications (STAFF, LEADERSHIP only - Create a notification)
export const createNotification = asyncHandler(async (req, res) => {
  // Only super_admin, admin, and editor can send notifications/alerts
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.role !== 'editor') {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Access denied' }
    })
  }

  const { type, recipientFilter, subject, bodyHtml } = req.body

  if (!subject || !bodyHtml) {
    return res.status(400).json({
      error: { code: 'BAD_REQUEST', message: 'Subject and bodyHtml are required' }
    })
  }

  const newNotif = await prisma.notifications.create({
    data: {
      type: type || 'TRANSACTIONAL',
      recipient_filter: recipientFilter || 'all',
      subject,
      body_html: bodyHtml,
      sent_by_id: req.user.id,
      recipient_count: 1
    }
  })

  res.status(201).json(formatNotification(newNotif))
})
