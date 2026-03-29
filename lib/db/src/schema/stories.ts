import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
  unique,
  date,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const series = pgTable("series", {
  id: text("id").primaryKey(),
  title: text("title").notNull().default(""),
  description: text("description").notNull().default(""),
  mood: text("mood").notNull().default(""),
  tags: jsonb("tags").notNull().default([]),
  coverImage: text("cover_image").notNull().default(""),
  episodeCount: integer("episode_count").notNull().default(5),
  seriesArc: text("series_arc").notNull().default(""),
  status: text("status").notNull().default("pending"),
  ownerUserId: text("owner_user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  castingData: jsonb("casting_data").notNull().default({}),
  chapterSummaries: jsonb("chapter_summaries").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

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
  categoryId: text("category_id"),
  subthemeId: text("subtheme_id"),
  isLibraryStory: boolean("is_library_story").notNull().default(false),
  status: text("status").notNull().default("published"),
  storyDna: jsonb("story_dna"),
  seriesId: text("series_id"),
  seriesEpisode: integer("series_episode"),
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
  lastActiveDate: date("last_active_date"),
  streakDays: integer("streak_days").notNull().default(0),
});

export const generatedCache = pgTable("generated_cache", {
  requestHash: text("request_hash").primaryKey(),
  storyId: text("story_id").notNull(),
});

export const userPresets = pgTable("user_presets", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull().default(""),
  castingData: jsonb("casting_data").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userNameUnique: unique("user_presets_user_name_unique").on(t.userId, t.name),
}));

export const userReactionHistory = pgTable("user_reaction_history", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  storyId: text("story_id").notNull(),
  storyTitle: text("story_title").notNull().default(""),
  tags: jsonb("tags").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const nameSubmissions = pgTable("name_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  submittedByUserId: text("submitted_by_user_id").references(() => usersTable.id, { onDelete: "set null" }),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  /** Whether this is a "listener" (the reader) or "partner" (love interest) name request */
  nameType: text("name_type", { enum: ["listener", "partner"] }).notNull().default("listener"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  notes: text("notes"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
});

export type GeneratedStoryRow = typeof generatedStories.$inferSelect;
export type UserLibraryRow = typeof userLibrary.$inferSelect;
export type UserProgressRow = typeof userProgress.$inferSelect;
export type UserTasteRow = typeof userTaste.$inferSelect;
export type GeneratedCacheRow = typeof generatedCache.$inferSelect;
export type UserPresetRow = typeof userPresets.$inferSelect;
export type UserReactionHistoryRow = typeof userReactionHistory.$inferSelect;
export type SeriesRow = typeof series.$inferSelect;
export type NameSubmissionRow = typeof nameSubmissions.$inferSelect;
