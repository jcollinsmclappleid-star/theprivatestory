import { useState } from "react";
import { useLocation } from "wouter";
import { useAudioPlayer, AMBIENT_OPTIONS } from "@/store/use-audio-player";
import type { AmbientId } from "@/store/use-audio-player";
import { Play, Pause, X, Wind, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

function AmbientDrawer({
  ambientMode,
  ambientVolume,
  setAmbientMode,
  setAmbientVolume,
  onClose,
}: {
  ambientMode: AmbientId | null;
  ambientVolume: number;
  setAmbientMode: (id: AmbientId | null) => void;
  setAmbientVolume: (v: number) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className="absolute bottom-full mb-3 left-0 right-0 glass-panel rounded-2xl p-4 border border-border/40"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Ambient Layer</p>
          <p className="text-xs text-muted-foreground">A subtle atmosphere beneath the voice.</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {AMBIENT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setAmbientMode(ambientMode === opt.id ? null : (opt.id as AmbientId))}
            className={`px-2 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              ambientMode === opt.id
                ? "bg-primary/20 border-primary/50 text-primary"
                : "bg-card/30 border-border/30 text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Wind className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={ambientVolume}
          onChange={(e) => setAmbientVolume(Number(e.target.value))}
          className="flex-1 h-1.5 accent-primary rounded-full cursor-pointer"
        />
        <span className="text-xs text-muted-foreground w-8 text-right">{Math.round(ambientVolume * 100)}%</span>
      </div>
    </motion.div>
  );
}

export function FloatingPlayer() {
  const [location] = useLocation();
  const [ambientOpen, setAmbientOpen] = useState(false);
  const {
    currentStory,
    isPlaying,
    togglePlay,
    progress,
    close,
    ambientMode,
    ambientVolume,
    setAmbientMode,
    setAmbientVolume,
  } = useAudioPlayer();

  const isHidden = !currentStory || location.startsWith("/story/");

  return (
    <AnimatePresence>
      {!isHidden && currentStory && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50"
        >
          <AnimatePresence>
            {ambientOpen && (
              <AmbientDrawer
                ambientMode={ambientMode}
                ambientVolume={ambientVolume}
                setAmbientMode={setAmbientMode}
                setAmbientVolume={setAmbientVolume}
                onClose={() => setAmbientOpen(false)}
              />
            )}
          </AnimatePresence>

          <div className="glass-panel rounded-full flex items-center p-2 pr-4 overflow-hidden relative group hover:border-primary/30 transition-colors">
            <div
              className="absolute left-0 bottom-0 h-1 bg-primary/80 transition-all duration-300 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />

            <Link href={`/story/${currentStory.id}`} className="flex items-center flex-1 min-w-0 cursor-pointer">
              <img
                src={currentStory.coverImage || "/images/logo.png"}
                alt={currentStory.title}
                className="w-12 h-12 rounded-full object-cover shadow-md shrink-0"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/logo.png"; }}
              />
              <div className="ml-3 truncate">
                <p className="text-sm font-semibold text-foreground truncate">{currentStory.title}</p>
                <p className="text-xs text-muted-foreground truncate">{currentStory.mood}</p>
              </div>
            </Link>

            <div className="flex items-center gap-2 shrink-0 ml-3">
              <button
                onClick={(e) => { e.stopPropagation(); setAmbientOpen((v) => !v); }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  ambientMode
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Ambient Layer"
              >
                <Wind className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); close(); }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
