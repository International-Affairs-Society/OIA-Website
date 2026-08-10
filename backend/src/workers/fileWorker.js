import { Worker } from 'bullmq'
import { redis } from '../lib/redis.js'
import logger from '../lib/logger.js'
import { processFileUpload } from './fileProcessor.js'

export const fileWorker = new Worker('fileProcessing', processFileUpload, { 
  connection: redis,
  concurrency: 5 // Process up to 5 uploads concurrently
})

fileWorker.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed with error: ${err.message}`)
})

fileWorker.on('error', (err) => {
  if (process.env.NODE_ENV === 'production') {
    logger.error('BullMQ fileWorker error:', err)
  }
})


