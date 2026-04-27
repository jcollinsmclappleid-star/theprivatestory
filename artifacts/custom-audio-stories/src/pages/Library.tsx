import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Clock, Play, RotateCcw, LogIn, Flag, Trash2, Search, X, SortAsc, SortDesc, Lock } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAudioPlayer } from "@/store/use-audio-player";
import type { Story, FullGeneratedStory } from "@workspace/api-client-react";
import { SkeletonCard } from "@/components/SkeletonCard";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { ReportStoryModal } from "@/components/ReportStoryModal";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type LibraryTab = "generated" | "continue";

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

function StoryCard({ story, showProgress, progress, onDeleted, isGenerated }: {
  story: Story;
  showProgress?: boolean;
  progress?: Record<string, unknown>;
  onDeleted?: () => void;
  isGenerated?: boolean;
}) {
  const { play } = useAudioPlayer();
  const [reportOpen, setReportOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const sceneCount = story.scenes?.length ?? 0;
  const progressSeconds = (progress?.audioProgressSeconds as number) ?? 0;
  const sceneIndex = (progress?.sceneIndex as number) ?? 0;
  const hasAudio = !!story.audioUrl;

  if (!hasAudio) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4 p-4 rounded-2xl bg-card/40 border border-border/20 opacity-50 relative cursor-default select-none"
      >
        <div className="flex-shrink-0">
          <img src={story.coverImage} alt={story.title} className="w-16 h-16 rounded-xl object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-primary/50 font-medium tracking-widest uppercase mb-0.5">{story.mood}</p>
          <h3 className="font-display font-semibold text-foreground/60 text-sm leading-tight line-clamp-1">{story.title}</h3>
        </div>
      </motion.div>
    );
  }

  const handleDelete = async () => {
    if (!confirm("Delete this story? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await fetch(`${API_BASE}/api/generated-story`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ storyId: story.id }),
      });
      onDeleted?.();
    } catch (err) {
      console.error("Failed to delete story", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
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
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => play(story)}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                title="Play"
              >
                <Play className="w-4 h-4" />
              </button>
              {isGenerated && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-1.5 rounded-full text-muted-foreground/40 hover:text-destructive transition-colors disabled:opacity-50"
                  title="Delete story"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setReportOpen(true)}
                className="p-1.5 rounded-full text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                title="Report this story"
              >
                <Flag className="w-3.5 h-3.5" />
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

      {reportOpen && (
        <ReportStoryModal
          storyId={story.id}
          storyTitle={story.title}
          onClose={() => setReportOpen(false)}
        />
      )}
    </>
  );
}

function EmptyState({ tab }: { tab: LibraryTab }) {
  const config: Record<LibraryTab, { icon: React.ReactNode; headline: string; sub: string }> = {
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
          Create Your Private Story
        </Link>
      </div>
    </div>
  );
}

function SubscriptionGate() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center px-4"
    >
      <div className="mb-6 opacity-60">
        <Lock className="w-12 h-12 text-primary/40 mx-auto" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-3">Your stories await</h2>
      <p className="text-muted-foreground text-sm max-w-xs mb-8">
        Subscribe to create personalised stories and track your listening progress — all saved privately to your account.
      </p>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all"
      >
        View Subscription Plans
      </Link>
    </motion.div>
  );
}

function AuthGate({ openSignIn }: { openSignIn: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center px-4"
    >
      <div className="mb-6 opacity-60">
        <BookOpen className="w-12 h-12 text-primary/40 mx-auto" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-3">Sign in to access your stories</h2>
      <p className="text-muted-foreground text-sm max-w-xs mb-8">
        Your creations and listening progress are all private to your account.
      </p>
      <button
        onClick={openSignIn}
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all"
      >
        <LogIn className="w-4 h-4" />
        Sign In to Continue
      </button>
    </motion.div>
  );
}

const TAB_CONFIG = [
  { id: "generated" as LibraryTab, label: "My Stories", icon: Sparkles },
  { id: "continue" as LibraryTab, label: "Continue", icon: Clock },
];

export default function Library() {
  const { isAuthenticated, isLoading: authLoading, openSignIn } = useAuth();
  const { hasFullAccess } = useSubscription();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<LibraryTab>("generated");
  const [generated, setGenerated] = useState<Story[]>([]);
  const [inProgress, setInProgress] = useState<(Story & { progress?: Record<string, unknown> })[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [libRes, contRes] = await Promise.all([
        fetch(`${API_BASE}/api/library`, { credentials: "include" }),
        fetch(`${API_BASE}/api/continue-listening`, { credentials: "include" }),
      ]);
      if (libRes.ok) {
        const lib = await libRes.json() as { saved: Story[]; generated: Story[]; variations: FullGeneratedStory[] };
        setGenerated(lib.generated ?? []);
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

  const filterAndSort = useCallback((stories: Story[]) => {
    let result = stories;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          (s.title ?? "").toLowerCase().includes(q) ||
          (s.mood ?? "").toLowerCase().includes(q) ||
          (s.description ?? "").toLowerCase().includes(q)
      );
    }
    if (sortOrder === "oldest") {
      result = [...result].sort((a, b) => {
        const aDate = (a as Record<string, unknown>).createdAt as string | undefined;
        const bDate = (b as Record<string, unknown>).createdAt as string | undefined;
        return new Date(aDate ?? 0).getTime() - new Date(bDate ?? 0).getTime();
      });
    } else {
      result = [...result].sort((a, b) => {
        const aDate = (a as Record<string, unknown>).createdAt as string | undefined;
        const bDate = (b as Record<string, unknown>).createdAt as string | undefined;
        return new Date(bDate ?? 0).getTime() - new Date(aDate ?? 0).getTime();
      });
    }
    return result;
  }, [searchQuery, sortOrder]);

  const filteredGenerated = useMemo(() => filterAndSort(generated), [filterAndSort, generated]);

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
          <h1 className="font-display text-4xl font-bold text-foreground">My Stories</h1>
        </div>
        <AuthGate openSignIn={openSignIn} />
      </div>
    );
  }

  if (isAuthenticated && !hasFullAccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground">My Stories</h1>
        </div>
        <SubscriptionGate />
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
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl font-bold text-foreground">My Stories</h1>
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
            <span>{label}</span>
          </button>
        ))}
      </div>

      {activeTab === "generated" && (
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or mood…"
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-card/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:bg-card/60 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setSortOrder((prev) => prev === "newest" ? "oldest" : "newest")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card/40 border border-border/30 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all flex-shrink-0"
            title={sortOrder === "newest" ? "Showing newest first" : "Showing oldest first"}
          >
            {sortOrder === "newest" ? <SortDesc className="w-3.5 h-3.5" /> : <SortAsc className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{sortOrder === "newest" ? "Newest" : "Oldest"}</span>
          </button>
        </div>
      )}

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
            {activeTab === "generated" && (
              filteredGenerated.length === 0 ? (
                searchQuery ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-muted-foreground">No stories match &ldquo;{searchQuery}&rdquo;</p>
                    <button onClick={() => setSearchQuery("")} className="mt-2 text-xs text-primary hover:text-primary/80 underline underline-offset-2">Clear search</button>
                  </div>
                ) : (
                  <EmptyState tab="generated" />
                )
              ) : (
                filteredGenerated.map((story) => {
                  const s = story as Story & { parent_story_id?: string };
                  return (
                    <div key={s.id} className="relative">
                      <StoryCard
                        story={s}
                        isGenerated
                        onDeleted={() => setGenerated(prev => prev.filter(st => st.id !== s.id))}
                      />
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
                  <div key={item.id} className="relative">
                    <StoryCard
                      story={item as Story}
                      showProgress
                      progress={item.progress}
                    />
                  </div>
                ))
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
          Create a New Story
        </Link>
      </div>
    </motion.div>
  );
}
