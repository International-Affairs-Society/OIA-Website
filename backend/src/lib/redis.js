import Redis from 'ioredis'
import logger from './logger.js'

export const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    return Math.min(times * 100, 3000)
  }
})

let lastLoggedErrorTime = 0
let errorCount = 0

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
    logger.warn(`⚠️ Redis Connection Warning (${err.message}): Unable to connect to Redis on ${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}. Please start Redis or set REDIS_HOST/REDIS_PORT in .env.`)
  }
})

export default redis


