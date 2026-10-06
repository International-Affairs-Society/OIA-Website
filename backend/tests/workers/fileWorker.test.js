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
    },
    documents: {
      update: vi.fn().mockResolvedValue({})
    }
  }
}))

const mockScanStream = vi.fn().mockResolvedValue({ isInfected: false, viruses: [] })
vi.mock('clamscan', () => {
  return {
    default: class MockNodeClam {
      async init() {
        return {
          scanStream: mockScanStream
        }
      }
    }
  }
})

// Import the mocked modules to make assertions
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

  it('processes the file successfully and updates document status', async () => {
    r2.send.mockResolvedValueOnce({ Body: 'mock-stream' })
    mockScanStream.mockResolvedValueOnce({ isInfected: false, viruses: [] })

    await processFileUpload(mockJob)

    expect(r2.send).toHaveBeenCalledTimes(1)
    expect(prisma.documents.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'doc-123' },
      data: expect.objectContaining({ status: 'VERIFIED' })
    }))
  })

  it('rejects infected files, deletes from R2 and alerts user', async () => {
    r2.send.mockResolvedValueOnce({ Body: 'mock-stream' }) // for GetObject
    r2.send.mockResolvedValueOnce({}) // for DeleteObject
    mockScanStream.mockResolvedValueOnce({ isInfected: true, viruses: ['Eicar-Test-Signature'] })

    await processFileUpload(mockJob)

    // Delete from R2 called
    expect(r2.send).toHaveBeenCalledTimes(2)
    // Document status updated to REJECTED
    expect(prisma.documents.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'doc-123' },
      data: expect.objectContaining({ status: 'REJECTED' })
    }))
    // User alerted
    expect(prisma.notifications.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        type: 'SECURITY_ALERT',
        recipient_filter: 'user:user-456'
      })
    }))
  })
})
