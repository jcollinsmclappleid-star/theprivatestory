import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON<T>(filename: string, defaultValue: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function writeJSON<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  const tempPath = filePath + ".tmp";
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempPath, filePath);
}

export type StoredStory = Record<string, unknown>;

export const storiesStore = {
  getAll(): Record<string, StoredStory> {
    return readJSON<Record<string, StoredStory>>("stories.json", {});
  },
  get(id: string): StoredStory | undefined {
    return this.getAll()[id];
  },
  set(id: string, story: StoredStory): void {
    const all = this.getAll();
    all[id] = story;
    writeJSON("stories.json", all);
  },
};

export type UserProfile = {
  savedStories: string[];
  generatedStories: string[];
  tasteProfile: Record<string, number>;
  preferredEndings: Record<string, number>;
  preferredIntensity: Record<string, number>;
  preferredVoiceFeel: Record<string, number>;
};

const defaultProfile = (): UserProfile => ({
  savedStories: [],
  generatedStories: [],
  tasteProfile: {},
  preferredEndings: {},
  preferredIntensity: {},
  preferredVoiceFeel: {},
});

export const usersStore = {
  getAll(): Record<string, UserProfile> {
    return readJSON<Record<string, UserProfile>>("users.json", {});
  },
  get(userId: string): UserProfile {
    return this.getAll()[userId] ?? defaultProfile();
  },
  set(userId: string, profile: UserProfile): void {
    const all = this.getAll();
    all[userId] = profile;
    writeJSON("users.json", all);
  },
};

export type ProgressEntry = {
  audioProgressSeconds: number;
  sceneIndex: number;
  updatedAt: string;
  storyId: string;
};

export const progressStore = {
  getAll(): Record<string, Record<string, ProgressEntry>> {
    return readJSON<Record<string, Record<string, ProgressEntry>>>("progress.json", {});
  },
  get(userId: string, storyId: string): ProgressEntry | undefined {
    return this.getAll()[userId]?.[storyId];
  },
  set(userId: string, storyId: string, entry: ProgressEntry): void {
    const all = this.getAll();
    if (!all[userId]) all[userId] = {};
    all[userId][storyId] = entry;
    writeJSON("progress.json", all);
  },
  getUserProgress(userId: string): Record<string, ProgressEntry> {
    return this.getAll()[userId] ?? {};
  },
};

export const generatedCacheStore = {
  getAll(): Record<string, string> {
    return readJSON<Record<string, string>>("generatedCache.json", {});
  },
  get(hash: string): string | undefined {
    return this.getAll()[hash];
  },
  set(hash: string, storyId: string): void {
    const all = this.getAll();
    all[hash] = storyId;
    writeJSON("generatedCache.json", all);
  },
};
