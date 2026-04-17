import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoFull } from "./Logo";

const STORAGE_KEY = "tps_age_confirmed";

export function hasConfirmedAge(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function confirmAge(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore
  }
}

interface AgeGateProps {
  onConfirmed: () => void;
}

export function AgeGate({ onConfirmed }: AgeGateProps) {
  const [declined, setDeclined] = useState(false);

  const handleYes = () => {
    confirmAge();
    onConfirmed();
  };

  const handleNo = () => {
    setDeclined(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 260, damping: 22 }}
        className="max-w-sm w-full rounded-3xl bg-background border border-border/40 p-8 shadow-2xl text-center"
      >
        <LogoFull height={120} className="mx-auto mb-5" />

        <AnimatePresence mode="wait">
          {!declined ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <h1 className="font-display text-2xl font-bold text-foreground mb-3">
                Are you 18 or older?
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                The Private Story is an adult service. You must be 18 or over to enter.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleNo}
                  className="flex-1 py-3.5 rounded-xl border border-border/40 text-muted-foreground font-semibold hover:bg-white/5 transition-all"
                >
                  No
                </button>
                <button
                  onClick={handleYes}
                  className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
                >
                  Yes
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="declined"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
            >
              <h1 className="font-display text-xl font-bold text-foreground mb-3">
                This page isn't for you
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The Private Story is for adults only. We hope to welcome you when you're older.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
