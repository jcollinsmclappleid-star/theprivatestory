import { boolean, integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";
import { generatedStories } from "./stories";

/**
 * story_reports — user-submitted reports on generated stories.
 *
 * Replaces/extends the legacy user_reports table with richer moderation fields.
 * Admin reviews these in the moderation dashboard.
 */
export const storyReports = pgTable("story_reports", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  storyId: text("story_id").references(() => generatedStories.id, { onDelete: "set null" }),
  storyTitle: text("story_title"),
  reason: text("reason").notNull(),
  reasonCategory: text("reason_category").notNull(),
  note: text("note"),
  inputSnapshot: jsonb("input_snapshot"),
  outputExcerpt: text("output_excerpt"),
  status: text("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  actionTaken: text("action_taken"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type StoryReport = typeof storyReports.$inferSelect;
export type NewStoryReport = typeof storyReports.$inferInsert;

/**
 * moderation_events — automatically logged events from the generation pipeline.
 *
 * Covers: input blocked, output flagged, output blocked, scene regenerated,
 * severe policy violation. Each blocking point in generate.ts should write here.
 */
export const moderationEvents = pgTable("moderation_events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  storyId: text("story_id").references(() => generatedStories.id, { onDelete: "set null" }),
  requestId: text("request_id"),
  eventType: text("event_type").notNull(),
  severity: text("severity").notNull().default("medium"),
  reason: text("reason").notNull(),
  flagsJson: jsonb("flags_json"),
  inputSnapshotJson: jsonb("input_snapshot_json"),
  outputExcerpt: text("output_excerpt"),
  actionTaken: text("action_taken").notNull().default("block"),
  emailSent: boolean("email_sent").notNull().default(false),
  linkedReportId: integer("linked_report_id").references(() => storyReports.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ModerationEvent = typeof moderationEvents.$inferSelect;
export type NewModerationEvent = typeof moderationEvents.$inferInsert;
