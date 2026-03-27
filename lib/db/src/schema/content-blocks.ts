import { serial, text, timestamp, pgTable } from "drizzle-orm/pg-core";

export const contentBlocks = pgTable("content_blocks", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  sessionId: text("session_id"),
  blockSource: text("block_source").notNull(),
  blockReason: text("block_reason").notNull(),
  inputHash: text("input_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
