import { db, adminAuditLog } from "@workspace/db";
import { logger } from "./logger.js";

/**
 * writeAuditLog — fire-and-forget admin audit trail entry.
 *
 * Every privileged admin action (name approve/reject, risk-score change,
 * content-block disposition, story publish/reject) must call this so the
 * action is traceable to an actor + timestamp for GDPR / safeguarding.
 *
 * The write is non-blocking: failures are logged but never surface to the
 * caller so a DB blip never breaks the admin action itself.
 *
 * @param actorUserId  better-auth user ID of the acting admin (null if unknown)
 * @param actorEmail   Admin email — stored even if account is later deleted
 * @param action       Machine-readable label (e.g. "name_approved")
 * @param targetType   Entity type modified (e.g. "name_submission")
 * @param targetId     Primary-key string of the affected record
 * @param metadata     Optional JSONB payload — before/after values, notes, etc.
 */
export function writeAuditLog(
  actorUserId: string | undefined | null,
  actorEmail: string | undefined | null,
  action: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, unknown>,
): void {
  db.insert(adminAuditLog)
    .values({
      actorUserId: actorUserId ?? null,
      actorEmail: actorEmail ?? null,
      action,
      targetType,
      targetId,
      metadata: metadata ?? null,
    })
    .catch((err: unknown) =>
      logger.error({ err, action, targetType, targetId }, "[audit-log] Failed to write audit log row"),
    );
}
