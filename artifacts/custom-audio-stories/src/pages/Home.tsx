import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Gift, Heart, ShieldCheck, Headphones, Sparkles, Lock } from "lucide-react";
import { Link } from "wouter";
import { RowSlider } from "@/components/RowSlider";
import { SkeletonRow } from "@/components/SkeletonCard";
import { GiftFAQ } from "@/components/GiftFAQ";
import { useStoriesFallback } from "@/hooks/use-api-fallbacks";
import { useAudioPlayer } from "@/store/use-audio-player";
import { useAuth } from "@/hooks/useAuth";
import type { Story } from "@workspace/api-client-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

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
        <img
          src={story.coverImage}
          alt={story.title}
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-xs text-primary font-medium tracking-widest uppercase mb-0.5">{story.mood}</p>
          <p className="text-sm font-semibold text-white line-clamp-1">{story.title}</p>
          <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${progressFraction * 100}%` }}
            />
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
// Sample preview cards (dummy — no real audio yet)
// ---------------------------------------------------------------------------

const SAMPLE_PREVIEWS = [
  {
    mood: "Romantic",
    title: "The Night We Stayed",
    description: "A hotel room, a long evening, and the feeling you never want to end.",
    duration: "10 min",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  },
  {
    mood: "Slow Burn",
    title: "Everything We Didn't Say",
    description: "Two people, a long silence, and all the things that don't need words.",
    duration: "12 min",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
  },
  {
    mood: "Intimate",
    title: "A Sunday That Lasts Forever",
    description: "Soft light, tangled sheets, and nowhere either of you needs to be.",
    duration: "8 min",
    image: "https://images.unsplash.com/photo-1518756131217-31eb79b20e8f?w=600&q=80",
  },
  {
    mood: "Comforting Night Story",
    title: "After Everything",
    description: "A quiet story for the end of the day — warm, close, and entirely yours.",
    duration: "7 min",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
  },
];

function SamplePreviewCard({ story }: { story: typeof SAMPLE_PREVIEWS[0] }) {
  const [playing, setPlaying] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="flex-shrink-0 w-64 rounded-2xl overflow-hidden border border-border/30 bg-card/40 group"
    >
      <div className="relative h-36 overflow-hidden">
        <img
          src={story.image}
          alt={story.mood}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <button
          onClick={() => setPlaying(!playing)}
          className="absolute inset-0 flex items-center justify-center"
          aria-label={playing ? "Pause preview" : "Play preview"}
        >
          <div className="w-12 h-12 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary hover:scale-110 transform transition-all">
            {playing ? (
              <div className="flex gap-1">
                <div className="w-1 h-4 bg-primary-foreground rounded-full" />
                <div className="w-1 h-4 bg-primary-foreground rounded-full" />
              </div>
            ) : (
              <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
            )}
          </div>
        </button>
        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary text-xs font-medium">
          {story.mood}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground text-base mb-1 line-clamp-1">{story.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{story.description}</p>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
            <Headphones className="w-3 h-3" />
            {story.duration}
          </span>
          <span className="text-xs text-primary font-medium">Sample</span>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Trust strip
// ---------------------------------------------------------------------------

const TRUST_ITEMS = [
  { icon: <Lock className="w-5 h-5" />, label: "Private & Discreet", sub: "Your story stays completely private" },
  { icon: <Sparkles className="w-5 h-5" />, label: "Fully Personalised", sub: "Built around your real details" },
  { icon: <Headphones className="w-5 h-5" />, label: "Premium Audio", sub: "Cinematic narration, beautifully produced" },
  { icon: <Gift className="w-5 h-5" />, label: "Thoughtful Gift", sub: "More meaningful than anything you can order" },
  { icon: <ShieldCheck className="w-5 h-5" />, label: "Secure Checkout", sub: "Discreet billing, safe payment" },
  { icon: <Heart className="w-5 h-5" />, label: "Digitally Delivered", sub: "Ready to listen anywhere, anytime" },
];

const OCCASION_TAGS = [
  "Anniversary", "Birthday", "Valentine's Day", "Just Because", "Long Distance", "Date Night",
  "New Relationship", "Special Surprise", "Getting Back Together",
];

// ---------------------------------------------------------------------------
// Main Home component
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

  const showContinue = continueListening.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col"
    >
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] min-h-[500px] flex items-end pb-24">
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
              Your Romantic Story
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-4 leading-tight drop-shadow-xl">
              {featured?.title || "Stories shaped around you"}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 line-clamp-2">
              {featured?.description || "Immersive, cinematic audio experiences crafted for your quietest moments."}
            </p>
            <p className="text-sm text-muted-foreground/60 mb-8 italic">
              Best experienced alone, with headphones.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href={`/story/${featured?.id}`}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-semibold flex items-center gap-2 transition-all hover:scale-105 hover:shadow-glow"
              >
                <Play className="w-5 h-5 fill-current" />
                Listen Now
              </Link>
              <Link
                href="/gift"
                className="flex items-center gap-2 px-6 py-4 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-all font-semibold"
              >
                <Gift className="w-4 h-4" />
                Give as a Gift
              </Link>
            </div>

            {/* Trust strip */}
            <div className="mt-8 flex flex-wrap gap-4 text-xs text-muted-foreground/60 tracking-wide">
              {["Personalised", "Audio-first", "Cinematic visuals", "Private library"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary/40 inline-block" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Rows */}
      <div className="relative z-20 -mt-12 space-y-4">

        {/* Continue Listening */}
        {showContinue && (
          <section className="py-4 px-4 md:px-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Continue Listening</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Pick up exactly where you left off.</p>
              </div>
              <Link href="/library?tab=continue" className="text-xs text-primary hover:text-primary/80 transition-colors">
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

        {isLoading ? (
          <>
            <SkeletonRow count={5} />
            <SkeletonRow count={5} />
            <SkeletonRow count={5} />
          </>
        ) : (
          <>
            {recs.for_you.length > 0 && (
              <RowSlider
                title="For You"
                subtitle="Picked for tonight"
                stories={recs.for_you as Story[]}
              />
            )}

            <RowSlider
              title="Tonight's Picks"
              subtitle="Curated for this exact mood"
              stories={tonightPicks}
            />

            {recs.has_taste_profile && recs.because_you_liked.length > 0 && (
              <RowSlider
                title={recs.because_you_liked_mood ? `Because you liked ${recs.because_you_liked_mood}` : "You May Also Like"}
                stories={recs.because_you_liked as Story[]}
              />
            )}

            <RowSlider
              title="Late Night"
              subtitle="Made for after midnight"
              stories={lateNight}
            />
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Gift CTA Banner */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="relative overflow-hidden rounded-3xl p-8 md:p-16 text-center border border-primary/20 bg-card/40 backdrop-blur-md flex flex-col items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1499914485622-a88fac536970?w=1200&q=80"
              alt="Atmosphere"
              className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/40" />
            <div className="relative z-10 max-w-xl mx-auto">
              <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-6">
                Gift a Story
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 text-foreground">
                Give something more meaningful.
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                A personalised romantic audio story — crafted around your names, your memories, your relationship. More intimate than flowers. More lasting than a card.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link
                  href="/gift"
                  className="inline-flex bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-8 py-4 rounded-full font-semibold items-center gap-2 transition-all hover:scale-105 hover:shadow-glow-lg"
                >
                  <Gift className="w-4 h-4" />
                  Build Your Gift
                </Link>
                <Link
                  href="/create"
                  className="inline-flex border border-border/40 text-muted-foreground px-6 py-4 rounded-full font-medium items-center gap-2 transition-all hover:border-primary/40 hover:text-foreground text-sm"
                >
                  Or create a free story
                </Link>
              </div>
            </div>
          </div>
        </section>

        {!isLoading && (
          <RowSlider
            title="Slow Burn"
            subtitle="Languid, layered, and intimate"
            stories={slowBurn}
          />
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Gift Positioning Section */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-4">
              A Personalised Gift
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              More meaningful than anything<br className="hidden md:block" /> you could order online.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A romantic audio story crafted around your partner, your names, and your relationship. Something they'll listen to alone, in the dark, wearing headphones — and feel completely seen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: <Heart className="w-6 h-6 text-primary" />,
                title: "Deeply Personal",
                desc: "Your names. Your setting. A memory you shared. All woven into a story that feels like it was written only for them.",
              },
              {
                icon: <Headphones className="w-6 h-6 text-primary" />,
                title: "Premium Audio",
                desc: "Cinematic narration, beautiful pacing, and optional ambient score. Like a film, but intimate and entirely yours.",
              },
              {
                icon: <Gift className="w-6 h-6 text-primary" />,
                title: "A Unique Gift",
                desc: "Nothing like it exists anywhere else. Not a card. Not a bouquet. A story made specifically for your relationship.",
              },
            ].map((item) => (
              <div key={item.title} className="glass-panel rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="font-display font-semibold text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Occasion tags */}
          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Perfect for any occasion</p>
            <div className="flex flex-wrap justify-center gap-2">
              {OCCASION_TAGS.map((tag) => (
                <Link
                  key={tag}
                  href="/gift"
                  className="px-4 py-2 rounded-full border border-border/40 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all text-sm"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Sample Previews */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Sample Stories</h2>
              <p className="text-xs text-muted-foreground mt-1">A taste of what we create — yours will be completely personalised.</p>
            </div>
            <Link href="/gift" className="text-xs text-primary hover:text-primary/80 transition-colors">
              Create yours →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {SAMPLE_PREVIEWS.map((story) => (
              <SamplePreviewCard key={story.title} story={story} />
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Trust / Reassurance Strip */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center mb-8">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Why people trust us</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TRUST_ITEMS.map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-4 rounded-2xl bg-card/40 border border-border/20">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-2xl bg-card/20 border border-border/10 text-center">
            <p className="text-xs text-muted-foreground/60">
              Discreet billing — your statement shows a neutral charge, never the product name.
              Your story details are never shared or stored publicly.
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Gift CTA — Final */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-card/60 to-background p-10 md:p-16 text-center">
            <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">Ready to begin?</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Start your romantic story.
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-8">
              A few minutes to personalise. A story they'll never forget.
            </p>
            <Link
              href="/gift"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 hover:-translate-y-0.5 shadow-[0_0_48px_-12px_hsl(37_42%_68%_/_0.45)]"
            >
              <Sparkles className="w-5 h-5" />
              Create Your Story
            </Link>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* FAQ */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-12 px-4 md:px-8 max-w-3xl mx-auto w-full">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">Common Questions</h2>
            <p className="text-muted-foreground">Everything you need to know before you start.</p>
          </div>
          <GiftFAQ />
        </section>

      </div>
    </motion.div>
  );
}
