import { useLocation } from "wouter";
import { useAudioPlayer } from "@/store/use-audio-player";
import { isSampleId } from "@/data/sampleId";
import { Play, Pause, X, RotateCcw, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

export function FloatingPlayer() {
  const [location] = useLocation();
  const {
    currentStory,
    isPlaying,
    togglePlay,
    progress,
    currentTime,
    duration,
    close,
    seekTo,
  } = useAudioPlayer();

  // Hide on the dedicated story page (its own player) and on /samples (the
  // bespoke StickyPlayer takes over there). When the user navigates AWAY from
  // /samples mid-listen, this floating player picks the session up.
  const isSample = isSampleId(currentStory?.id);
  const detailHref = isSample ? "/samples" : `/story/${currentStory?.id}`;
  const isHidden =
    !currentStory ||
    location.startsWith("/story/") ||
    location === "/samples";

  const skipBack    = () => seekTo(Math.max(0, currentTime - 30));
  const skipForward = () => seekTo(Math.min(duration || currentTime + 30, currentTime + 30));

  return (
    <AnimatePresence>
      {!isHidden && currentStory && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50"
        >
          <div className="glass-panel rounded-2xl border border-border/40 overflow-hidden">
            {/* Progress bar */}
            <div className="h-[2px] bg-white/8 w-full">
              <div
                className="h-full bg-primary/80 transition-all duration-300 ease-linear"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            {/* Main row */}
            <div className="flex items-center px-3 py-2.5 gap-2">
              <Link href={detailHref} className="flex items-center flex-1 min-w-0 cursor-pointer gap-2.5">
                <img
                  src={currentStory.coverImage || "/images/logo.png"}
                  alt={currentStory.title}
                  className="w-10 h-10 rounded-xl object-cover shadow-md shrink-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/logo.png"; }}
                />
                <div className="truncate">
                  <p className="text-sm font-semibold text-foreground truncate leading-tight">{currentStory.title}</p>
                  <p className="text-xs text-muted-foreground truncate leading-tight">
                    {currentStory.mood ?? ""}
                  </p>
                </div>
              </Link>

              {/* Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={skipBack}
                  className="flex flex-col items-center gap-0.5 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Skip back 30s"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-[8px] font-bold leading-none -mt-0.5">30</span>
                </button>
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors shrink-0"
                >
                  {isPlaying
                    ? <Pause className="w-5 h-5 fill-current" />
                    : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                <button
                  onClick={skipForward}
                  className="flex flex-col items-center gap-0.5 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Skip forward 30s"
                >
                  <RotateCw className="w-4 h-4" />
                  <span className="text-[8px] font-bold leading-none -mt-0.5">30</span>
                </button>
                <button
                  onClick={() => close()}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
