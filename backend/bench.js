/**
 * Latency Benchmark Script
 * Tests DB connection time, raw Prisma query time, and live API response times.
 * Run from /backend: node bench.js
 */

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config()

const API_BASE = `http://localhost:3001`
const prisma = new PrismaClient()

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
}

function color(text, ...codes) {
  return codes.map(c => COLORS[c] || '').join('') + text + COLORS.reset
}

function badge(ms) {
  if (ms < 100) return color(`${ms}ms`, 'green', 'bold')
  if (ms < 300) return color(`${ms}ms`, 'yellow', 'bold')
  return color(`${ms}ms`, 'red', 'bold')
}

function hr(label = '') {
  const line = '─'.repeat(60)
  if (label) {
    const pad = Math.max(0, 58 - label.length)
    const half = Math.floor(pad / 2)
    console.log(color(`\n${'─'.repeat(half)} ${label} ${'─'.repeat(pad - half)}\n`, 'cyan'))
  } else {
    console.log(color(`\n${line}\n`, 'dim'))
  }
}

async function measure(label, fn) {
  const start = performance.now()
  let result, error
  try {
    result = await fn()
  } catch (e) {
    error = e
  }
  const ms = Math.round(performance.now() - start)
  const status = error ? color('✗ FAIL', 'red', 'bold') : color('✓ OK', 'green', 'bold')
  console.log(`  ${status}  ${label.padEnd(42)} ${badge(ms)}`)
  if (error) console.log(color(`         ${error.message}`, 'red'))
  return { ms, result, error }
}

async function measureHTTP(label, path, opts = {}) {
  return measure(label, async () => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: opts.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      credentials: 'include',
    })
    return { status: res.status, ok: res.ok }
  })
}

// ─────────────────────────────────────────────────────────
// 1. DB Latency (Prisma)
// ─────────────────────────────────────────────────────────
async function benchDB() {
  hr('Database Latency (Prisma → Supabase)')

  // Cold connection warmup
  await measure('Cold connection warmup (1st query ever)', () =>
    prisma.$queryRaw`SELECT 1`
  )

  // Raw SQL roundtrip
  await measure('Raw SQL  SELECT NOW()', () =>
    prisma.$queryRaw`SELECT NOW()`
  )

  // Prisma model query — count
  await measure('Prisma   users.count()', () =>
    prisma.users.count()
  )

  // Prisma model query — events list (no filter)
  await measure('Prisma   events.findMany({ take: 10 })', () =>
    prisma.events.findMany({ take: 10, include: { mou: { select: { id: true, name: true } } } })
  )

  // Prisma model query — events list (with index filter)
  await measure('Prisma   events filtered (published, not archived)', () =>
    prisma.events.findMany({
      where: { status: 'published', is_archived: false },
      take: 10,
      orderBy: { date: 'asc' },
      include: { mou: { select: { id: true, name: true } } }
    })
  )

  // Warm repeat (connection already open — best-case latency)
  await measure('Warm repeat  SELECT NOW() (connection pooled)', () =>
    prisma.$queryRaw`SELECT NOW()`
  )
}

// ─────────────────────────────────────────────────────────
// 2. API Latency (HTTP → Backend → DB)
// ─────────────────────────────────────────────────────────
async function benchAPI() {
  hr('API Latency (HTTP → localhost:3001 → Supabase)')

  // Check if server is running
  let serverUp = false
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) })
    serverUp = res.ok
  } catch {
    try {
      const res = await fetch(`${API_BASE}/api/v1/events`, { signal: AbortSignal.timeout(2000) })
      serverUp = true
    } catch {
      serverUp = false
    }
  }

  if (!serverUp) {
    console.log(color('  ⚠  Backend server not running on :3001 — skipping HTTP tests', 'yellow'))
    console.log(color('     Start it with: npm run dev\n', 'dim'))
    return
  }

  // Cold API request (cache miss)
  const r1 = await measureHTTP('GET /api/v1/events (cold, cache miss)', '/api/v1/events')

  // Warm API request (cache hit — should be near 0ms processing)
  const r2 = await measureHTTP('GET /api/v1/events (warm, cache hit)', '/api/v1/events')

  // With eventType filter
  await measureHTTP('GET /api/v1/events?eventType=upcoming', '/api/v1/events?eventType=upcoming')
  await measureHTTP('GET /api/v1/events?eventType=upcoming (2nd hit)', '/api/v1/events?eventType=upcoming')

  // Single event by ID (no cache)
  await measureHTTP('GET /api/v1/events/nonexistent (404 path)', '/api/v1/events/00000000-0000-0000-0000-000000000000')

  // Calculate cache speedup
  if (r1.ms && r2.ms && !r1.error && !r2.error) {
    const speedup = (r1.ms / Math.max(r2.ms, 1)).toFixed(1)
    const saved = r1.ms - r2.ms
    console.log()
    console.log(color(`  📦  Cache speedup: ${speedup}x faster  (saved ~${saved}ms per request)`, 'cyan', 'bold'))
  }
}

// ─────────────────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────────────────
async function main() {
  console.log()
  console.log(color('  OIA Backend — Latency Benchmark', 'bold', 'cyan'))
  console.log(color(`  Region: ap-southeast-1 (Singapore)  |  ${new Date().toISOString()}`, 'dim'))

  await benchDB()
  await benchAPI()

  hr()
  console.log(color('  Benchmark complete.\n', 'dim'))
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
