import redis from '../lib/redis.js'
import logger from '../lib/logger.js'
/**
 * Dual-Layer Rate Limiting Middleware
 * Limits by User ID and by IP address simultaneously.
 * @param {number} uuidLimit - The max number of requests allowed per minute per user account
 * @param {number} ipLimit - The max number of requests allowed per minute per IP address
 */
export const dualRateLimiter = (uuidLimit, ipLimit) => async (req, res, next) => {
  // If no user object exists, we can only limit by IP
  const userId = req.user?.id
  const ip = req.ip || req.connection.remoteAddress

  const windowSizeSeconds = 60
  
  try {
    let exceedLimit = false
    const pipeline = redis.pipeline()

    // Key for IP limit
    if (ip) {
      const ipKey = `rate_limit:ip:${ip}`
      const currentIpCount = await redis.get(ipKey)
      
      if (currentIpCount && parseInt(currentIpCount) >= ipLimit) {
        exceedLimit = true
      } else {
        pipeline.incr(ipKey)
        if (!currentIpCount) {
          pipeline.expire(ipKey, windowSizeSeconds)
        }
      }
    }

    // Key for UUID limit
    if (userId) {
      const userKey = `rate_limit:uuid:${userId}`
      const currentUserCount = await redis.get(userKey)
      
      if (currentUserCount && parseInt(currentUserCount) >= uuidLimit) {
        exceedLimit = true
      } else {
        pipeline.incr(userKey)
        if (!currentUserCount) {
          pipeline.expire(userKey, windowSizeSeconds)
        }
      }
    }

    if (exceedLimit) {
      return res.status(429).json({
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Rate limit exceeded. Please wait before trying again.'
        }
      })
    }

    // If limits are not exceeded, execute pipeline to increment counters
    await pipeline.exec()
    next()
  } catch (error) {
    logger.error('Rate Limiter Error:', error)
    // Fail open if Redis is down so we don't break the application
    next()
  }
}
