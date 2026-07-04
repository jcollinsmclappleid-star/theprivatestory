import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Headphones, ChevronRight, Moon,
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
import { CreationStudio } from "@/components/CreationStudio";
import { HeroLivingPortrait } from "@/components/HeroLivingPortrait";
import { HeroChoiceChips } from "@/components/HeroChoiceChips";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { MiniDoorCTA } from "@/components/ThreeDoors";
import { TrustBar } from "@/components/TrustBar";
import { EDITORS_PICKS, type EditorsPick } from "@/data/editorsPicks";
import { useAudioPlayer } from "@/store/use-audio-player";
import { SAMPLE_ID_PREFIX, isSampleId } from "@/data/sampleId";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Editor's Pick → global audio store adapter (mirror of Samples.tsx)
// ---------------------------------------------------------------------------

const sampleAudioUrl = (slug: string) =>
  `${API_BASE}/voice-samples/editors-picks/${slug}.mp3`;
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

/** The single pick that fronts the After Dark teaser */
const AFTER_DARK_SLUG = "02-adjoining-suites";

const MOBILE_HERO_PROOF = [
  { icon: Sparkles, text: "1M+ fantasy combinations — yours is written fresh" },
  { icon: Headphones, text: "Full-cast audio · ~10 min · private to your account" },
] as const;

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
}

function SamplePlayCard({ pick, tone, featured = false }: SamplePlayCardProps) {
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
    <button
      type="button"
      onClick={onClick}
      aria-pressed={cardPlaying}
      aria-label={cardPlaying ? `Pause ${pick.title}` : `Play ${pick.title}`}
      className={[
        "group relative w-full text-left rounded-3xl overflow-hidden bg-[#0f0d0a] transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        accent.ring,
        featured ? "md:scale-[1.03]" : "",
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
  );
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

export default function Home() {
  const { pack1, pack5, pack20 } = usePricing();

  useSEO({
    title: "The Private Story — Personalised Erotica",
    description: "Create your personalised erotic audio fantasy — ~10 minutes, full-cast narration, written from your choices and private to you alone.",
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">

      {/* ------------------------------------------------------------------ */}
      {/* Hero — mobile: cinematic image + overlay copy; desktop: split overlay */}
      {/* ------------------------------------------------------------------ */}

      {/* Mobile — image-first, fantasy-forward */}
      <section className="relative z-30 w-full md:hidden min-h-[min(560px,88svh)] flex flex-col justify-end overflow-hidden">
        <HeroLivingPortrait variant="mobileBackdrop" />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,9,8,0.35) 0%, rgba(10,9,8,0.55) 38%, rgba(10,9,8,0.92) 72%, hsl(var(--background)) 100%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.65 }}
          className="relative z-10 px-5 pt-24 pb-5 flex flex-col gap-4"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary/90">
            Personalised erotic fantasy · private to you
          </p>
          <h1 className="text-[1.75rem] font-display font-bold text-white leading-[1.12]">
            You create the fantasy.{" "}
            <span className="text-primary">We write &amp; narrate it.</span>
          </h1>
          <p className="text-[14px] text-white/82 leading-relaxed max-w-[20rem]">
            Who they are, where it happens, how explicit — full-cast audio, yours alone, ready in minutes.
          </p>

          <Link href="/after-dark" className="w-full">
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm bg-primary text-primary-foreground transition-all active:scale-[0.99] shadow-[0_0_32px_-6px_hsl(var(--primary)/0.55)]"
            >
              <Sparkles className="w-4 h-4" />
              Create your fantasy
            </button>
          </Link>

          <a
            href="#creation-room"
            className="flex items-center justify-center gap-1.5 text-xs text-white/65 hover:text-primary transition-colors py-0.5"
          >
            <Headphones className="w-3.5 h-3.5" />
            Hear a sample first
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </motion.div>

        <div className="relative z-10 px-5 pb-4 space-y-2.5 border-t border-white/8 pt-4 mx-0 bg-background/40 backdrop-blur-[2px]">
          {MOBILE_HERO_PROOF.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-2.5">
              <Icon className="w-3.5 h-3.5 text-primary/80 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-white/72 leading-snug">{text}</p>
            </div>
          ))}
          <p className="text-[10px] text-white/45 pt-1">
            From {pack1.display} · one-time purchase · credits never expire · 18+
          </p>
        </div>
      </section>

      {/* Desktop hero */}
      <section className="relative z-30 w-full min-h-0 md:min-h-[min(88vh,720px)] pt-2 pb-4 md:pt-4 md:pb-6 px-6 sm:px-8 hidden md:flex flex-col items-start justify-start overflow-hidden">
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
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary/90">
            Your private audio fantasy · ready in minutes
          </p>
          <h1 className="text-[1.85rem] sm:text-5xl md:text-6xl font-display font-bold text-white leading-[1.1] md:drop-shadow-xl">
            Your fantasy. Your cast.{" "}
            <span className="text-primary">Your story.</span>
          </h1>

          <p className="text-[15px] md:text-lg text-white/85 tracking-wide max-w-xl leading-relaxed">
            Create your spicy fantasy — who they are, where it happens, how far you want it — we write and narrate{" "}
            <span className="text-white/95">~10 minutes just for you</span>.
          </p>

          <Link href="/after-dark" className="w-full md:w-auto">
            <button className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm bg-primary text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90 active:scale-100 shadow-[0_0_32px_-6px_hsl(var(--primary)/0.55)]">
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

          <div className="hidden md:flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <a
              href="#creation-room"
              className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-white/80 hover:text-primary transition-colors tracking-widest uppercase py-2"
            >
              <Sparkles className="w-3 h-3" />
              See how yours is built ↓
            </a>
          </div>
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
        secondaryLabel={`From ${pack1.display} · 20-pack`}
        secondaryHref="/pricing"
      />

      <div className="relative z-20 space-y-0 -mt-2 md:-mt-6">

        <HeroChoiceChips className="hidden md:block max-w-2xl mx-auto px-4 pt-4 pb-2" />

        <CreationStudio priceDisplay={pack1.display} />

        {/* ---------------------------------------------------------------- */}
        {/* Proof — hear the narration (featured samples first)               */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center mb-8 max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary mb-3">
              The studio
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              Thirty seconds of proof.{" "}
              <span className="text-primary">Ten minutes of yours.</span>
            </h2>
            <p className="text-white/80 text-base leading-relaxed">
              Hear the voices and the craft in a brief opening — every teaser stops before the story begins.{" "}
              <span className="text-white/90">Your version is ~10 minutes, full-cast, written only for you.</span>
            </p>
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
                />
              );
            })}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/samples"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-sm px-7 py-3.5 rounded-full hover:bg-primary/90 transition-all shadow-[0_0_32px_-6px_hsl(var(--primary)/0.55)]"
            >
              Hear all studio teasers
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/after-dark"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-white/85 border border-white/15 hover:border-primary/40 hover:text-white transition-all"
            >
              Create your fantasy from {pack1.display}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-center text-xs text-white/65 mt-4">
            Teasers fade on a held breath. Your story runs ~10 minutes — full-cast, private, entirely yours.
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Deliverable reassurance                                           */}
        {/* ---------------------------------------------------------------- */}
        <section className="flex flex-wrap items-center justify-center gap-3 px-4 py-4">
          {[
            { icon: <Headphones className="w-3 h-3" />, label: "Full-cast · ~10 min · original cover art" },
            { icon: <Sparkles className="w-3 h-3" />, label: "Cast entirely around your choices" },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/12 bg-white/4 text-[11px] text-white/85 font-medium"
            >
              <span className="text-primary/80">{icon}</span>
              {label}
            </span>
          ))}
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
          className="py-10 px-4 md:px-8 max-w-7xl mx-auto w-full scroll-mt-24"
        >
          <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-[#0d0a0c]">
            {/* Atmospheric layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a0f18] via-[#0d0a0c] to-[#120818] pointer-events-none" />
            <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-950/25 rounded-full blur-3xl pointer-events-none" />
            {/* Original After Dark artwork — kept */}
            <div
              className="absolute inset-y-0 right-0 w-2/5 pointer-events-none"
              aria-hidden="true"
              style={{
                backgroundImage: `url(${import.meta.env.BASE_URL}images/home-visual-3.webp)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                maskImage: "linear-gradient(to left, rgba(0,0,0,0.7) 0%, transparent 85%)",
                WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.7) 0%, transparent 85%)",
              }}
            />
            {/* Subtle vertical "door" of light on the right edge */}
            <div
              className="absolute top-8 bottom-8 right-[18%] w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10 p-8 md:p-14 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14 items-center">
              {/* Left — copy + CTA */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/70 mb-5">
                  Personalised Erotica
                </p>
                <h2 className="font-display text-3xl md:text-5xl font-bold text-white/92 leading-[1.1] mb-5">
                  Nothing held back.<br className="hidden md:block" />
                  <span className="text-primary">When you want it to be.</span>
                </h2>
                <p className="text-white/88 text-base leading-relaxed mb-3 max-w-md">
                  The same premium narration — with an intensity dial that runs from slow-burn intimate to explicitly unrestrained.
                </p>
                <p className="text-white/75 text-sm leading-relaxed mb-8 max-w-md">
                  Power, surrender, forbidden dynamics — written around your choices. Narrated for you alone.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/after-dark"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-[0_0_28px_-8px_rgba(201,162,39,0.55)]"
                  >
                    Create your fantasy
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <span className="text-[11px] text-white/65">
                    From {pack1.display} · 18+
                  </span>
                </div>
              </div>

              {/* Right — single Maya teaser card */}
              <div className="max-w-sm w-full mx-auto lg:mx-0 lg:ml-auto">
                {(() => {
                  const pick = EDITORS_PICKS.find((p) => p.slug === AFTER_DARK_SLUG);
                  if (!pick) return null;
                  return (
                    <div className="relative">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/60 mb-3 text-center lg:text-left">
                        A taste of the deeper register
                      </p>
                      <SamplePlayCard pick={pick} tone="gold" />
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
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
