import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2 } from '../lib/r2.js'

/**
 * Generates a pre-signed URL for a key in Cloudflare R2 bucket.
 * @param {string} key - The R2 object key.
 * @returns {Promise<string|null>} Pre-signed URL or null if error/empty.
 */
export async function getSignedR2Url(key) {
  if (!key) return null
  try {
    return await getSignedUrl(
      r2,
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || 'documents',
        Key: key
      }),
      { expiresIn: 900 } // 15 minutes
    )
  } catch (err) {
    console.error('Error generating pre-signed R2 URL for key:', key, err)
    return null
  }
}
