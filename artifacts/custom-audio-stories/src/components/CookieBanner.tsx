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
      className="fixed inset-x-0 bottom-0 z-[9999] p-3 sm:p-4 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-border/60 bg-background/95 backdrop-blur-md shadow-2xl shadow-black/40">
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Cookie className="w-4 h-4 text-primary" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-sm font-semibold mb-1">Cookies on The Private Story</h2>
              <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                We use strictly necessary cookies to keep you signed in and to process payments. With your permission, we'd also like to use Google Analytics to understand which pages people use most so we can improve them. You can change your mind at any time from the footer.{" "}
                <Link href="/cookie-policy" className="text-primary hover:underline">Cookie policy</Link>
                {" · "}
                <Link href="/privacy-policy" className="text-primary hover:underline">Privacy</Link>
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={accept}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  Accept all
                </button>
                <button
                  type="button"
                  onClick={decline}
                  className="px-4 py-2 rounded-xl border border-border text-foreground/80 text-xs font-medium hover:bg-foreground/5 transition-colors"
                >
                  Essential only
                </button>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close — keep essential cookies only"
              onClick={decline}
              className="flex-shrink-0 -m-1 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              <X className="w-4 h-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;
