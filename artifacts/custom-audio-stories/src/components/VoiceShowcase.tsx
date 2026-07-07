import { useState, useRef, useCallback } from "react";
import { Play, Pause, Loader } from "lucide-react";
import { VOICES, KAYLA_VOICE_ID } from "@/lib/voices";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const SAMPLE_VOICE_IDS = [
  KAYLA_VOICE_ID,         // Kayla — recommended narrator
  "jfIS2w2yJi0grJZPyEsk", // Theo — male narrator
  "tQ4MEZFJOzsahSEEZtHK", // Maya — her dialogue
  "AeRdCCKzvd23BpJoofzx", // James — his dialogue
  "PB6BdkFkZLbI39GHdnbQ", // Lisa
  "D9MdulIxfrCUUJcGNQon", // Sofia
];

const SAMPLE_VOICES = SAMPLE_VOICE_IDS
  .map((id) => VOICES.find((v) => v.id === id))
  .filter(Boolean) as typeof VOICES;

export function VoiceShowcase() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggle = useCallback((voiceId: string) => {
    if (playing === voiceId) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }

    const audio = new Audio();
    audioRef.current = audio;
    setLoading(voiceId);
    setPlaying(null);

    audio.oncanplay = () => {
      setLoading(null);
      setPlaying(voiceId);
      audio.play().catch(() => {
        setLoading(null);
        setPlaying(null);
      });
    };

    audio.onended = () => setPlaying(null);
    audio.onerror = () => { setLoading(null); setPlaying(null); };

    audio.src = `${BASE}/api/voice-samples/${voiceId}`;
    audio.load();
  }, [playing]);

  return (
    <div className="w-full">
      <div className="text-center mb-7">
        <p
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.28)",
            marginBottom: "10px",
          }}
        >
          Choose your narrator
        </p>
        <p className="text-sm text-muted-foreground/60 leading-relaxed">
          Kayla is our recommended narrator — press play to hear each voice before you decide.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
        {SAMPLE_VOICES.map((voice) => {
          const isPlaying = playing === voice.id;
          const isLoading = loading === voice.id;
          const isActive = isPlaying || isLoading;

          return (
            <button
              key={voice.id}
              type="button"
              onClick={() => handleToggle(voice.id)}
              aria-label={`${isPlaying ? "Pause" : "Play"} ${voice.displayName} voice sample`}
              className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200 w-full sm:w-auto sm:min-w-[190px] sm:max-w-[230px] ${
                isActive
                  ? "border-primary/50 bg-primary/8 shadow-[0_0_20px_-8px_rgba(201,162,39,0.3)]"
                  : "border-border/25 bg-white/[0.02] hover:border-border/50 hover:bg-white/[0.04]"
              }`}
            >
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/6 text-muted-foreground group-hover:bg-white/12 group-hover:text-foreground"
                }`}
              >
                {isLoading ? (
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5 translate-x-[1px]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-sm font-semibold text-foreground leading-tight">
                    {voice.displayName}
                  </span>
                  {voice.recommendLabel && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">
                      {voice.recommendLabel}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border leading-none flex-shrink-0 ${
                      voice.gender === "female"
                        ? "border-pink-400/25 bg-pink-500/5 text-pink-300/70"
                        : "border-blue-400/25 bg-blue-500/5 text-blue-300/70"
                    }`}
                  >
                    {voice.label}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground/45 mt-0.5 truncate">
                  {voice.accentLabel ?? voice.accent}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-center text-[11px] text-muted-foreground/30 mt-5">
        You choose your narrator when creating each story — Maya and James handle character dialogue by default.
      </p>
    </div>
  );
}
