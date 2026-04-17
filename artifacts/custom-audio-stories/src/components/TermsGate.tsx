import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { LogoFull } from "./Logo";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function TermsGate() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [needsAcceptance, setNeedsAcceptance] = useState(false);
  const [checking, setChecking] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || authLoading || fetched) return;
    setFetched(true);
    setChecking(true);
    fetch(`${API_BASE}/api/me`, { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && !data.termsAcceptedAt) setNeedsAcceptance(true);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [isAuthenticated, authLoading, fetched]);

  const handleYes = async () => {
    if (accepting) return;
    setAccepting(true);
    try {
      await fetch(`${API_BASE}/api/me/accept-terms`, {
        method: "PATCH",
        credentials: "include",
      });
    } catch {}
    setNeedsAcceptance(false);
  };

  if (!isAuthenticated || authLoading) return null;
  if (checking) return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-md" />
  );
  if (!needsAcceptance) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05, type: "spring", stiffness: 260, damping: 22 }}
          className="w-full max-w-sm rounded-3xl bg-background border border-border/40 p-8 shadow-2xl text-center"
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
                <h1 className="font-display text-2xl font-bold text-foreground mb-8">
                  Are you 18 or above?
                </h1>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeclined(true)}
                    className="flex-1 py-3.5 rounded-xl border border-border/40 text-muted-foreground font-semibold hover:bg-white/5 transition-all"
                  >
                    No
                  </button>
                  <button
                    onClick={handleYes}
                    disabled={accepting}
                    className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-60"
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
                <h1 className="font-display text-xl font-bold text-foreground">
                  This content is for adults only.
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
