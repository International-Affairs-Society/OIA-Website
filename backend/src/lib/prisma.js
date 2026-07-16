import { PrismaClient } from '@prisma/client'
import pkg from 'pg'
const { Pool } = pkg
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL

const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis

const prisma =
  globalForPrisma.__prisma ??
  prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma
}

export default prisma
