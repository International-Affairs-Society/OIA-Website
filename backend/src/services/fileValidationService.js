import fs from 'fs/promises'
import path from 'path'
import { fileTypeFromFile } from 'file-type'

// Allowed file extensions (lowercase)
const ALLOWED_EXTENSIONS = new Set([
  'pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'docx', 'xlsx', 'pptx',
  'mp4', 'webm', 'mov', 'avi', 'mkv'
])

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
])

// Maximum allowed file size: 50 MB
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024

export async function validateFileSignature(filePath, declaredMimetype, originalName) {
  const errors = []

  // 1. Size check
  try {
    const stat = await fs.stat(filePath)
    if (stat.size > MAX_FILE_SIZE_BYTES) {
      errors.push(`File size ${(stat.size / 1024 / 1024).toFixed(1)} MB exceeds the limit`)
    }
  } catch {
    errors.push('Could not read file from disk')
    return { valid: false, errors, quarantine: true }
  }

  // 2. file-type magic bytes check
  const typeInfo = await fileTypeFromFile(filePath)
  if (!typeInfo) {
    errors.push('Could not determine file type from magic bytes')
  } else {
    if (!ALLOWED_EXTENSIONS.has(typeInfo.ext) || !ALLOWED_MIME_TYPES.has(typeInfo.mime)) {
      errors.push(`Actual file type '${typeInfo.mime}' with extension '${typeInfo.ext}' is not permitted`)
    }
    if (typeInfo.mime !== declaredMimetype && declaredMimetype !== 'application/octet-stream') {
      errors.push(`Declared MIME type '${declaredMimetype}' does not match actual type '${typeInfo.mime}'`)
    }
  }

  // 3. Extension check against original filename
  const originalExt = path.extname(originalName).toLowerCase().replace('.', '')
  if (!ALLOWED_EXTENSIONS.has(originalExt)) {
    errors.push(`Original file extension '${originalExt}' is not permitted.`)
  }

  return {
    valid: errors.length === 0,
    errors,
    quarantine: errors.length > 0
  }
}
