import { db } from "@workspace/db";
import {
  generatedStories,
  userLibrary,
  userProgress,
  userTaste,
  generatedCache,
} from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

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
    await db
      .insert(generatedStories)
      .values({
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
      })
      .onConflictDoUpdate({
        target: generatedStories.id,
        set: {
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
        },
      });
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
    createdAt: row.createdAt?.toISOString(),
  };
}

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
          // 'generated' and 'variation' types
        ),
      )
      .orderBy(userLibrary.savedAt);
    return rows
      .filter((r) => r.type === "generated" || r.type === "variation")
      .map((r) => ({ storyId: r.storyId, type: r.type }))
      .reverse();
  },

  async addSaved(userId: string, storyId: string): Promise<void> {
    await db
      .insert(userLibrary)
      .values({ userId, storyId, type: "saved" })
      .onConflictDoUpdate({
        target: [userLibrary.userId, userLibrary.storyId],
        set: { type: "saved" },
      });
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
};

const defaultTaste = (): TasteProfile => ({
  tasteProfile: {},
  preferredIntensity: {},
  preferredVoiceFeel: {},
  preferredEndings: {},
  preferredRelationshipDynamics: {},
});

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
      })
      .onConflictDoUpdate({
        target: userTaste.userId,
        set: {
          tasteProfile: taste.tasteProfile,
          preferredIntensity: taste.preferredIntensity,
          preferredVoiceFeel: taste.preferredVoiceFeel,
          preferredEndings: taste.preferredEndings,
          preferredRelationshipDynamics: taste.preferredRelationshipDynamics,
        },
      });
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
