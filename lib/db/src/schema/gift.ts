import {
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const giftOrders = pgTable("gift_orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => usersTable.id, { onDelete: "set null" }),

  recipientType: text("recipient_type").notNull().default(""),
  occasion: text("occasion").notNull().default(""),

  yourName: text("your_name").notNull().default(""),
  partnerName: text("partner_name").notNull().default(""),
  nickname: text("nickname").notNull().default(""),
  relationshipDetail: text("relationship_detail").notNull().default(""),
  specialMemory: text("special_memory").notNull().default(""),

  mood: text("mood").notNull().default(""),
  setting: text("setting").notNull().default(""),
  customSetting: text("custom_setting").notNull().default(""),

  voicePreference: text("voice_preference").notNull().default(""),
  storyLength: text("story_length").notNull().default(""),

  addons: jsonb("addons").notNull().default([]),
  giftMessage: text("gift_message").notNull().default(""),

  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull().default("0"),
  addonTotal: numeric("addon_total", { precision: 10, scale: 2 }).notNull().default("0"),
  finalPrice: numeric("final_price", { precision: 10, scale: 2 }).notNull().default("0"),

  status: text("status").notNull().default("pending_payment"),
  stripeSessionId: text("stripe_session_id"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type GiftOrderRow = typeof giftOrders.$inferSelect;
export type GiftOrderInsert = typeof giftOrders.$inferInsert;
