import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

/**
 * consent_log — immutable append-only record of every consent event.
 *
 * Required for GDPR, UK Online Safety Act, and age-appropriate design codes.
 * Rows are NEVER deleted (no deletedAt, no DELETE route).
 *
 * consentType values:
 *   terms_accepted   — user accepted the terms of service
 *   age_declaration  — user declared they are 18+
 *   terms_updated    — user re-accepted after a terms version change
 */
export const consentLog = pgTable("consent_log", {
  id: serial("id").primaryKey(),
  /** FK to users.id — no cascade delete: legal hold must survive account deletion. */
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  /** Machine-readable consent event type. */
  consentType: text("consent_type").notNull(),
  /** Future-proofing: version string for the terms document accepted (nullable). */
  termsVersion: varchar("terms_version", { length: 32 }),
  /** Requester IP at the time of acceptance (nullable — may be absent in some proxies). */
  ipAddress: varchar("ip_address", { length: 64 }),
  /** Full User-Agent string at the time of acceptance. */
  userAgent: text("user_agent"),
  /** Immutable creation timestamp — no updatedAt column. */
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ConsentLogRow = typeof consentLog.$inferSelect;
export type ConsentLogInsert = typeof consentLog.$inferInsert;
