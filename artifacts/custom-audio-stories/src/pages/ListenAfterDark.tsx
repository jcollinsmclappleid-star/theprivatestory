import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, RotateCw, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const AUDIO_URL        = `${API_BASE}/api/audio/audio-fc49bea83789fbfdf8b98e5042316d77.mp3`;
const COVER_URL        = `${API_BASE}/api/images/cover-fc49bea83789fbfdf8b98e5042316d77.png`;
const SCENE3_START     = 253;
const TOTAL_DURATION_S = 599; // initial fallback — overridden by actual file-size fetch on mount
const BYTES_PER_SECOND = 16_000; // 128 kbps CBR MP3 → 16 000 bytes/sec
const AGE_GATE_KEY = "tps_age_confirmed";

const CHOICES = [
  { label: "Pairing",    value: "Her & Him" },
  { label: "Chemistry",  value: "He Takes Charge" },
  { label: "Setting",    value: "Moving Elevator" },
  { label: "World",      value: "Sun-Soaked · Late Night · Montego Bay" },
  { label: "Archetype",  value: "The Adventurer" },
  { label: "Narrator",   value: "Kayla · Expressive" },
  { label: "Intensity",  value: "Intense · After Dark" },
];

const SITUATION = "He's engaged. The announcement was three weeks ago.";

// Rose accent for After Dark
const ROSE = "#e879a0";

function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[999] flex items-center justify-center px-6"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #1a0910 0%, #0a0508 60%, #050303 100%)" }}
    >
      <div className="w-full max-w-sm text-center">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-7"
          style={{ border: `1px solid ${ROSE}30`, background: `${ROSE}12` }}
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: ROSE }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3" style={{ color: `${ROSE}99` }}>
          After Dark · Adults only
        </p>
        <h1 className="font-display text-3xl font-bold text-foreground leading-tight mb-4">
          This story contains<br />explicit content.
        </h1>
        <p className="text-sm text-white/55 leading-relaxed mb-8">
          You must be 18 years of age or older to enter.<br />
          By continuing you confirm this is true.
        </p>
        <button
          onClick={onConfirm}
          className="w-full font-bold text-sm py-4 rounded-2xl active:scale-[0.98] transition-all mb-3"
          style={{ background: ROSE, color: "#000", boxShadow: `0 0 40px -8px ${ROSE}80` }}
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

export default function ListenAfterDark() {
  useSEO({
    title: "Gold Light, Cold Metal — After Dark sample — The Private Story",
    description:
      "He's promised to someone else. The gold light makes it easy to pretend otherwise. An Editor's Choice After Dark story at intense level.",
  });

  const [ageConfirmed, setAgeConfirmed] = useState(() => {
    try { return localStorage.getItem(AGE_GATE_KEY) === "1"; } catch { return false; }
  });
  const confirmAge = useCallback(() => {
    try { localStorage.setItem(AGE_GATE_KEY, "1"); } catch { /* noop */ }
    setAgeConfirmed(true);
  }, []);

  const audioRef      = useRef<HTMLAudioElement>(null);
  const hasPlayedRef  = useRef(false);
  const [playing, setPlaying]         = useState(false);
  const [currentTime, setCurrentTime] = useState(SCENE3_START);
  const [duration, setDuration]       = useState(TOTAL_DURATION_S);
  const [seeked, setSeeked]           = useState(false);

  // Fetch actual audio duration from file size
  useEffect(() => {
    fetch(AUDIO_URL, { method: "GET", headers: { Range: "bytes=0-0" } })
      .then(r => {
        const cr = r.headers.get("content-range");
        if (cr) {
          const total = Number(cr.split("/")[1] ?? "0");
          if (total > 1_000_000) setDuration(Math.round(total / BYTES_PER_SECOND));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onMeta = () => {
      if (!seeked && audio.readyState >= 1) {
        audio.currentTime = SCENE3_START;
        setCurrentTime(SCENE3_START);
        setSeeked(true);
      }
    };
    const onTime = () => {
      const t = audio.currentTime;
      if (!hasPlayedRef.current && t < SCENE3_START - 0.5) return;
      setCurrentTime(t);
    };
    const onEnd  = () => setPlaying(false);

    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);

    if (audio.readyState >= 1 && !seeked) {
      audio.currentTime = SCENE3_START;
      setCurrentTime(SCENE3_START);
      setSeeked(true);
    }

    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }, [seeked]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else {
      try {
        await audio.play();
        hasPlayedRef.current = true;
        setPlaying(true);
      } catch { /* audio may not be ready */ }
    }
  }, [playing]);

  const skipBack = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 30);
  }, []);

  const skipForward = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(duration, audio.currentTime + 30);
  }, [duration]);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const progress  = duration ? Math.min(100, (currentTime / duration) * 100) : 0;
  const scene3Pct = duration ? (SCENE3_START / duration) * 100 : 0;

  return (
    <>
      {!ageConfirmed && <AgeGate onConfirm={confirmAge} />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background flex flex-col"
      >
        <audio ref={audioRef} src={AUDIO_URL} preload="metadata" />

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5">
          <Link
            href="/listen"
            className="flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: `${ROSE}99` }}
            onMouseEnter={e => (e.currentTarget.style.color = ROSE)}
            onMouseLeave={e => (e.currentTarget.style.color = `${ROSE}99`)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.22em]">Sample story</span>
          <Link
            href="/pricing"
            className="text-[11px] transition-colors tracking-widest uppercase"
            style={{ color: `${ROSE}cc` }}
          >
            Pricing →
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center px-6 pb-10 max-w-lg mx-auto w-full">

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex items-center gap-2 mb-6"
          >
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
              style={{ border: `1px solid ${ROSE}38`, background: `${ROSE}12`, color: ROSE }}
            >
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
              After Dark
            </span>
            <span
              className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
              style={{ border: `1px solid ${ROSE}22`, background: `${ROSE}08`, color: `${ROSE}bb` }}
            >
              Intense
            </span>
          </motion.div>

          {/* Cover art */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden mb-6"
            style={{ boxShadow: `0 0 80px -20px ${ROSE}40` }}
          >
            <img src={COVER_URL} alt="Gold Light, Cold Metal" className="w-full h-full object-cover" />
          </motion.div>

          {/* Story info */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center mb-7 w-full"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: `${ROSE}99` }}>
              Intense · After Dark · Narrated by Kayla
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight">
              Gold Light, Cold Metal
            </h1>
            <p className="text-sm text-white/65 italic leading-relaxed">
              He's promised to someone else. The elevator has stalled.<br />
              The gold light makes it easy to pretend otherwise.
            </p>
          </motion.div>

          {/* Player */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-full mb-2"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-center"
               style={{ color: `${ROSE}60` }}>
              Playing from Scene 3 — the moment everything breaks
            </p>

            {/* Seek bar */}
            <div
              className="h-[3px] bg-white/8 rounded-full cursor-pointer mb-5 relative group"
              onClick={seek}
            >
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{ width: `${progress}%`, background: ROSE }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 6px)`, background: ROSE, boxShadow: `0 0 8px ${ROSE}b0` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-white/25"
                style={{ left: `${scene3Pct}%` }}
                title="Scene 3 starts here"
              />
            </div>

            {/* Transport */}
            <div className="flex items-center justify-between gap-2 mb-5">
              <span className="text-xs text-white/55 font-mono tabular-nums w-9 shrink-0">{formatTime(currentTime)}</span>
              <button
                onClick={skipBack}
                className="flex flex-col items-center gap-0.5 active:scale-90 transition-all"
                style={{ color: `${ROSE}70` }}
                onMouseEnter={e => (e.currentTarget.style.color = `${ROSE}cc`)}
                onMouseLeave={e => (e.currentTarget.style.color = `${ROSE}70`)}
                aria-label="Skip back 30 seconds"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="text-[9px] font-semibold tabular-nums leading-none">30</span>
              </button>
              <button
                onClick={togglePlay}
                className="flex items-center justify-center w-14 h-14 rounded-full shrink-0 active:scale-95 transition-all hover:scale-105"
                style={{ background: ROSE, boxShadow: `0 0 40px -8px ${ROSE}88` }}
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing
                  ? <Pause className="w-5 h-5" style={{ color: "#000" }} />
                  : <Play className="w-5 h-5 ml-0.5" style={{ color: "#000" }} />
                }
              </button>
              <button
                onClick={skipForward}
                className="flex flex-col items-center gap-0.5 active:scale-90 transition-all"
                style={{ color: `${ROSE}70` }}
                onMouseEnter={e => (e.currentTarget.style.color = `${ROSE}cc`)}
                onMouseLeave={e => (e.currentTarget.style.color = `${ROSE}70`)}
                aria-label="Skip forward 30 seconds"
              >
                <RotateCw className="w-5 h-5" />
                <span className="text-[9px] font-semibold tabular-nums leading-none">30</span>
              </button>
              <span className="text-xs text-white/55 font-mono tabular-nums w-9 text-right shrink-0">{formatTime(duration)}</span>
            </div>

          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-[10px] text-white/30 text-center mt-4 mb-8 italic"
          >
            Scenes 1–2 played on the home page — this continues where that left off.
          </motion.p>

          {/* Choices */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="w-full mb-8"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] whitespace-nowrap"
                    style={{ color: `${ROSE}80` }}>
                The choices that built this story
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="rounded-2xl p-4 mb-3"
                 style={{ border: `1px solid ${ROSE}22`, background: `${ROSE}08` }}>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
                 style={{ color: `${ROSE}60` }}>The Situation</p>
              <p className="text-sm text-white/85 italic leading-relaxed">"{SITUATION}"</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {CHOICES.map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl px-3 py-2.5"
                  style={
                    label === "Intensity"
                      ? { border: `1px solid ${ROSE}25`, background: `${ROSE}08` }
                      : { border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }
                  }
                >
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/35 mb-1">{label}</p>
                  <p className="text-xs leading-snug"
                     style={{ color: label === "Intensity" ? `${ROSE}cc` : "rgba(255,255,255,0.75)" }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="w-full mb-8"
          >
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
            <p className="text-center text-sm text-white/55 leading-relaxed mb-4">
              This was an editor's selection — built to show what After Dark can do.
              Yours is written from scratch around your cast, your scene, your desire.
              Every choice is yours. The story exists only for you.
            </p>

            <div className="flex items-center justify-center gap-2 mb-6">
              <Link href="/listen/private"
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                ← Hear the warm version
              </Link>
            </div>

            <Link
              href="/pricing"
              className="block w-full text-center font-bold text-sm py-4 rounded-2xl active:scale-[0.98] transition-all"
              style={{ background: ROSE, color: "#000", boxShadow: `0 0 40px -8px ${ROSE}80` }}
            >
              Build my private story →
            </Link>

            <div className="flex items-center justify-center gap-4 mt-4">
              <Link href="/pricing" className="text-xs text-white/40 hover:text-white/70 transition-colors">View pricing</Link>
              <span className="text-white/20 text-xs">·</span>
              <Link href="/how-it-works" className="text-xs text-white/40 hover:text-white/70 transition-colors">How it works</Link>
              <span className="text-white/20 text-xs">·</span>
              <Link href="/about" className="text-xs text-white/40 hover:text-white/70 transition-colors">About us</Link>
            </div>
          </motion.div>
        </div>

        <p className="text-center text-[10px] text-white/35 tracking-wide pb-8 px-6">
          Literary. Private. Entirely yours. ·{" "}
          <Link href="/privacy" className="hover:text-white/50 transition-colors">How we protect it →</Link>
        </p>
      </motion.div>
    </>
  );
}
