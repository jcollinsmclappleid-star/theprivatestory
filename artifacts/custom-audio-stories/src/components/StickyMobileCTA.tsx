import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { Link } from "wouter";

interface StickyMobileCTAProps {
  priceDisplay: string;
  /** Defaults to /after-dark */
  href?: string;
  /** If set, button scrolls instead of navigating */
  scrollToId?: string;
  label?: string;
  /** Direct action (e.g. checkout) — takes priority over scrollToId and href */
  onClick?: () => void;
  loading?: boolean;
  secondaryLabel?: string;
  onSecondaryClick?: () => void;
  /** Secondary link (e.g. try-one path) — shown below primary on mobile sticky bar */
  secondaryHref?: string;
}

/** Appears after scroll on mobile — keeps conversion path one thumb away. */
export function StickyMobileCTA({
  priceDisplay,
  href = "/after-dark",
  scrollToId,
  label,
  onClick,
  loading = false,
  secondaryLabel,
  onSecondaryClick,
  secondaryHref,
}: StickyMobileCTAProps) {
  const [visible, setVisible] = useState(false);
  const ctaLabel = label ?? `Create your fantasy · from ${priceDisplay}`;

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScroll = () => {
    if (!scrollToId) return;
    document.getElementById(scrollToId)?.scrollIntoView({ behavior: "smooth" });
  };

  const primaryClass =
    "pointer-events-auto w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-[0_0_32px_-6px_hsl(var(--primary)/0.55)] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed";

  const primaryContent = loading ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      One moment…
    </>
  ) : (
    <>
      <Sparkles className="w-4 h-4" />
      {ctaLabel}
    </>
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="md:hidden fixed bottom-0 inset-x-0 z-40 px-4 pb-4 pt-3 pointer-events-none"
          style={{
            background: "linear-gradient(0deg, rgba(10,9,8,0.97) 0%, rgba(10,9,8,0.88) 55%, transparent 100%)",
          }}
        >
          <div className="pointer-events-auto flex flex-col gap-2">
            {onClick ? (
              <button type="button" onClick={onClick} disabled={loading} className={primaryClass}>
                {primaryContent}
              </button>
            ) : scrollToId ? (
              <button type="button" onClick={handleScroll} className={primaryClass}>
                {primaryContent}
              </button>
            ) : (
              <Link href={href} className="block">
                <button type="button" className={primaryClass}>
                  {primaryContent}
                </button>
              </Link>
            )}
            {secondaryLabel && secondaryHref && (
              <Link href={secondaryHref} className="block text-center text-[11px] text-white/50 hover:text-primary transition-colors py-1">
                {secondaryLabel}
              </Link>
            )}
            {secondaryLabel && onSecondaryClick && !secondaryHref && (
              <button
                type="button"
                onClick={onSecondaryClick}
                className="text-center text-[11px] text-white/50 hover:text-primary transition-colors py-1 w-full"
              >
                {secondaryLabel}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
