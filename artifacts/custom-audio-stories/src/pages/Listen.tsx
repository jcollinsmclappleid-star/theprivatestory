import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const AGE_GATE_KEY = "tps_age_confirmed";

// ---------------------------------------------------------------------------
// Story definitions
// ---------------------------------------------------------------------------
const STORIES = {
  privateStory: {
    id: "b46f97f830345edb4687ed19b7a28ad1",
    title: "The Ring in the Mirror",
    tagline: "He has a ring on his finger. The elevator has stalled.\nNeither of you mentions either.",
    metaLine: "Warm · 10 min · Narrated by Clara",
    audioUrl: `${API_BASE}/api/audio/audio-b46f97f830345edb4687ed19b7a28ad1.mp3`,
    coverUrl: `${API_BASE}/api/images/cover-daa5ffac36e215afb98fc54761355b53.png`,
    scene3Start: 253,
    situation: "He's engaged. The announcement was three weeks ago.",
    choices: [
      { label: "Pairing",    value: "Her & Him" },
      { label: "Chemistry",  value: "He Takes Charge" },
      { label: "Setting",    value: "Moving Elevator" },
      { label: "World",      value: "Sun-Soaked · Late Night · Montego Bay" },
      { label: "Archetype",  value: "The Adventurer" },
      { label: "Narrator",   value: "Clara · Soothing" },
    ],
  },
  afterDark: {
    id: "0adf3133018146a8d7f7fa5bde57d752",
    title: "Gold Light, Cold Metal",
    tagline: "He's promised to someone else. The elevator has stalled.\nThe gold light makes it easy to pretend otherwise.",
    metaLine: "Intense · After Dark · Narrated by Clara",
    audioUrl: `${API_BASE}/api/audio/audio-fc49bea83789fbfdf8b98e5042316d77.mp3`,
    coverUrl: `${API_BASE}/api/images/cover-fc49bea83789fbfdf8b98e5042316d77.png`,
    scene3Start: 253,
    situation: "He's engaged. The announcement was three weeks ago.",
    choices: [
      { label: "Pairing",    value: "Her & Him" },
      { label: "Chemistry",  value: "He Takes Charge" },
      { label: "Setting",    value: "Moving Elevator" },
      { label: "World",      value: "Sun-Soaked · Late Night · Montego Bay" },
      { label: "Archetype",  value: "The Adventurer" },
      { label: "Narrator",   value: "Clara · Soothing" },
      { label: "Intensity",  value: "Intense · After Dark" },
    ],
  },
} as const;

type StoryKey = keyof typeof STORIES;

// ---------------------------------------------------------------------------
// Age gate
// ---------------------------------------------------------------------------
function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[999] flex items-center justify-center px-6"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #1a1209 0%, #0a0908 60%, #050403 100%)" }}
    >
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-primary/30 bg-primary/8 mb-7">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "#c9a227" }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/60 mb-3">Adults only</p>
        <h1 className="font-display text-3xl font-bold text-foreground leading-tight mb-4">
          This story contains<br />explicit content.
        </h1>
        <p className="text-sm text-white/55 leading-relaxed mb-8">
          You must be 18 years of age or older to enter.<br />
          By continuing you confirm this is true.
        </p>
        <button
          onClick={onConfirm}
          className="w-full bg-primary text-primary-foreground font-bold text-sm py-4 rounded-2xl
                     hover:bg-primary/90 active:scale-[0.98] transition-all mb-3
                     shadow-[0_0_40px_-8px_rgba(201,162,39,0.5)]"
        >
          I am 18 or older — enter
        </button>
        <Link
          href="/"
          className="block w-full text-center text-xs text-white/35 hover:text-white/60 transition-colors py-2"
        >
          Leave
        </Link>
        <p className="text-[10px] text-white/20 mt-5 leading-relaxed">
          Your confirmation is stored on this device only.<br />
          We never share or track it.
        </p>
      </div>
    </motion.div>
  );
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Listen page
// ---------------------------------------------------------------------------
export default function Listen() {
  useSEO({
    title: "Listen to a sample — The Private Story",
    description:
      "Hear what a private, personalised audio story sounds like. Two Editor's Choice samples at different intensities — then create one built entirely around your own choices.",
  });

  const [ageConfirmed, setAgeConfirmed] = useState(() => {
    try { return localStorage.getItem(AGE_GATE_KEY) === "1"; } catch { return false; }
  });
  const confirmAge = useCallback(() => {
    try { localStorage.setItem(AGE_GATE_KEY, "1"); } catch { /* noop */ }
    setAgeConfirmed(true);
  }, []);

  // Default to After Dark — the new story
  const [selected, setSelected] = useState<StoryKey>("afterDark");
  const story = STORIES[selected];

  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying]         = useState(false);
  const [currentTime, setCurrentTime] = useState(story.scene3Start);
  const [duration, setDuration]       = useState(0);
  const [seeked, setSeeked]           = useState(false);

  // Switch story — pause, reset player state, load new src
  const switchStory = useCallback((key: StoryKey) => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = STORIES[key].audioUrl;
      audio.load();
    }
    setPlaying(false);
    setCurrentTime(STORIES[key].scene3Start);
    setDuration(0);
    setSeeked(false);
    setSelected(key);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onMeta = () => {
      const d = audio.duration;
      if (d && isFinite(d) && d > 0) {
        setDuration(d);
        if (!seeked) {
          audio.currentTime = story.scene3Start;
          setCurrentTime(story.scene3Start);
          setSeeked(true);
        }
      }
    };
    const onTime = () => setCurrentTime(audio.currentTime);
    const onEnd  = () => setPlaying(false);

    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);

    if (audio.readyState >= 1 && !seeked) {
      audio.currentTime = story.scene3Start;
      setCurrentTime(story.scene3Start);
      setSeeked(true);
      if (audio.duration && isFinite(audio.duration)) setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }, [seeked, story.scene3Start]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      await audio.play();
      setPlaying(true);
    }
  }, [playing]);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const progress    = duration ? (currentTime / duration) * 100 : 0;
  const scene3Pct   = duration ? (story.scene3Start / duration) * 100 : 0;

  const isAfterDark = selected === "afterDark";

  return (
    <>
      {!ageConfirmed && <AgeGate onConfirm={confirmAge} />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background flex flex-col"
      >
        <audio ref={audioRef} src={story.audioUrl} preload="metadata" />

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5">
          <Link href="/" className="opacity-50 hover:opacity-90 transition-opacity">
            <img src={`${API_BASE}/images/logo.png`} alt="The Private Story" className="w-8 h-8" />
          </Link>
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.22em]">Sample stories</span>
          <Link
            href="/pricing"
            className="text-[11px] text-primary/80 hover:text-primary transition-colors tracking-widest uppercase"
          >
            Pricing →
          </Link>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col items-center px-6 pb-10 max-w-lg mx-auto w-full">

          {/* Spice selector */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="w-full mb-8"
          >
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-white/40 mb-4">
              Select your intensity level
            </p>
            <div className="flex gap-3">
              {/* The Private Story button */}
              <button
                onClick={() => switchStory("privateStory")}
                className={`flex-1 flex flex-col items-center gap-1.5 py-4 px-3 rounded-2xl border transition-all duration-300
                  ${!isAfterDark
                    ? "border-white/40 bg-white/6 shadow-[0_0_24px_-6px_rgba(255,255,255,0.15)]"
                    : "border-white/12 bg-white/2 opacity-50 hover:opacity-75"
                  }`}
              >
                {/* Moon / intimate */}
                <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">The Private Story</span>
                <span className="text-[9px] text-white/40">Warm intensity</span>
              </button>

              {/* After Dark button */}
              <button
                onClick={() => switchStory("afterDark")}
                className={`flex-1 flex flex-col items-center gap-1.5 py-4 px-3 rounded-2xl border transition-all duration-300
                  ${isAfterDark
                    ? "border-[#e879a0]/50 bg-[#e879a0]/8 shadow-[0_0_30px_-8px_rgba(232,121,160,0.4)]"
                    : "border-[#e879a0]/15 bg-[#e879a0]/3 opacity-50 hover:opacity-75"
                  }`}
              >
                {/* Flame */}
                <svg className="w-4 h-4 text-[#e879a0]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5 0.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#e879a0]">After Dark</span>
                <span className="text-[9px] text-[#e879a0]/60">Intense</span>
              </button>
            </div>
          </motion.div>

          {/* Animated story panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="w-full flex flex-col items-center"
            >
              {/* Badges */}
              <div className="flex items-center gap-2 mb-6">
                {isAfterDark ? (
                  <>
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#e879a0]/35 bg-[#e879a0]/10 text-[#e879a0]">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
                      After Dark
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#e879a0]/20 bg-[#e879a0]/5 text-[#e879a0]/70">
                      Intense
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20 bg-white/5 text-white/70">
                      The Private Story
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/30 bg-primary/8 text-primary/80">
                      Editor's Choice
                    </span>
                  </>
                )}
              </div>

              {/* Cover art */}
              <div
                className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden mb-6"
                style={{
                  boxShadow: isAfterDark
                    ? "0 0 80px -20px rgba(232,121,160,0.25)"
                    : "0 0 80px -20px rgba(201,162,39,0.25)",
                }}
              >
                <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover" />
              </div>

              {/* Story info */}
              <div className="text-center mb-7 w-full">
                <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mb-2">
                  {story.metaLine}
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight">
                  {story.title}
                </h1>
                <p className="text-sm text-white/65 italic leading-relaxed whitespace-pre-line">
                  {story.tagline}
                </p>
              </div>

              {/* Player */}
              <div className="w-full mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/50 mb-3 text-center">
                  Playing from Scene 3 — the moment everything breaks
                </p>

                {/* Progress bar */}
                <div
                  className="h-[3px] bg-white/8 rounded-full cursor-pointer mb-5 relative group"
                  onClick={seek}
                >
                  <div
                    className="h-full rounded-full transition-all duration-100"
                    style={{
                      width: `${progress}%`,
                      background: isAfterDark ? "#e879a0" : "#c9a227",
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      left: `calc(${progress}% - 6px)`,
                      background: isAfterDark ? "#e879a0" : "#c9a227",
                      boxShadow: isAfterDark
                        ? "0 0 8px rgba(232,121,160,0.7)"
                        : "0 0 8px rgba(201,162,39,0.7)",
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-white/30"
                    style={{ left: `${scene3Pct}%` }}
                    title="Scene 3 starts here"
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center gap-5">
                  <span className="text-xs text-white/55 font-mono tabular-nums w-9">
                    {formatTime(currentTime)}
                  </span>
                  <button
                    onClick={togglePlay}
                    className="flex-1 flex items-center justify-center w-14 h-14 rounded-full
                               active:scale-95 transition-all hover:scale-105"
                    style={{
                      maxWidth: "56px",
                      minWidth: "56px",
                      background: isAfterDark ? "#e879a0" : "#c9a227",
                      boxShadow: isAfterDark
                        ? "0 0 40px -8px rgba(232,121,160,0.55)"
                        : "0 0 40px -8px rgba(201,162,39,0.55)",
                    }}
                    aria-label={playing ? "Pause" : "Play"}
                  >
                    {playing ? (
                      <Pause className="w-5 h-5 text-black" />
                    ) : (
                      <Play className="w-5 h-5 text-black ml-0.5" />
                    )}
                  </button>
                  <span className="text-xs text-white/55 font-mono tabular-nums w-9 text-right">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Scene note */}
              <p className="text-[10px] text-white/30 text-center mb-8 italic">
                Scenes 1–2 played on the home page — this continues where that left off.
              </p>

              {/* Choices that built this story */}
              <div className="w-full mb-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.22em] whitespace-nowrap">
                    The choices that built this story
                  </span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Situation */}
                <div className="rounded-2xl border border-primary/20 bg-primary/6 p-4 mb-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-primary/50 mb-1.5">The Situation</p>
                  <p className="text-sm text-white/85 italic leading-relaxed">"{story.situation}"</p>
                </div>

                {/* Other choices */}
                <div className="grid grid-cols-2 gap-2">
                  {story.choices.map(({ label, value }) => (
                    <div
                      key={label}
                      className={`rounded-xl border px-3 py-2.5 ${
                        label === "Intensity"
                          ? "border-[#e879a0]/20 bg-[#e879a0]/5"
                          : "border-white/8 bg-white/3"
                      }`}
                    >
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/35 mb-1">{label}</p>
                      <p className={`text-xs leading-snug ${label === "Intensity" ? "text-[#e879a0]/80" : "text-white/75"}`}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* This is not your story */}
              <div className="w-full mb-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.22em] whitespace-nowrap">
                    This is not your story
                  </span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <p className="text-center text-base font-display text-foreground leading-snug mb-2">
                  We believe in personalisation.
                </p>
                <p className="text-center text-sm text-white/55 leading-relaxed mb-6">
                  Both of these are editor's selections — built to show what the platform can do.
                  Yours is written from scratch around your cast, your scene, your desire, your intensity.
                  Every choice is yours. The story exists only for you.
                </p>

                <Link
                  href="/pricing"
                  className="block w-full text-center font-bold text-sm py-4 rounded-2xl
                             hover:opacity-90 active:scale-[0.98] transition-all"
                  style={{
                    background: isAfterDark ? "#e879a0" : "#c9a227",
                    color: "#000",
                    boxShadow: isAfterDark
                      ? "0 0 40px -8px rgba(232,121,160,0.5)"
                      : "0 0 40px -8px rgba(201,162,39,0.5)",
                  }}
                >
                  Build my private story →
                </Link>

                <div className="flex items-center justify-center gap-4 mt-4">
                  <Link href="/pricing" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                    View pricing
                  </Link>
                  <span className="text-white/20 text-xs">·</span>
                  <Link href="/how-it-works" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                    How it works
                  </Link>
                  <span className="text-white/20 text-xs">·</span>
                  <Link href="/about" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                    About us
                  </Link>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-white/35 tracking-wide pb-8 px-6">
          Literary. Private. Entirely yours. ·{" "}
          <Link href="/privacy" className="hover:text-white/50 transition-colors">
            How we protect it →
          </Link>
        </p>
      </motion.div>
    </>
  );
}
