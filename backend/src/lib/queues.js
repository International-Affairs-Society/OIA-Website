import { Queue } from 'bullmq'
import { redis } from './redis.js'
import logger from './logger.js'

// Define queues
export const fileQueue = new Queue('fileProcessing', { connection: redis })
export const emailQueue = new Queue('emailNotifications', { connection: redis })

logger.info('✅ BullMQ Queues initialized')
