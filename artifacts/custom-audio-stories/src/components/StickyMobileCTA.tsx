import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link } from "wouter";

interface StickyMobileCTAProps {
  priceDisplay: string;
}

/** Appears after scroll on mobile — keeps conversion path one thumb away. */
export function StickyMobileCTA({ priceDisplay }: StickyMobileCTAProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          <Link href="/after-dark" className="pointer-events-auto block">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-[0_0_32px_-6px_rgba(201,162,39,0.55)] active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4" />
              Create your erotica · from {priceDisplay}
            </button>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
