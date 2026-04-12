import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, RotateCw, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const AUDIO_URL        = `${API_BASE}/api/audio/audio-b46f97f830345edb4687ed19b7a28ad1.mp3`;
const COVER_URL        = `${API_BASE}/api/images/cover-daa5ffac36e215afb98fc54761355b53.png`;
const SCENE3_START     = 253;
const TOTAL_DURATION_S = 600; // initial fallback — overridden by actual file-size fetch on mount
const BYTES_PER_SECOND = 16_000; // 128 kbps CBR MP3 → 16 000 bytes/sec
const AMBIENT_VOL_MAX  = 1.0;

const AGE_GATE_KEY = "tps_age_confirmed";

const CHOICES = [
  { label: "Pairing",    value: "Her & Him" },
  { label: "Chemistry",  value: "He Takes Charge" },
  { label: "Setting",    value: "Moving Elevator" },
  { label: "World",      value: "Sun-Soaked · Late Night · Montego Bay" },
  { label: "Archetype",  value: "The Adventurer" },
  { label: "Narrator",   value: "Clara · Soothing" },
];

const SITUATION = "He's engaged. The announcement was three weeks ago.";

const AMBIENT_OPTS = [
  { id: "rain",       label: "Rain",       url: `${API_BASE}/api/ambient/rain.mp3` },
  { id: "train",      label: "Train",      url: `${API_BASE}/api/ambient/train.mp3` },
  { id: "ocean",      label: "Ocean",      url: `${API_BASE}/api/ambient/ocean.mp3` },
  { id: "quiet_room", label: "Quiet Room", url: `${API_BASE}/api/ambient/quiet_room.mp3` },
] as const;
type AmbientKey = (typeof AMBIENT_OPTS)[number]["id"];

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
          This story contains<br />adult content.
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

export default function ListenPrivate() {
  useSEO({
    title: "The Ring in the Mirror — Sample story — The Private Story",
    description:
      "He has a ring on his finger. The elevator has stalled. Neither of you mentions either. An Editor's Choice story at warm intensity.",
  });

  const [ageConfirmed, setAgeConfirmed] = useState(() => {
    try { return localStorage.getItem(AGE_GATE_KEY) === "1"; } catch { return false; }
  });
  const confirmAge = useCallback(() => {
    try { localStorage.setItem(AGE_GATE_KEY, "1"); } catch { /* noop */ }
    setAgeConfirmed(true);
  }, []);

  const audioRef      = useRef<HTMLAudioElement>(null);
  const ambientRef    = useRef<HTMLAudioElement>(null);
  const hasPlayedRef  = useRef(false);
  const [playing, setPlaying]         = useState(false);
  const [currentTime, setCurrentTime] = useState(SCENE3_START);
  const [duration, setDuration]       = useState(TOTAL_DURATION_S);
  const [seeked, setSeeked]           = useState(false);

  // Ambient state — off by default, quiet_room pre-selected, low volume
  const [ambientOn, setAmbientOn]         = useState(false);
  const [ambientKey, setAmbientKey]       = useState<AmbientKey>("quiet_room");
  const [ambientVol, setAmbientVol]       = useState(0.1);
  // Ref so effects always read the latest volume without being in every dep array
  const ambientVolRef = useRef(0.1);

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

  // Ambient effect 1: play/pause + track switching.
  // ambientVolRef (not ambientVol state) is read so volume changes don't re-trigger this.
  useEffect(() => {
    const el = ambientRef.current;
    if (!el) return;

    if (!ambientOn || !playing) {
      el.pause();
      return;
    }

    const opt = AMBIENT_OPTS.find(o => o.id === ambientKey);
    if (!opt) return;

    // Detect track change by checking whether the current src includes the track id
    const currentSrc = el.currentSrc || el.src || "";
    const needsLoad  = !currentSrc.includes(`${ambientKey}.mp3`);

    let onCanPlay: (() => void) | null = null;

    if (needsLoad) {
      el.pause();
      el.src  = opt.url;
      el.loop = true;
      el.load();
      // Play once the browser has buffered enough — avoids silent failure after load()
      onCanPlay = () => {
        el.volume = ambientVolRef.current;
        el.play().catch(() => {});
      };
      el.addEventListener("canplay", onCanPlay, { once: true });
    } else {
      el.volume = ambientVolRef.current;
      el.play().catch(() => {});
    }

    return () => {
      if (onCanPlay) el.removeEventListener("canplay", onCanPlay);
    };
  }, [ambientOn, playing, ambientKey]);

  // Ambient effect 2: volume only — updates the ref AND the live element immediately.
  // Kept separate so moving the slider never restarts the track.
  useEffect(() => {
    ambientVolRef.current = ambientVol;
    if (ambientRef.current) ambientRef.current.volume = ambientVol;
  }, [ambientVol]);

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
        <audio ref={ambientRef} loop />

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5">
          <Link
            href="/listen"
            className="flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.22em]">Sample story</span>
          <Link
            href="/pricing"
            className="text-[11px] text-primary/80 hover:text-primary transition-colors tracking-widest uppercase"
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
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20 bg-white/5 text-white/60">
              The Private Story
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/30 bg-primary/8 text-primary/80">
              Editor's Choice
            </span>
          </motion.div>

          {/* Cover art */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden mb-6
                       shadow-[0_0_80px_-20px_rgba(201,162,39,0.25)]"
          >
            <img src={COVER_URL} alt="The Ring in the Mirror" className="w-full h-full object-cover" />
          </motion.div>

          {/* Story info */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center mb-7 w-full"
          >
            <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mb-2">
              Warm · 10 min · Narrated by Clara
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight">
              The Ring in the Mirror
            </h1>
            <p className="text-sm text-white/65 italic leading-relaxed">
              He has a ring on his finger. The elevator has stalled.<br />Neither of you mentions either.
            </p>
          </motion.div>

          {/* Player */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-full mb-2"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/50 mb-3 text-center">
              Playing from Scene 3 — the moment everything breaks
            </p>

            {/* Seek bar */}
            <div
              className="h-[3px] bg-white/8 rounded-full cursor-pointer mb-5 relative group"
              onClick={seek}
            >
              <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary
                           shadow-[0_0_8px_rgba(201,162,39,0.7)] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-primary/40"
                style={{ left: `${scene3Pct}%` }}
                title="Scene 3 starts here"
              />
            </div>

            {/* Transport */}
            <div className="flex items-center justify-between gap-2 mb-5">
              <span className="text-xs text-white/55 font-mono tabular-nums w-9 shrink-0">{formatTime(currentTime)}</span>
              <button
                onClick={skipBack}
                className="flex flex-col items-center gap-0.5 text-white/45 hover:text-white/80 active:scale-90 transition-all"
                aria-label="Skip back 30 seconds"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="text-[9px] font-semibold tabular-nums leading-none">30</span>
              </button>
              <button
                onClick={togglePlay}
                className="flex items-center justify-center w-14 h-14 rounded-full shrink-0
                           bg-primary hover:bg-primary/90 active:scale-95 transition-all hover:scale-105
                           shadow-[0_0_40px_-8px_rgba(201,162,39,0.55)]"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? <Pause className="w-5 h-5 text-primary-foreground" /> : <Play className="w-5 h-5 text-primary-foreground ml-0.5" />}
              </button>
              <button
                onClick={skipForward}
                className="flex flex-col items-center gap-0.5 text-white/45 hover:text-white/80 active:scale-90 transition-all"
                aria-label="Skip forward 30 seconds"
              >
                <RotateCw className="w-5 h-5" />
                <span className="text-[9px] font-semibold tabular-nums leading-none">30</span>
              </button>
              <span className="text-xs text-white/55 font-mono tabular-nums w-9 text-right shrink-0">{formatTime(duration)}</span>
            </div>

            {/* Ambient controls */}
            <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/35">Ambient layer</span>
                <button
                  onClick={() => setAmbientOn(v => !v)}
                  className={`relative w-8 h-4 rounded-full transition-colors ${ambientOn ? "bg-primary/70" : "bg-white/15"}`}
                  aria-label={ambientOn ? "Turn off ambient" : "Turn on ambient"}
                >
                  <span
                    className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${ambientOn ? "translate-x-4" : "translate-x-0.5"}`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {AMBIENT_OPTS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setAmbientKey(opt.id); if (!ambientOn) setAmbientOn(true); }}
                    className={`py-1.5 rounded-xl text-[10px] font-medium transition-all border ${
                      ambientKey === opt.id && ambientOn
                        ? "bg-primary/20 border-primary/50 text-primary"
                        : ambientKey === opt.id
                          ? "bg-white/8 border-white/20 text-white/60"
                          : "bg-transparent border-white/8 text-white/30 hover:text-white/60 hover:border-white/20"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] text-white/30 w-10 shrink-0">Volume</span>
                <input
                  type="range"
                  min={0}
                  max={AMBIENT_VOL_MAX}
                  step={0.005}
                  value={ambientVol}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setAmbientVol(v);
                    ambientVolRef.current = v;
                    if (ambientRef.current) ambientRef.current.volume = v;
                  }}
                  disabled={!ambientOn}
                  className="flex-1 h-1 accent-[#c9a227] rounded-full cursor-pointer disabled:opacity-30"
                />
                <span className="text-[9px] text-white/30 w-6 text-right">{Math.round((ambientVol / AMBIENT_VOL_MAX) * 100)}%</span>
              </div>
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
              <span className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.22em] whitespace-nowrap">The choices that built this story</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/6 p-4 mb-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-primary/50 mb-1.5">The Situation</p>
              <p className="text-sm text-white/85 italic leading-relaxed">"{SITUATION}"</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {CHOICES.map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-white/8 bg-white/3 px-3 py-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/35 mb-1">{label}</p>
                  <p className="text-xs text-white/75 leading-snug">{value}</p>
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
              <span className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.22em] whitespace-nowrap">This is not your story</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <p className="text-center text-base font-display text-foreground leading-snug mb-2">
              We believe in personalisation.
            </p>
            <p className="text-center text-sm text-white/55 leading-relaxed mb-4">
              This was an editor's selection — built to show what the platform can do.
              Yours is written from scratch around your cast, your room, your desire.
              Every choice is yours. The story exists only for you.
            </p>

            <div className="flex items-center justify-center gap-2 mb-6">
              <Link href="/listen/after-dark"
                className="text-xs text-[#e879a0]/60 hover:text-[#e879a0] transition-colors"
              >
                ← Hear the After Dark version
              </Link>
            </div>

            <Link
              href="/pricing"
              className="block w-full text-center bg-primary text-primary-foreground font-bold text-sm
                         py-4 rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all
                         shadow-[0_0_40px_-8px_rgba(201,162,39,0.5)]"
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
