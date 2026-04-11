import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import { MiniDoorCTA } from "@/components/ThreeDoors";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const SAMPLE_ID = "lib-dd2_02-1775048422711";
const COVER_URL = `${API_BASE}/images/cover-${SAMPLE_ID}.png`;
const AUDIO_URL = `${API_BASE}/audio/audio-${SAMPLE_ID}.mp3`;

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

        {/* Framing */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center text-xs text-white/55 italic leading-relaxed mb-10 max-w-[220px]"
        >
          This story wasn't built around you.<br />Yours will be.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.5 }}
          className="flex flex-col items-center gap-5 w-full"
        >
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">
            Create a story built around your desire
          </p>
          <MiniDoorCTA />
          <div className="flex items-center gap-4 mt-1">
            <Link href="/pricing" className="text-xs text-white/50 hover:text-white/75 transition-colors">
              View pricing
            </Link>
            <span className="text-white/25 text-xs">·</span>
            <Link href="/about" className="text-xs text-white/50 hover:text-white/75 transition-colors">
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
  );
}
