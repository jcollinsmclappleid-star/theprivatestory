import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const REACTIONS = [
  { emoji: "❤️", label: "Felt that", tags: ["Felt that", "Adored", "Seen"] },
  { emoji: "🔥", label: "More like this", tags: ["More like this", "Electric", "Desired"] },
  { emoji: "✨", label: "Surprised me", tags: ["Surprised me", "Instant Chemistry", "Undone"] },
  { emoji: "🌙", label: "Needed that", tags: ["Needed that", "Tender", "Safe"] },
];

interface Props {
  visible: boolean;
  onDismiss: () => void;
  storyMood?: string;
  storyTags?: string[];
  storyId?: string;
  storyTitle?: string;
}

export function StoryReactionOverlay({ visible, onDismiss, storyMood, storyTags, storyId, storyTitle }: Props) {
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
    }, 4000);
    return () => clearTimeout(timer);
  }, [visible, dismissed]);

  function handleDismiss(reactionTags: string[]) {
    setDismissed(true);
    if (reactionTags.length > 0) {
      const tasteUpdate: Record<string, number> = {};

      for (const tag of reactionTags) {
        tasteUpdate[tag] = (tasteUpdate[tag] ?? 0) + 1;
      }

      if (storyMood) {
        tasteUpdate[storyMood] = (tasteUpdate[storyMood] ?? 0) + 1;
      }

      if (storyTags && storyTags.length > 0) {
        for (const tag of storyTags) {
          tasteUpdate[tag] = (tasteUpdate[tag] ?? 0) + 1;
        }
      }

      fetch(`${API_BASE}/api/me/taste`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tasteProfile: tasteUpdate,
          reactionTags,
          storyId,
          storyTitle,
        }),
      }).catch(() => {});

    }
    onDismiss();
  }

  function handleReaction(reaction: typeof REACTIONS[number]) {
    setSelected(reaction.label);
    setTimeout(() => handleDismiss(reaction.tags), 350);
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
                  key={r.label}
                  onClick={() => handleReaction(r)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                    selected === r.label
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
