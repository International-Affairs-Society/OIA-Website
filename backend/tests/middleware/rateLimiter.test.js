import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockRedis } = vi.hoisted(() => {
  // We can use dynamic import or just rely on a simple object for the mock
  // but to use ioredis-mock we can just instantiate it inside the mock factory
  return { mockRedis: null } // We'll set it inside the vi.mock
})

vi.mock('../../src/lib/redis.js', async () => {
  const RedisMock = (await import('ioredis-mock')).default
  const instance = new RedisMock()
  return {
    default: instance,
    redis: instance
  }
})

import redis from '../../src/lib/redis.js'

import { dualRateLimiter } from '../../src/middleware/rateLimiter.js'

describe('dualRateLimiter Middleware', () => {
  let req, res, next

  beforeEach(() => {
    // Reset mock redis and express objects before each test
    redis.flushall()

    req = {
      ip: '127.0.0.1',
      user: { id: 'user-123' },
      connection: { remoteAddress: '127.0.0.1' }
    }

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    }

    next = vi.fn()
  })

  it('allows requests under the limits', async () => {
    const middleware = dualRateLimiter(4, 10)
    
    // Simulate 3 requests
    await middleware(req, res, next)
    await middleware(req, res, next)
    await middleware(req, res, next)

    expect(next).toHaveBeenCalledTimes(3)
    expect(res.status).not.toHaveBeenCalled()
  })

  it('blocks requests when UUID limit is reached', async () => {
    const middleware = dualRateLimiter(4, 10)
    
    // Make 4 allowed requests
    await middleware(req, res, next)
    await middleware(req, res, next)
    await middleware(req, res, next)
    await middleware(req, res, next)

    expect(next).toHaveBeenCalledTimes(4)

    // Make the 5th request, which should be blocked by UUID limit
    await middleware(req, res, next)

    expect(next).toHaveBeenCalledTimes(4) // Should not be called again
    expect(res.status).toHaveBeenCalledWith(429)
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded. Please wait before trying again.'
      }
    })
  })

  it('blocks requests when IP limit is reached for unauthenticated users', async () => {
    const middleware = dualRateLimiter(4, 10)
    
    // Unauthenticated user (no req.user.id)
    req.user = undefined
    
    // Make 10 allowed requests
    for (let i = 0; i < 10; i++) {
      await middleware(req, res, next)
    }

    expect(next).toHaveBeenCalledTimes(10)

    // Make 11th request, which should be blocked by IP limit
    await middleware(req, res, next)

    expect(next).toHaveBeenCalledTimes(10) // Should not be called again
    expect(res.status).toHaveBeenCalledWith(429)
  })

  it('allows multiple users on the same subnet IP without starvating each other', async () => {
    const middleware = dualRateLimiter(4, 5)
    
    // User A makes 3 requests from shared subnet IP 192.168.1.50
    const reqA = {
      ip: '192.168.1.50',
      user: { id: 'user-A' }
    }
    await middleware(reqA, res, next)
    await middleware(reqA, res, next)
    await middleware(reqA, res, next)

    // User B makes 3 requests from the EXACT SAME subnet IP 192.168.1.50
    const reqB = {
      ip: '192.168.1.50',
      user: { id: 'user-B' }
    }
    await middleware(reqB, res, next)
    await middleware(reqB, res, next)
    await middleware(reqB, res, next)

    // Total requests from this IP is 6 (which exceeds unauthenticated ipLimit 5).
    // Both users should succeed because their UUID limit (4 each) has not been exceeded.
    expect(next).toHaveBeenCalledTimes(6)
    expect(res.status).not.toHaveBeenCalled()
  })

  it('bypasses rate limit for admin and staff roles during QA operations', async () => {
    const middleware = dualRateLimiter(2, 2)
    const adminReq = {
      ip: '127.0.0.1',
      user: { id: 'admin-1', role: 'super_admin' }
    }

    for (let i = 0; i < 5; i++) {
      await middleware(adminReq, res, next)
    }

    expect(next).toHaveBeenCalledTimes(5)
    expect(res.status).not.toHaveBeenCalled()
  })

  it('bypasses rate limit when x-qa-bypass header is present with valid token', async () => {
    process.env.QA_BYPASS_TOKEN = 'secret-qa-token'
    const middleware = dualRateLimiter(1, 1)
    const qaReq = {
      headers: { 'x-qa-bypass': 'secret-qa-token' },
      ip: '127.0.0.1',
      user: { id: 'test-user' }
    }

    for (let i = 0; i < 5; i++) {
      await middleware(qaReq, res, next)
    }

    expect(next).toHaveBeenCalledTimes(5)
    delete process.env.QA_BYPASS_TOKEN
  })
})
