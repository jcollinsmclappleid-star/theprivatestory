import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const SAMPLE_ID = "lib-dd2_02-1775048422711";
const COVER_URL = `${API_BASE}/images/cover-${SAMPLE_ID}.png`;
const AUDIO_URL = `${API_BASE}/audio/audio-${SAMPLE_ID}.mp3`;

const AGE_GATE_KEY = "tps_age_confirmed";

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
        {/* Lock mark */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-primary/30 bg-primary/8 mb-7">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "#c9a227" }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* Heading */}
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/60 mb-3">Adults only</p>
        <h1 className="font-display text-3xl font-bold text-foreground leading-tight mb-4">
          This story contains<br />explicit content.
        </h1>
        <p className="text-sm text-white/55 leading-relaxed mb-8">
          You must be 18 years of age or older to enter.<br />
          By continuing you confirm this is true.
        </p>

        {/* Confirm button */}
        <button
          onClick={onConfirm}
          className="w-full bg-primary text-primary-foreground font-bold text-sm py-4 rounded-2xl
                     hover:bg-primary/90 active:scale-[0.98] transition-all mb-3
                     shadow-[0_0_40px_-8px_rgba(201,162,39,0.5)]"
        >
          I am 18 or older — enter
        </button>

        {/* Leave link */}
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

export default function Listen() {
  useSEO({
    title: "Listen to a sample — The Private Story",
    description:
      "Hear what a private, personalised audio story sounds like. Then create one built entirely around your desire.",
  });

  const [ageConfirmed, setAgeConfirmed] = useState(() => {
    try { return localStorage.getItem(AGE_GATE_KEY) === "1"; } catch { return false; }
  });

  const confirmAge = useCallback(() => {
    try { localStorage.setItem(AGE_GATE_KEY, "1"); } catch { /* noop */ }
    setAgeConfirmed(true);
  }, []);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onMeta = () => {
      const d = audio.duration;
      if (d && isFinite(d) && d > 0) setDuration(d);
    };
    const onTime = () => setCurrentTime(audio.currentTime);
    const onEnd = () => setPlaying(false);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

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

  const progress = duration ? (currentTime / duration) * 100 : 0;

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
        <Link href="/" className="opacity-50 hover:opacity-90 transition-opacity">
          <img src={`${API_BASE}/images/logo.png`} alt="The Private Story" className="w-8 h-8" />
        </Link>
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.22em]">Sample story</span>
        <Link
          href="/pricing"
          className="text-[11px] text-primary/80 hover:text-primary transition-colors tracking-widest uppercase"
        >
          Pricing →
        </Link>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center px-6 py-4 max-w-sm mx-auto w-full">

        {/* Cover art */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden mb-7
                     shadow-[0_0_80px_-20px_rgba(201,162,39,0.22)]"
        >
          <img src={COVER_URL} alt="The Back Room in Rainlight" className="w-full h-full object-cover" />
        </motion.div>

        {/* Story info */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mb-7 w-full"
        >
          <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mb-2">
            Forbidden · 8 min · Narrated by Clara
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight">
            The Back Room in Rainlight
          </h1>
          <p className="text-sm text-white/70 italic leading-relaxed">
            You shouldn't want him. But Chicago at midnight doesn't care about shoulds.
          </p>
        </motion.div>

        {/* Player */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="w-full mb-8"
        >
          {/* Progress bar */}
          <div
            className="h-[3px] bg-white/8 rounded-full cursor-pointer mb-5 relative group"
            onClick={seek}
          >
            <div
              className="h-full bg-primary rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary
                         shadow-[0_0_8px_rgba(201,162,39,0.7)] opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>

          {/* Time + play */}
          <div className="flex items-center gap-5">
            <span className="text-xs text-white/55 font-mono tabular-nums w-9">
              {formatTime(currentTime)}
            </span>
            <button
              onClick={togglePlay}
              className="flex-1 flex items-center justify-center w-14 h-14 rounded-full
                         bg-primary hover:bg-primary/90 active:scale-95
                         transition-all hover:scale-105
                         shadow-[0_0_40px_-8px_rgba(201,162,39,0.55)]"
              style={{ maxWidth: "56px", minWidth: "56px" }}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <Pause className="w-5 h-5 text-primary-foreground" />
              ) : (
                <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
              )}
            </button>
            <span className="text-xs text-white/55 font-mono tabular-nums w-9 text-right">
              {formatTime(duration)}
            </span>
          </div>
        </motion.div>

        {/* Make it yours — personalisation pitch */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="w-full mb-8"
        >
          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.22em]">Now make it yours</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Headline */}
          <p className="text-center text-base font-display text-foreground leading-snug mb-2">
            This was someone else's story.
          </p>
          <p className="text-center text-sm text-white/60 leading-relaxed mb-6">
            Yours is written from scratch — around your cast,<br />your room, your desire.
          </p>

          {/* Customisation pillars */}
          <div className="grid grid-cols-3 gap-2 mb-7">
            <div className="flex flex-col items-center gap-1.5 rounded-xl border border-white/8 bg-white/3 px-2 py-3">
              <span className="text-lg">🚪</span>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wide text-center">The room</span>
              <span className="text-[10px] text-white/40 text-center leading-tight">Bar, hotel, study&hellip;</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 rounded-xl border border-white/8 bg-white/3 px-2 py-3">
              <span className="text-lg">✦</span>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wide text-center">The cast</span>
              <span className="text-[10px] text-white/40 text-center leading-tight">Who he is to you</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 rounded-xl border border-white/8 bg-white/3 px-2 py-3">
              <span className="text-lg">🔥</span>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wide text-center">The desire</span>
              <span className="text-[10px] text-white/40 text-center leading-tight">Mood & intensity</span>
            </div>
          </div>

          {/* CTA button */}
          <Link
            href="/pricing"
            className="block w-full text-center bg-primary text-primary-foreground font-bold text-sm
                       py-4 rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all
                       shadow-[0_0_40px_-8px_rgba(201,162,39,0.5)]"
          >
            Build my private story →
          </Link>

          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/pricing" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              View pricing
            </Link>
            <span className="text-white/20 text-xs">·</span>
            <Link href="/about" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              About us
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer note */}
      <p className="text-center text-[10px] text-white/35 tracking-wide pb-8 px-6">
        Literary. Private. Entirely yours. ·{" "}
        <Link href="/privacy" className="hover:text-white/35 transition-colors">
          How we protect it →
        </Link>
      </p>
    </motion.div>
    </>
  );
}
