import { Worker } from 'bullmq'
import fs from 'fs/promises'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import prisma from '../lib/prisma.js'
import { r2 } from '../lib/r2.js'
import { redis } from '../lib/redis.js'
import logger from '../lib/logger.js'

export const processFileUpload = async (job) => {
  const { documentId, filePath, r2Key, mimetype, userId } = job.data

  try {
    const logId = documentId || r2Key
    logger.info(`Processing file upload for ${logId}`)

    // Read the file from the temporary disk location
    const fileBuffer = await fs.readFile(filePath)

    // Upload to Cloudflare R2
    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'documents',
      Key: r2Key,
      Body: fileBuffer,
      ContentType: mimetype
    }))

    // Update the database to reflect successful processing (e.g. status)
    // Note: The document is initially 'PENDING' for verification by staff.
    // We could add an 'upload_status' field in the future, but for now we just
    // leave it as PENDING which means it's ready for review.
    
    logger.info(`Successfully uploaded ${r2Key}`)

  } catch (error) {
    const logId = documentId || r2Key
    logger.error(`Failed to process upload for ${logId}:`, error)
    
    // Create a notification for the user about the failure
    await prisma.notifications.create({
      data: {
        type: 'SYSTEM_ALERT',
        recipient_filter: `user:${userId}`,
        subject: 'File Upload Failed',
        body_html: `Your upload for ${r2Key.split('/').pop()} failed to process. Please try again.`,
        recipient_count: 1
      }
    })

    throw error // Re-throw to trigger BullMQ retry/fail logic
  } finally {
    // Always clean up the temporary file
    try {
      await fs.unlink(filePath)
    } catch (cleanupError) {
      logger.error(`Failed to delete temporary file ${filePath}:`, cleanupError)
    }
  }
}

export const fileWorker = new Worker('fileProcessing', processFileUpload, { 
  connection: redis,
  concurrency: 5 // Process up to 5 uploads concurrently
})

fileWorker.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed with error: ${err.message}`)
})
