import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Play, Gift, Sparkles, Headphones, Wand2, BookOpen, Check, ChevronRight,
} from "lucide-react";
import { Link } from "wouter";
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
    fetch(`${API_BASE}/api/continue-listening`, { credentials: "include" })
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
    fetch(`${API_BASE}/api/recommendations`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setRecs(data); })
      .catch(() => {});
  }, [isAuthenticated]);
  return recs;
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

  const featured = stories?.[0];
  const tonightPicks = stories?.slice(1, 9) || [];
  const lateNight = stories?.filter(s => s.mood === "Late Night") || [];
  const slowBurn = stories?.filter(s => s.mood === "Slow Burn") || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">

      {/* ------------------------------------------------------------------ */}
      {/* Hero */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative w-full h-[75vh] min-h-[560px] flex items-end pb-24">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Hero Background"
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
            <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-4">
              The Private Story
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-4 leading-tight drop-shadow-xl">
              Written for you.<br className="hidden md:block" /> Private to you.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-2">
              Tell us your mood, your moment, your fantasy. The Private Story writes and narrates a cinematic audio story — shaped around you, seen only by you, ready in minutes.
            </p>
            <p className="text-sm text-muted-foreground/60 mb-8 italic">
              No history shared. No social. Best experienced alone, with headphones.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              {/* PRIMARY: Create Story */}
              <Link
                href="/create"
                className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-base hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-glow"
              >
                <Sparkles className="w-5 h-5" />
                Write My Story
              </Link>
              {/* SECONDARY: Browse */}
              <Link
                href="/browse"
                className="flex items-center gap-2 px-6 py-4 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-border/80 transition-all font-medium"
              >
                <Play className="w-4 h-4 fill-current" />
                Browse Stories
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground/60 tracking-wide">
              {["Free to create", "AI-written & narrated", "Cinematic audio", "Completely private"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary/40 inline-block" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="relative z-20 -mt-12 space-y-4">

        {/* ---------------------------------------------------------------- */}
        {/* How it works — 3 steps */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-4">
              How It Works
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Your story in three steps.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              No templates. No generic output. A real story written around your exact mood and moment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                step: "01",
                icon: <Wand2 className="w-6 h-6 text-primary" />,
                title: "Describe your moment",
                desc: "Choose your mood, intensity, and voice feel. Add a brief prompt — a setting, a feeling, an idea. It takes about 60 seconds.",
              },
              {
                step: "02",
                icon: <Sparkles className="w-6 h-6 text-primary" />,
                title: "We write it for you",
                desc: "GPT-4o crafts a cinematic, multi-scene story shaped around your choices. Every story is original and written from scratch.",
              },
              {
                step: "03",
                icon: <Headphones className="w-6 h-6 text-primary" />,
                title: "Listen privately",
                desc: "Your story is narrated in your chosen voice and saved to your private library. Listen now, or save it for tonight.",
              },
            ].map((item) => (
              <div key={item.step} className="relative glass-panel rounded-2xl p-6">
                <span className="absolute top-4 right-4 text-4xl font-display font-bold text-primary/10">{item.step}</span>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-display font-semibold text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold text-base hover:bg-primary/90 transition-all hover:scale-105 hover:-translate-y-0.5 shadow-[0_0_48px_-12px_hsl(37_42%_68%_/_0.45)]"
            >
              <Sparkles className="w-5 h-5" />
              Write My Story — It's Free
            </Link>
            <p className="text-xs text-muted-foreground/50 mt-3">No account required to create your first story.</p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Continue Listening */}
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
        {/* Story rows */}
        {/* ---------------------------------------------------------------- */}
        {isLoading ? (
          <>
            <SkeletonRow count={5} />
            <SkeletonRow count={5} />
          </>
        ) : (
          <>
            {recs.for_you.length > 0 && (
              <RowSlider title="For You" subtitle="Picked for tonight" stories={recs.for_you as Story[]} />
            )}
            <RowSlider title="Tonight's Picks" subtitle="Curated for this exact mood" stories={tonightPicks} />
            {recs.has_taste_profile && recs.because_you_liked.length > 0 && (
              <RowSlider
                title={recs.because_you_liked_mood ? `Because you liked ${recs.because_you_liked_mood}` : "You May Also Like"}
                stories={recs.because_you_liked as Story[]}
              />
            )}
            <RowSlider title="Late Night" subtitle="Made for after midnight" stories={lateNight} />
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* #2: Subscribe / Premium Library */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/40 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-background/60" />
            <div className="relative z-10 p-8 md:p-14 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-4">
                  Premium Library
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Unlimited stories.<br className="hidden md:block" /> One subscription.
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Access every story in our curated library — late night listens, slow burns, emotional journeys — plus save your own creations. Stream anything, anytime, privately.
                </p>
                <ul className="space-y-2 mb-8">
                  {[
                    "Unlimited access to all curated stories",
                    "Save your AI-created stories to your library",
                    "New stories added every week",
                    "Listen across all your devices",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-4 flex-wrap">
                  <Link
                    href="/library"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full font-semibold hover:bg-primary/90 transition-all hover:scale-105"
                  >
                    <BookOpen className="w-4 h-4" />
                    Explore the Library
                  </Link>
                  <span className="text-xs text-muted-foreground/60">Coming soon — join early access</span>
                </div>
              </div>
              <div className="hidden md:block flex-shrink-0 w-64">
                <div className="space-y-3">
                  {[
                    { mood: "Slow Burn", title: "Everything We Didn't Say" },
                    { mood: "Late Night", title: "The Hour Before Dawn" },
                    { mood: "Romantic", title: "A Sunday That Lasts Forever" },
                    { mood: "Intimate", title: "After Everything" },
                  ].map((s, i) => (
                    <div
                      key={s.title}
                      className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/20"
                      style={{ opacity: 1 - i * 0.18 }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Headphones className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-primary font-medium">{s.mood}</p>
                        <p className="text-xs text-foreground font-medium line-clamp-1">{s.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* More story rows */}
        {!isLoading && (
          <RowSlider title="Slow Burn" subtitle="Languid, layered, and intimate" stories={slowBurn} />
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Featured story CTA */}
        {/* ---------------------------------------------------------------- */}
        {featured && (
          <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
            <div className="relative overflow-hidden rounded-3xl h-64 md:h-72">
              <img
                src={featured.coverImage}
                alt={featured.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
              <div className="relative h-full flex flex-col justify-center px-8 max-w-lg">
                <span className="text-xs font-medium text-primary uppercase tracking-widest mb-2">Featured Story</span>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2 line-clamp-2">{featured.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{featured.description}</p>
                <Link
                  href={`/story/${featured.id}`}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold w-fit hover:bg-primary/90 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Listen Now
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* #3: Gift — small supporting section */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="rounded-3xl border border-border/30 bg-card/30 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Gift className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">Give the gift of a story.</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                Want to create something for someone else? Gift a personalised romantic audio story — built around their names, your relationship, and a special moment. More meaningful than anything you can order online.
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3">
              <Link
                href="/gift"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-105 whitespace-nowrap"
              >
                <Gift className="w-4 h-4" />
                Gift a Story
              </Link>
              <Link
                href="/gift"
                className="inline-flex items-center gap-2 border border-border/40 text-muted-foreground px-6 py-3 rounded-full text-sm hover:border-primary/40 hover:text-foreground transition-all whitespace-nowrap"
              >
                See how it works
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Final Create Story CTA */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-card/60 to-background p-10 md:p-16 text-center">
            <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">Your private story is waiting.</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Written for you.<br className="hidden md:block" /> Kept for you.
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-8">
              60 seconds to describe your moment. Then we write it, narrate it, and keep it private. Always.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 hover:-translate-y-0.5 shadow-[0_0_48px_-12px_hsl(37_42%_68%_/_0.45)]"
            >
              <Sparkles className="w-5 h-5" />
              Write My Story
            </Link>
          </div>
        </section>

      </div>
    </motion.div>
  );
}
