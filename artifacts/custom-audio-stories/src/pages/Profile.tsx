import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Heart, BookOpen, Flame, User, ChevronRight,
  Trash2, Wand2, Play, Library, ArrowRight, Star, Zap, LogIn,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useAudioPlayer } from "@/store/use-audio-player";
import type { Story } from "@workspace/api-client-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TasteProfile = {
  tasteProfile: Record<string, number>;
  preferredIntensity: Record<string, number>;
  preferredVoiceFeel: Record<string, number>;
  preferredRelationshipDynamics: Record<string, number>;
  preferredEndings: Record<string, number>;
  streakDays: number;
  reactionHistory?: Array<{ storyId: string; reactions: string[]; createdAt: string }>;
};

type CastingPreset = {
  id: number;
  name: string;
  castingData: Record<string, unknown>;
  createdAt: string;
};

type LibraryData = {
  saved: Story[];
  generated: Story[];
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function useTaste(isAuthenticated: boolean) {
  const [data, setData] = useState<TasteProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    fetch(`${API_BASE}/api/me/taste`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return { data, loading };
}

function usePresets(isAuthenticated: boolean) {
  const [presets, setPresets] = useState<CastingPreset[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    fetch(`${API_BASE}/api/me/presets`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : [])
      .then(setPresets)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  useEffect(() => { reload(); }, [reload]);

  const deletePreset = useCallback(async (id: number) => {
    await fetch(`${API_BASE}/api/me/presets/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setPresets((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { presets, loading, deletePreset };
}

function useLibrary(isAuthenticated: boolean) {
  const [data, setData] = useState<LibraryData>({ saved: [], generated: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    fetch(`${API_BASE}/api/me/library`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return { data, loading };
}

type ReactionHistoryEntry = {
  id: number;
  storyId: string;
  storyTitle: string;
  tags: string[];
  createdAt: string;
};

function useReactionHistory(isAuthenticated: boolean) {
  const [items, setItems] = useState<ReactionHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    fetch(`${API_BASE}/api/me/reaction-history`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setItems(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return { items, loading };
}

function useContinueListening(isAuthenticated: boolean) {
  const [items, setItems] = useState<(Story & { progress?: Record<string, unknown> })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    fetch(`${API_BASE}/api/me/continue-listening`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setItems(d.slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return { items, loading };
}

// ---------------------------------------------------------------------------
// Helper: top entry from a score map
// ---------------------------------------------------------------------------
function topEntry(map: Record<string, number>): string | null {
  const entries = Object.entries(map).filter(([, v]) => v > 0);
  if (!entries.length) return null;
  return entries.sort(([, a], [, b]) => b - a)[0][0];
}

function totalSignals(taste: TasteProfile): number {
  const sum = (m: Record<string, number>) => Object.values(m).reduce((a, b) => a + b, 0);
  return sum(taste.tasteProfile) + sum(taste.preferredIntensity);
}

// ---------------------------------------------------------------------------
// Taste summary text
// ---------------------------------------------------------------------------
function TasteSummaryText({ taste }: { taste: TasteProfile }) {
  const signals = totalSignals(taste);
  if (signals < 3) {
    return (
      <p className="text-muted-foreground text-sm leading-relaxed">
        Listen to a few more stories and your personal taste profile will take shape here.
      </p>
    );
  }

  const topMood = topEntry(taste.tasteProfile);
  const topIntensity = topEntry(taste.preferredIntensity);
  const topDynamic = topEntry(taste.preferredRelationshipDynamics);
  const topVoice = topEntry(taste.preferredVoiceFeel);

  const parts: string[] = [];
  if (topMood) parts.push(topMood);
  if (topIntensity) parts.push(topIntensity);
  if (topDynamic) parts.push(topDynamic);

  return (
    <div className="space-y-2">
      <p className="text-foreground text-sm font-medium">
        Your taste leans toward{" "}
        <span className="text-primary">{parts.join(", ")}</span>
        {topVoice ? (
          <>
            {" "}with a preference for{" "}
            <span className="text-primary/80">{topVoice}</span>.
          </>
        ) : "."}
      </p>
      <p className="text-xs text-muted-foreground">
        Based on {signals} signal{signals !== 1 ? "s" : ""} from your listening history.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Story mini card (horizontal)
// ---------------------------------------------------------------------------
function StoryMiniCard({ story, episodeLabel }: { story: Story; episodeLabel?: string }) {
  const { play } = useAudioPlayer();

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-border/20 hover:border-primary/20 transition-all group">
      {story.coverImage ? (
        <img
          src={story.coverImage}
          alt={story.title}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-primary/50" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {episodeLabel && (
          <p className="text-[10px] font-medium text-primary/60 uppercase tracking-widest mb-0.5">{episodeLabel}</p>
        )}
        <p className="text-sm font-medium text-foreground truncate">{story.title}</p>
        <p className="text-xs text-muted-foreground truncate">{story.mood} · {story.duration}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href={`/story/${story.id}`}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
        {story.audioUrl && (
          <button
            onClick={() => play(story)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat badge
// ---------------------------------------------------------------------------
function StatBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="glass-panel rounded-2xl p-5 text-center">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <p className="text-2xl font-display font-bold text-primary mb-1">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preset card
// ---------------------------------------------------------------------------
function PresetCard({
  preset,
  onDelete,
  onUse,
}: {
  preset: CastingPreset;
  onDelete: (id: number) => void;
  onUse: (preset: CastingPreset) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  const cd = preset.castingData as Record<string, string>;

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border/30 bg-card/40 hover:border-primary/20 transition-all group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{preset.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {[cd.archetype, cd.dynamic, cd.intensity].filter(Boolean).join(" · ")}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onUse(preset)}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20"
        >
          <Wand2 className="w-3 h-3" />
          Use
        </button>
        {confirming ? (
          <button
            onClick={() => { onDelete(preset.id); setConfirming(false); }}
            className="text-xs text-red-400 px-2 py-1 rounded-full border border-red-400/30 hover:bg-red-400/10 transition-colors"
          >
            Confirm
          </button>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick Create banner
// ---------------------------------------------------------------------------
function QuickCreateBanner({ taste }: { taste: TasteProfile }) {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);

  const signals = totalSignals(taste);
  if (signals < 5) return null;

  const handleClick = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/me/quick-create-params`, { credentials: "include" });
      if (!r.ok) return;
      const params = await r.json();
      if (params.eligible === false) return;
      sessionStorage.setItem("quickCreateParams", JSON.stringify(params));
      navigate("/create");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Write one for me</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            We know your taste. Let us write the perfect story without a single question.
          </p>
        </div>
        <button
          onClick={handleClick}
          disabled={loading}
          className="flex-shrink-0 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all shadow-glow disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Generate
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Profile page
// ---------------------------------------------------------------------------
export default function Profile() {
  const { user, isAuthenticated, isLoading, openSignIn } = useAuth();
  const [, navigate] = useLocation();
  const { data: taste, loading: tasteLoading } = useTaste(isAuthenticated);
  const { presets, loading: presetsLoading, deletePreset } = usePresets(isAuthenticated);
  const { data: library, loading: libraryLoading } = useLibrary(isAuthenticated);
  const { items: continueItems, loading: continueLoading } = useContinueListening(isAuthenticated);
  const { items: reactionHistory } = useReactionHistory(isAuthenticated);

  const handleUsePreset = useCallback((preset: CastingPreset) => {
    sessionStorage.setItem("castingPreset", JSON.stringify(preset.castingData));
    navigate("/create");
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Your private profile</h2>
          <p className="text-muted-foreground max-w-sm">
            Sign in to see your taste profile, saved stories, and casting presets.
          </p>
        </div>
        <button
          onClick={openSignIn}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </button>
      </div>
    );
  }

  const displayName = user?.firstName ?? user?.name ?? "You";
  const avatar = user?.profileImageUrl ?? user?.image;
  const streakDays = taste?.streakDays ?? 0;
  const savedCount = library.saved.length;
  const generatedCount = library.generated.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-4 py-10 space-y-10"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center gap-5">
        {avatar ? (
          <img src={avatar} alt={displayName} className="w-16 h-16 rounded-full object-cover border-2 border-primary/30" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{displayName}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Stats row */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-3 gap-3">
        <StatBadge
          icon={<Flame className="w-5 h-5 text-primary" />}
          label="Evening streak"
          value={streakDays >= 1 ? `${streakDays} ${streakDays === 1 ? "evening" : "evenings"}` : "—"}
        />
        <StatBadge
          icon={<Sparkles className="w-5 h-5 text-primary" />}
          label="Stories created"
          value={generatedCount}
        />
        <StatBadge
          icon={<Heart className="w-5 h-5 text-primary" />}
          label="Stories saved"
          value={savedCount}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Taste Profile */}
      {/* ------------------------------------------------------------------ */}
      <section className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Your Taste</h2>
          </div>
          <Link href="/library" className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            Full library <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {tasteLoading ? (
          <div className="h-10 bg-card/50 rounded-lg animate-pulse" />
        ) : taste ? (
          <>
            <TasteSummaryText taste={taste} />

            {/* Top moods / reaction summary */}
            {(() => {
              const moodEntries = Object.entries(taste.tasteProfile)
                .filter(([, v]) => v > 0)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5);
              if (!moodEntries.length) return null;
              return (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">What you've been drawn to:</p>
                  <div className="flex flex-wrap gap-2">
                    {moodEntries.map(([mood, count]) => (
                      <span
                        key={mood}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-foreground"
                      >
                        <span className="text-primary font-medium">{mood}</span>
                        {count > 1 && <span className="text-muted-foreground/60">×{count}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {taste && totalSignals(taste) >= 5 && (
              <QuickCreateBanner taste={taste} />
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Start listening to build your taste profile.</p>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Casting Presets */}
      {/* ------------------------------------------------------------------ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Casting Presets</h2>
          </div>
          <Link href="/create" className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            New story <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {presetsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-card/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : presets.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {presets.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                layout
              >
                <PresetCard
                  preset={p}
                  onDelete={deletePreset}
                  onUse={handleUsePreset}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="rounded-xl border border-dashed border-border/40 p-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              When you save a casting combination in The Casting Room, it appears here — ready to use again.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Open The Casting Room
            </Link>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Reaction History */}
      {/* ------------------------------------------------------------------ */}
      {reactionHistory.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Recent Reactions</h2>
          </div>
          <div className="space-y-2">
            {reactionHistory.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-card/60 border border-border/20"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Heart className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  {entry.storyTitle && (
                    <p className="text-xs text-muted-foreground mb-1.5 truncate">{entry.storyTitle}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex px-2 py-0.5 rounded-full bg-primary/10 border border-primary/15 text-[11px] text-primary font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Continue Listening */}
      {/* ------------------------------------------------------------------ */}
      {!continueLoading && continueItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground">Continue Listening</h2>
            </div>
            <Link href="/library" className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              Library <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {continueItems.map((s, i) => {
              const progressSeconds = (s.progress?.audioProgressSeconds as number) ?? 0;
              const duration = s.duration ?? "5 min";
              const durationSec = parseInt(duration) * 60 || 300;
              const pct = Math.min(Math.round((progressSeconds / durationSec) * 100), 99);
              return (
                <div key={s.id ?? i} className="flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-border/20">
                  {s.coverImage ? (
                    <img src={s.coverImage} alt={s.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Play className="w-5 h-5 text-primary/50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-border/30 rounded-full">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground flex-shrink-0">{pct}%</p>
                    </div>
                  </div>
                  <Link href={`/story/${s.id}`} className="p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all flex-shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Generated stories with Episode 1/2 pairing */}
      {/* ------------------------------------------------------------------ */}
      {!libraryLoading && library.generated.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground">Created by You</h2>
            </div>
            <Link href="/library" className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              See all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {(() => {
              const stories = library.generated.slice(0, 8);
              const parentIdToEp2 = new Map<string, Story>();
              stories.forEach((s) => {
                const parentId = (s as Record<string, unknown>).parent_story_id as string | undefined;
                if (parentId) parentIdToEp2.set(parentId, s);
              });
              const renderedIds = new Set<string>();
              return stories.map((s, i) => {
                if (renderedIds.has(s.id ?? "")) return null;
                const ep2 = parentIdToEp2.get(s.id ?? "");
                if (ep2) {
                  renderedIds.add(ep2.id ?? "");
                  return (
                    <div key={s.id ?? i} className="rounded-xl border border-primary/15 overflow-hidden">
                      <p className="text-[10px] font-semibold text-primary/50 uppercase tracking-widest px-3 pt-2">Series</p>
                      <StoryMiniCard story={s} episodeLabel="Episode 1" />
                      <div className="h-px bg-border/20 mx-3" />
                      <StoryMiniCard story={ep2} episodeLabel="Episode 2" />
                    </div>
                  );
                }
                return (
                  <StoryMiniCard key={s.id ?? i} story={s} />
                );
              }).filter(Boolean);
            })()}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Saved stories */}
      {/* ------------------------------------------------------------------ */}
      {!libraryLoading && library.saved.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground">Saved Stories</h2>
            </div>
            <Link href="/library" className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              See all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {library.saved.slice(0, 5).map((s, i) => (
              <StoryMiniCard key={s.id ?? i} story={s} />
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Footer links */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-border/20">
        <Link href="/library" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <Library className="w-4 h-4" />
          Full Library
        </Link>
        <Link href="/create" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <Sparkles className="w-4 h-4" />
          Create Story
        </Link>
      </div>
    </motion.div>
  );
}
