import { defineConfig } from '@prisma/config'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  earlyAccess: true,
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL
  }
})
