import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useSearch } from "wouter";
import {
  Sparkles, Shield, Lock, Headphones,
  ChevronDown, Check, ChevronRight,
  EyeOff, Loader2, CheckCircle2, AlertCircle,
  Sliders, Flame, Trash2, Timer, Star, X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePricing } from "@/hooks/usePricing";
import { TrustBar, CountryStrip } from "@/components/TrustBar";
import { PricingHero } from "@/components/PricingHero";
import { PricingSampleTeaser } from "@/components/PricingSampleTeaser";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { hiwAct4Src } from "@/components/HowItWorksHero";
import { readHomeBrief } from "@/lib/afterDarkExpress";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const SECTION_LABEL = "text-[10px] font-bold uppercase tracking-[0.28em] text-primary/90 mb-2";
const PANEL = "rounded-3xl border border-white/10 bg-[#0c0a10]";

const TRUST_CHIPS = [
  { icon: <Sliders className="w-3.5 h-3.5" />, label: "Your cast & chemistry" },
  { icon: <Headphones className="w-3.5 h-3.5" />, label: "Full-cast narration" },
  { icon: <EyeOff className="w-3.5 h-3.5" />, label: "Only you hear it" },
  { icon: <Flame className="w-3.5 h-3.5" />, label: "Your explicit dial" },
  { icon: <Lock className="w-3.5 h-3.5" />, label: "Billed discreetly" },
  { icon: <Timer className="w-3.5 h-3.5" />, label: "Yours in under 3 minutes" },
];

const PACK20_FEATURES = [
  "Twenty private stories — each ~10 minutes of full-cast audio",
  "Every mood, pairing & scenario you can imagine",
  "Written around your cast, chemistry & desires",
  "Explicit dial on every story — intimate to unrestrained",
  "Original cover art · private library · never shared",
];

const PACK5_FEATURES = [
  "Five private stories to explore different fantasies",
  "Different pairings, moods & scenarios each time",
  "Full-cast narration on every story",
  "Your explicit dial on each — your depth, your call",
  "Original cover art · private library",
];

const PACK1_FEATURES = [
  "One fully narrated story (~10 min), private to you",
  "Written around your cast, tags & scenario",
  "Full-cast narration with your chosen narrator",
  "Intensity from intimate to explicitly unrestrained",
  "One-time purchase — no subscription",
];

const LIBRARY_VS = {
  them: [
    "Pick from a catalogue someone else curated",
    "Hope the cast and chemistry feel close enough",
    "Same story thousands of others have heard",
    "Intensity fixed — take it or leave it",
  ],
  us: [
    "Each story built from your choices alone",
    "Your cast, your chemistry, your pronouns",
    "Original fiction — never replicated",
    "Explicit dial from intimate to unrestrained",
  ],
};

type PackKey = "pack_1" | "pack_5" | "pack_20";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What do I get per story?",
    a: "Each story is a fully personalised, narrated audio experience — approximately ten minutes — written around your cast, chemistry, tags, and how explicit you want it. Original cover art and private library storage are included with every pack.",
  },
  {
    q: "How explicit can my story be?",
    a: "You set the dial when you create your fantasy — from slow burn and romantic to warm, elevated, or explicitly unrestrained. There is no separate tier or extra charge. Every pack includes the full range.",
  },
  {
    q: "Are my stories private?",
    a: "Completely. Your stories are saved only to your account and are not visible to anyone else — including us. You can delete them at any time.",
  },
  {
    q: "Do credits expire?",
    a: "No. Use them whenever you like — there is no schedule and no subscription pressure.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/8 last:border-0" onClick={() => setOpen(!open)}>
      <button type="button" className="w-full flex items-center justify-between gap-4 py-5 text-left group cursor-pointer">
        <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors leading-snug">{q}</span>
        <span className="flex-shrink-0 text-primary/80 group-hover:text-primary transition-colors">
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && <p className="text-sm text-white/60 leading-relaxed pb-5 pr-8">{a}</p>}
    </div>
  );
}

function hasWarmTraffic(): boolean {
  try {
    if (sessionStorage.getItem("afterDarkCheckoutState")) return true;
    const prs = sessionStorage.getItem("paywallReturnState");
    if (prs) {
      const p = (JSON.parse(prs) as { returnPath?: string }).returnPath;
      if (p?.includes("after-dark")) return true;
    }
    const brief = readHomeBrief();
    if (brief && Object.values(brief).some(Boolean)) return true;
  } catch { /* ignore */ }
  return false;
}

function PackFeatureList({ items, compact = false }: { items: string[]; compact?: boolean }) {
  return (
    <div className={`${compact ? "mb-4 space-y-2" : "mb-6 space-y-2.5"}`}>
      {items.map((text) => (
        <div key={text} className="flex items-start gap-2.5">
          <div className="w-4 h-4 rounded-full border border-primary/60 bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="w-2.5 h-2.5 text-primary" />
          </div>
          <span className="text-sm leading-snug text-white/85">{text}</span>
        </div>
      ))}
    </div>
  );
}

function CheckoutSpinner() {
  return (
    <span className="flex items-center justify-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      One moment…
    </span>
  );
}

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const { pack1, pack5, pack20, currency } = usePricing();
  const search = useSearch();
  const checkoutResult = new URLSearchParams(search).get("checkout");
  const [loadingPlan, setLoadingPlan] = useState<PackKey | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const pendingCheckoutRef = useRef<string | null>(null);
  const [warmTraffic, setWarmTraffic] = useState(false);

  useEffect(() => {
    setWarmTraffic(hasWarmTraffic());
  }, []);

  const pack20Features = useMemo(
    () => [...PACK20_FEATURES, `${pack20.perStoryDisplay} per story — most chosen by listeners`],
    [pack20.perStoryDisplay],
  );

  const scrollToPacks = useCallback(() => {
    document.getElementById("pricing-cards")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToPack1 = useCallback(() => {
    document.getElementById("pack-1")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const doCheckout = async (plan: PackKey) => {
    setLoadingPlan(plan);
    setCheckoutError(null);
    try {
      const res = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          currency,
          returnPath: (() => {
            try {
              const s = sessionStorage.getItem("paywallReturnState");
              if (s) {
                const p = (JSON.parse(s) as { returnPath?: string }).returnPath;
                if (p) return p;
              }
              if (sessionStorage.getItem("afterDarkCheckoutState")) return "/after-dark";
            } catch { /* ignore */ }
            return "/after-dark";
          })(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setCheckoutError(data.error ?? "Could not start checkout. Please try again.");
      } else {
        window.location.href = data.url;
      }
    } catch {
      setCheckoutError("Network error — please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const pending = pendingCheckoutRef.current ?? (() => {
      try { return sessionStorage.getItem("pendingPricingCheckout"); } catch { return null; }
    })();
    if (pending && ["pack_1", "pack_5", "pack_20"].includes(pending)) {
      pendingCheckoutRef.current = null;
      try { sessionStorage.removeItem("pendingPricingCheckout"); } catch { /* ignore */ }
      doCheckout(pending as PackKey);
    }
  }, [isAuthenticated]);

  const startCheckout = (plan: PackKey) => {
    doCheckout(plan);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col bg-background">

      <PricingHero warmTraffic={warmTraffic} onScrollToPacks={scrollToPacks} />

      {(checkoutResult === "success" || checkoutError) && (
        <section className="px-4 md:px-8 max-w-3xl mx-auto w-full -mt-2 relative z-20">
          {checkoutResult === "success" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">Your stories are ready. Continue creating yours.</span>
              <Link
                href="/after-dark"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/40 text-green-300 text-xs font-bold hover:bg-green-500/30 transition-colors"
              >
                Create your fantasy
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          )}
          {checkoutError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-3 px-5 py-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{checkoutError}</span>
            </motion.div>
          )}
        </section>
      )}

      {warmTraffic && checkoutResult !== "success" && (
        <section className="px-4 md:px-8 max-w-3xl mx-auto w-full py-3">
          <div className={`${PANEL} border-primary/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4`}>
            <div className="flex-1">
              <p className={SECTION_LABEL}>Your story is waiting</p>
              <p className="text-sm text-white/90 font-medium">Choose a collection below to hear it narrated — private to you alone.</p>
            </div>
            <button
              type="button"
              onClick={() => startCheckout("pack_20")}
              disabled={loadingPlan !== null}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all flex-shrink-0 disabled:opacity-60"
            >
              {loadingPlan === "pack_20" ? <CheckoutSpinner /> : "Create 20 stories"}
            </button>
          </div>
        </section>
      )}

      {/* Pricing cards — first conversion section after hero */}
      <section id="pricing-cards" className="py-8 md:py-14 px-4 md:px-8 max-w-5xl mx-auto w-full scroll-mt-16">
        <div className="text-center mb-8 md:mb-10">
          <p className={SECTION_LABEL}>Pay once · stories never expire</p>
          <h2 className="font-display text-2xl md:text-4xl font-bold text-white leading-tight">
            Choose your
            <span className="text-primary"> private collection.</span>
          </h2>
          <p className="text-white/60 text-sm mt-3 max-w-xl mx-auto">
            One-time purchase. Every pack includes the full explicit dial — no subscription, no upsell tier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-start">

          {/* pack_20 — anchor tier, first on mobile */}
          <div
            id="pack-20"
            className={`relative overflow-hidden ${PANEL} p-6 md:p-7 border-primary/35 shadow-[0_0_60px_-15px_rgba(201,162,39,0.25)] md:-mt-2 md:mb-2 order-1 md:order-2`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-[#0c0a10]/80 pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="text-xs font-bold uppercase tracking-widest text-white/55">Your private collection</p>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/35 text-primary text-[10px] font-bold tracking-wider uppercase">
                  <Star className="w-2.5 h-2.5" /> Most chosen
                </span>
              </div>
              <p className="text-[10px] text-primary/80 font-semibold uppercase tracking-wider mb-2">20 stories</p>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="font-display text-4xl md:text-5xl font-bold text-white tabular-nums">{pack20.display}</span>
              </div>
              <p className="text-xs text-primary/75 mb-5 font-medium">{pack20.perStoryDisplay} per story · indulge every mood</p>
              <PackFeatureList items={pack20Features} />
              <button
                type="button"
                onClick={() => startCheckout("pack_20")}
                disabled={loadingPlan !== null}
                className="block w-full text-center py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all hover:shadow-[0_0_32px_rgba(201,162,39,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingPlan === "pack_20" ? <CheckoutSpinner /> : "Create 20 stories"}
              </button>
              <p className="text-center text-[10px] text-white/45 mt-3">Twenty nights. Twenty fantasies. Yours alone.</p>
            </div>
          </div>

          {/* pack_5 — middle tier */}
          <div className={`relative overflow-hidden ${PANEL} p-6 md:p-7 border-white/15 order-2 md:order-1`}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Explore five moods</p>
              <p className="text-[10px] text-white/45 font-semibold uppercase tracking-wider mb-2">5 stories</p>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="font-display text-4xl md:text-5xl font-bold text-white tabular-nums">{pack5.display}</span>
              </div>
              <p className="text-xs text-white/55 mb-5">{pack5.perStoryDisplay} per story · room to experiment</p>
              <PackFeatureList items={PACK5_FEATURES} />
              <button
                type="button"
                onClick={() => startCheckout("pack_5")}
                disabled={loadingPlan !== null}
                className="block w-full text-center py-3 rounded-full border border-primary/45 bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingPlan === "pack_5" ? <CheckoutSpinner /> : "Create 5 stories"}
              </button>
            </div>
          </div>

          {/* pack_1 — demoted */}
          <div id="pack-1" className={`relative overflow-hidden ${PANEL} p-5 md:p-6 border-white/8 opacity-95 order-3 md:order-3`}>
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Just one story?</p>
              <p className="text-[10px] text-white/35 font-semibold uppercase tracking-wider mb-2">1 story</p>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="font-display text-3xl md:text-4xl font-bold text-white/90 tabular-nums">{pack1.display}</span>
              </div>
              <p className="text-xs text-white/45 mb-4">Yours alone · no subscription</p>
              <PackFeatureList items={PACK1_FEATURES} compact />
              <button
                type="button"
                onClick={() => startCheckout("pack_1")}
                disabled={loadingPlan !== null}
                className="block w-full text-center py-2.5 rounded-full border border-white/20 bg-white/[0.03] text-white/80 font-semibold text-sm hover:border-primary/35 hover:text-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingPlan === "pack_1" ? <CheckoutSpinner /> : "Create one story"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
          <span className="text-xs text-white/50">Stories never expire · one-time purchase · <Link href="/terms" className="underline underline-offset-2 hover:text-white/70">terms</Link></span>
        </div>
      </section>

      {/* Compact trust chips — horizontal scroll on mobile */}
      <section className="pb-6 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1 -mx-1 px-1">
          {TRUST_CHIPS.map((chip) => (
            <div
              key={chip.label}
              className="flex-shrink-0 snap-start inline-flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 bg-white/[0.03] text-[11px] text-white/70 whitespace-nowrap"
            >
              <span className="text-primary">{chip.icon}</span>
              {chip.label}
            </div>
          ))}
        </div>
      </section>

      <section className="py-2 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <PricingSampleTeaser />
      </section>

      <section className="py-8 md:py-10 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className={`relative overflow-hidden ${PANEL} border-primary/20`}>
          <div className="absolute inset-0 opacity-30 pointer-events-none" aria-hidden>
            <img src={hiwAct4Src("yours")} alt="" className="absolute inset-0 w-full h-full object-cover object-[70%_20%]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a10] via-[#0c0a10]/92 to-[#0c0a10]/75" />
          </div>
          <div className="relative px-5 py-7 md:px-10 md:py-10">
            <div className="text-center mb-6 md:mb-8 max-w-lg mx-auto">
              <p className={SECTION_LABEL}>Not a catalogue</p>
              <h2 className="font-display text-xl md:text-3xl font-bold text-white">
                Generic heat vs. <span className="text-primary">your exact fantasy</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-3xl mx-auto rounded-2xl overflow-hidden border border-white/10">
              <div className="p-5 md:p-6 md:border-r border-white/10 bg-black/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Streaming catalogues</p>
                <div className="space-y-2.5">
                  {LIBRARY_VS.them.map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <X className="w-3.5 h-3.5 text-white/25 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white/35 line-through leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 md:p-6 bg-primary/[0.08]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80 mb-3">The Private Story</p>
                <div className="space-y-2.5">
                  {LIBRARY_VS.us.map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary" />
                      <span className="text-sm text-white/90 font-medium leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className={`relative overflow-hidden ${PANEL} p-6 md:p-10`}>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className={SECTION_LABEL}>Privacy by design</p>
              <h2 className="font-display text-xl md:text-2xl font-bold text-white mb-4 leading-tight">
                Your fantasies belong to <span className="text-primary">no one else.</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                {[
                  { heading: "No social layer", body: "No feeds. No discovery. Nothing to share." },
                  { heading: "Not visible to us", body: "Your library is yours alone." },
                  { heading: "Billed discreetly", body: "Neutral descriptor on your statement." },
                  { heading: "Delete any time", body: "Remove any story permanently." },
                ].map((item) => (
                  <div key={item.heading} className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
                    <p className="text-sm font-semibold text-white/90 mb-0.5">{item.heading}</p>
                    <p className="text-xs text-white/55 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
              <Link href="/privacy" className="text-xs text-primary/80 hover:text-primary transition-colors">
                Privacy policy →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-4 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <CountryStrip />
      </section>

      <TrustBar />

      <section className="py-10 px-4 md:px-8 max-w-2xl mx-auto w-full">
        <div className="text-center mb-6">
          <p className={SECTION_LABEL}>Questions</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white">Answered quietly.</h2>
        </div>
        <div className={`${PANEL} px-5 md:px-6 border-white/8`}>
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} {...faq} />
          ))}
        </div>
      </section>

      <section className="py-14 px-4 md:px-8 max-w-3xl mx-auto w-full text-center">
        <p className={SECTION_LABEL}>Ready when you are</p>
        <h2 className="font-display text-2xl md:text-4xl font-bold text-white leading-tight mb-3">
          Your collection.
          <span className="text-primary"> Your heat. Your rules.</span>
        </h2>
        <p className="text-sm text-white/60 mb-8 max-w-md mx-auto">
          Most listeners start with twenty — room for every mood you haven&apos;t imagined yet.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => startCheckout("pack_20")}
            disabled={loadingPlan !== null}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-[0_0_32px_-8px_rgba(201,162,39,0.5)] disabled:opacity-60 w-full sm:w-auto"
          >
            {loadingPlan === "pack_20" ? <CheckoutSpinner /> : (
              <>
                <Sparkles className="w-4 h-4" />
                Create 20 stories · {pack20.display}
              </>
            )}
          </button>
          <Link
            href="/after-dark"
            className="inline-flex items-center justify-center gap-1.5 text-xs text-white/70 hover:text-primary transition-colors uppercase tracking-widest py-2"
          >
            Create your fantasy first →
          </Link>
        </div>
      </section>

      <StickyMobileCTA
        priceDisplay={pack20.display}
        label={warmTraffic ? `Unlock your story · ${pack20.display}` : `Create 20 stories · ${pack20.display}`}
        onClick={() => startCheckout("pack_20")}
        loading={loadingPlan === "pack_20"}
        secondaryLabel="Just one story"
        onSecondaryClick={scrollToPack1}
      />
    </motion.div>
  );
}
