// ============================================================
// mouExpiryProcessor.js — MOU-01
// BullMQ job processor: updates MOU statuses and creates
// admin notifications for upcoming/expired MOUs.
// Register as a repeatable job (daily cron) in server.js.
// ============================================================
import prisma from '../lib/prisma.js'
import logger from '../lib/logger.js'

// Days-before-expiry thresholds mapped to MOUStatus enum values
const EXPIRY_THRESHOLDS = [
  { days: 30,  status: 'Expiring_in_30_days'  },
  { days: 90,  status: 'Expiring_in_90_days'  },
  { days: 120, status: 'Expiring_in_120_days' }
]

export const processMouExpiry = async (job) => {
  logger.info(`[mouExpiryProcessor] Starting MOU expiry check (jobId: ${job?.id || 'manual'})...`)

  const now = new Date()

  // ── Step 1: Update statuses for expiring MOUs ─────────────
  for (const { days, status } of EXPIRY_THRESHOLDS) {
    // Find MOUs whose expiry date falls within the next `days` ± 1 day window.
    // The ±1 day window ensures the job catches MOUs even if it runs slightly
    // off-schedule (e.g. due to server restart).
    const windowStart = new Date(now)
    windowStart.setDate(now.getDate() + days - 1)

    const windowEnd = new Date(now)
    windowEnd.setDate(now.getDate() + days + 1)

    const expiringMous = await prisma.mous.findMany({
      where: {
        expiry_date: { gte: windowStart, lte: windowEnd },
        is_archived: false,
        deleted_at:  null,
        // Only update if not already set to this or a more urgent status
        NOT: { status: { in: ['Expired', status] } }
      },
      select: { id: true, name: true, partner_university: true, expiry_date: true }
    })

    for (const mou of expiringMous) {
      await prisma.mous.update({
        where: { id: mou.id },
        data:  { status: status, updated_at: new Date() }
      })

      // Create an admin notification for this MOU
      await prisma.notifications.create({
        data: {
          type:             'MOU_ALERT',
          recipient_filter: 'role:admin',
          subject:          `MOU Expiry Alert: "${mou.name}" expires in ~${days} days`,
          body_html: `
            <p>The MOU with <strong>${mou.partner_university}</strong> 
            (<em>${mou.name}</em>) is expiring on 
            <strong>${new Date(mou.expiry_date).toDateString()}</strong>.</p>
            <p>Please initiate the renewal process or mark it as Dormant.</p>
          `.trim(),
          recipient_count: 1
        }
      })

      logger.info(`[mouExpiryProcessor] MOU ${mou.id} ("${mou.name}") → ${status}`)
    }
  }

  // ── Step 2: Auto-expire overdue MOUs ─────────────────────
  const { count: expiredCount } = await prisma.mous.updateMany({
    where: {
      expiry_date: { lt: now },
      is_archived: false,
      deleted_at:  null,
      NOT: { status: 'Expired' }
    },
    data: { status: 'Expired', updated_at: new Date() }
  })

  if (expiredCount > 0) {
    logger.info(`[mouExpiryProcessor] Auto-expired ${expiredCount} MOU(s)`)
  }

  logger.info('[mouExpiryProcessor] Completed.')
}
