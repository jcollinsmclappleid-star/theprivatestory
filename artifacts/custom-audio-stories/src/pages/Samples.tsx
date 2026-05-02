import { useState, useRef, useCallback, useEffect, useId } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Play, Pause, Sparkles, Moon } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const BASE = import.meta.env.BASE_URL;
const API_BASE = BASE.replace(/\/$/, "");
const AGE_GATE_KEY = "tps_age_confirmed";

type DoorSample = {
  id: "romance" | "after-dark" | "drift";
  room: string;
  doorName: string;
  storyTitle: string;
  blurb: string;
  voiceName: string;
  voiceMeta: string;
  ctaLabel: string;
  ctaHref: string;
  audioUrl: string;
  Icon: typeof Sparkles;
  accent: string;
  rgb: string;
  bg: string;
  border: string;
  borderHover: string;
  glow: string;
  knob: string;
  knobHover: string;
  nameColor: string;
  taglineColor: string;
  labelColor: string;
};

const DOORS: DoorSample[] = [
  {
    id: "romance",
    room: "The Story Room",
    doorName: "Romance",
    storyTitle: "The Fake-Dating One",
    blurb:
      "His sister's wedding was on Saturday — and the plus-one box had been empty for six months. A tiny favour, on paper. A weekend pretending. Until somewhere between the toast and the first dance, neither of them remembered to let go.",
    voiceName: "Clara",
    voiceMeta: "British · Warm · Soothing",
    ctaLabel: "Create your romance",
    ctaHref: "/create",
    audioUrl: `${API_BASE}/voice-samples/doors/romance.mp3`,
    Icon: Sparkles,
    accent: "#c9a227",
    rgb: "201,162,39",
    bg: "linear-gradient(180deg, #1d1105 0%, #130d07 55%, #0b0906 100%)",
    border: "rgba(201,162,39,0.24)",
    borderHover: "rgba(201,162,39,0.70)",
    glow: "rgba(201,162,39,0.20)",
    knob: "rgba(201,162,39,0.28)",
    knobHover: "rgba(201,162,39,0.85)",
    nameColor: "#e8d5a0",
    taglineColor: "rgba(201,162,39,0.90)",
    labelColor: "rgba(201,162,39,0.72)",
  },
  {
    id: "after-dark",
    room: "The Story Room",
    doorName: "After Dark",
    storyTitle: "The First Word",
    blurb:
      "He stopped at her door. She'd been waiting for him to ask — for weeks, maybe — long enough that the silence between them had started to feel like a held breath. A consent-led excerpt. Nothing happens until she says it does.",
    voiceName: "Maya",
    voiceMeta: "American · Intimate · Close",
    ctaLabel: "Enter After Dark",
    ctaHref: "/after-dark",
    audioUrl: `${API_BASE}/voice-samples/doors/after-dark.mp3`,
    Icon: Moon,
    accent: "#7b8fff",
    rgb: "123,143,255",
    bg: "linear-gradient(180deg, #05050f 0%, #040409 55%, #060608 100%)",
    border: "rgba(123,143,255,0.22)",
    borderHover: "rgba(123,143,255,0.60)",
    glow: "rgba(123,143,255,0.18)",
    knob: "rgba(123,143,255,0.24)",
    knobHover: "rgba(123,143,255,0.78)",
    nameColor: "#9baeff",
    taglineColor: "rgba(123,143,255,0.90)",
    labelColor: "rgba(123,143,255,0.68)",
  },
  {
    id: "drift",
    room: "The Quiet Room",
    doorName: "Drift",
    storyTitle: "The House at the Edge of the Forest",
    blurb:
      "You arrive on foot. There is no road. Inside, a fire has been laid for you — a blanket folded over the chair, a pot of tea still warm. You don't remember who left it. You don't need to. Slow, sensory, written to let you settle.",
    voiceName: "Theo",
    voiceMeta: "British · Textured · Unhurried",
    ctaLabel: "Explore Drift",
    ctaHref: "/drift",
    audioUrl: `${API_BASE}/voice-samples/doors/drift.mp3`,
    Icon: Moon,
    accent: "#56b4e0",
    rgb: "86,180,224",
    bg: "linear-gradient(180deg, #06121a 0%, #050d13 55%, #060a0e 100%)",
    border: "rgba(86,180,224,0.22)",
    borderHover: "rgba(86,180,224,0.60)",
    glow: "rgba(86,180,224,0.18)",
    knob: "rgba(86,180,224,0.26)",
    knobHover: "rgba(86,180,224,0.80)",
    nameColor: "#b8e4f5",
    taglineColor: "rgba(86,180,224,0.90)",
    labelColor: "rgba(86,180,224,0.68)",
  },
];

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  const titleId = useId();
  const descId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const leaveRef = useRef<HTMLAnchorElement>(null);

  // Focus the confirm button on mount and lock body scroll while gate is open.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  // Trap Tab focus between the confirm button and the leave link.
  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const focusables = [confirmRef.current, leaveRef.current].filter(
      (el): el is HTMLElement => el != null,
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onKeyDown={onKeyDown}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[999] flex items-center justify-center px-6"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #1a1209 0%, #0a0908 60%, #050403 100%)",
      }}
    >
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-primary/30 bg-primary/8 mb-7">
          <svg
            className="w-7 h-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            style={{ color: "#c9a227" }}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/60 mb-3">
          Adults only
        </p>
        <h1
          id={titleId}
          className="font-display text-3xl font-bold text-foreground leading-tight mb-4"
        >
          One of these samples<br />contains adult content.
        </h1>
        <p id={descId} className="text-sm text-white/55 leading-relaxed mb-8">
          You must be 18 years of age or older to listen.<br />
          By continuing you confirm this is true.
        </p>
        <button
          ref={confirmRef}
          onClick={onConfirm}
          className="w-full bg-primary text-primary-foreground font-bold text-sm py-4 rounded-2xl
                     hover:bg-primary/90 active:scale-[0.98] transition-all mb-3
                     shadow-[0_0_40px_-8px_rgba(201,162,39,0.5)]
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          I am 18 or older — enter
        </button>
        <Link
          ref={leaveRef}
          href="/"
          className="block w-full text-center text-xs text-white/35 hover:text-white/60 transition-colors py-2
                     focus:outline-none focus-visible:text-white/80"
        >
          Leave
        </Link>
      </div>
    </motion.div>
  );
}

function SampleCard({
  door,
  isPlaying,
  onPlayToggle,
  registerAudio,
  onEnded,
}: {
  door: DoorSample;
  isPlaying: boolean;
  onPlayToggle: () => void;
  registerAudio: (audio: HTMLAudioElement | null) => void;
  onEnded: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Callback ref so registration happens synchronously when the audio element
  // mounts/unmounts. Listener binding lives in this same component so it is
  // never racy with parent effects.
  const audioCallbackRef = useCallback(
    (el: HTMLAudioElement | null) => {
      registerAudio(el);
    },
    [registerAudio],
  );

  const handleTimeUpdate = useCallback(
    (e: React.SyntheticEvent<HTMLAudioElement>) => {
      setCurrentTime(e.currentTarget.currentTime);
    },
    [],
  );

  const handleLoadedMetadata = useCallback(
    (e: React.SyntheticEvent<HTMLAudioElement>) => {
      const d = e.currentTarget.duration;
      if (d && isFinite(d)) setDuration(d);
    },
    [],
  );

  const handleEnded = useCallback(() => {
    setCurrentTime(0);
    onEnded();
  }, [onEnded]);

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const Icon = door.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-2xl overflow-hidden"
      style={{
        background: door.bg,
        border: `1px solid ${hovered || isPlaying ? door.borderHover : door.border}`,
        transition: "border 0.35s ease, box-shadow 0.35s ease",
        boxShadow:
          hovered || isPlaying
            ? `0 0 60px -16px ${door.glow}, 0 12px 32px -16px rgba(0,0,0,0.6)`
            : `0 4px 18px -10px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Top accent glow */}
      <div
        aria-hidden="true"
        style={{
          height: "3px",
          background: `linear-gradient(90deg, transparent 0%, ${door.accent} 50%, transparent 100%)`,
          opacity: hovered || isPlaying ? 0.85 : 0.45,
          transition: "opacity 0.3s ease",
        }}
      />

      <div className="p-5 sm:p-6">
        {/* Header: room label + door name + icon */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p
              className="text-[9px] font-bold uppercase tracking-[0.22em] mb-1.5"
              style={{ color: door.labelColor }}
            >
              {door.room}
            </p>
            <h2
              className="font-display text-xl font-bold leading-none"
              style={{ color: door.nameColor }}
            >
              {door.doorName}
            </h2>
          </div>
          <div
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              border: `1px solid ${door.border}`,
              background: `rgba(${door.rgb}, 0.06)`,
            }}
          >
            <Icon className="w-4 h-4" style={{ color: door.accent, opacity: 0.85 }} />
          </div>
        </div>

        {/* Story title */}
        <h3 className="font-display text-2xl sm:text-[26px] font-bold text-foreground leading-tight mb-3">
          {door.storyTitle}
        </h3>

        {/* Blurb */}
        <p className="text-sm text-white/65 leading-relaxed mb-5">{door.blurb}</p>

        {/* Player */}
        <div
          className="rounded-xl p-3.5 sm:p-4 mb-4"
          style={{
            background: `rgba(${door.rgb}, 0.05)`,
            border: `1px solid rgba(${door.rgb}, 0.13)`,
          }}
        >
          <div className="flex items-center gap-3.5">
            {/* Play / pause */}
            <button
              onClick={onPlayToggle}
              aria-label={isPlaying ? `Pause ${door.storyTitle}` : `Play ${door.storyTitle}`}
              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                         transition-all duration-200 active:scale-95"
              style={{
                background: door.accent,
                color: "#0a0a0a",
                boxShadow: isPlaying
                  ? `0 0 24px -4px ${door.glow}, 0 0 48px -8px ${door.glow}`
                  : `0 4px 14px -4px rgba(0,0,0,0.4)`,
              }}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" fill="currentColor" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
              )}
            </button>

            {/* Voice + progress */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3 mb-1.5">
                <p className="text-[11px] font-semibold truncate" style={{ color: door.taglineColor }}>
                  Narrated by {door.voiceName}
                </p>
                <p className="text-[10px] tabular-nums text-white/45 flex-shrink-0">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </p>
              </div>
              <p className="text-[10px] text-white/35 mb-2 truncate">{door.voiceMeta}</p>
              <div
                className="relative h-1 rounded-full overflow-hidden"
                style={{ background: `rgba(${door.rgb}, 0.18)` }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-150"
                  style={{
                    width: `${progressPct}%`,
                    background: door.accent,
                    boxShadow: isPlaying ? `0 0 8px ${door.glow}` : "none",
                  }}
                />
              </div>
            </div>
          </div>

          <audio
            ref={audioCallbackRef}
            src={door.audioUrl}
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onDurationChange={handleLoadedMetadata}
            onEnded={handleEnded}
          />
        </div>

        {/* Door CTA */}
        <Link
          href={door.ctaHref}
          className="group block w-full rounded-xl py-3.5 px-4 text-center
                     text-sm font-bold transition-all duration-200 active:scale-[0.98]"
          style={{
            background: `rgba(${door.rgb}, 0.10)`,
            border: `1px solid ${door.border}`,
            color: door.nameColor,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `rgba(${door.rgb}, 0.18)`;
            e.currentTarget.style.borderColor = door.borderHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `rgba(${door.rgb}, 0.10)`;
            e.currentTarget.style.borderColor = door.border;
          }}
        >
          {door.ctaLabel}
          <span className="inline-block ml-1.5 transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>
    </motion.div>
  );
}

export default function Samples() {
  useSEO({
    title: "Hear a sample — Three doors, three voices — The Private Story",
    description:
      "Three short narrated excerpts — one from each door. Romance, After Dark, Drift. Hear what a personalised audio story sounds like before you create your own.",
  });

  const [ageConfirmed, setAgeConfirmed] = useState(() => {
    try {
      return localStorage.getItem(AGE_GATE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const confirmAge = useCallback(() => {
    try {
      localStorage.setItem(AGE_GATE_KEY, "1");
    } catch {
      /* noop */
    }
    setAgeConfirmed(true);
  }, []);

  // One audio element plays at a time. We pause every other element on each
  // play and use a request-id token so a stale play() promise that resolves
  // after a newer request was issued cannot leave two audios playing at once.
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const playReqRef = useRef(0);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const pauseAllExcept = useCallback((keepId: string | null) => {
    for (const [id, el] of Object.entries(audioRefs.current)) {
      if (id !== keepId && el && !el.paused) {
        el.pause();
      }
    }
  }, []);

  const handlePlayToggle = useCallback(
    async (id: string) => {
      const target = audioRefs.current[id];
      if (!target) return;

      // Toggle off: pause the targeted element. Bump the token so any
      // in-flight play() resolution for *this* element no-ops.
      if (!target.paused) {
        playReqRef.current += 1;
        target.pause();
        setPlayingId((cur) => (cur === id ? null : cur));
        return;
      }

      // New play request. Take a token, pause everything else immediately,
      // and only commit the playing state if our token is still current
      // when play() resolves. Pausing an element whose play() is still
      // pending is safe — it simply rejects with AbortError, which we swallow.
      const reqId = ++playReqRef.current;
      pauseAllExcept(id);
      setPlayingId(id);

      try {
        await target.play();
        if (reqId !== playReqRef.current) {
          // A newer request superseded us before play() resolved.
          target.pause();
        }
      } catch {
        // play() rejected (autoplay block, AbortError after pause, etc.)
        if (reqId === playReqRef.current) {
          setPlayingId((cur) => (cur === id ? null : cur));
        }
      }
    },
    [pauseAllExcept],
  );

  const handleEnded = useCallback((id: string) => {
    setPlayingId((cur) => (cur === id ? null : cur));
  }, []);

  const registerAudio = useCallback(
    (id: string) => (audio: HTMLAudioElement | null) => {
      audioRefs.current[id] = audio;
    },
    [],
  );

  return (
    <>
      {!ageConfirmed && <AgeGate onConfirm={confirmAge} />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background flex flex-col"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5 max-w-3xl w-full mx-auto">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.22em]">
            Samples
          </span>
          <Link
            href="/pricing"
            className="text-[11px] text-primary/80 hover:text-primary transition-colors tracking-widest uppercase"
          >
            Pricing →
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center px-5 sm:px-6 pb-16 max-w-3xl mx-auto w-full">
          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.5 }}
            className="text-center mb-8 mt-2"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/60 mb-4">
              Three doors · Three voices
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4">
              Hear what your story<br />could sound like.
            </h1>
            <p className="text-sm text-white/60 leading-relaxed max-w-md mx-auto">
              One short excerpt from each door. Different worlds, different
              voices, different rules. Pick one and press play.
            </p>
          </motion.div>

          {/* Three door cards */}
          <div className="w-full flex flex-col gap-5">
            {DOORS.map((door) => (
              <SampleCard
                key={door.id}
                door={door}
                isPlaying={playingId === door.id}
                onPlayToggle={() => handlePlayToggle(door.id)}
                registerAudio={registerAudio(door.id)}
                onEnded={() => handleEnded(door.id)}
              />
            ))}
          </div>

          {/* Quiet footer note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-10 text-center max-w-md"
          >
            <p className="text-xs text-white/40 leading-relaxed">
              These are short excerpts narrated to demonstrate voice and tone.
              Your own stories are written around your choices and stay private
              to your account.
            </p>
            <Link
              href="/listen"
              className="inline-block mt-4 text-[11px] tracking-[0.18em] uppercase text-primary/70 hover:text-primary transition-colors"
            >
              Or compare two intensities of one story →
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
