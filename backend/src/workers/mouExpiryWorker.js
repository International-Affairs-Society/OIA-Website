// ============================================================
// mouExpiryWorker.js — MOU-01
// BullMQ Worker for the 'mouExpiry' queue.
// Processes the daily MOU expiry check job.
// ============================================================
import { Worker } from 'bullmq'
import { redis } from '../lib/redis.js'
import logger from '../lib/logger.js'
import { processMouExpiry } from './mouExpiryProcessor.js'

export const mouExpiryWorker = new Worker('mouExpiry', processMouExpiry, {
  connection: redis,
  concurrency: 1  // Only one expiry check at a time
})

mouExpiryWorker.on('completed', (job) => {
  logger.info(`[mouExpiryWorker] Job ${job.id} completed successfully`)
})

mouExpiryWorker.on('failed', (job, err) => {
  logger.error(`[mouExpiryWorker] Job ${job?.id} failed: ${err.message}`)
})

mouExpiryWorker.on('error', (err) => {
  logger.error('[mouExpiryWorker] Worker error:', err)
})
