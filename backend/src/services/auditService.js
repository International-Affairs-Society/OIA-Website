// ============================================================
// auditService.js — AUDIT-01
// Centralised audit log writer.
// Wraps prisma.audit_logs.create with a consistent structure.
// ============================================================
import prisma from '../lib/prisma.js'
import logger from '../lib/logger.js'

/**
 * Write a structured audit event.
 *
 * @param {Object} opts
 * @param {string}  opts.itemId        - ID of the affected entity
 * @param {string}  opts.action        - AuditAction enum value (e.g. 'Updated', 'Deleted')
 * @param {string}  opts.itemTitle     - Human-readable name of the entity
 * @param {string}  opts.itemType      - AuditItemType enum value (e.g. 'Program', 'MOU')
 * @param {Object}  opts.performedBy   - req.user object { id, name, role }
 * @param {string}  [opts.details]     - Free-text description of the action
 * @param {string}  [opts.previousValue] - JSON-serialisable previous state
 * @param {string}  [opts.newValue]    - JSON-serialisable new state
 */
export async function writeAudit({
  itemId,
  action,
  itemTitle,
  itemType,
  performedBy,
  details,
  previousValue,
  newValue
}) {
  try {
    let combinedDetails = details || ''
    if (previousValue !== undefined || newValue !== undefined) {
      const diff = ` | Prev: ${JSON.stringify(previousValue || {})} | New: ${JSON.stringify(newValue || {})}`
      combinedDetails = combinedDetails ? `${combinedDetails}${diff}` : diff
    }

    await prisma.audit_logs.create({
      data: {
        item_id:            itemId,
        action:             action,
        item_title:         itemTitle || 'Unknown',
        item_type:          itemType,
        performed_by_name:  performedBy?.name || 'Unknown',
        performed_by_role:  performedBy?.role || 'Unknown',
        details:            combinedDetails   || null
      }
    })
  } catch (err) {
    // Audit failures should never crash the main request
    logger.error('[auditService] Failed to write audit log:', err.message)
  }
}
