import Redis from 'ioredis'
import logger from './logger.js'

export const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    return Math.min(times * 50, 2000)
  }
})

redis.on('connect', () => {
  logger.info('✅ Connected to Redis')
})

redis.on('error', (err) => {
  logger.error('❌ Redis Connection Error:', err)
})

export default redis
