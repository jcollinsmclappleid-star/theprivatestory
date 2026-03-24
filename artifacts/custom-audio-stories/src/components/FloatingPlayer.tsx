import { useLocation } from "wouter";
import { useAudioPlayer } from "@/store/use-audio-player";
import { Play, Pause, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

export function FloatingPlayer() {
  const [location] = useLocation();
  const { currentStory, isPlaying, togglePlay, progress, close } = useAudioPlayer();

  // Hide on story detail page as it has its own big player
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
          <div className="glass-panel rounded-full flex items-center p-2 pr-4 overflow-hidden relative group hover:border-primary/30 transition-colors">
            {/* Progress bar background */}
            <div 
              className="absolute left-0 bottom-0 h-1 bg-primary/80 transition-all duration-300 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
            
            <Link href={`/story/${currentStory.id}`} className="flex items-center flex-1 min-w-0 cursor-pointer">
              {/* thumbnail */}
              <img 
                src={currentStory.coverImage} 
                alt={currentStory.title}
                className="w-12 h-12 rounded-full object-cover shadow-md shrink-0"
              />
              <div className="ml-3 truncate">
                <p className="text-sm font-semibold text-foreground truncate">{currentStory.title}</p>
                <p className="text-xs text-muted-foreground truncate">{currentStory.mood}</p>
              </div>
            </Link>

            <div className="flex items-center gap-3 shrink-0 ml-4">
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
