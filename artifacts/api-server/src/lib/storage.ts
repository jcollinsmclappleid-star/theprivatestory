import { db } from "@workspace/db";
import {
  generatedStories,
  userLibrary,
  userProgress,
  userTaste,
  generatedCache,
  userPresets,
  userReactionHistory,
  series,
} from "@workspace/db/schema";
import { eq, and, inArray, desc } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StoredStory = Record<string, unknown>;

export type UserProfile = {
  savedStories: string[];
  generatedStories: string[];
  tasteProfile: Record<string, number>;
  preferredEndings: Record<string, number>;
  preferredIntensity: Record<string, number>;
  preferredVoiceFeel: Record<string, number>;
  preferredRelationshipDynamics: Record<string, number>;
};

export type ProgressEntry = {
  audioProgressSeconds: number;
  sceneIndex: number;
  updatedAt: string;
  storyId: string;
};

// ---------------------------------------------------------------------------
// storiesStore — backed by `generated_stories` table
// ---------------------------------------------------------------------------

export const storiesStore = {
  async getAll(): Promise<Record<string, StoredStory>> {
    const rows = await db.select().from(generatedStories);
    const map: Record<string, StoredStory> = {};
    for (const row of rows) {
      map[row.id] = rowToStoredStory(row);
    }
    return map;
  },

  async get(id: string): Promise<StoredStory | undefined> {
    const [row] = await db
      .select()
      .from(generatedStories)
      .where(eq(generatedStories.id, id));
    if (!row) return undefined;
    return rowToStoredStory(row);
  },

  async set(id: string, story: StoredStory): Promise<void> {
    const values = {
      id,
      ownerUserId: (story.ownerUserId as string | null) ?? null,
      title: (story.title as string) ?? "",
      description: (story.description as string) ?? "",
      mood: (story.mood as string) ?? "",
      duration: (story.duration as string) ?? "",
      audioUrl: (story.audioUrl as string) ?? "",
      scenes: (story.scenes ?? []) as unknown[],
      images: (story.images ?? {}) as Record<string, unknown>,
      brief: (story.brief ?? {}) as Record<string, unknown>,
      requestHash: (story.requestHash as string | null) ?? (story.id as string | null) ?? null,
      variantType: (story.variant_type as string | null) ?? null,
      parentStoryId: (story.parent_story_id as string | null) ?? null,
      recommendationTags: (story.recommendation_tags ?? []) as unknown[],
      qc: (story.qc ?? null) as Record<string, unknown> | null,
      categoryId: (story.categoryId as string | null) ?? null,
      subthemeId: (story.subthemeId as string | null) ?? null,
      isLibraryStory: (story.isLibraryStory as boolean) ?? false,
      status: (story.status as string) ?? "published",
      storyDna: (story.storyDna ?? null) as Record<string, unknown> | null,
      seriesId: (story.seriesId as string | null) ?? null,
      seriesEpisode: (story.seriesEpisode as number | null) ?? null,
    };
    const updateSet = {
      title: values.title,
      description: values.description,
      mood: values.mood,
      duration: values.duration,
      audioUrl: values.audioUrl,
      scenes: values.scenes,
      images: values.images,
      brief: values.brief,
      requestHash: values.requestHash,
      variantType: values.variantType,
      parentStoryId: values.parentStoryId,
      recommendationTags: values.recommendationTags,
      qc: values.qc,
      categoryId: values.categoryId,
      subthemeId: values.subthemeId,
      isLibraryStory: values.isLibraryStory,
      status: values.status,
      storyDna: values.storyDna,
      seriesId: values.seriesId,
      seriesEpisode: values.seriesEpisode,
    };
    await db
      .insert(generatedStories)
      .values(values)
      .onConflictDoUpdate({ target: generatedStories.id, set: updateSet });
  },

  async updateStatus(id: string, status: "draft" | "published" | "skipped"): Promise<void> {
    await db
      .update(generatedStories)
      .set({ status })
      .where(eq(generatedStories.id, id));
  },

  async getLibraryStories(status?: string): Promise<StoredStory[]> {
    const rows = await db
      .select()
      .from(generatedStories)
      .where(
        status
          ? and(eq(generatedStories.isLibraryStory, true), eq(generatedStories.status, status))
          : eq(generatedStories.isLibraryStory, true)
      )
      .orderBy(generatedStories.createdAt);
    return rows.map(rowToStoredStory);
  },

  async getRecentDna(limit = 20): Promise<Record<string, unknown>[]> {
    const rows = await db
      .select({ storyDna: generatedStories.storyDna })
      .from(generatedStories)
      .where(eq(generatedStories.isLibraryStory, true))
      .orderBy(generatedStories.createdAt)
      .limit(limit);
    return rows
      .map((r) => r.storyDna as Record<string, unknown> | null)
      .filter((d): d is Record<string, unknown> => d != null);
  },
};

function rowToStoredStory(row: typeof generatedStories.$inferSelect): StoredStory {
  return {
    id: row.id,
    ownerUserId: row.ownerUserId,
    title: row.title,
    description: row.description,
    mood: row.mood,
    duration: row.duration,
    audioUrl: row.audioUrl,
    scenes: row.scenes,
    images: row.images,
    brief: row.brief,
    requestHash: row.requestHash,
    variant_type: row.variantType,
    parent_story_id: row.parentStoryId,
    recommendation_tags: row.recommendationTags,
    qc: row.qc,
    categoryId: row.categoryId,
    subthemeId: row.subthemeId,
    isLibraryStory: row.isLibraryStory,
    status: row.status,
    storyDna: row.storyDna,
    seriesId: row.seriesId,
    seriesEpisode: row.seriesEpisode,
    createdAt: row.createdAt?.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// seriesStore — backed by `series` table
// ---------------------------------------------------------------------------

export const seriesStore = {
  async getAll(): Promise<typeof series.$inferSelect[]> {
    return db.select().from(series).orderBy(series.createdAt);
  },

  async get(id: string): Promise<typeof series.$inferSelect | undefined> {
    const [row] = await db.select().from(series).where(eq(series.id, id));
    return row;
  },

  async set(s: {
    id: string;
    title: string;
    description: string;
    mood: string;
    tags: string[];
    coverImage: string;
    episodeCount: number;
    seriesArc: string;
    status: string;
  }): Promise<void> {
    await db
      .insert(series)
      .values(s)
      .onConflictDoUpdate({
        target: series.id,
        set: { title: s.title, description: s.description, mood: s.mood, tags: s.tags, coverImage: s.coverImage, episodeCount: s.episodeCount, seriesArc: s.seriesArc, status: s.status },
      });
  },

  async updateStatus(id: string, status: string): Promise<void> {
    await db.update(series).set({ status }).where(eq(series.id, id));
  },

  async updateCoverImage(id: string, coverImage: string): Promise<void> {
    await db.update(series).set({ coverImage }).where(eq(series.id, id));
  },

  async getEpisodes(seriesId: string): Promise<StoredStory[]> {
    const rows = await db
      .select()
      .from(generatedStories)
      .where(eq(generatedStories.seriesId, seriesId))
      .orderBy(generatedStories.seriesEpisode);
    return rows.map(rowToStoredStory);
  },
};

// ---------------------------------------------------------------------------
// libraryStore — backed by `user_library` table
// ---------------------------------------------------------------------------

export const libraryStore = {
  async getSavedStoryIds(userId: string): Promise<string[]> {
    const rows = await db
      .select()
      .from(userLibrary)
      .where(and(eq(userLibrary.userId, userId), eq(userLibrary.type, "saved")))
      .orderBy(userLibrary.savedAt);
    return rows.map((r) => r.storyId).reverse();
  },

  async getGeneratedStoryIds(userId: string): Promise<{ storyId: string; type: string }[]> {
    const rows = await db
      .select()
      .from(userLibrary)
      .where(
        and(
          eq(userLibrary.userId, userId),
          inArray(userLibrary.type, ["generated", "variation"]),
        ),
      )
      .orderBy(userLibrary.savedAt);
    return rows.map((r) => ({ storyId: r.storyId, type: r.type })).reverse();
  },

  async addSaved(userId: string, storyId: string): Promise<void> {
    await db
      .insert(userLibrary)
      .values({ userId, storyId, type: "saved" })
      .onConflictDoNothing();
  },

  async removeSaved(userId: string, storyId: string): Promise<void> {
    await db
      .delete(userLibrary)
      .where(
        and(
          eq(userLibrary.userId, userId),
          eq(userLibrary.storyId, storyId),
          eq(userLibrary.type, "saved"),
        ),
      );
  },

  async addGenerated(userId: string, storyId: string, variantType?: string | null): Promise<void> {
    const type = variantType ? "variation" : "generated";
    await db
      .insert(userLibrary)
      .values({ userId, storyId, type })
      .onConflictDoNothing();
  },
};

// ---------------------------------------------------------------------------
// tasteStore — backed by `user_taste` table
// ---------------------------------------------------------------------------

export type TasteProfile = {
  tasteProfile: Record<string, number>;
  preferredIntensity: Record<string, number>;
  preferredVoiceFeel: Record<string, number>;
  preferredEndings: Record<string, number>;
  preferredRelationshipDynamics: Record<string, number>;
  lastActiveDate: string | null;
  streakDays: number;
};

const defaultTaste = (): TasteProfile => ({
  tasteProfile: {},
  preferredIntensity: {},
  preferredVoiceFeel: {},
  preferredEndings: {},
  preferredRelationshipDynamics: {},
  lastActiveDate: null,
  streakDays: 0,
});

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function computeStreak(currentStreak: number, lastActive: string | null): { streakDays: number; lastActiveDate: string } {
  const today = todayDateString();
  if (!lastActive) return { streakDays: 1, lastActiveDate: today };
  if (lastActive === today) return { streakDays: currentStreak, lastActiveDate: today };
  const last = new Date(lastActive);
  const now = new Date(today);
  const diffDays = Math.round((now.getTime() - last.getTime()) / 86_400_000);
  if (diffDays === 1) return { streakDays: currentStreak + 1, lastActiveDate: today };
  return { streakDays: 1, lastActiveDate: today };
}

export const tasteStore = {
  async get(userId: string): Promise<TasteProfile> {
    const [row] = await db
      .select()
      .from(userTaste)
      .where(eq(userTaste.userId, userId));
    if (!row) return defaultTaste();
    return {
      tasteProfile: (row.tasteProfile as Record<string, number>) ?? {},
      preferredIntensity: (row.preferredIntensity as Record<string, number>) ?? {},
      preferredVoiceFeel: (row.preferredVoiceFeel as Record<string, number>) ?? {},
      preferredEndings: (row.preferredEndings as Record<string, number>) ?? {},
      preferredRelationshipDynamics: (row.preferredRelationshipDynamics as Record<string, number>) ?? {},
      lastActiveDate: row.lastActiveDate ?? null,
      streakDays: row.streakDays ?? 0,
    };
  },

  async upsert(userId: string, taste: TasteProfile): Promise<void> {
    await db
      .insert(userTaste)
      .values({
        userId,
        tasteProfile: taste.tasteProfile,
        preferredIntensity: taste.preferredIntensity,
        preferredVoiceFeel: taste.preferredVoiceFeel,
        preferredEndings: taste.preferredEndings,
        preferredRelationshipDynamics: taste.preferredRelationshipDynamics,
        lastActiveDate: taste.lastActiveDate ?? null,
        streakDays: taste.streakDays ?? 0,
      })
      .onConflictDoUpdate({
        target: userTaste.userId,
        set: {
          tasteProfile: taste.tasteProfile,
          preferredIntensity: taste.preferredIntensity,
          preferredVoiceFeel: taste.preferredVoiceFeel,
          preferredEndings: taste.preferredEndings,
          preferredRelationshipDynamics: taste.preferredRelationshipDynamics,
          lastActiveDate: taste.lastActiveDate ?? null,
          streakDays: taste.streakDays ?? 0,
        },
      });
  },

  async incrementStreak(userId: string): Promise<{ streakDays: number }> {
    const current = await this.get(userId);
    const { streakDays, lastActiveDate } = computeStreak(current.streakDays, current.lastActiveDate);
    await this.upsert(userId, { ...current, streakDays, lastActiveDate });
    return { streakDays };
  },

  async mergeReaction(userId: string, reactionTags: string[]): Promise<void> {
    const current = await this.get(userId);
    const profile = { ...current.tasteProfile };
    for (const tag of reactionTags) {
      profile[tag] = (profile[tag] ?? 0) + 1;
    }
    await this.upsert(userId, { ...current, tasteProfile: profile });
  },
};

// ---------------------------------------------------------------------------
// progressStore — backed by `user_progress` table
// ---------------------------------------------------------------------------

export const progressStore = {
  async get(userId: string, storyId: string): Promise<ProgressEntry | undefined> {
    const [row] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.storyId, storyId)));
    if (!row) return undefined;
    return {
      audioProgressSeconds: row.audioProgressSeconds,
      sceneIndex: row.sceneIndex,
      updatedAt: row.updatedAt.toISOString(),
      storyId: row.storyId,
    };
  },

  async set(userId: string, storyId: string, entry: ProgressEntry): Promise<void> {
    await db
      .insert(userProgress)
      .values({
        userId,
        storyId,
        audioProgressSeconds: entry.audioProgressSeconds,
        sceneIndex: entry.sceneIndex,
        updatedAt: new Date(entry.updatedAt),
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.storyId],
        set: {
          audioProgressSeconds: entry.audioProgressSeconds,
          sceneIndex: entry.sceneIndex,
          updatedAt: new Date(entry.updatedAt),
        },
      });
  },

  async delete(userId: string, storyId: string): Promise<void> {
    await db
      .delete(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.storyId, storyId)));
  },

  async getUserProgress(userId: string): Promise<Record<string, ProgressEntry>> {
    const rows = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
    const map: Record<string, ProgressEntry> = {};
    for (const row of rows) {
      map[row.storyId] = {
        audioProgressSeconds: row.audioProgressSeconds,
        sceneIndex: row.sceneIndex,
        updatedAt: row.updatedAt.toISOString(),
        storyId: row.storyId,
      };
    }
    return map;
  },
};

// ---------------------------------------------------------------------------
// generatedCacheStore — backed by `generated_cache` table
// ---------------------------------------------------------------------------

export const generatedCacheStore = {
  async get(hash: string): Promise<string | undefined> {
    const [row] = await db
      .select()
      .from(generatedCache)
      .where(eq(generatedCache.requestHash, hash));
    return row?.storyId;
  },

  async set(hash: string, storyId: string): Promise<void> {
    await db
      .insert(generatedCache)
      .values({ requestHash: hash, storyId })
      .onConflictDoUpdate({
        target: generatedCache.requestHash,
        set: { storyId },
      });
  },
};

// ---------------------------------------------------------------------------
// presetsStore — backed by `user_presets` table
// ---------------------------------------------------------------------------

export type CastingPreset = {
  id: number;
  name: string;
  castingData: Record<string, unknown>;
  createdAt: string;
};

export const presetsStore = {
  async getAll(userId: string): Promise<CastingPreset[]> {
    const rows = await db
      .select()
      .from(userPresets)
      .where(eq(userPresets.userId, userId))
      .orderBy(userPresets.createdAt);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      castingData: (r.castingData as Record<string, unknown>) ?? {},
      createdAt: r.createdAt.toISOString(),
    })).reverse();
  },

  async create(userId: string, name: string, castingData: Record<string, unknown>): Promise<CastingPreset> {
    const [row] = await db
      .insert(userPresets)
      .values({ userId, name, castingData })
      .returning();
    return {
      id: row.id,
      name: row.name,
      castingData: (row.castingData as Record<string, unknown>) ?? {},
      createdAt: row.createdAt.toISOString(),
    };
  },

  async delete(userId: string, id: number): Promise<void> {
    await db
      .delete(userPresets)
      .where(and(eq(userPresets.id, id), eq(userPresets.userId, userId)));
  },
};

// ---------------------------------------------------------------------------
// reactionHistoryStore — backed by `user_reaction_history` table
// ---------------------------------------------------------------------------

export type ReactionHistoryEntry = {
  id: number;
  storyId: string;
  storyTitle: string;
  tags: string[];
  createdAt: string;
};

export const reactionHistoryStore = {
  async addEntry(userId: string, storyId: string, storyTitle: string, tags: string[]): Promise<void> {
    await db.insert(userReactionHistory).values({ userId, storyId, storyTitle, tags });
  },

  async getRecent(userId: string, limit = 5): Promise<ReactionHistoryEntry[]> {
    const rows = await db
      .select()
      .from(userReactionHistory)
      .where(eq(userReactionHistory.userId, userId))
      .orderBy(desc(userReactionHistory.createdAt))
      .limit(limit);
    return rows.map((r) => ({
      id: r.id,
      storyId: r.storyId,
      storyTitle: r.storyTitle,
      tags: (r.tags as string[]) ?? [],
      createdAt: r.createdAt.toISOString(),
    }));
  },
};

// ---------------------------------------------------------------------------
// usersStore — kept for backwards compat (combines taste + library)
// ---------------------------------------------------------------------------

export const usersStore = {
  async get(userId: string): Promise<UserProfile> {
    const [taste, savedIds, generatedRows] = await Promise.all([
      tasteStore.get(userId),
      libraryStore.getSavedStoryIds(userId),
      libraryStore.getGeneratedStoryIds(userId),
    ]);
    return {
      savedStories: savedIds,
      generatedStories: generatedRows.map((r) => r.storyId),
      tasteProfile: taste.tasteProfile,
      preferredEndings: taste.preferredEndings,
      preferredIntensity: taste.preferredIntensity,
      preferredVoiceFeel: taste.preferredVoiceFeel,
      preferredRelationshipDynamics: taste.preferredRelationshipDynamics,
    };
  },
};
