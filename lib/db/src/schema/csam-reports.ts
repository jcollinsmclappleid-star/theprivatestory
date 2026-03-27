import { serial, text, timestamp, pgTable } from "drizzle-orm/pg-core";

export const csamReports = pgTable("csam_reports", {
  id: serial("id").primaryKey(),
  contentBlockId: text("content_block_id").notNull(),
  reportedAt: timestamp("reported_at", { withTimezone: true }).notNull().defaultNow(),
  reportedTo: text("reported_to").notNull(),
  adminUserId: text("admin_user_id").notNull(),
  notes: text("notes"),
  preservedAt: timestamp("preserved_at", { withTimezone: true }).notNull().defaultNow(),
});
