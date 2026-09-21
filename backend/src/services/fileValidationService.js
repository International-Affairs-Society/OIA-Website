// ============================================================
// fileValidationService.js — SEC-02
// Server-side file signature (magic bytes) validation.
// Checks: file size, allowed extension, MIME-to-signature match.
// ============================================================
import fs from 'fs/promises'
import path from 'path'

// Known magic byte signatures keyed by allowed MIME type.
// Each value is an array of valid signatures (some types have multiple).
const ALLOWED_SIGNATURES = {
  'application/pdf': [
    Buffer.from([0x25, 0x50, 0x44, 0x46]) // %PDF
  ],
  'image/jpeg': [
    Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]),
    Buffer.from([0xFF, 0xD8, 0xFF, 0xE1]),
    Buffer.from([0xFF, 0xD8, 0xFF, 0xE8])
  ],
  'image/png': [
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
  ],
  'image/gif': [
    Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]), // GIF89a
    Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61])  // GIF87a
  ],
  // DOCX / XLSX / PPTX are ZIP archives — same magic bytes
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    Buffer.from([0x50, 0x4B, 0x03, 0x04])
  ]
}

// Allowed file extensions (lowercase)
const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.docx'
])

// Maximum allowed file size: 10 MB
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

/**
 * Validates an uploaded file by checking:
 *  1. File size ≤ MAX_FILE_SIZE_BYTES
 *  2. Extension is in ALLOWED_EXTENSIONS
 *  3. Actual file header matches the declared MIME type
 *
 * @param {string} filePath        - Absolute path to the temp file on disk
 * @param {string} declaredMimetype - MIME type reported by multer / browser
 * @param {string} originalName    - Original filename (for extension check)
 * @returns {{ valid: boolean, errors: string[], quarantine: boolean }}
 */
export async function validateFileSignature(filePath, declaredMimetype, originalName) {
  const errors = []

  // 1. Size check
  try {
    const stat = await fs.stat(filePath)
    if (stat.size > MAX_FILE_SIZE_BYTES) {
      errors.push(`File size ${(stat.size / 1024 / 1024).toFixed(1)} MB exceeds the ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB limit`)
    }
  } catch {
    errors.push('Could not read file from disk')
    return { valid: false, errors, quarantine: true }
  }

  // 2. Extension check
  const ext = path.extname(originalName).toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    errors.push(`File extension '${ext}' is not permitted. Allowed: ${[...ALLOWED_EXTENSIONS].join(', ')}`)
  }

  // 3. MIME type must be in our allow-list
  const allowedSigs = ALLOWED_SIGNATURES[declaredMimetype]
  if (!allowedSigs) {
    errors.push(`MIME type '${declaredMimetype}' is not permitted`)
  } else {
    // 4. Magic bytes check — read only the first 8 bytes
    try {
      const header = Buffer.alloc(8)
      const fh = await fs.open(filePath, 'r')
      await fh.read(header, 0, 8, 0)
      await fh.close()

      const signatureMatches = allowedSigs.some(sig =>
        header.subarray(0, sig.length).equals(sig)
      )

      if (!signatureMatches) {
        errors.push(
          `File content does not match declared MIME type '${declaredMimetype}'.` +
          ` Possible spoofed extension (actual header: ${header.subarray(0, 4).toString('hex')})`
        )
      }
    } catch {
      errors.push('Could not read file header for validation')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    quarantine: errors.length > 0
  }
}
