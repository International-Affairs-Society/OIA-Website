import redis from '../lib/redis.js'
import logger from '../lib/logger.js'
import rateLimit from 'express-rate-limit'
/**
 * Helper to reliably resolve the true client IP across proxies, Cloudflare, and local subnets
 */
export const getClientIp = (req) => {
  const cf = req.headers?.['cf-connecting-ip']
  if (cf) return (typeof cf === 'string' ? cf.split(',')[0].trim() : cf[0])

  const xReal = req.headers?.['x-real-ip']
  if (xReal) return (typeof xReal === 'string' ? xReal.split(',')[0].trim() : xReal[0])

  const xff = req.headers?.['x-forwarded-for']
  if (xff) return (typeof xff === 'string' ? xff.split(',')[0].trim() : xff[0])

  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1'
}

/**
 * Dual-Layer Rate Limiting Middleware
 * Limits by User ID and by IP address simultaneously.
 * Designed to prevent shared subnet IP starvation (e.g. QA rooms, campus Wi-Fi) by allocating
 * separate UUID buckets per user and providing a high shared-subnet IP allowance for authenticated users.
 * @param {number} uuidLimit - The max number of requests allowed per minute per user account
 * @param {number} ipLimit - The max number of requests allowed per minute per IP address
 */
export const dualRateLimiter = (uuidLimit, ipLimit) => async (req, res, next) => {
  // Allow bypassing rate limits for automated QA or local dev if configured
  if (process.env.DISABLE_RATE_LIMIT === 'true') {
    return next()
  }
  if (process.env.QA_BYPASS_TOKEN && req.headers['x-qa-bypass'] === process.env.QA_BYPASS_TOKEN) {
    return next()
  }

  // Admin/staff roles running critical tasks or QA tests should not be throttled
  if (req.user?.role && ['super_admin', 'admin', 'editor'].includes(req.user.role)) {
    return next()
  }

  const userId = req.user?.id
  const ip = getClientIp(req)

  const windowSizeSeconds = 60
  
  try {
    let exceedLimit = false
    const pipeline = redis.pipeline()

    // Key for IP limit:
    // If a user is authenticated, limit primarily by User ID to prevent shared subnet IP starvation.
    // For authenticated users sharing an office/campus subnet, use a high abuse ceiling (ipLimit * 15 or 150 min).
    // For unauthenticated users, enforce standard ipLimit.
    if (ip) {
      const effectiveIpLimit = userId ? Math.max(ipLimit * 15, 150) : ipLimit
      const ipKey = `rate_limit:ip:${ip}`
      const currentIpCount = await redis.get(ipKey)
      
      if (currentIpCount && parseInt(currentIpCount) >= effectiveIpLimit) {
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

/**
 * Limiter for authentication endpoints (300 req/min to accommodate large QA teams and campus subnets)
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  skip: (req) => 
    process.env.DISABLE_RATE_LIMIT === 'true' ||
    (process.env.QA_BYPASS_TOKEN && req.headers['x-qa-bypass'] === process.env.QA_BYPASS_TOKEN),
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication requests. Please try again in a minute.'
    }
  }
})

/**
 * Limiter for public lead capture submissions (50 req/min to allow QA form validation testing)
 */
export const leadLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  skip: (req) => 
    process.env.DISABLE_RATE_LIMIT === 'true' ||
    (process.env.QA_BYPASS_TOKEN && req.headers['x-qa-bypass'] === process.env.QA_BYPASS_TOKEN),
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many submissions. Please wait a moment before trying again.'
    }
  }
})

