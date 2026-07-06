import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Lock, ChevronRight, Flame, Star, Check } from "lucide-react";
import type { StoryRevealContent } from "@/lib/storyReveal";
import { buildPackSavingsCopy } from "@/lib/packSavings";

type PackPricing = {
  display: string;
  perStoryDisplay: string;
  amount: number;
  stories: number;
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
  /** Server-side admin — can generate without pack credits (matches API bypass). */
  isAdmin?: boolean;
  onCheckout: (plan: "pack_1" | "pack_5" | "pack_20") => void;
  onWriteWithCredit: () => void;
  onStartOver: () => void;
  /** Local dev — skip paywall and continue the funnel */
  onDevBypass?: () => void;
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
  isAdmin = false,
  onCheckout,
  onWriteWithCredit,
  onStartOver,
  onDevBypass,
}: StoryRevealPaywallProps) {
  const heroSrc = coverUrl ?? fallbackCoverUrl;
  const hasGeneratedCover = !!coverUrl;
  const sym = currency === "gbp" ? "£" : "$";

  const savings = useMemo(
    () => buildPackSavingsCopy(pack1, pack5, pack20, currency),
    [pack1, pack5, pack20, currency],
  );

  const savePctVsSingles = useMemo(() => {
    const baseline = pack1.amount * 20;
    if (baseline <= 0) return 0;
    return Math.round(((baseline - pack20.amount) / baseline) * 100);
  }, [pack1.amount, pack20.amount]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const content = (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-[#050203]">
      <div className="absolute inset-0">
        <motion.img
          key={heroSrc}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: hasGeneratedCover ? 0.55 : 0.38, scale: 1 }}
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
            background: `radial-gradient(ellipse at 50% 20%, ${accentHex}28 0%, transparent 50%), linear-gradient(0deg, #050203 0%, #050203ee 28%, #050203dd 55%, #050203f0 100%)`,
          }}
        />
      </div>

      <div className="absolute inset-0 overflow-y-auto overscroll-contain">
        <div
          className="relative z-10 w-full max-w-lg mx-auto px-4 flex flex-col gap-6 pb-[max(4rem,env(safe-area-inset-bottom))]"
          style={{
            paddingTop: "max(1.5rem, env(safe-area-inset-top))",
            minHeight: "100%",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2 pt-2"
          >
            {onDevBypass && (
              <button
                type="button"
                onClick={onDevBypass}
                className="mb-2 w-full px-4 py-3 rounded-xl text-sm font-bold border border-amber-400/50 bg-amber-400/15 text-amber-200 hover:bg-amber-400/25 transition-colors"
              >
                Local preview — skip to story generation →
              </button>
            )}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-black/40 backdrop-blur-sm">
              <Flame className="w-3 h-3" style={{ color: accentHex }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/90">
                Your story is nearly done
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-lg">
              Unlock your <span style={{ color: accentHex }}>private library</span>
            </h2>
            <p className="text-sm text-white/75 max-w-md mx-auto leading-relaxed">
              You built this fantasy from scratch. Most listeners keep exploring — different pairings, moods, and situations — with a story collection.
            </p>
            <div className="mt-3 mx-auto max-w-md rounded-xl border border-white/12 bg-black/45 px-4 py-3 text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50 mb-2">
                What happens next
              </p>
              <ol className="text-xs text-white/75 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>Choose your library size — credits never expire</li>
                <li>Your story generates in ~3 minutes, full-cast narration</li>
                <li>Listen privately, then build the next fantasy whenever you want</li>
              </ol>
            </div>
          </motion.div>

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

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="space-y-3"
          >
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary/90 mb-1">
                One-time · yours forever
              </p>
              <p className="text-sm text-white/70 leading-snug">
                No subscription. Credits never expire. Every story built around your cast.
              </p>
            </div>

            {checkoutError && (
              <p className="text-xs text-red-400 text-center">{checkoutError}</p>
            )}

            {!creditsLoading && storyCredits != null && (storyCredits > 0 || isAdmin) && (
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
                  {storyCredits > 0
                    ? `Write my story now — ${storyCredits} credit${storyCredits === 1 ? "" : "s"} left`
                    : "Generate my story now"}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* ── Recommended: 20-story collection ── */}
            <button
              type="button"
              disabled={!!loadingPlan}
              onClick={() => onCheckout("pack_20")}
              className="w-full rounded-2xl p-4 sm:p-5 text-left relative overflow-hidden transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #c0392b 0%, #7b241c 55%, #4a0e0e 100%)",
                boxShadow: "0 0 40px rgba(192,57,43,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/35 border border-white/20 text-white text-[9px] font-bold uppercase tracking-wider">
                  <Star className="w-3 h-3 fill-current" />
                  Recommended
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/15 text-white text-[9px] font-bold uppercase tracking-wider">
                  Save {savePctVsSingles}%
                </span>
              </div>
              <p className="text-white font-bold text-lg pr-4">Immersive Collection — 20 stories</p>
              <p className="text-white/95 text-sm mt-1 font-semibold">
                {pack20.display} once · {pack20.perStoryDisplay} per story
              </p>
              <p className="text-white/75 text-xs mt-2 leading-relaxed">
                Save <span className="text-white font-semibold">{savings.collectionSaveVsSingles}</span> vs buying
                one at a time ({savings.collectionSinglesTotal}).
                {savings.collectionSaveVsFivePacks && (
                  <> Or <span className="text-white font-semibold">{savings.collectionSaveVsFivePacks}</span> less than four 5-packs.</>
                )}
              </p>
              <ul className="mt-3 space-y-1">
                {[
                  "Twenty nights, twenty fantasies — pairings, heat, situations",
                  savings.collectionPerStoryVsSingle,
                  `About ${sym}${Math.ceil(pack20.amount / 100 / 5)}/month if you enjoy one a week`,
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2 text-[11px] text-white/80">
                    <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-white/90" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              {loadingPlan === "pack_20" && (
                <Loader2 className="absolute right-4 top-5 w-5 h-5 animate-spin text-white/70" />
              )}
            </button>

            {/* ── Fallback: 5-story bundle ── */}
            <button
              type="button"
              disabled={!!loadingPlan}
              onClick={() => onCheckout("pack_5")}
              className="w-full rounded-2xl p-4 text-left relative border transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{ borderColor: `${accentHex}44`, background: "rgba(255,255,255,0.04)" }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">
                Start smaller
              </p>
              <p className="text-white font-bold text-base">Story Bundle — 5 stories</p>
              <p className="text-white/80 text-sm mt-0.5">
                {pack5.display} once · {pack5.perStoryDisplay} each
              </p>
              <p className="text-white/55 text-xs mt-1.5">
                Save {savings.bundleSaveVsSingles} vs five singles ({savings.bundleSinglesTotal}). Room to experiment — upgrade anytime.
              </p>
              {loadingPlan === "pack_5" && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-white/60" />
              )}
            </button>

            <p className="text-center text-[10px] text-white/40 leading-snug px-2">
              Single-story purchase available on our{" "}
              <a href="/pricing" className="underline underline-offset-2 hover:text-white/60">
                pricing page
              </a>{" "}
              — most listeners choose the collection for the per-story savings.
            </p>
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

  return createPortal(content, document.body);
}
