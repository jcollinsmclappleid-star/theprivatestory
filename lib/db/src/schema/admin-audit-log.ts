import { check, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./auth";

/**
 * admin_audit_log — immutable record of every privileged admin action.
 *
 * Written for GDPR / safeguarding compliance: every action that creates,
 * updates, or deletes a record must be traceable to an actor + timestamp.
 * Rows are never deleted (no deletedAt column).
 *
 * action allowed values (enforced by DB check constraint):
 *   name_approved | name_rejected
 *   risk_score_change
 *   content_block_dispositioned
 *   story_published | story_rejected
 *
 * targetType allowed values (enforced by DB check constraint):
 *   name_submission | user | content_block | story
 *
 * Both constraints must be updated in sync with writeAuditLog() call-sites.
 */
export const adminAuditLog = pgTable(
  "admin_audit_log",
  {
    id: serial("id").primaryKey(),
    /** better-auth user ID of the admin who performed the action. */
    actorUserId: text("actor_user_id").references(() => usersTable.id, { onDelete: "set null" }),
    /** Admin email — stored for human-readable reports even if the account is later deleted. */
    actorEmail: text("actor_email"),
    /** Machine-readable action label — constrained to known values. */
    action: text("action").notNull(),
    /** The entity type that was modified — constrained to known values. */
    targetType: text("target_type").notNull(),
    /** The primary-key string of the affected record. */
    targetId: text("target_id").notNull(),
    /** Flexible JSONB payload — before/after values, notes, score changes, etc. */
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      "admin_audit_log_action_check",
      sql`${table.action} IN (
        'name_approved', 'name_rejected',
        'risk_score_change',
        'content_block_dispositioned',
        'story_published', 'story_rejected',
        'moderation_reviewed'
      )`,
    ),
    check(
      "admin_audit_log_target_type_check",
      sql`${table.targetType} IN (
        'name_submission', 'user', 'content_block', 'story',
        'moderation_event', 'story_report'
      )`,
    ),
  ],
);

export type AdminAuditLogRow = typeof adminAuditLog.$inferSelect;
