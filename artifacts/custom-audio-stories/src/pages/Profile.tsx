import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Heart, BookOpen, Flame, User, ChevronRight,
  Trash2, Wand2, Play, Library, ArrowRight, Star, Zap, LogIn,
  CreditCard, AlertCircle, X, Loader2, Download,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { authClient } from "@/lib/authClient";
import { VOICES } from "@/lib/voices";
import { useAudioPlayer } from "@/store/use-audio-player";
import { usePricing } from "@/hooks/usePricing";
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
  const topVoiceId = topEntry(taste.preferredVoiceFeel);
  const topVoice = topVoiceId ? (VOICES.find(v => v.id === topVoiceId)?.name ?? null) : null;

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
  const { monthly, annual, addon, currency } = usePricing();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteProcessing, setDeleteProcessing] = useState(false);
  const [deleteDone, setDeleteDone] = useState(false);
  const { user, isAuthenticated, isLoading, openSignIn } = useAuth();
  const [, navigate] = useLocation();
  const { data: taste, loading: tasteLoading } = useTaste(isAuthenticated);
  const { presets, loading: presetsLoading, deletePreset } = usePresets(isAuthenticated);
  const { data: library, loading: libraryLoading } = useLibrary(isAuthenticated);
  const { items: continueItems, loading: continueLoading } = useContinueListening(isAuthenticated);
  const { items: reactionHistory } = useReactionHistory(isAuthenticated);
  const [usageData, setUsageData] = useState<{
    plan: string;
    used: number;
    limit: number;
    storiesRemaining: number;
    renewDate: string | null;
    subscriptionStatus: string | null;
    cancelAt: string | null;
  } | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [addonLoading, setAddonLoading] = useState(false);
  const [upsellLoading, setUpsellLoading] = useState<"monthly" | "annual" | null>(null);
  const [deleteSubLoading, setDeleteSubLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${API_BASE}/api/me/usage`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setUsageData(d); })
      .catch(() => {});
  }, [isAuthenticated]);

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
      {/* Subscription */}
      {/* ------------------------------------------------------------------ */}
      {usageData && (
        <section className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-primary" />
            <h2 className="font-display font-semibold text-sm text-foreground">Subscription</h2>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Current plan</p>
              <p className="font-semibold text-foreground capitalize">
                {usageData.plan === "free" ? "Free"
                  : usageData.plan === "monthly" ? "Monthly"
                  : usageData.plan === "annual" ? "Annual"
                  : "Immersive Story"}
              </p>
            </div>
            {usageData.plan !== "free" && usageData.plan !== "immersive" && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Stories used</p>
                <p className="font-semibold text-foreground">
                  {usageData.used} / {usageData.limit}
                </p>
              </div>
            )}
          </div>

          {/* Monthly/annual progress bar */}
          {usageData.plan !== "free" && usageData.plan !== "immersive" && (
            <div className="mt-4">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${usageData.storiesRemaining === 0 ? "bg-amber-400" : "bg-primary"}`}
                  style={{ width: `${Math.min(100, (usageData.used / usageData.limit) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {usageData.storiesRemaining > 0
                  ? <><span className="text-primary font-medium">{usageData.storiesRemaining} {usageData.storiesRemaining === 1 ? "Immersive Story" : "Immersive Stories"} remaining</span> — renews {usageData.renewDate ? new Date(usageData.renewDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "soon"}</>
                  : <span className="text-amber-400">Allowance reached — renews {usageData.renewDate ? new Date(usageData.renewDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "soon"}</span>
                }
              </p>
            </div>
          )}

          {/* Immersive plan state */}
          {usageData.plan === "immersive" && (
            <div className="mt-4">
              {usageData.addonStoriesRemaining > 0 ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/8 border border-primary/20">
                  <p className="text-xs text-primary font-medium">You have a story ready — start creating</p>
                  <Link href="/after-dark" className="text-xs px-3 py-1.5 rounded-full bg-primary/15 text-primary hover:bg-primary/25 transition-all font-medium">
                    Create story →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">Your story is yours forever. Ready for another?</p>
                  <div className="flex flex-col gap-2">
                    {(["monthly", "annual"] as const).map((plan) => {
                      const labels: Record<string, string> = {
                        monthly: `Subscribe — ${monthly.storyAllowance} stories/month · ${monthly.display}`,
                        annual:  `Annual — ${annual.storyAllowance} stories/year · ${annual.display}`,
                      };
                      const isLoading = upsellLoading === plan;
                      return (
                        <button
                          key={plan}
                          disabled={!!upsellLoading}
                          onClick={async () => {
                            setUpsellLoading(plan);
                            try {
                              const res = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
                                method: "POST",
                                credentials: "include",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ plan, currency }),
                              });
                              const d = await res.json();
                              if (d.url) window.location.href = d.url;
                            } finally {
                              setUpsellLoading(null);
                            }
                          }}
                          className={`text-xs px-4 py-2.5 rounded-full transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-1.5 ${
                            plan === "annual"
                              ? "bg-primary/12 border border-primary/25 text-primary hover:bg-primary/20"
                              : "border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/30"
                          }`}
                        >
                          {isLoading ? <><Loader2 className="w-3 h-3 animate-spin" /> Starting…</> : labels[plan]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {usageData.plan === "free" && (
            <p className="mt-3 text-xs text-muted-foreground">
              Upgrade to generate stories. <Link href="/pricing" className="text-primary hover:underline underline-offset-2">See plans →</Link>
            </p>
          )}
          {/* Cancellation scheduled banner */}
          {usageData.plan !== "free" && usageData.subscriptionStatus === "canceling" && (
            <div className="mt-4 p-3 rounded-xl bg-amber-400/8 border border-amber-400/20 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-amber-400">Cancellation scheduled</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your access continues until{" "}
                  <span className="text-foreground font-medium">
                    {usageData.cancelAt
                      ? new Date(usageData.cancelAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                      : usageData.renewDate
                        ? new Date(usageData.renewDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                        : "your renewal date"}
                  </span>.
                </p>
              </div>
              <button
                disabled={reactivateLoading}
                onClick={async () => {
                  setReactivateLoading(true);
                  try {
                    const res = await fetch(`${API_BASE}/api/stripe/reactivate-subscription`, {
                      method: "POST",
                      credentials: "include",
                    });
                    if (res.ok) {
                      setUsageData(prev => prev ? { ...prev, subscriptionStatus: "active", cancelAt: null } : prev);
                    }
                  } finally {
                    setReactivateLoading(false);
                  }
                }}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-50"
              >
                {reactivateLoading ? "..." : "Keep plan"}
              </button>
            </div>
          )}

          {/* Cancel confirmation dialog */}
          <AnimatePresence>
            {cancelConfirmOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-4 p-4 rounded-xl border border-border/30 bg-card/60 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">Cancel your subscription?</p>
                  <button onClick={() => setCancelConfirmOpen(false)} className="p-1 rounded-full hover:bg-white/5 text-muted-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You'll keep full access to your stories until{" "}
                  <span className="text-foreground font-medium">
                    {usageData.renewDate
                      ? new Date(usageData.renewDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                      : "your renewal date"}
                  </span>. After that, your account will revert to free.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCancelConfirmOpen(false)}
                    className="flex-1 text-xs px-3 py-2 rounded-full border border-border/30 text-muted-foreground hover:text-foreground transition-all"
                  >
                    Keep my plan
                  </button>
                  <button
                    disabled={cancelLoading}
                    onClick={async () => {
                      setCancelLoading(true);
                      try {
                        const res = await fetch(`${API_BASE}/api/stripe/cancel-subscription`, {
                          method: "POST",
                          credentials: "include",
                        });
                        const json = await res.json();
                        if (res.ok) {
                          setUsageData(prev => prev ? {
                            ...prev,
                            subscriptionStatus: "canceling",
                            cancelAt: json.cancelAt ?? prev.renewDate,
                          } : prev);
                          setCancelConfirmOpen(false);
                        }
                      } finally {
                        setCancelLoading(false);
                      }
                    }}
                    className="flex-1 text-xs px-3 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                  >
                    {cancelLoading ? "Cancelling..." : "Yes, cancel"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {usageData.plan !== "free" && (
            <div className="mt-4 pt-4 border-t border-border/20 flex flex-col sm:flex-row gap-2">
              <button
                onClick={async () => {
                  const res = await fetch(`${API_BASE}/api/stripe/portal`, { credentials: "include" });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                }}
                className="text-xs px-4 py-2 rounded-full border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
              >
                Manage billing
              </button>
              {(usageData.plan === "monthly" || usageData.plan === "annual") && usageData.subscriptionStatus === "active" && (
                <button
                  disabled={addonLoading}
                  onClick={async () => {
                    setAddonLoading(true);
                    try {
                      const res = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ plan: "addon", currency }),
                      });
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                    } finally {
                      setAddonLoading(false);
                    }
                  }}
                  className="text-xs px-4 py-2 rounded-full border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {addonLoading ? <><Loader2 className="w-3 h-3 animate-spin" /> Starting…</> : <>Add more stories — <span className="tabular-nums">{addon.display}</span></>}
                </button>
              )}
              {(usageData.plan === "monthly" || usageData.plan === "annual") && usageData.subscriptionStatus !== "canceling" && (
                <button
                  onClick={() => setCancelConfirmOpen(true)}
                  className="text-xs px-4 py-2 rounded-full border border-red-500/20 text-red-400/70 hover:text-red-400 hover:border-red-400/30 transition-all"
                >
                  Cancel subscription
                </button>
              )}
            </div>
          )}
        </section>
      )}

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
              When you save a creation combination in The Creation Room, it appears here — ready to use again.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Open The Creation Room
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
              const stories = library.generated.slice(0, 10);
              const allStoryIds = new Set(stories.map((s) => s.id ?? ""));
              const parentIdToEp2 = new Map<string, Story>();
              const ep2WithParentInList = new Set<string>();
              stories.forEach((s) => {
                const parentId = (s as Record<string, unknown>).parent_story_id as string | undefined;
                if (parentId && allStoryIds.has(parentId)) {
                  parentIdToEp2.set(parentId, s);
                  ep2WithParentInList.add(s.id ?? "");
                }
              });
              return stories
                .filter((s) => !ep2WithParentInList.has(s.id ?? ""))
                .slice(0, 6)
                .map((s, i) => {
                  const ep2 = parentIdToEp2.get(s.id ?? "");
                  if (ep2) {
                    return (
                      <div key={s.id ?? i} className="rounded-xl border border-primary/15 overflow-hidden">
                        <p className="text-[10px] font-semibold text-primary/50 uppercase tracking-widest px-3 pt-2">Series</p>
                        <StoryMiniCard story={s} episodeLabel="Episode 1" />
                        <div className="h-px bg-border/20 mx-3" />
                        <StoryMiniCard story={ep2} episodeLabel="Episode 2" />
                      </div>
                    );
                  }
                  const parentId = (s as Record<string, unknown>).parent_story_id as string | undefined;
                  return <StoryMiniCard key={s.id ?? i} story={s} episodeLabel={parentId ? "Episode 2" : undefined} />;
                });
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

      {/* Your data — GDPR Art.15 / Art.20 (export) */}
      {/* ------------------------------------------------------------------ */}
      <div className="border border-border/40 rounded-2xl p-5 mt-4">
        <h3 className="font-display font-semibold text-sm text-foreground mb-1">Your data</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Download a copy of everything we hold about you — your account, taste profile, stories, and reactions — in a machine-readable JSON file.
        </p>
        <a
          href={`${API_BASE}/api/me/export`}
          download
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-foreground/80 hover:bg-foreground/5 hover:text-foreground text-xs font-medium transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Export my data (JSON)
        </a>
      </div>

      {/* Danger zone — account deletion (GDPR Art.17 right to erasure) */}
      {/* ------------------------------------------------------------------ */}
      <div className="border border-destructive/20 rounded-2xl p-5 mt-4">
        <h3 className="font-display font-semibold text-sm text-destructive/80 mb-1">Delete Account</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Permanently delete your account and all personal data within 30 days. This cannot be undone.
        </p>

        {/* Gate: active recurring subscription — must cancel before deleting */}
        {usageData && (usageData.plan === "monthly" || usageData.plan === "annual") && usageData.subscriptionStatus === "active" ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/15">
              <AlertCircle className="w-4 h-4 text-destructive/60 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-destructive/80">Step 1 — Cancel your subscription</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your active subscription must be cancelled before your account can be deleted. You'll keep access until the end of your current billing period.
                </p>
              </div>
            </div>
            <button
              disabled={deleteSubLoading}
              onClick={async () => {
                setDeleteSubLoading(true);
                try {
                  const res = await fetch(`${API_BASE}/api/stripe/cancel-subscription`, {
                    method: "POST",
                    credentials: "include",
                  });
                  const json = await res.json();
                  if (res.ok) {
                    setUsageData(prev => prev ? {
                      ...prev,
                      subscriptionStatus: "canceling",
                      cancelAt: json.cancelAt ?? prev.renewDate,
                    } : prev);
                  }
                } finally {
                  setDeleteSubLoading(false);
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-destructive/30 text-destructive/70 hover:bg-destructive/8 hover:text-destructive hover:border-destructive/50 text-xs font-medium transition-all disabled:opacity-50"
            >
              {deleteSubLoading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling subscription…</>
              ) : (
                "Cancel subscription — then proceed to delete"
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Note for users with a scheduled cancellation */}
            {usageData && usageData.subscriptionStatus === "canceling" && !deleteDone && (
              <p className="text-xs text-amber-400/80 mb-3">
                Note: your subscription access will also end immediately on deletion (rather than at the scheduled date).
              </p>
            )}

            {!deleteConfirmOpen && !deleteDone && (
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="text-xs text-destructive/70 hover:text-destructive transition-colors underline underline-offset-2"
              >
                Request account deletion
              </button>
            )}
            {deleteConfirmOpen && !deleteDone && (
              <div className="space-y-3">
                <p className="text-xs text-destructive font-medium">
                  Are you sure? Your taste profile, history, and account data will be permanently erased.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      setDeleteProcessing(true);
                      try {
                        const res = await fetch(`${API_BASE}/api/me`, { method: "DELETE", credentials: "include" });
                        if (res.ok) {
                          await authClient.signOut();
                          window.location.href = import.meta.env.BASE_URL || "/";
                        } else {
                          const body = await res.json().catch(() => ({}));
                          alert(body.error ?? "Failed to delete account. Please try again or contact support@theprivatestory.com.");
                          setDeleteConfirmOpen(false);
                        }
                      } catch {
                        setDeleteConfirmOpen(false);
                      } finally {
                        setDeleteProcessing(false);
                      }
                    }}
                    disabled={deleteProcessing}
                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-full text-xs font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    {deleteProcessing ? "Deleting…" : "Yes, delete my account"}
                  </button>
                  <button
                    onClick={() => setDeleteConfirmOpen(false)}
                    className="px-4 py-2 border border-border rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {deleteDone && (
              <p className="text-xs text-muted-foreground">
                Your deletion request has been received. All personal data will be removed within 30 days.
                You can contact <a href="mailto:support@theprivatestory.com" className="text-primary hover:underline">support@theprivatestory.com</a> with any questions.
              </p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
