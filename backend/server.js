import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import DOMPurify from 'isomorphic-dompurify'
// Load environment variables
dotenv.config()

// Import routes
import authRouter from './src/routes/auth.js'
import usersRouter from './src/routes/users.js'
import programsRouter from './src/routes/programs.js'
import applicationsRouter from './src/routes/applications.js'
import documentsRouter from './src/routes/documents.js'
import studentRecordsRouter from './src/routes/student-records.js'
import eventsRouter from './src/routes/events.js'
import calendarRouter from './src/routes/calendar.js'
import mousRouter from './src/routes/mous.js'
import universitiesRouter from './src/routes/universities.js'
import notificationsRouter from './src/routes/notifications.js'
import analyticsRouter from './src/routes/analytics.js'
import changeRequestsRouter from './src/routes/change-requests.js'
import reviewsRouter from './src/routes/reviews.js'
import auditRouter from './src/routes/audit.js'
import mediaRouter from './src/routes/media.js'
import programLeadsRouter from './src/routes/programLeads.js'
import visitsRouter from './src/routes/visits.js'
import draftsRouter from './src/routes/drafts.js'

// Import workers to initialize them
import './src/workers/fileWorker.js'
import './src/workers/mouExpiryWorker.js'
// Import error handler middleware
import errorHandler from './src/middleware/errorHandler.js'

const app = express()

// Trust the first proxy (Coolify's reverse proxy) so express-rate-limit
// can correctly identify client IPs via X-Forwarded-For header.
app.set('trust proxy', 1)

// Secure HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}))

// Global Rate Limiting (Normal Browsing: 10,000 requests per 15 min, exempt health check)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10000, // 10,000 requests per 15 mins for browsing / campus IPs
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/',
  message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests from this IP, please try again later.' } }
})

// Global middleware
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/['"]/g, '')
const allowedOrigins = [
  frontendUrl,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))
app.use(limiter)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = DOMPurify.sanitize(obj[key])
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key])
        }
      }
    }
    sanitize(req.body)
  }
  next()
})

// Base root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Bennett Student Portal OIA Backend API',
    version: '1.0.0',
    status: 'Running'
  })
})

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Mount routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/programs', programsRouter)
app.use('/api/v1/applications', applicationsRouter)
app.use('/api/v1/documents', documentsRouter)
app.use('/api/v1/student-records', studentRecordsRouter)
app.use('/api/v1/events', eventsRouter)
app.use('/api/v1/calendar', calendarRouter)
app.use('/api/v1/mous', mousRouter)
app.use('/api/v1/universities', universitiesRouter)
app.use('/api/v1/notifications', notificationsRouter)
app.use('/api/v1/analytics', analyticsRouter)
app.use('/api/v1/change-requests', changeRequestsRouter)
app.use('/api/v1/reviews', reviewsRouter)
app.use('/api/v1/audit', auditRouter)
app.use('/api/v1/media', mediaRouter)
app.use('/api/v1/program-leads', programLeadsRouter)
app.use('/api/v1/visits', visitsRouter)
app.use('/api/v1/drafts', draftsRouter)


// Global 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  })
})

// Global error handler (Must be mounted last)
app.use(errorHandler)

import { mouExpiryQueue } from './src/lib/queues.js'

const PORT = process.env.PORT || 3001
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server is running on port ${PORT}`)

  // MOU-01: register daily MOU expiry check (runs at midnight every day)
  await mouExpiryQueue.add(
    'checkMouExpiry',
    {},
    { repeat: { cron: '0 0 * * *' }, removeOnComplete: true }
  ).catch(err => console.error('[MOU] Failed to register expiry cron:', err))
})

export default app
