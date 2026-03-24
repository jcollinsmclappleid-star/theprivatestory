import {
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const generatedStories = pgTable("generated_stories", {
  id: text("id").primaryKey(),
  ownerUserId: text("owner_user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull().default(""),
  description: text("description").notNull().default(""),
  mood: text("mood").notNull().default(""),
  duration: text("duration").notNull().default(""),
  audioUrl: text("audio_url").notNull().default(""),
  scenes: jsonb("scenes").notNull().default([]),
  images: jsonb("images").notNull().default({}),
  brief: jsonb("brief").notNull().default({}),
  requestHash: text("request_hash"),
  variantType: text("variant_type"),
  parentStoryId: text("parent_story_id"),
  recommendationTags: jsonb("recommendation_tags").notNull().default([]),
  qc: jsonb("qc"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userLibrary = pgTable(
  "user_library",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    storyId: text("story_id").notNull(),
    type: text("type").notNull().default("saved"),
    savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("user_library_user_story_type_uniq").on(t.userId, t.storyId, t.type)],
);

export const userProgress = pgTable(
  "user_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    storyId: text("story_id").notNull(),
    audioProgressSeconds: real("audio_progress_seconds").notNull().default(0),
    sceneIndex: integer("scene_index").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.storyId] })],
);

export const userTaste = pgTable("user_taste", {
  userId: text("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  tasteProfile: jsonb("taste_profile").notNull().default({}),
  preferredIntensity: jsonb("preferred_intensity").notNull().default({}),
  preferredVoiceFeel: jsonb("preferred_voice_feel").notNull().default({}),
  preferredEndings: jsonb("preferred_endings").notNull().default({}),
  preferredRelationshipDynamics: jsonb("preferred_relationship_dynamics").notNull().default({}),
});

export const generatedCache = pgTable("generated_cache", {
  requestHash: text("request_hash").primaryKey(),
  storyId: text("story_id").notNull(),
});

export type GeneratedStoryRow = typeof generatedStories.$inferSelect;
export type UserLibraryRow = typeof userLibrary.$inferSelect;
export type UserProgressRow = typeof userProgress.$inferSelect;
export type UserTasteRow = typeof userTaste.$inferSelect;
export type GeneratedCacheRow = typeof generatedCache.$inferSelect;
