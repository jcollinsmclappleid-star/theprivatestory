import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Headphones, ChevronRight,
  EyeOff, WifiOff, Lock,
  Check, Loader2,
  Play, Pause,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useSEO } from "@/hooks/useSEO";
import { usePricing } from "@/hooks/usePricing";
import type { Story } from "@workspace/api-client-react";
import { HomeCreativityShowcase } from "@/components/HomeCreativityShowcase";
import { HeroLivingPortrait } from "@/components/HeroLivingPortrait";
import { LogoHero } from "@/components/Logo";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { MiniDoorCTA } from "@/components/MiniDoorCTA";
import { TrustBar } from "@/components/TrustBar";
import { EDITORS_PICKS, EDITORS_PICK_AUDIO_VERSION, type EditorsPick } from "@/data/editorsPicks";
import { useAudioPlayer } from "@/store/use-audio-player";
import { SAMPLE_ID_PREFIX, isSampleId } from "@/data/sampleId";
import { handoffFromSample } from "@/lib/sampleInspiredBrief";
import { preloadHomeCriticalImages, preloadHomeCarouselImages } from "@/lib/preloadHomeAssets";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Editor's Pick → global audio store adapter (mirror of Samples.tsx)
// ---------------------------------------------------------------------------

const sampleAudioUrl = (slug: string) =>
  `${API_BASE}/voice-samples/editors-picks/${slug}.mp3?v=${EDITORS_PICK_AUDIO_VERSION}`;
const sampleCoverUrl = (slug: string) =>
  `${API_BASE}/voice-samples/editors-picks/covers/${slug}.webp`;

function formatSampleDuration(runtimeSec: number): string {
  if (runtimeSec < 60) return `~${runtimeSec} sec`;
  const mins = Math.max(1, Math.round(runtimeSec / 60));
  return mins === 1 ? "~1 min" : `~${mins} min`;
}

function pickToStory(pick: EditorsPick): Story {
  return {
    id: `${SAMPLE_ID_PREFIX}${pick.slug}`,
    title: pick.title,
    description: pick.tagline,
    mood: pick.tags[0] ?? "sample",
    tags: pick.tags,
    duration: formatSampleDuration(pick.runtimeSec),
    coverImage: sampleCoverUrl(pick.slug),
    audioUrl: sampleAudioUrl(pick.slug),
    isPremium: false,
    isNew: false,
  };
}

/** Featured studio teasers on home (~40 sec each). */
const HERO_SAMPLE_SLUGS = ["02-adjoining-suites", "06-supervisor"] as const;

const MOBILE_HERO_PROOF = [
  { icon: Sparkles, text: "1M+ fantasy combinations — yours is written fresh" },
  { icon: Headphones, text: "Full-cast audio · ~10 min · private to your account" },
] as const;

/** Shared hero copy — one message on mobile and desktop. */
function HomeHeroCopy({ layout }: { layout: "mobile" | "desktop" }) {
  const isMobile = layout === "mobile";
  return (
    <>
      <div className={`flex flex-col ${isMobile ? "items-center -mt-0.5 mb-2" : "mb-3"}`}>
        {isMobile ? (
          <LogoHero height={56} className="max-w-[min(90vw,17rem)] mb-1" />
        ) : (
          <p
            className={`hero-brand-title font-bold uppercase ${
              isMobile ? "text-[10px] tracking-[0.34em]" : "text-[10px] tracking-[0.32em]"
            }`}
          >
            The Private Story
          </p>
        )}
      </div>
      <h1
        className={`font-display font-bold text-white tracking-tight ${
          isMobile
            ? "text-[1.75rem] leading-[1.08] mb-4 text-center"
            : "text-[1.85rem] sm:text-5xl md:text-6xl leading-[1.1] md:drop-shadow-xl"
        }`}
      >
        You create the fantasy.
        <span className={`block text-primary ${isMobile ? "mt-1" : "mt-1 sm:mt-2"}`}>
          We write &amp; narrate it.
        </span>
      </h1>
      <div
        className={`space-y-3 ${
          isMobile ? "mx-auto max-w-[21rem] text-center mb-1" : "max-w-xl text-left"
        }`}
      >
        <p
          className={`text-white/82 leading-relaxed ${
            isMobile ? "text-[14px]" : "text-[15px] md:text-base"
          }`}
        >
          Create who you want and how they look — which city, which room, the situation that
          won&apos;t leave you alone — then the fantasy, from slow burn to no limits, and the voice
          that makes your skin prickle.
        </p>
        <p
          className={`text-white/65 leading-relaxed ${
            isMobile ? "text-[13px]" : "text-[15px] md:text-base"
          }`}
        >
          Your{" "}
          <span className="hero-accent-purple font-semibold">spicy audio fantasy</span>, written and
          narrated in ~ten private minutes. Yours alone.
        </p>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Data hooks
// ---------------------------------------------------------------------------

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

// CastingPreview removed — merged into CreationStudio at top of funnel.

// ---------------------------------------------------------------------------
// SamplePlayCard — used by The Listening Room (3 cards) and the After Dark
// teaser (1 card). Plays through the central useAudioPlayer store so the
// FloatingPlayer takes over once a card starts playing, exactly like /samples.
// ---------------------------------------------------------------------------

interface SamplePlayCardProps {
  pick: EditorsPick;
  /** "gold" for The Listening Room, "indigo" for the After Dark teaser. */
  tone: "gold" | "indigo";
  /** Highlight + scale this card (used for the centre Listening Room card). */
  featured?: boolean;
  /** Link to /after-dark with brief pre-filled from this teaser. */
  showInspiredLink?: boolean;
}

function SamplePlayCard({ pick, tone, featured = false, showInspiredLink = false }: SamplePlayCardProps) {
  const { currentStory, isPlaying, play, togglePlay } = useAudioPlayer();
  const isCurrent = useMemo(
    () =>
      !!currentStory &&
      isSampleId(currentStory.id) &&
      currentStory.id.slice(SAMPLE_ID_PREFIX.length) === pick.slug,
    [currentStory, pick.slug],
  );
  const cardPlaying = isCurrent && isPlaying;

  const onClick = useCallback(() => {
    if (isCurrent) togglePlay();
    else play(pickToStory(pick));
  }, [isCurrent, togglePlay, play, pick]);

  const accent =
    tone === "gold"
      ? {
          ring: featured
            ? "ring-1 ring-primary/50 shadow-[0_24px_60px_-20px_rgba(201,162,39,0.45)]"
            : "ring-1 ring-white/8",
          chip: "border-primary/30 bg-primary/8 text-primary/85",
          play:
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_24px_-6px_rgba(201,162,39,0.6)]",
        }
      : {
          ring: "ring-1 ring-[#7b8fff]/25 shadow-[0_24px_60px_-20px_rgba(60,70,200,0.5)]",
          chip: "border-[#7b8fff]/30 bg-[#7b8fff]/10 text-[#9baeff]",
          play:
            "bg-[#7b8fff]/90 text-[#0a0a1e] hover:bg-[#9baeff] shadow-[0_0_24px_-6px_rgba(123,143,255,0.55)]",
        };

  return (
    <div className={["group relative w-full", featured ? "md:scale-[1.03]" : ""].join(" ")}>
    <button
      type="button"
      onClick={onClick}
      aria-pressed={cardPlaying}
      aria-label={cardPlaying ? `Pause ${pick.title}` : `Play ${pick.title}`}
      className={[
        "relative w-full text-left rounded-3xl overflow-hidden bg-[#0f0d0a] transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        accent.ring,
      ].join(" ")}
    >
      {/* Cover */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={sampleCoverUrl(pick.slug)}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d0a] via-[#0f0d0a]/55 to-transparent" />

        {/* Voice badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${accent.chip}`}>
            {pick.cast.length} voices · {formatSampleDuration(pick.runtimeSec)}
          </span>
        </div>

        {/* Pairing chip (top-right) */}
        <div className="absolute top-4 right-4 z-10">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider bg-black/45 border border-white/10 text-white/75">
            {pick.pairing}
          </span>
        </div>

        {/* Title block over fade */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 md:p-6">
          <p className="font-display italic text-xl md:text-[1.55rem] leading-tight text-white/95 mb-1.5 drop-shadow">
            {pick.title}
          </p>
          <p className="text-[12px] text-white/80 leading-snug">
            {pick.tagline}
          </p>
        </div>
      </div>

      {/* Footer — play control + ends-on */}
      <div className="flex items-center gap-3 p-4 md:p-5 border-t border-white/5">
        <span
          className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all ${accent.play}`}
          aria-hidden="true"
        >
          {cardPlaying
            ? <Pause className="w-4 h-4" fill="currentColor" />
            : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
        </span>
        <span className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-0.5">
            Ends on
          </span>
          <span className="text-[12px] italic text-white/85 leading-snug truncate">
            {pick.endsOn}
          </span>
        </span>
        <span className="flex-shrink-0 text-[10px] text-white/35 tabular-nums">
          {formatSampleDuration(pick.runtimeSec)} teaser
        </span>
      </div>
    </button>
    {showInspiredLink && (
      <Link
        href="/after-dark"
        onClick={() => handoffFromSample(pick)}
        className="mt-2 flex items-center justify-center gap-1 w-full py-2.5 rounded-xl border border-primary/25 bg-primary/5 text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors min-h-[44px]"
      >
        Build one like this
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

export default function Home() {
  const { pack1, pack5, pack20 } = usePricing();

  useEffect(() => {
    preloadHomeCriticalImages();
    const el = document.getElementById("what-you-get");
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          preloadHomeCarouselImages();
          obs.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useSEO({
    title: "The Private Story — Personalised Audio Fantasy",
    description:
      "Create your spicy audio fantasy — ~10 minutes, full-cast narration, written from your choices and private to you alone.",
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">

      {/* ------------------------------------------------------------------ */}
      {/* Hero — cinematic moving portrait + SEO copy                         */}
      {/* ------------------------------------------------------------------ */}

      {/* Mobile — branded header, copy, portrait, CTA */}
      <section className="relative z-30 w-full md:hidden px-3 pt-1 pb-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-lg mx-auto rounded-2xl border border-primary/15 bg-gradient-to-b from-primary/[0.07] via-background/50 to-transparent px-4 pt-3 pb-4 shadow-[0_20px_56px_-28px_rgba(0,0,0,0.85)]"
        >
          <div className="text-center mb-2">
            <HomeHeroCopy layout="mobile" />
          </div>

          <HeroLivingPortrait variant="contained" className="mx-auto mb-3 !max-h-[min(30vh,240px)]" />

          <div className="flex flex-col gap-2.5">
            <Link
              href="/after-dark"
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm bg-primary text-primary-foreground transition-all active:scale-[0.99] shadow-[0_0_32px_-6px_hsl(var(--primary)/0.55)] min-h-[48px]"
            >
              <Sparkles className="w-4 h-4" />
              Create your fantasy
            </Link>
            <a
              href="#home-samples"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-white/60 hover:text-primary transition-colors py-1"
            >
              <Headphones className="w-3.5 h-3.5" />
              Hear a sample first
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-4 mb-2">
            {MOBILE_HERO_PROOF.map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-[10px] text-white/70"
              >
                <Icon className="w-3 h-3 text-primary/75 flex-shrink-0" />
                {text.split(" — ")[0]}
              </span>
            ))}
          </div>
          <p className="text-center text-[10px] text-white/45">
            From {pack1.display} · one-time purchase · credits never expire · 18+
          </p>
        </motion.div>
      </section>

      {/* Desktop hero */}
      <section className="relative z-30 w-full min-h-0 md:min-h-[min(88vh,720px)] pt-2 pb-4 md:pt-4 md:pb-6 px-6 sm:px-8 hidden md:flex flex-col items-start justify-start overflow-x-hidden">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none hidden md:block">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% -5%, rgba(180,120,160,0.14) 0%, rgba(120,80,140,0.08) 48%, transparent 72%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/82 to-background/25 lg:from-background/92 lg:via-background/55 lg:to-transparent" />
        </div>

        <HeroLivingPortrait variant="overlay" className="hidden md:block" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.75 }}
          className="relative flex flex-col items-start gap-4 md:gap-8 w-full md:max-w-xl lg:max-w-[42%] pt-2 md:pt-4"
        >
          <HomeHeroCopy layout="desktop" />

          <Link href="/after-dark" className="w-full md:w-auto">
            <button
              type="button"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm bg-primary text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90 active:scale-100 shadow-[0_0_32px_-6px_hsl(var(--primary)/0.55)]"
            >
              <Sparkles className="w-4 h-4" />
              Create your fantasy
            </button>
          </Link>

          <p className="text-xs text-white/70 hidden md:block">
            From {pack1.display} · one-time purchase · credits never expire · 18+
            {" · "}
            <Link href="/pricing" className="text-primary/80 hover:text-primary transition-colors">
              20 stories · best value
            </Link>
          </p>

          <a
            href="#home-samples"
            className="hidden md:flex items-center justify-center sm:justify-start gap-1.5 text-xs text-white/80 hover:text-primary transition-colors tracking-widest uppercase py-2"
          >
            <Headphones className="w-3 h-3" />
            Hear a sample first ↓
          </a>
        </motion.div>
      </section>

      {/* Private promise — desktop */}
      <section className="relative z-20 px-6 sm:px-8 pb-2 md:pb-0 -mt-1 hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 py-3 px-4 rounded-2xl border border-primary/15 bg-primary/5">
          {[
            { icon: <Sparkles className="w-3 h-3" />, label: "1M+ combos — written fresh" },
            { icon: <EyeOff className="w-3 h-3" />, label: "Private to you" },
            { icon: <Headphones className="w-3 h-3" />, label: "Full-cast · ~10 min" },
            { icon: <Lock className="w-3 h-3" />, label: "One-time · credits never expire" },
          ].map(({ icon, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-[11px] text-white/80 font-medium">
              <span className="text-primary/75">{icon}</span>
              {label}
            </span>
          ))}
        </div>
      </section>

      <StickyMobileCTA
        priceDisplay={pack1.display}
        href="/after-dark"
        label="Create your fantasy"
      />

      <div className="relative z-20 space-y-0">

        <HomeCreativityShowcase />

        {/* ---------------------------------------------------------------- */}
        {/* Proof — hear the narration (featured samples)                     */}
        {/* ---------------------------------------------------------------- */}
        <section id="home-samples" className="py-8 px-4 md:px-8 max-w-7xl mx-auto w-full scroll-mt-20">
          <div className="text-center mb-8 max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary mb-3">
              The studio
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              Thirty seconds of proof.{" "}
              <span className="text-primary">Ten minutes of yours.</span>
            </h2>
            <p className="text-white/80 text-base leading-relaxed mb-4">
              Tap play on a card to hear the craft — then imagine your version at full length.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Private to your account",
                "Full-cast · ~10 min",
                "Original cover art",
              ].map((label) => (
                <span
                  key={label}
                  className="px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-[10px] text-white/70"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 items-stretch max-w-3xl mx-auto">
            {HERO_SAMPLE_SLUGS.map((slug) => {
              const pick = EDITORS_PICKS.find((p) => p.slug === slug);
              if (!pick) return null;
              return (
                <SamplePlayCard
                  key={slug}
                  pick={pick}
                  tone="gold"
                  featured
                  showInspiredLink
                />
              );
            })}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/samples"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-sm px-7 py-3.5 rounded-full hover:bg-primary/90 transition-all shadow-[0_0_32px_-6px_hsl(var(--primary)/0.55)]"
            >
              Hear all studio teasers
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-center text-xs text-white/65 mt-4">
            Teasers fade on a held breath. Your story runs ~10 minutes — full-cast, private, entirely yours.
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Trust bar                                                         */}
        {/* ---------------------------------------------------------------- */}
        <TrustBar />

        {/* ---------------------------------------------------------------- */}
        {/* Explicit register teaser — gold frame, links to creation           */}
        {/* ---------------------------------------------------------------- */}
        <section
          id="after-dark-section"
          className="py-8 px-4 md:px-8 max-w-3xl mx-auto w-full scroll-mt-24 text-center"
        >
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/70 mb-3">
            Ready when you are
          </p>
          <p className="text-white/80 text-sm leading-relaxed mb-5">
            The same premium narration — from slow-burn intimate to explicitly unrestrained. Written around your choices, private to you.
          </p>
          <Link
            href="/after-dark"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-[0_0_28px_-8px_rgba(201,162,39,0.55)]"
          >
            Create your fantasy
            <ChevronRight className="w-4 h-4" />
          </Link>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Emotion-led hook                                                  */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-20 px-4 md:px-8 max-w-2xl mx-auto w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-5">
              <p className="text-2xl md:text-3xl font-display font-medium text-white/88 leading-snug">
                Have you ever wanted a story written entirely around you?
              </p>
              <p className="text-base md:text-lg text-white/80 leading-relaxed">
                Your world. Your rules. The tension that builds exactly as you like it — and a story that feels written for you, because it was.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Not curated for everyone. Created for you.",
                "Choose the feeling. Choose how far it goes.",
                "Narrated for you alone. Kept in your personal collection.",
              ].map((line) => (
                <p
                  key={line}
                  className="text-sm text-white/80 tracking-wide italic"
                >
                  {line}
                </p>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-x-5 gap-y-2">
              {[
                { icon: <EyeOff className="w-3 h-3" />, label: "Visible only to you" },
                { icon: <WifiOff className="w-3 h-3" />, label: "No sharing" },
                { icon: <Lock className="w-3 h-3" />, label: "No profile" },
                { icon: <Headphones className="w-3 h-3" />, label: "Saved privately" },
              ].map(({ icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-[11px] text-white/80">
                  <span className="text-primary/70">{icon}</span>
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Pricing teaser                                                    */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="rounded-3xl border border-border/25 bg-card/20 p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center mb-8">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2">Private access</p>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
                  A story written entirely for you.<br className="hidden md:block" />
                  <span className="text-muted-foreground font-normal"> Whenever the moment calls for it.</span>
                </h2>
              </div>
              <Link
                href="/pricing"
                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/10 transition-all whitespace-nowrap"
              >
                See all pack details
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Immersive Collection — Best Value */}
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 relative overflow-hidden shadow-[0_0_40px_-12px_rgba(201,162,39,0.2)] flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Immersive Collection</p>
                  <span className="px-1.5 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[9px] font-bold tracking-wider uppercase">Best value</span>
                </div>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="font-display text-3xl font-bold text-foreground tabular-nums">{pack20.display}</span>
                </div>
                <p className="text-xs text-muted-foreground/80 mb-4"><span className="tabular-nums">{pack20.perStoryDisplay}</span> per story · 20 stories · After Dark included</p>
                <Link
                  href="/pricing"
                  className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-[0_0_24px_-4px_rgba(201,162,39,0.4)]"
                >
                  Unlock 20 Stories
                </Link>
              </div>

              {/* Immersive Bundle */}
              <div className="rounded-2xl border border-border/25 bg-background/30 p-6 flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-3">Immersive Bundle</p>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="font-display text-3xl font-bold text-foreground tabular-nums">{pack5.display}</span>
                </div>
                <p className="text-xs text-muted-foreground/80 mb-4"><span className="tabular-nums">{pack5.perStoryDisplay}</span> per story · 5 stories · After Dark included</p>
                <Link
                  href="/pricing"
                  className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-border/40 bg-background/40 text-sm font-semibold text-foreground/80 hover:border-primary/40 hover:text-primary transition-all"
                >
                  Get 5 Stories
                </Link>
              </div>

              {/* Immersive Story — trial */}
              <div className="rounded-2xl border border-border/25 bg-background/30 p-6 flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-3">Immersive Story</p>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="font-display text-3xl font-bold text-foreground tabular-nums">{pack1.display}</span>
                </div>
                <p className="text-xs text-muted-foreground/80 mb-4">1 story · the simplest way to try your first</p>
                <Link
                  href="/pricing"
                  className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-border/40 bg-background/40 text-sm font-semibold text-foreground/80 hover:border-primary/40 hover:text-primary transition-all"
                >
                  Create One Story
                </Link>
              </div>

            </div>

            <div className="text-center space-y-2">
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground/80">
                {["Your personal collection included", "After Dark included", "Cast every character yourself", "Add more stories whenever you want"].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-primary/30 inline-block" />
                    {item}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/80">
                Every pack includes: your personal collection · original cover art · premium voice narration ·{" "}
                <Link href="/pricing" className="text-primary/80 hover:text-primary transition-colors">see all packs →</Link>
              </p>
            </div>
          </div>
        </section>


        {/* ---------------------------------------------------------------- */}
        {/* SEO page links                                                    */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

            {/* Core */}
            <div className="rounded-2xl border border-border/20 bg-card/20 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-3">Personalised</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Personalised audio stories", href: "/personalised-audio-stories" },
                  { label: "Private audio stories", href: "/private-audio-stories" },
                  { label: "Adult audio stories", href: "/adult-audio-stories" },
                  { label: "Audio stories for women", href: "/audio-stories-for-women" },
                  { label: "Create your own audio story", href: "/create-your-own-audio-story" },
                  { label: "AI audio story generator", href: "/ai-audio-story-generator" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground/80 hover:text-primary transition-colors leading-snug flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3 h-3 text-primary/70 group-hover:text-primary/60 transition-colors flex-shrink-0" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Bedtime */}
            <div className="rounded-2xl border border-border/20 bg-card/20 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-3">Relaxation</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Bedtime audio stories", href: "/bedtime-audio-stories" },
                  { label: "Relaxing audio stories", href: "/relaxing-audio-stories" },
                  { label: "Sleep audio stories", href: "/sleep-audio-stories" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground/80 hover:text-primary transition-colors leading-snug flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3 h-3 text-primary/70 group-hover:text-primary/60 transition-colors flex-shrink-0" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Romantic */}
            <div className="rounded-2xl border border-border/20 bg-card/20 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-3">Romantic</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Romantic audio stories", href: "/romantic-audio-stories" },
                  { label: "Love stories audio", href: "/love-stories-audio" },
                  { label: "Emotional audio stories", href: "/emotional-audio-stories" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground/80 hover:text-primary transition-colors leading-snug flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3 h-3 text-primary/70 group-hover:text-primary/60 transition-colors flex-shrink-0" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Intimate */}
            <div className="rounded-2xl border border-border/20 bg-card/20 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-3">Intimate & Genre</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Intimate audio stories", href: "/intimate-audio-stories" },
                  { label: "Late night audio stories", href: "/late-night-audio-stories" },
                  { label: "Slow burn audio stories", href: "/slow-burn-audio-stories" },
                  { label: "Confident energy stories", href: "/confident-energy-stories" },
                  { label: "Quiet intensity stories", href: "/quiet-intensity-stories" },
                  { label: "Dark romance audio stories", href: "/dark-romance-audio-stories" },
                  { label: "Forbidden romance stories", href: "/forbidden-romance-audio-stories" },
                  { label: "Enemies to lovers stories", href: "/enemies-to-lovers-audio-stories" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground/80 hover:text-primary transition-colors leading-snug flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3 h-3 text-primary/70 group-hover:text-primary/60 transition-colors flex-shrink-0" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Compare & Alternatives */}
            <div className="rounded-2xl border border-border/20 bg-card/20 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-3">Compare &amp; Alternatives</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Dipsea alternative", href: "/dipsea-alternative" },
                  { label: "Quinn alternative", href: "/quinn-alternative" },
                  { label: "Ferly alternative", href: "/ferly-alternative" },
                  { label: "GoneWildAudio alternative", href: "/gonewildaudio-alternative" },
                  { label: "Audio stories vs audiobooks", href: "/audio-stories-vs-audiobooks" },
                  { label: "Best audio story app", href: "/best-audio-story-app-for-adults" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground/80 hover:text-primary transition-colors leading-snug flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3 h-3 text-primary/70 group-hover:text-primary/60 transition-colors flex-shrink-0" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/discover"
              className="text-xs text-primary/70 hover:text-primary transition-colors tracking-widest uppercase"
            >
              Browse all 60+ story types →
            </Link>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Final CTA — mini doors                                            */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full flex flex-col items-center gap-6">
          <MiniDoorCTA />
          <div className="flex items-center gap-5">
            <Link
              href="/pricing"
              className="text-xs text-primary/70 hover:text-primary transition-colors tracking-widest uppercase"
            >
              View pricing →
            </Link>
            <span className="text-white/15 text-xs">·</span>
            <Link
              href="/samples"
              className="text-xs text-white/40 hover:text-white/70 transition-colors tracking-widest uppercase"
            >
              Hear a sample →
            </Link>
          </div>
          <p className="text-[11px] text-muted-foreground/80">
            Under 3 minutes from first choice to listening. Private from the first word.{" "}
            <Link href="/privacy" className="hover:text-primary/60 transition-colors">How we protect it →</Link>
          </p>
        </section>

      </div>
    </motion.div>
  );
}
