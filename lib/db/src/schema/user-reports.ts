import { serial, text, timestamp, pgTable } from "drizzle-orm/pg-core";

export const userReports = pgTable("user_reports", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  storyId: text("story_id"),
  generationSessionId: text("generation_session_id"),
  category: text("category").notNull(),
  notes: text("notes"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewedBy: text("reviewed_by"),
  resolution: text("resolution"),
});
