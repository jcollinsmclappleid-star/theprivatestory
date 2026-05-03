import { useState, useCallback, useEffect, useMemo, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft,
  Play,
  Pause,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { TrustBar } from "@/components/TrustBar";
import { AgeGate, hasConfirmedAge } from "@/components/AgeGate";
import {
  EDITORS_PICKS,
  VOICES_META,
  type EditorsPick,
  type EditorsPickVoice,
} from "@/data/editorsPicks";
import { useAudioPlayer } from "@/store/use-audio-player";
import { SAMPLE_ID_PREFIX, isSampleId } from "@/data/sampleId";
import type { Story } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL;
const API_BASE = BASE.replace(/\/$/, "");

const audioUrl = (slug: string) =>
  `${API_BASE}/voice-samples/editors-picks/${slug}.mp3`;
const coverUrl = (slug: string) =>
  `${API_BASE}/voice-samples/editors-picks/covers/${slug}.png`;

/** Adapt an EditorsPick into the Story shape the central audio store expects. */
function pickToStory(pick: EditorsPick): Story {
  return {
    id: `${SAMPLE_ID_PREFIX}${pick.slug}`,
    title: pick.title,
    description: pick.tagline,
    mood: pick.tags[0] ?? "sample",
    tags: pick.tags,
    duration: "2 min",
    coverImage: coverUrl(pick.slug),
    audioUrl: audioUrl(pick.slug),
    isPremium: false,
    isNew: false,
  };
}

function fmtTime(s: number): string {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function Samples() {
  useSEO({
    title:
      "Editor's Picks — Ten short audio stories — The Private Story",
    description:
      "Ten openings. Ten endings on a held breath. Short, intimate, narrated stories from our writers — each one stops where you'd want it to keep going. Yours, when you create one, can go further. 18+.",
  });

  // Synchronous lazy init — read localStorage on first render so previously
  // confirmed users never see a flash of the AgeGate during hydration.
  // SSR-safe: hasConfirmedAge() guards `localStorage` access internally.
  const [ageConfirmed, setAgeConfirmed] = useState(() => hasConfirmedAge());

  // ---- Audio state — driven by the central useAudioPlayer store -----------
  // The actual <audio> element lives in <AudioProvider> at the root, so a
  // single playback session is preserved when users navigate between pages.
  // We never spawn a parallel <audio> here.
  const {
    currentStory,
    isPlaying,
    currentTime,
    duration,
    progress,
    play: playStore,
    togglePlay: togglePlayStore,
    seekTo,
    close: closeStore,
  } = useAudioPlayer();

  const [voiceFilter, setVoiceFilter] = useState<EditorsPickVoice | null>(null);
  const [openTranscript, setOpenTranscript] = useState<string | null>(null);

  // Resolve the pick currently in the global audio session (if it's a sample).
  const currentSlug = useMemo(() => {
    if (!currentStory || !isSampleId(currentStory.id)) return null;
    return currentStory.id.slice(SAMPLE_ID_PREFIX.length);
  }, [currentStory]);

  const currentPick = useMemo(
    () => EDITORS_PICKS.find((p) => p.slug === currentSlug) ?? null,
    [currentSlug],
  );
  const nextPick = useMemo(() => {
    if (!currentPick) return null;
    const idx = EDITORS_PICKS.findIndex((p) => p.slug === currentPick.slug);
    return EDITORS_PICKS[idx + 1] ?? null;
  }, [currentPick]);

  // Track end-of-story locally — show the "create yours" CTA when the current
  // sample reaches the end. We watch progress (not isPlaying) so a paused
  // finish still triggers the CTA. Resets on slug change.
  const [endedSlug, setEndedSlug] = useState<string | null>(null);
  useEffect(() => {
    setEndedSlug(null);
  }, [currentSlug]);
  useEffect(() => {
    if (!currentSlug) return;
    if (duration > 0 && progress >= 0.995 && !isPlaying) {
      setEndedSlug(currentSlug);
    }
  }, [progress, duration, isPlaying, currentSlug]);

  const playSlug = useCallback(
    (slug: string) => {
      const pick = EDITORS_PICKS.find((p) => p.slug === slug);
      if (!pick) return;
      setEndedSlug(null);
      playStore(pickToStory(pick));
    },
    [playStore],
  );

  const togglePlay = useCallback(
    (slug: string) => {
      if (currentSlug === slug) {
        togglePlayStore();
      } else {
        playSlug(slug);
      }
    },
    [currentSlug, togglePlayStore, playSlug],
  );

  const closePlayer = useCallback(() => {
    closeStore();
    setEndedSlug(null);
  }, [closeStore]);

  const skip = useCallback(
    (delta: number) => {
      if (duration <= 0) return;
      seekTo(Math.max(0, Math.min(duration, currentTime + delta)));
    },
    [currentTime, duration, seekTo],
  );

  const seek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (duration <= 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      seekTo(Math.max(0, Math.min(duration, duration * pct)));
    },
    [duration, seekTo],
  );

  // Keyboard seek — Arrow ±5s, PageUp/Down ±15s, Home/End jump to start/end.
  // Granularity is tuned for ~2-minute samples (FloatingPlayer uses ±30s for
  // long-form stories; ±5/±15 fits short-form better).
  const seekKey = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (duration <= 0) return;
      let delta = 0;
      let absolute: number | null = null;
      switch (e.key) {
        case "ArrowLeft":  delta = -5; break;
        case "ArrowRight": delta = 5; break;
        case "PageDown":   delta = -15; break;
        case "PageUp":     delta = 15; break;
        case "Home":       absolute = 0; break;
        case "End":        absolute = duration; break;
        default: return;
      }
      e.preventDefault();
      seekTo(
        absolute !== null
          ? absolute
          : Math.max(0, Math.min(duration, currentTime + delta)),
      );
    },
    [currentTime, duration, seekTo],
  );

  // Voice picker is intentionally highlight-only (not a filter) — every story
  // remains visible because each piece is its own editorial moment, but the
  // selected voice's three (or two) stories pop while the rest dim back. This
  // keeps the page reading as a curated set rather than a search result.
  const visiblePicks = EDITORS_PICKS;

  /** Keyboard navigation between StoryCards.
   *  ArrowDown/Up (and J/K, Vim-style) move focus between cards.
   *  Enter / Space on a card toggles play (cards have onClick wired to it).
   *  Home/End jump to first/last card. */
  const onCardsKeyDown = useCallback((e: KeyboardEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    const card = target.closest<HTMLElement>("[data-pick-card]");
    if (!card) return;
    const list = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>("[data-pick-card]"),
    );
    const idx = list.indexOf(card);
    if (idx === -1) return;

    let next = -1;
    switch (e.key) {
      case "ArrowDown":
      case "j":
      case "J":
        next = Math.min(list.length - 1, idx + 1);
        break;
      case "ArrowUp":
      case "k":
      case "K":
        next = Math.max(0, idx - 1);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = list.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    const dest = list[next];
    if (dest) {
      dest.focus();
      dest.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, []);

  if (!ageConfirmed) {
    return <AgeGate onConfirmed={() => setAgeConfirmed(true)} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* No local <audio>: AudioProvider at the app root owns the single
          element so audio survives navigation and never double-plays. */}

      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-5 py-3.5">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-white/65 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <span className="text-[10px] font-bold text-white/45 uppercase tracking-[0.22em]">
            Editor's Picks · 18+
          </span>
          <Link
            href="/create"
            className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors tracking-widest uppercase"
          >
            Create →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <Hero onStart={() => playSlug(EDITORS_PICKS[0].slug)} />

      {/* Editorial cards — keyboard nav: ArrowUp/Down + Home/End move
          focus between cards; Enter/Space on a focused card toggles play. */}
      <section
        className="max-w-3xl mx-auto px-5 sm:px-6 pb-24 pt-6"
        onKeyDown={onCardsKeyDown}
        aria-label="Editor's Picks"
      >
        {visiblePicks.slice(0, 5).map((pick) => (
          <StoryCard
            key={pick.slug}
            pick={pick}
            isPlaying={isPlaying && currentSlug === pick.slug}
            isCurrent={currentSlug === pick.slug}
            transcriptOpen={openTranscript === pick.slug}
            onTogglePlay={() => togglePlay(pick.slug)}
            onToggleTranscript={() =>
              setOpenTranscript((v) => (v === pick.slug ? null : pick.slug))
            }
            voiceFilter={voiceFilter}
          />
        ))}

        {/* Voice strip — woven mid-page */}
        <VoiceStrip
          activeVoice={voiceFilter}
          onPick={(v) => setVoiceFilter((curr) => (curr === v ? null : v))}
        />

        {visiblePicks.slice(5).map((pick) => (
          <StoryCard
            key={pick.slug}
            pick={pick}
            isPlaying={isPlaying && currentSlug === pick.slug}
            isCurrent={currentSlug === pick.slug}
            transcriptOpen={openTranscript === pick.slug}
            onTogglePlay={() => togglePlay(pick.slug)}
            onToggleTranscript={() =>
              setOpenTranscript((v) => (v === pick.slug ? null : pick.slug))
            }
            voiceFilter={voiceFilter}
          />
        ))}
      </section>

      {/* Cliffhanger CTA */}
      <FinalCTA />

      {/* Trust footer */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pb-24">
        <TrustBar />
        <p className="mt-8 text-[12px] text-white/45 leading-relaxed text-center max-w-xl mx-auto">
          About these editor's picks: ten short narrated openings, written by
          our editorial team and narrated by four voices. Each one is built as
          a complete short — it lands, deliberately, before any explicit
          content.{" "}
          <a
            href="/safety"
            className="text-primary/80 hover:text-primary underline underline-offset-2"
          >
            Read the safety report
          </a>
          .
        </p>
      </section>

      {/* Sticky bottom player */}
      <AnimatePresence>
        {currentPick && (
          <StickyPlayer
            pick={currentPick}
            nextPick={nextPick}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            ended={endedSlug === currentPick.slug}
            onTogglePlay={() => togglePlay(currentPick.slug)}
            onSkip={skip}
            onSeek={seek}
            onSeekKey={seekKey}
            onClose={closePlayer}
            onPlayNext={() => nextPick && playSlug(nextPick.slug)}
          />
        )}
      </AnimatePresence>

      {/* Spacer so sticky player never overlaps last content */}
      {currentPick && <div className="h-28" aria-hidden="true" />}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Hero                                                                    */
/* ----------------------------------------------------------------------- */

function Hero({ onStart }: { onStart: () => void }) {
  const [editorialOpen, setEditorialOpen] = useState(false);

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(201,162,39,0.10) 0%, transparent 55%), linear-gradient(180deg, #0a0806 0%, #0a0806 100%)",
        }}
      />
      {/* Hero collage of three covers, blurred + masked into the dark */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-[0.32]">
        <div className="absolute right-[-10%] top-[8%] w-[55%] aspect-square rounded-3xl overflow-hidden">
          <img
            src={coverUrl("07-bodyguard")}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            style={{ filter: "blur(2px) saturate(0.85)" }}
          />
        </div>
        <div className="absolute left-[-5%] bottom-[-5%] w-[40%] aspect-square rounded-3xl overflow-hidden">
          <img
            src={coverUrl("05-cabin")}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            style={{ filter: "blur(3px) saturate(0.8)" }}
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,8,6,0.55) 0%, rgba(10,8,6,0.85) 60%, rgba(10,8,6,1) 100%)",
          }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 relative">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-start gap-7"
        >
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/35 bg-primary/[0.07]">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-white/85 uppercase tracking-[0.22em]">
              Editor's Picks · Ten Stories · 18+
            </span>
          </div>

          <h1 className="font-display text-[2rem] sm:text-5xl md:text-[3.4rem] font-bold leading-[1.05] text-foreground">
            Ten openings.{" "}
            <em className="text-primary not-italic font-bold">
              Ten endings on a held breath.
            </em>
          </h1>

          <p className="text-[15px] sm:text-base text-white/65 leading-relaxed max-w-xl">
            Short, intimate stories from our writers — narrated end-to-end by
            four voices. Each one stops where you'd want it to keep going.
            Yours, when you create one, can go further.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm
                         bg-primary text-primary-foreground transition-all
                         hover:scale-[1.03] hover:brightness-110 active:scale-100
                         shadow-[0_0_36px_-8px_rgba(201,162,39,0.55)]"
              data-testid="hero-start-first"
            >
              <Play className="w-4 h-4" fill="currentColor" />
              Start with the first
            </button>
            <a
              href="#stories"
              className="text-[11px] text-primary/70 hover:text-primary transition-colors tracking-[0.18em] uppercase font-semibold"
            >
              Browse all ten ↓
            </a>
          </div>

          {/* Editorial note — discreet, expandable */}
          <div className="mt-4 max-w-xl w-full">
            <button
              onClick={() => setEditorialOpen((v) => !v)}
              className="flex items-center gap-1.5 text-[11px] text-white/45 hover:text-white/70 transition-colors italic"
              aria-expanded={editorialOpen}
            >
              {editorialOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              Editor's note — why these are softer by design
            </button>
            <AnimatePresence>
              {editorialOpen && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-3 text-[12px] text-white/55 leading-relaxed border-l border-primary/30 pl-4 italic overflow-hidden"
                >
                  Adult themes throughout. By design, these public samples fade
                  before any explicit content — they're built as cliffhangers.
                  Fully explicit, personalised stories live behind sign-up,
                  age verification and a paid subscription, where they belong.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      <div id="stories" />
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/* StoryCard                                                               */
/* ----------------------------------------------------------------------- */

function StoryCard({
  pick,
  isPlaying,
  isCurrent,
  transcriptOpen,
  onTogglePlay,
  onToggleTranscript,
  voiceFilter,
}: {
  pick: EditorsPick;
  isPlaying: boolean;
  isCurrent: boolean;
  transcriptOpen: boolean;
  onTogglePlay: () => void;
  onToggleTranscript: () => void;
  voiceFilter: EditorsPickVoice | null;
}) {
  const dimmed = voiceFilter !== null && pick.voice !== voiceFilter;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55 }}
      animate={{ opacity: dimmed ? 0.32 : 1 }}
      className={`mb-14 sm:mb-20 rounded-3xl overflow-hidden transition-all
                  outline-none focus-visible:ring-2 focus-visible:ring-primary/55
                  ${isCurrent ? "ring-1 ring-primary/45 shadow-[0_0_60px_-18px_rgba(201,162,39,0.55)]" : "ring-1 ring-white/[0.06]"}`}
      style={{
        background:
          "linear-gradient(180deg, #16110a 0%, #110d08 60%, #0d0a07 100%)",
      }}
      data-testid={`pick-card-${pick.slug}`}
      data-pick-card
      tabIndex={0}
      aria-label={`${pick.title} — narrated by ${pick.voiceName}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          // Only catch when the card itself is focused, not a button inside.
          if (e.currentTarget === e.target) {
            e.preventDefault();
            onTogglePlay();
          }
        }
      }}
    >
      {/* Cover */}
      <div className="relative aspect-[4/5] sm:aspect-[16/10] overflow-hidden">
        <img
          src={coverUrl(pick.slug)}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="w-full h-full object-cover"
          style={{ filter: "saturate(0.95) brightness(0.92)" }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(0deg, rgba(13,10,7,0.95) 0%, rgba(13,10,7,0.45) 35%, rgba(13,10,7,0.05) 70%, transparent 100%)",
          }}
        />
        {/* Now-playing dot */}
        {isCurrent && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-sm border border-primary/35">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-bold text-primary uppercase tracking-[0.18em]">
              Now playing
            </span>
          </div>
        )}
        {/* Sequence label on cover */}
        <div className="absolute bottom-4 left-5">
          <p className="text-[10px] font-bold text-primary/85 uppercase tracking-[0.28em]">
            {String(pick.number).padStart(2, "0")} ·{" "}
            <span className="text-white/65">Narrated by {pick.voiceName}</span>{" "}
            ·{" "}
            <span className="text-white/55">
              {Math.round(pick.runtimeSec / 60)} min
            </span>
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 sm:px-7 pt-5 pb-6">
        <h2 className="font-display italic text-[1.6rem] sm:text-3xl font-bold leading-[1.15] text-foreground mb-2">
          {pick.title}
        </h2>
        <p className="text-[14px] sm:text-[15px] text-primary/85 leading-snug mb-5">
          {pick.tagline}
        </p>

        {/* Pairing chip + tag chips */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.12em]
                       border border-rose-300/25 bg-rose-300/[0.06] text-rose-200/80"
          >
            ♥ {pick.pairing}
          </span>
          {pick.tags.map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold text-white/60 uppercase tracking-[0.12em]
                         border border-white/[0.07] bg-white/[0.025]"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Excerpt */}
        <p className="font-display italic text-[14px] text-white/45 leading-relaxed mb-6 border-l border-primary/25 pl-4">
          {pick.excerpt}
        </p>

        {/* Player row */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onTogglePlay}
            aria-label={
              isPlaying
                ? `Pause ${pick.title}`
                : `Play ${pick.title}`
            }
            className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center
                       bg-primary text-primary-foreground transition-all
                       hover:scale-105 active:scale-95
                       shadow-[0_0_28px_-6px_rgba(201,162,39,0.55)]"
            data-testid={`pick-play-${pick.slug}`}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" fill="currentColor" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-primary/55 uppercase tracking-[0.2em] mb-1">
              Ends on
            </p>
            <p className="text-[12.5px] sm:text-[13px] italic text-white/65 leading-snug truncate">
              {pick.endsOn}
            </p>
          </div>
        </div>

        {/* Transcript reveal */}
        <button
          onClick={onToggleTranscript}
          aria-expanded={transcriptOpen}
          className="mt-5 flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/65 transition-colors uppercase tracking-[0.18em] font-semibold"
        >
          {transcriptOpen ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
          {transcriptOpen ? "Hide transcript" : "Read transcript"}
        </button>
        <AnimatePresence>
          {transcriptOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-white/[0.06] text-[14px] text-white/70 leading-[1.7] whitespace-pre-line">
                {pick.transcript}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

/* ----------------------------------------------------------------------- */
/* VoiceStrip                                                              */
/* ----------------------------------------------------------------------- */

function VoiceStrip({
  activeVoice,
  onPick,
}: {
  activeVoice: EditorsPickVoice | null;
  onPick: (v: EditorsPickVoice) => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55 }}
      className="my-12 sm:my-16 py-10 sm:py-12 px-5 sm:px-8 rounded-2xl border border-white/[0.06] bg-white/[0.015]"
    >
      <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.22em] text-center mb-2">
        Four Voices
      </p>
      <h3 className="font-display italic text-2xl sm:text-[1.7rem] font-bold text-center text-foreground mb-7 leading-tight">
        Each chosen for the room they live in.
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {VOICES_META.map((v) => {
          const active = activeVoice === v.key;
          return (
            <button
              key={v.key}
              onClick={() => onPick(v.key)}
              className={`text-left p-4 rounded-xl border transition-all
                          ${
                            active
                              ? "border-primary/55 bg-primary/[0.07] shadow-[0_0_22px_-8px_rgba(201,162,39,0.5)]"
                              : "border-white/[0.06] bg-white/[0.02] hover:border-white/15"
                          }`}
              aria-pressed={active}
              data-testid={`voice-pill-${v.key}`}
            >
              <p
                className={`font-display text-lg font-bold leading-none mb-1.5
                            ${active ? "text-primary" : "text-foreground"}`}
              >
                {v.name}
              </p>
              <p className="text-[11.5px] text-white/55 leading-snug">
                {v.oneLine}
              </p>
            </button>
          );
        })}
      </div>
      {activeVoice && (
        <p className="text-[11px] text-white/40 text-center mt-4">
          Highlighting{" "}
          <span className="text-primary/70 font-semibold">
            {VOICES_META.find((v) => v.key === activeVoice)?.name}
          </span>
          's stories. Tap again to clear.
        </p>
      )}
    </motion.section>
  );
}

/* ----------------------------------------------------------------------- */
/* FinalCTA                                                                */
/* ----------------------------------------------------------------------- */

function FinalCTA() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 50% 30%, rgba(201,162,39,0.13) 0%, transparent 55%), #0a0806",
      }}
    >
      <div className="max-w-2xl mx-auto px-6 py-24 sm:py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.28em] mb-5">
            What if the door didn't close?
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold leading-[1.05] text-foreground mb-6">
            <em className="not-italic text-primary font-bold">Yours</em>{" "}
            doesn't have to stop.
          </h2>
          <p className="text-[15px] sm:text-base text-white/65 leading-relaxed max-w-lg mx-auto mb-10">
            Editor's picks fade by design. The story you create — around your
            cast, your scene, your situation — can go as far as you want it to.
          </p>
          <Link href="/create">
            <button
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm
                         bg-primary text-primary-foreground transition-all
                         hover:scale-[1.03] hover:brightness-110 active:scale-100
                         shadow-[0_0_44px_-10px_rgba(201,162,39,0.65)]"
              data-testid="final-cta-create"
            >
              <Sparkles className="w-4 h-4" />
              Start your private story
            </button>
          </Link>
          <p className="text-[11px] text-white/35 italic mt-7 max-w-md mx-auto leading-relaxed">
            All explicit content is private to you. Behind sign-up, age
            verification and a paid subscription.
          </p>
          <Link
            href="/how-it-works"
            className="inline-block mt-4 text-[11px] text-primary/65 hover:text-primary tracking-[0.18em] uppercase font-semibold"
          >
            How it works →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/* StickyPlayer                                                            */
/* ----------------------------------------------------------------------- */

function StickyPlayer({
  pick,
  nextPick,
  isPlaying,
  currentTime,
  duration,
  ended,
  onTogglePlay,
  onSkip,
  onSeek,
  onSeekKey,
  onClose,
  onPlayNext,
}: {
  pick: EditorsPick;
  nextPick: EditorsPick | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  ended: boolean;
  onTogglePlay: () => void;
  onSkip: (delta: number) => void;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  onSeekKey: (e: KeyboardEvent<HTMLDivElement>) => void;
  onClose: () => void;
  onPlayNext: () => void;
}) {
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-primary/20 bg-background/95 backdrop-blur-xl"
      style={{
        boxShadow: "0 -10px 40px -8px rgba(0,0,0,0.55)",
      }}
      data-testid="sticky-player"
    >
      {/* Hairline progress bar — keyboard-accessible scrubber.
          Arrow keys ±5s, PageUp/Down ±15s, Home/End jump to start/end. */}
      <div
        role="slider"
        tabIndex={0}
        aria-label={`Audio progress for ${pick.title}`}
        aria-valuemin={0}
        aria-valuemax={Math.max(1, Math.round(duration))}
        aria-valuenow={Math.round(currentTime)}
        aria-valuetext={`${fmtTime(currentTime)} of ${fmtTime(duration)}`}
        onClick={onSeek}
        onKeyDown={onSeekKey}
        className="absolute -top-px left-0 right-0 h-1 cursor-pointer group focus:outline-none focus-visible:h-1.5 focus-visible:bg-white/[0.06] focus-visible:ring-1 focus-visible:ring-primary/45"
      >
        <div className="absolute inset-0 bg-white/[0.04]" />
        <div
          className="absolute inset-y-0 left-0 bg-primary transition-[width] duration-150"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
          style={{ left: `${pct}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        {ended ? (
          <motion.div
            key="ended"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <img
                src={coverUrl(pick.slug)}
                alt=""
                aria-hidden="true"
                className="flex-shrink-0 w-11 h-11 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-primary uppercase tracking-[0.18em] mb-0.5">
                  Want yours to keep going?
                </p>
                <p className="text-[12px] text-white/55 italic truncate">
                  Ends on: {pick.endsOn}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {nextPick && (
                <button
                  onClick={onPlayNext}
                  className="px-3.5 py-2 rounded-full text-[11px] font-semibold text-primary/85 hover:text-primary border border-primary/30 hover:border-primary/55 transition-all uppercase tracking-[0.12em]"
                  data-testid="player-play-next"
                >
                  Next →
                </button>
              )}
              <Link href="/create">
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold bg-primary text-primary-foreground hover:brightness-110 transition-all uppercase tracking-[0.1em]"
                  data-testid="player-create-cta"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Create
                </button>
              </Link>
              <button
                onClick={onClose}
                aria-label="Close player"
                className="p-2 rounded-full text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto px-5 sm:px-6 py-3 flex items-center gap-3 sm:gap-4"
          >
            <img
              src={coverUrl(pick.slug)}
              alt=""
              aria-hidden="true"
              className="flex-shrink-0 w-11 h-11 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-display italic text-[14px] sm:text-[15px] font-semibold text-foreground truncate leading-tight">
                {pick.title}
              </p>
              <p className="text-[10.5px] text-white/45 uppercase tracking-[0.16em] mt-0.5">
                {pick.voiceName} ·{" "}
                <span className="text-white/35">
                  {fmtTime(currentTime)} / {fmtTime(duration)}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onSkip(-15)}
                aria-label="Back 15 seconds"
                className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-white/55 hover:text-white hover:bg-white/5 transition-colors text-[10px] font-bold"
              >
                -15
              </button>
              <button
                onClick={onTogglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="w-11 h-11 rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all"
                data-testid="player-toggle"
              >
                {isPlaying ? (
                  <Pause className="w-4.5 h-4.5" fill="currentColor" />
                ) : (
                  <Play className="w-4.5 h-4.5 ml-0.5" fill="currentColor" />
                )}
              </button>
              <button
                onClick={() => onSkip(15)}
                aria-label="Forward 15 seconds"
                className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-white/55 hover:text-white hover:bg-white/5 transition-colors text-[10px] font-bold"
              >
                +15
              </button>
              <button
                onClick={onClose}
                aria-label="Close player"
                className="ml-1 p-2 rounded-full text-white/35 hover:text-white/65 hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
