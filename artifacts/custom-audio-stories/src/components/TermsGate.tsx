import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function TermsGate() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [needsAcceptance, setNeedsAcceptance] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || authLoading || fetched) return;
    setFetched(true);
    setChecking(true);
    fetch(`${API_BASE}/api/me`, { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && !data.termsAcceptedAt) {
          setNeedsAcceptance(true);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [isAuthenticated, authLoading, fetched]);

  const handleAccept = async () => {
    if (!checked || accepting) return;
    setAccepting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/me/accept-terms`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setNeedsAcceptance(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setAccepting(false);
    }
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
        className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-md px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md glass-panel rounded-3xl p-8 border border-border/30 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Before you begin</h2>
              <p className="text-xs text-muted-foreground">A moment of your time, just once.</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Private Story is designed for adults aged 18 and over. By continuing, you confirm that you are 18 or older and agree to our terms of service and content policy.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your stories are private to your account. We don't share them, and we never will.
            </p>
          </div>

          <div className="flex gap-3 items-start mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                id="terms-confirm"
                checked={checked}
                onChange={e => setChecked(e.target.checked)}
                className="w-4 h-4 rounded border border-primary/30 accent-primary cursor-pointer"
              />
            </div>
            <label htmlFor="terms-confirm" className="text-sm text-foreground/80 leading-relaxed cursor-pointer">
              I confirm I am 18 or older and agree to The Private Story{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                Terms of Service <ExternalLink className="w-3 h-3" />
              </a>
              {" "}and{" "}
              <a href="/content-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                Content Policy <ExternalLink className="w-3 h-3" />
              </a>
              .
            </label>
          </div>

          {error && (
            <p className="text-xs text-destructive mb-4">{error}</p>
          )}

          <button
            onClick={handleAccept}
            disabled={!checked || accepting}
            className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {accepting ? "Saving…" : "Continue to The Private Story"}
          </button>

          <p className="text-[11px] text-muted-foreground/50 text-center mt-4 leading-relaxed">
            You'll only see this once. Questions?{" "}
            <a href="mailto:support@theprivatestory.com" className="hover:text-primary transition-colors">
              support@theprivatestory.com
            </a>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
