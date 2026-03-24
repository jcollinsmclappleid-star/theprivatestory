import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Sparkles } from "lucide-react";

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
}

export function PremiumModal({ open, onClose }: PremiumModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-md glass-panel rounded-3xl p-8 border border-amber-400/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/30 mb-6 mx-auto">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>

            <h2 className="text-2xl font-display font-bold text-foreground text-center mb-3">
              Unlock the full experience
            </h2>
            <p className="text-muted-foreground text-center text-sm leading-relaxed mb-2">
              Continue the story, unlock premium episodes, and generate more stories shaped around you.
            </p>
            <p className="text-muted-foreground/70 text-center text-xs leading-relaxed mb-8">
              More stories. More continuations. More personalised listening.
            </p>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 text-background font-semibold px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity">
                <Sparkles className="w-4 h-4" />
                Start Free Trial
              </button>
              <button
                onClick={onClose}
                className="w-full px-6 py-3 rounded-full border border-border/60 text-muted-foreground text-sm hover:text-foreground hover:border-border transition-colors"
              >
                Get Story Credits
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
