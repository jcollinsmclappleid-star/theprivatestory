import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Clock, Shuffle, Play, Heart, HeartOff, RotateCcw, LogIn } from "lucide-react";
import { Link } from "wouter";
import { useAudioPlayer } from "@/store/use-audio-player";
import type { Story, FullGeneratedStory } from "@workspace/api-client-react";
import { SkeletonCard } from "@/components/SkeletonCard";
import { useAuth } from "@workspace/replit-auth-web";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type LibraryTab = "saved" | "generated" | "continue" | "variations";

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2">
      <div
        className="h-full bg-primary rounded-full transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </div>
  );
}

function StoryCard({ story, showProgress, progress, onUnsave, isSaved }: {
  story: Story;
  showProgress?: boolean;
  progress?: Record<string, unknown>;
  onUnsave?: () => void;
  isSaved?: boolean;
}) {
  const { play } = useAudioPlayer();
  const sceneCount = story.scenes?.length ?? 0;
  const progressSeconds = (progress?.audioProgressSeconds as number) ?? 0;
  const sceneIndex = (progress?.sceneIndex as number) ?? 0;

  const handleSave = async () => {
    if (isSaved) {
      await fetch(`${API_BASE}/api/save-story`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ storyId: story.id }),
      });
      onUnsave?.();
    } else {
      await fetch(`${API_BASE}/api/save-story`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ storyId: story.id }),
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 p-4 rounded-2xl bg-card/40 border border-border/30 hover:border-primary/30 transition-all group"
    >
      <Link href={`/story/${story.id}`} className="flex-shrink-0">
        <img
          src={story.coverImage}
          alt={story.title}
          className="w-16 h-16 rounded-xl object-cover group-hover:scale-105 transition-transform"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-primary font-medium tracking-widest uppercase mb-0.5">
              {story.mood}
            </p>
            <Link href={`/story/${story.id}`}>
              <h3 className="font-display font-semibold text-foreground text-sm leading-tight line-clamp-1 hover:text-primary transition-colors">
                {story.title}
              </h3>
            </Link>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {onUnsave !== undefined && (
              <button
                onClick={handleSave}
                className={`p-1.5 rounded-full transition-colors ${isSaved ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                title={isSaved ? "Unsave" : "Save"}
              >
                {isSaved ? <Heart className="w-4 h-4 fill-current" /> : <HeartOff className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={() => play(story)}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              title="Play"
            >
              <Play className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showProgress && progress && (
          <div className="mt-2">
            <ProgressBar value={progressSeconds / 300} />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                Scene {sceneIndex + 1}{sceneCount > 0 ? ` of ${sceneCount}` : ""}
              </span>
              <Link
                href={`/story/${story.id}`}
                className="text-xs text-primary font-medium hover:text-primary/80 transition-colors"
              >
                Resume →
              </Link>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState({ tab }: { tab: LibraryTab }) {
  const config: Record<LibraryTab, { icon: React.ReactNode; headline: string; sub: string }> = {
    saved: {
      icon: <Heart className="w-10 h-10 text-primary/40" />,
      headline: "Nothing saved yet.",
      sub: "When something stays with you, save it here.",
    },
    generated: {
      icon: <Sparkles className="w-10 h-10 text-primary/40" />,
      headline: "You haven't created a story yet.",
      sub: "Start with a mood and let us build the rest.",
    },
    continue: {
      icon: <Clock className="w-10 h-10 text-primary/40" />,
      headline: "You're all caught up.",
      sub: "Your in-progress stories will appear here.",
    },
    variations: {
      icon: <Shuffle className="w-10 h-10 text-primary/40" />,
      headline: "No variations yet.",
      sub: "Generate a story variation to see it here.",
    },
  };

  const { icon, headline, sub } = config[tab];

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 opacity-60">{icon}</div>
      <p className="font-display text-xl font-semibold text-foreground mb-2">{headline}</p>
      <p className="text-muted-foreground text-sm mb-8 max-w-xs">{sub}</p>
      <div className="flex gap-3">
        <Link
          href="/create"
          className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all"
        >
          Create Your Story
        </Link>
        <Link
          href="/browse"
          className="border border-border/50 text-muted-foreground px-6 py-3 rounded-full text-sm font-medium hover:border-primary/30 hover:text-foreground transition-all"
        >
          Browse Library
        </Link>
      </div>
    </div>
  );
}

function AuthGate({ login }: { login: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center px-4"
    >
      <div className="mb-6 opacity-60">
        <BookOpen className="w-12 h-12 text-primary/40 mx-auto" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-3">Sign in to access your library</h2>
      <p className="text-muted-foreground text-sm max-w-xs mb-8">
        Your saved stories, generated stories, and listening progress are all stored in your personal library.
      </p>
      <button
        onClick={login}
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all"
      >
        <LogIn className="w-4 h-4" />
        Sign In to Continue
      </button>
    </motion.div>
  );
}

const TAB_CONFIG = [
  { id: "saved" as LibraryTab, label: "Saved", icon: Heart },
  { id: "generated" as LibraryTab, label: "Generated", icon: Sparkles },
  { id: "continue" as LibraryTab, label: "Continue", icon: Clock },
  { id: "variations" as LibraryTab, label: "Variations", icon: Shuffle },
];

export default function Library() {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const [activeTab, setActiveTab] = useState<LibraryTab>("saved");
  const [saved, setSaved] = useState<Story[]>([]);
  const [generated, setGenerated] = useState<Story[]>([]);
  const [variations, setVariations] = useState<FullGeneratedStory[]>([]);
  const [inProgress, setInProgress] = useState<(Story & { progress?: Record<string, unknown> })[]>([]);
  const [loading, setLoading] = useState(false);

  const VARIATION_LABELS: Record<string, string> = {
    softer: "Softer",
    darker: "Darker",
    slower: "Slower",
    more_emotional: "More Emotional",
    new_ending: "New Ending",
    new_setting: "New Setting",
    continue_chemistry: "Continue the Chemistry",
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [libRes, contRes] = await Promise.all([
        fetch(`${API_BASE}/api/library`, { credentials: "include" }),
        fetch(`${API_BASE}/api/continue-listening`, { credentials: "include" }),
      ]);
      if (libRes.ok) {
        const lib = await libRes.json() as { saved: Story[]; generated: Story[]; variations: FullGeneratedStory[] };
        setSaved(lib.saved ?? []);
        setGenerated(lib.generated ?? []);
        setVariations(lib.variations ?? []);
      }
      if (contRes.ok) {
        const cont = await contRes.json() as (Story & { progress?: Record<string, unknown> })[];
        setInProgress(cont ?? []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, load]);

  const handleUnsave = (storyId: string) => {
    setSaved((prev) => prev.filter((s) => s.id !== storyId));
  };

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 w-full space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 p-4 rounded-2xl bg-card/40 border border-border/20 animate-pulse">
            <SkeletonCard className="w-16 h-16 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-16 bg-muted/30 rounded-full" />
              <div className="h-4 w-2/3 bg-muted/40 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-primary mb-2">Private Collection</p>
          <h1 className="font-display text-4xl font-bold text-foreground">My Library</h1>
        </div>
        <AuthGate login={login} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto px-4 py-8 w-full"
    >
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-primary mb-2">Private Collection</p>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl font-bold text-foreground">My Library</h1>
          <button
            onClick={load}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-white/5"
            title="Refresh"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-8 bg-card/40 p-1 rounded-2xl border border-border/30">
        {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-medium transition-all ${
              activeTab === id
                ? "bg-primary text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-card/40 border border-border/20 animate-pulse">
                <SkeletonCard className="w-16 h-16 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 w-16 bg-muted/30 rounded-full" />
                  <div className="h-4 w-2/3 bg-muted/40 rounded-full" />
                  <div className="h-3 w-1/2 bg-muted/20 rounded-full" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {activeTab === "saved" && (
              saved.length === 0 ? (
                <EmptyState tab="saved" />
              ) : (
                saved.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    isSaved
                    onUnsave={() => handleUnsave(story.id)}
                  />
                ))
              )
            )}

            {activeTab === "generated" && (
              generated.length === 0 ? (
                <EmptyState tab="generated" />
              ) : (
                generated.map((story) => {
                  const s = story as Story & { parent_story_id?: string };
                  return (
                    <div key={s.id} className="relative">
                      {s.parent_story_id && (
                        <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium border border-primary/30">
                          Continued
                        </div>
                      )}
                      <StoryCard story={s as Story} />
                    </div>
                  );
                })
              )
            )}

            {activeTab === "continue" && (
              inProgress.length === 0 ? (
                <EmptyState tab="continue" />
              ) : (
                inProgress.map((item) => (
                  <StoryCard
                    key={item.id}
                    story={item as Story}
                    showProgress
                    progress={item.progress}
                  />
                ))
              )
            )}

            {activeTab === "variations" && (
              variations.length === 0 ? (
                <EmptyState tab="variations" />
              ) : (
                variations.map((story) => {
                  const varLabel = story.variant_type ? (VARIATION_LABELS[story.variant_type] ?? story.variant_type) : null;
                  const storyAsStory: Story = {
                    id: story.id,
                    title: story.title,
                    description: story.description,
                    mood: story.mood,
                    tags: story.recommendation_tags ?? [story.mood],
                    duration: story.duration,
                    coverImage: story.images?.cover ?? "",
                    audioUrl: story.audioUrl,
                    isPremium: false,
                    isNew: false,
                    scenes: story.scenes ?? [],
                  };
                  return (
                    <div key={story.id} className="relative">
                      {varLabel && (
                        <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium border border-primary/30">
                          {varLabel}
                        </div>
                      )}
                      <StoryCard story={storyAsStory} />
                    </div>
                  );
                })
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 p-6 rounded-2xl border border-primary/20 bg-primary/5 text-center">
        <p className="text-sm text-muted-foreground mb-4">Ready for something new?</p>
        <Link
          href="/create"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Create Your Story
        </Link>
      </div>
    </motion.div>
  );
}
