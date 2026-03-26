import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Headphones, Play, ChevronRight, Zap, Moon,
  EyeOff, WifiOff, Trash2, Lock, Shield,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { RowSlider } from "@/components/RowSlider";
import { SkeletonRow } from "@/components/SkeletonCard";
import { useStoriesFallback } from "@/hooks/use-api-fallbacks";
import { useAudioPlayer } from "@/store/use-audio-player";
import { useAuth } from "@/hooks/useAuth";
import type { Story } from "@workspace/api-client-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Data hooks
// ---------------------------------------------------------------------------

function useContinueListening(isAuthenticated: boolean) {
  const [items, setItems] = useState<Story[]>([]);
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${API_BASE}/api/me/continue-listening`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setItems((data as Story[]).slice(0, 8)))
      .catch(() => {});
  }, [isAuthenticated]);
  return items;
}

function useRecommendations(isAuthenticated: boolean) {
  const [recs, setRecs] = useState<{
    for_you: Story[];
    because_you_liked: Story[];
    because_you_liked_mood: string | null;
    has_taste_profile: boolean;
  }>({ for_you: [], because_you_liked: [], because_you_liked_mood: null, has_taste_profile: false });
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${API_BASE}/api/me/recommendations`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setRecs(data); })
      .catch(() => {});
  }, [isAuthenticated]);
  return recs;
}

function useQuickCreate(isAuthenticated: boolean) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${API_BASE}/api/me/taste`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        const sum = (m: Record<string, number>) => Object.values(m).reduce((a, b) => a + b, 0);
        const signals = sum(data.tasteProfile ?? {}) + sum(data.preferredIntensity ?? {});
        setReady(signals >= 5);
      })
      .catch(() => {});
  }, [isAuthenticated]);
  return ready;
}

// ---------------------------------------------------------------------------
// Continue Listening card
// ---------------------------------------------------------------------------

function ContinueCard({ story }: { story: Story & { progress?: Record<string, unknown> } }) {
  const { play } = useAudioPlayer();
  const progressSeconds = (story.progress?.audioProgressSeconds as number) ?? 0;
  const sceneIndex = (story.progress?.sceneIndex as number) ?? 0;
  const sceneCount = story.scenes?.length ?? 1;
  const progressFraction = Math.min(progressSeconds / 300, 1);

  return (
    <Link href={`/story/${story.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative flex-shrink-0 w-52 rounded-2xl overflow-hidden border border-border/30 bg-card/40 cursor-pointer group"
        onClick={(e) => { e.preventDefault(); play(story); }}
      >
        <img src={story.coverImage} alt={story.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-xs text-primary font-medium tracking-widest uppercase mb-0.5">{story.mood}</p>
          <p className="text-sm font-semibold text-white line-clamp-1">{story.title}</p>
          <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${progressFraction * 100}%` }} />
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-white/50">Scene {sceneIndex + 1} of {sceneCount}</p>
            <p className="text-xs text-primary font-medium">Resume →</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

export default function Home() {
  const { data: stories, isLoading } = useStoriesFallback();
  const { isAuthenticated } = useAuth();
  const continueListening = useContinueListening(isAuthenticated);
  const recs = useRecommendations(isAuthenticated);
  const quickCreateReady = useQuickCreate(isAuthenticated);
  const [, navigate] = useLocation();
  const [quickCreateLoading, setQuickCreateLoading] = useState(false);

  const handleQuickCreate = useCallback(async () => {
    setQuickCreateLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/me/quick-create-params`, { credentials: "include" });
      if (!r.ok) return;
      const params = await r.json();
      if (params.eligible === false) return;
      sessionStorage.setItem("quickCreateParams", JSON.stringify(params));
      navigate("/create");
    } finally {
      setQuickCreateLoading(false);
    }
  }, [navigate]);

  const tonightPicks = (isAuthenticated && recs.for_you.length > 0)
    ? (recs.for_you as Story[])
    : (stories?.slice(1, 9) || []);
  const lateNight = stories?.filter(s => s.mood === "Late Night") || [];
  const slowBurn = stories?.filter(s => s.mood === "Slow Burn") || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative w-full h-[80vh] min-h-[580px] flex items-end pb-24">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-background/20" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-5">
              Personalised Audio Story
            </span>

            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-5 leading-tight drop-shadow-xl">
              A story written<br className="hidden md:block" /> just for you.<br className="hidden md:block" />
              <span className="text-primary">Seen only by you.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
              Tell us your mood, the person you want in the room, your moment. We write it and narrate it — a personalised audio story that exists only for you, heard only through your headphones.
            </p>

            <div className="flex items-center gap-4 flex-wrap mb-4">
              <Link
                href="/create"
                className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-base hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-glow"
              >
                <Sparkles className="w-5 h-5" />
                Begin your story
              </Link>

              <Link
                href="/browse"
                className="flex items-center gap-2 px-6 py-4 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-border/80 transition-all font-medium"
              >
                <Play className="w-4 h-4 fill-current" />
                Listen privately
              </Link>
            </div>

            {quickCreateReady && (
              <div className="mb-4">
                <button
                  onClick={handleQuickCreate}
                  disabled={quickCreateLoading}
                  className="flex items-center gap-1.5 text-xs text-primary/60 hover:text-primary transition-colors disabled:opacity-50"
                >
                  {quickCreateLoading ? (
                    <span className="w-3 h-3 rounded-full border border-primary/40 border-t-primary animate-spin" />
                  ) : (
                    <Zap className="w-3 h-3" />
                  )}
                  Write one for me based on my taste
                </button>
              </div>
            )}

            {/* Privacy statement + trust strip */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-sm">
                <Lock className="w-3 h-3 inline-block mr-1.5 text-primary/40 -mt-0.5" />
                Built so we can't share it — not even if asked. Your stories are yours alone.
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground/40 tracking-wide">
                {["No feeds", "No history", "No trace", "Heard only by you"].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-primary/30 inline-block" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="relative z-20 -mt-12 space-y-0">

        {/* ---------------------------------------------------------------- */}
        {/* Privacy Trust Strip                                               */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-10 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { icon: <EyeOff className="w-4 h-4" />, text: "Visible only to you" },
              { icon: <WifiOff className="w-4 h-4" />, text: "No social features, no feeds" },
              { icon: <Lock className="w-4 h-4" />, text: "Built so we can't share it" },
              { icon: <Headphones className="w-4 h-4" />, text: "Designed for private listening" },
              { icon: <Trash2 className="w-4 h-4" />, text: "Delete everything, anytime" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex flex-col items-center text-center gap-2 px-3 py-4 rounded-2xl border border-border/20 bg-card/20 hover:border-primary/20 hover:bg-primary/5 transition-all"
              >
                <span className="text-primary/60">{item.icon}</span>
                <span className="text-xs text-muted-foreground/70 leading-snug">{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Differentiation — "Nothing here exists until you ask for it"      */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-card/30 backdrop-blur-md p-10 md:p-16">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-background/60 pointer-events-none" />
            <div className="relative z-10 max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-6">
                Made for you. By you.
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
                Nothing here exists<br className="hidden md:block" /> until you ask for it.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Other platforms give you what they think you want. We write what you actually asked for — your mood, your moment, the exact feeling you're after. A story that didn't exist an hour ago. Written for you, specifically.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Your mood", desc: "The emotional register. How you want to feel." },
                  { label: "Your moment", desc: "The scenario, the setting, the spark." },
                  { label: "Your voice", desc: "Narrated in the tone that fits tonight." },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-background/40 border border-border/20 p-4">
                    <p className="font-semibold text-foreground text-sm mb-1">{item.label}</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-semibold hover:bg-primary/90 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                Begin your story
              </Link>
              <p className="text-xs text-muted-foreground/40 mt-3">60 seconds to begin. Private from the first moment.</p>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Continue Listening                                                */}
        {/* ---------------------------------------------------------------- */}
        {continueListening.length > 0 && (
          <section className="py-4 px-4 md:px-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Continue Listening</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Pick up exactly where you left off.</p>
              </div>
              <Link href="/library" className="text-xs text-primary hover:text-primary/80 transition-colors">
                See all →
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {continueListening.map((s) => (
                <ContinueCard key={s.id} story={s as Story & { progress?: Record<string, unknown> }} />
              ))}
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Story rows                                                        */}
        {/* ---------------------------------------------------------------- */}
        {isLoading ? (
          <>
            <SkeletonRow count={5} />
            <SkeletonRow count={5} />
          </>
        ) : (
          <>
            <RowSlider
              title={isAuthenticated && recs.has_taste_profile ? "For You" : "For tonight"}
              subtitle={isAuthenticated && recs.has_taste_profile ? "Picked from what you love" : "Stories that know what tonight calls for"}
              stories={tonightPicks}
            />
            {recs.has_taste_profile && recs.because_you_liked.length > 0 && (
              <RowSlider
                title={recs.because_you_liked_mood ? `Because you liked ${recs.because_you_liked_mood}` : "You May Also Like"}
                stories={recs.because_you_liked as Story[]}
              />
            )}
            <RowSlider
              title="After midnight"
              subtitle="When the evening has its own kind of quiet"
              stories={lateNight}
            />
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* After Dark teaser                                                  */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <Link href="/after-dark" className="block group">
            <div className="relative overflow-hidden rounded-3xl border border-[#1a1a2e]/60 bg-[#0a0a12]">
              {/* Cool dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d1a] via-[#0a0a12] to-[#0d1117] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-950/20 via-transparent to-indigo-950/20 pointer-events-none" />

              {/* Subtle light source top-right */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-950/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-5">
                    <Moon className="w-4 h-4 text-[#6b7dff]" />
                    <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#6b7dff]/70">
                      After Dark
                    </span>
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-white/90 mb-4 leading-tight">
                    When the usual stories<br className="hidden md:block" /> aren't enough.
                  </h2>
                  <p className="text-white/40 text-sm leading-relaxed mb-1 max-w-md">
                    A section with its own rules.
                  </p>
                  <p className="text-white/30 text-sm leading-relaxed mb-8 max-w-md">
                    The Private Story, after midnight.
                  </p>
                  <div className="flex items-center gap-2 text-[#6b7dff] group-hover:text-[#8b9dff] transition-colors">
                    <span className="text-sm font-medium tracking-wide">Enter After Dark</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Mood column — abstract, no spoilers */}
                <div className="hidden md:flex flex-col gap-3 flex-shrink-0">
                  {[
                    { label: "Power Exchange", opacity: "opacity-60" },
                    { label: "The Forbidden", opacity: "opacity-40" },
                    { label: "More Than Two", opacity: "opacity-25" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`px-4 py-2 rounded-xl border border-white/5 bg-white/3 ${item.opacity}`}
                    >
                      <span className="text-xs text-white/60 tracking-wide">{item.label}</span>
                    </div>
                  ))}
                  <div className="px-4 py-2 rounded-xl border border-white/5 bg-white/3 opacity-10">
                    <span className="text-xs text-white/60 tracking-wide blur-sm">•••••••••</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* Slow Burn row */}
        {!isLoading && (
          <RowSlider
            title="Slow burn"
            subtitle="Patience before the moment — languid, layered, intimate"
            stories={slowBurn}
          />
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Final CTA                                                          */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-card/60 to-background p-10 md:p-16 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">Your story. Kept entirely yours.</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              A fantasy written for you.<br className="hidden md:block" />
              <span className="text-muted-foreground font-normal">Heard only by you.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-8 leading-relaxed">
              Tell us your moment. We write it, narrate it, and keep it private — from the very first word.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 hover:-translate-y-0.5 shadow-[0_0_48px_-12px_hsl(37_42%_68%_/_0.45)]"
            >
              <Sparkles className="w-5 h-5" />
              Begin your story
            </Link>
            <p className="text-xs text-muted-foreground/40 mt-4">
              60 seconds to begin. Private from the first moment.{" "}
              <Link href="/privacy" className="hover:text-primary transition-colors">How we protect it →</Link>
            </p>
          </div>
        </section>

      </div>
    </motion.div>
  );
}
