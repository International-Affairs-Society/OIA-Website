import { Queue } from 'bullmq'
import { redis } from './redis.js'
import logger from './logger.js'

// Define queues
export const fileQueue = new Queue('fileProcessing', { connection: redis })
export const emailQueue = new Queue('emailNotifications', { connection: redis })

fileQueue.on('error', (err) => {
  if (process.env.NODE_ENV === 'production') {
    logger.error('BullMQ fileQueue error:', err)
  }
})

emailQueue.on('error', (err) => {
  if (process.env.NODE_ENV === 'production') {
    logger.error('BullMQ emailQueue error:', err)
  }
})


logger.info('✅ BullMQ Queues initialized')

