import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "tps_cookie_consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __tpsOpenCookieBanner?: () => void;
  }
}

type Choice = "granted" | "denied" | null;

function readChoice(): Choice {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "granted" || v === "denied") return v;
  } catch {
    /* localStorage may be blocked */
  }
  return null;
}

function writeChoice(c: Exclude<Choice, null>) {
  try { localStorage.setItem(STORAGE_KEY, c); } catch { /* ignore */ }
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: c === "granted" ? "granted" : "denied",
    });
  }
}

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (readChoice() === null) {
      const t = window.setTimeout(() => setOpen(true), 800);
      return () => window.clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    window.__tpsOpenCookieBanner = () => setOpen(true);
    return () => { delete window.__tpsOpenCookieBanner; };
  }, []);

  const accept = useCallback(() => { writeChoice("granted"); setOpen(false); }, []);
  const decline = useCallback(() => { writeChoice("denied"); setOpen(false); }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-[9999] p-3 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-xl rounded-xl border border-border/50 bg-background/95 backdrop-blur-md shadow-xl shadow-black/30">
        <div className="p-3 flex items-center gap-2.5">
          <Cookie className="w-3.5 h-3.5 text-primary flex-shrink-0" aria-hidden />
          <p className="flex-1 text-[11px] text-muted-foreground leading-snug min-w-0">
            Essential cookies keep you signed in. We'd also like to use Analytics to improve the site.{" "}
            <Link href="/cookie-policy" className="text-primary hover:underline">Policy</Link>
            {" · "}
            <Link href="/privacy-policy" className="text-primary hover:underline">Privacy</Link>
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={accept}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 transition-colors"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={decline}
              className="px-3 py-1.5 rounded-lg border border-border text-foreground/70 text-[11px] font-medium hover:bg-foreground/5 transition-colors"
            >
              Essential only
            </button>
            <button
              type="button"
              aria-label="Close — keep essential cookies only"
              onClick={decline}
              className="p-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              <X className="w-3.5 h-3.5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;
