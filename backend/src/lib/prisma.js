import { PrismaClient } from '@prisma/client'

// Prevent multiple PrismaClient instances in development hot-reload cycles.
// In production, a single instance is always created.
const globalForPrisma = globalThis

const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma
}

export default prisma
