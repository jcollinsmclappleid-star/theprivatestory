import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const REACTIONS = [
  { emoji: "❤️", label: "Felt that", tag: "Felt that" },
  { emoji: "🔥", label: "More like this", tag: "More like this" },
  { emoji: "✨", label: "Surprised me", tag: "Surprised me" },
  { emoji: "🌙", label: "Needed that", tag: "Needed that" },
];

interface Props {
  visible: boolean;
  onDismiss: () => void;
  storyMood?: string;
}

export function StoryReactionOverlay({ visible, onDismiss, storyMood }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSelected(null);
      setDismissed(false);
      return;
    }
    const timer = setTimeout(() => {
      if (!dismissed) handleDismiss([]);
    }, 5000);
    return () => clearTimeout(timer);
  }, [visible, dismissed]);

  function handleDismiss(tags: string[]) {
    setDismissed(true);
    if (tags.length > 0) {
      fetch(`${API_BASE}/api/me/taste`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reactionTags: tags }),
      }).catch(() => {});
    }
    onDismiss();
  }

  function handleReaction(tag: string) {
    setSelected(tag);
    setTimeout(() => handleDismiss([tag]), 400);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="reaction-overlay"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,380px)]"
        >
          <div className="glass-panel rounded-2xl px-4 py-4 border border-border/40 shadow-2xl">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground text-center mb-3">
              How was it?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {REACTIONS.map((r) => (
                <button
                  key={r.tag}
                  onClick={() => handleReaction(r.tag)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                    selected === r.tag
                      ? "border-primary/60 bg-primary/10"
                      : "border-white/8 bg-white/4 hover:bg-white/8 hover:border-white/16"
                  }`}
                >
                  <span className="text-2xl leading-none">{r.emoji}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight text-center px-1">
                    {r.label}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => handleDismiss([])}
              className="mt-3 w-full text-center text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              skip
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
