import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processFileUpload } from '../../src/workers/fileProcessor.js'

// Mock external dependencies
vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn().mockResolvedValue(Buffer.from('fake-file-content')),
    unlink: vi.fn().mockResolvedValue()
  }
}))

vi.mock('../../src/lib/r2.js', () => ({
  r2: {
    send: vi.fn()
  }
}))

vi.mock('../../src/lib/prisma.js', () => ({
  default: {
    notifications: {
      create: vi.fn().mockResolvedValue({})
    }
  }
}))

// Import the mocked modules to make assertions
import fs from 'fs/promises'
import { r2 } from '../../src/lib/r2.js'
import prisma from '../../src/lib/prisma.js'

describe('fileWorker - processFileUpload', () => {
  let mockJob

  beforeEach(() => {
    vi.clearAllMocks()

    mockJob = {
      data: {
        documentId: 'doc-123',
        filePath: '/tmp/fake-file.pdf',
        r2Key: 'documents/user-456/123-fake-file.pdf',
        mimetype: 'application/pdf',
        userId: 'user-456'
      }
    }
  })

  it('processes the file successfully and cleans up', async () => {
    r2.send.mockResolvedValueOnce({})

    await processFileUpload(mockJob)

    // Verify fs.readFile was called correctly
    expect(fs.readFile).toHaveBeenCalledWith('/tmp/fake-file.pdf')

    // Verify r2.send was called
    expect(r2.send).toHaveBeenCalledTimes(1)

    // Verify temporary file was deleted
    expect(fs.unlink).toHaveBeenCalledWith('/tmp/fake-file.pdf')

    // Verify no error notification was created
    expect(prisma.notifications.create).not.toHaveBeenCalled()
  })

  it('creates an error notification and re-throws when R2 upload fails', async () => {
    const fakeError = new Error('R2 Upload Failed')
    r2.send.mockRejectedValueOnce(fakeError)

    // The function should re-throw the error
    await expect(processFileUpload(mockJob)).rejects.toThrow('R2 Upload Failed')

    // Verify notification was created
    expect(prisma.notifications.create).toHaveBeenCalledTimes(1)
    expect(prisma.notifications.create).toHaveBeenCalledWith({
      data: {
        type: 'SYSTEM_ALERT',
        recipient_filter: 'user:user-456',
        subject: 'File Upload Failed',
        body_html: 'Your upload for 123-fake-file.pdf failed to process. Please try again.',
        recipient_count: 1
      }
    })

    // Verify cleanup still happened despite the error
    expect(fs.unlink).toHaveBeenCalledWith('/tmp/fake-file.pdf')
  })
})
