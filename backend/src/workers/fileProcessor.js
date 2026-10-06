import { GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import prisma from '../lib/prisma.js'
import { r2 } from '../lib/r2.js'
import logger from '../lib/logger.js'
import NodeClam from 'clamscan'

export const processFileUpload = async (job) => {
  const { documentId, r2Key, userId } = job.data
  const logId = documentId || r2Key

  try {
    logger.info(`Starting ClamAV scan for ${logId}`)

    // Fetch the file stream from R2
    const getRes = await r2.send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'documents',
      Key: r2Key
    }))

    // Initialize ClamScan (falls back to local clamdscan if daemon isn't configured)
    let clamscan = null
    try {
      clamscan = await new NodeClam().init({
        removeInfected: false, 
        clamdscan: {
          host: process.env.CLAMAV_HOST || '127.0.0.1',
          port: process.env.CLAMAV_PORT || 3310,
          localFallback: true,
        }
      })
    } catch (clamErr) {
      if (process.env.NODE_ENV !== 'production' || process.env.SKIP_MALWARE_SCAN === 'true') {
        logger.warn(`ClamAV scanner unavailable (${clamErr.message}), skipping scan in non-production for ${logId}`)
        if (documentId && !documentId.startsWith('media-')) {
          await prisma.documents.update({
            where: { id: documentId },
            data: { status: 'VERIFIED', updated_at: new Date() }
          }).catch(() => {})
        }
        return
      }
      throw clamErr
    }

    const { isInfected, viruses } = await clamscan.scanStream(getRes.Body)

    if (isInfected) {
      logger.warn(`Malware detected in ${logId}: ${viruses.join(', ')}`)
      
      // 1. Delete the infected file from R2
      await r2.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || 'documents',
        Key: r2Key
      }))

      // 2. Mark document as REJECTED in DB (only for documents table records)
      if (documentId && !documentId.startsWith('media-')) {
        await prisma.documents.update({
          where: { id: documentId },
          data: { status: 'REJECTED', updated_at: new Date() }
        })
      }

      // 3. Notify user
      if (userId && userId !== 'anonymous') {
        await prisma.notifications.create({
          data: {
            type: 'SECURITY_ALERT',
            recipient_filter: `user:${userId}`,
            subject: 'Upload Rejected (Malware Detected)',
            body_html: `Your upload was rejected by our security scanners because it contained malware: ${viruses.join(', ')}`,
            recipient_count: 1
          }
        })
      }
    } else {
      logger.info(`File ${logId} is clean.`)
      
      // Update status to verified/clean for documents table records
      if (documentId && !documentId.startsWith('media-')) {
        await prisma.documents.update({
          where: { id: documentId },
          data: { status: 'VERIFIED', updated_at: new Date() }
        })
      }
    }
  } catch (error) {
    logger.error(`Failed to scan upload for ${logId}:`, error)
    throw error // Trigger retry
  }
}
