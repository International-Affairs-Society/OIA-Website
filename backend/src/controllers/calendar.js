import asyncHandler from '../middleware/asyncHandler.js'

// GET /calendar (Authenticated)
export const getCalendar = asyncHandler(async (req, res) => {
  res.json({ data: [] })
})

// POST /calendar (STAFF, LEADERSHIP only)
export const createCalendarEvent = asyncHandler(async (req, res) => {
  res.status(201).json({
    id: 'mock-calendar-event-id',
    title: req.body.title || 'Mock Calendar Event',
    startDatetime: req.body.startDatetime || new Date().toISOString(),
    message: 'Calendar event created (mocked)'
  })
})

// PATCH /calendar/:id (STAFF, LEADERSHIP only)
export const updateCalendarEvent = asyncHandler(async (req, res) => {
  res.json({
    id: req.params.id,
    message: 'Calendar event updated (mocked)'
  })
})

// DELETE /calendar/:id (LEADERSHIP only)
export const deleteCalendarEvent = asyncHandler(async (req, res) => {
  res.json({
    id: req.params.id,
    message: 'Calendar event deleted (mocked)'
  })
})
