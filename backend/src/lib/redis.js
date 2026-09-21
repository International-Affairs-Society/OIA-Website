import Redis from 'ioredis'
import logger from './logger.js'

// Connect using REDIS_URL if provided (common in PaaS like Coolify, Render, Heroku)
// Otherwise fallback to individual host/port/password variables
const redisConfig = process.env.REDIS_URL 
  ? process.env.REDIS_URL 
  : {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    }

export const redis = new Redis(redisConfig, {
  maxRetriesPerRequest: null, // Required by BullMQ
  retryStrategy(times) {
    return Math.min(times * 100, 3000)
  }
})

let lastLoggedErrorTime = 0
let errorCount = 0 // eslint-disable-line no-unused-vars -- intentional counter; value incremented for future telemetry

redis.on('connect', () => {
  logger.info('✅ Connected to Redis')
  errorCount = 0
})

redis.on('error', (err) => {
  errorCount++
  const now = Date.now()
  // Throttle error logging to once per 60 seconds to prevent terminal spam
  if (now - lastLoggedErrorTime > 60000) {
    lastLoggedErrorTime = now
    logger.warn(`⚠️ Redis Connection Warning (${err.message}): Unable to connect to Redis. Please check your REDIS_URL or REDIS_HOST/REDIS_PORT environment variables.`)
  }
})

export default redis
