import { motion } from "framer-motion";
import { Loader2, Sparkles, Lock, ChevronRight, Flame } from "lucide-react";
import type { StoryRevealContent } from "@/lib/storyReveal";

type PackPricing = {
  display: string;
  perStoryDisplay: string;
  amount: number;
};

interface StoryRevealPaywallProps {
  reveal: StoryRevealContent;
  coverUrl: string | null;
  fallbackCoverUrl: string;
  coverLoading: boolean;
  accentHex: string;
  darknessLabel?: string;
  pack1: PackPricing;
  pack5: PackPricing;
  pack20: PackPricing;
  currency: string;
  checkoutError: string | null;
  loadingPlan: string | null;
  storyCredits: number | null;
  creditsLoading: boolean;
  onCheckout: (plan: "pack_1" | "pack_5" | "pack_20") => void;
  onWriteWithCredit: () => void;
  onStartOver: () => void;
}

export function StoryRevealPaywall({
  reveal,
  coverUrl,
  fallbackCoverUrl,
  coverLoading,
  accentHex,
  darknessLabel,
  pack1,
  pack5,
  pack20,
  currency,
  checkoutError,
  loadingPlan,
  storyCredits,
  creditsLoading,
  onCheckout,
  onWriteWithCredit,
  onStartOver,
}: StoryRevealPaywallProps) {
  const heroSrc = coverUrl ?? fallbackCoverUrl;
  const hasGeneratedCover = !!coverUrl;
  const sym = currency === "gbp" ? "£" : "$";

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      {/* Full-bleed cover — the arousal peak */}
      <div className="absolute inset-0">
        <motion.img
          key={heroSrc}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: hasGeneratedCover ? 0.72 : 0.48, scale: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          src={heroSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackCoverUrl;
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 20%, ${accentHex}33 0%, transparent 50%), linear-gradient(0deg, #050203 0%, rgba(5,2,3,0.55) 35%, rgba(5,2,3,0.25) 65%, rgba(5,2,3,0.5) 100%)`,
          }}
        />
      </div>

      <div className="absolute inset-0 overflow-y-auto">
        <div className="relative z-10 w-full max-w-lg mx-auto px-4 py-8 md:py-10 pb-16 flex flex-col gap-6">

          {/* Progress + hook */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-black/40 backdrop-blur-sm">
              <Flame className="w-3 h-3" style={{ color: accentHex }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/90">
                Your story is nearly done
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-lg">
              We built this from{" "}
              <span style={{ color: accentHex }}>your choices</span>
            </h2>
            <p className="text-sm text-white/75 max-w-md mx-auto leading-relaxed">
              Cover art {coverLoading && !coverUrl ? "is rendering" : "is ready"} — unlock your private library to hear it narrated.
            </p>
          </motion.div>

          {/* Story card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-2xl overflow-hidden border backdrop-blur-md"
            style={{
              borderColor: `${accentHex}44`,
              boxShadow: `0 0 48px -12px ${accentHex}66, 0 24px 60px -24px rgba(0,0,0,0.8)`,
              background: "rgba(8,4,6,0.75)",
            }}
          >
            <div className="relative h-52 sm:h-56 overflow-hidden">
              <img
                src={heroSrc}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover object-[center_20%]"
                style={{ opacity: 0.95 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              {coverLoading && !coverUrl && (
                <div className="absolute top-3 right-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/50 border border-white/10">
                  <Loader2 className="w-3 h-3 animate-spin text-white/70" />
                  <span className="text-[9px] uppercase tracking-wider text-white/60">Creating your cover</span>
                </div>
              )}
              {hasGeneratedCover && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/50 border border-white/15">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/80">Made for you</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.22em]"
                    style={{ color: accentHex }}
                  >
                    {reveal.roomLabel}
                  </span>
                  {darknessLabel && (
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/20 text-white/75">
                      {darknessLabel}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-white leading-tight">
                  {reveal.title}
                </h3>
              </div>
            </div>

            <div className="px-4 py-4 border-t border-white/8">
              <p className="font-display italic text-sm md:text-base text-white/90 leading-relaxed line-clamp-3">
                &ldquo;{reveal.snippet}&rdquo;
              </p>
            </div>

            {/* Visible erotic choices — proof of personalization */}
            <div className="px-4 pb-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/45 mb-2">
                Cast from your selections
              </p>
              <div className="flex flex-wrap gap-1.5">
                {reveal.choices.map((c) => (
                  <span
                    key={`${c.label}-${c.value}`}
                    className="inline-flex flex-col px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.04]"
                  >
                    <span className="text-[8px] font-bold uppercase tracking-wider text-white/45">{c.label}</span>
                    <span className="text-[11px] font-semibold text-white/95 leading-tight" style={{ color: c.accent }}>
                      {c.value}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Library / packs — not single-story framing */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="space-y-3"
          >
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary/90 mb-1">
                Your private story library
              </p>
              <p className="text-sm text-white/70 leading-snug">
                One-time packs · credits never expire · each story built around your cast
              </p>
            </div>

            {checkoutError && (
              <p className="text-xs text-red-400 text-center">{checkoutError}</p>
            )}

            {!creditsLoading && storyCredits != null && storyCredits > 0 && (
              <button
                type="button"
                onClick={onWriteWithCredit}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: `linear-gradient(135deg, ${accentHex}, ${accentHex}cc)`,
                  color: "#0a0806",
                  boxShadow: `0 0 32px ${accentHex}55`,
                }}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Write my story now — {storyCredits} credit{storyCredits === 1 ? "" : "s"} left
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              disabled={!!loadingPlan}
              onClick={() => onCheckout("pack_20")}
              className="w-full rounded-2xl p-4 text-left relative overflow-hidden transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #c0392b, #7b241c)",
                boxShadow: "0 0 32px rgba(192,57,43,0.4)",
              }}
            >
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/30 text-white text-[9px] font-bold uppercase tracking-wider">
                Most stories · best value
              </span>
              <p className="text-white font-bold text-base pr-20">Immersive Library — 20 stories</p>
              <p className="text-white/90 text-sm mt-0.5">{pack20.display} once · {pack20.perStoryDisplay} each</p>
              <p className="text-white/60 text-[11px] mt-1">
                Under {sym}{Math.ceil(pack20.amount / 100 / 10)}/month if you listen weekly
              </p>
              {loadingPlan === "pack_20" && (
                <Loader2 className="absolute right-4 bottom-4 w-4 h-4 animate-spin text-white/70" />
              )}
            </button>

            <button
              type="button"
              disabled={!!loadingPlan}
              onClick={() => onCheckout("pack_5")}
              className="w-full rounded-2xl p-4 text-left relative border transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{ borderColor: `${accentHex}55`, background: `${accentHex}12` }}
            >
              <p className="text-white font-bold text-base">Story Bundle — 5 stories</p>
              <p className="text-white/75 text-sm mt-0.5">{pack5.display} once · {pack5.perStoryDisplay} each</p>
              {loadingPlan === "pack_5" && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />
              )}
            </button>

            <button
              type="button"
              disabled={!!loadingPlan}
              onClick={() => onCheckout("pack_1")}
              className="w-full px-4 py-3 rounded-xl text-sm text-white/65 hover:text-white/85 border border-white/12 flex items-center justify-center gap-2 transition-colors"
            >
              Start with 1 story — {pack1.display}
              {loadingPlan === "pack_1" && <Loader2 className="w-3 h-3 animate-spin" />}
            </button>
          </motion.div>

          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-[11px] text-white/50 flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Billed discreetly · Private to your account · Full cast narration
            </p>
            <button
              type="button"
              onClick={onStartOver}
              className="text-xs text-white/40 hover:text-white/60 underline underline-offset-2"
            >
              Change my choices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
