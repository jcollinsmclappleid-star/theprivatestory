import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useSearch } from "wouter";
import {
  Sparkles, Shield, Lock, Headphones, BookOpen,
  ChevronDown, Check, Moon,
  EyeOff, Bookmark, Loader2, CheckCircle2, AlertCircle,
  Users, Sliders, Flame, Trash2, Timer, Star,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePricing } from "@/hooks/usePricing";
import { TrustBar, CountryStrip } from "@/components/TrustBar";
import { VoiceShowcase } from "@/components/VoiceShowcase";
import { PersonalisedEroticaDoor } from "@/components/ThreeDoors";

const BASE = import.meta.env.BASE_URL;
const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const REASSURANCE = [
  { icon: <Sliders className="w-4 h-4" />, label: "Fully cast by you", sub: "Character, energy, chemistry, setting — every detail yours before a word is written" },
  { icon: <Headphones className="w-4 h-4" />, label: "Full cast narration", sub: "Three distinct voices — narrator, her voice, his voice — matched to your pairing. Not one reader. A full cast." },
  { icon: <EyeOff className="w-4 h-4" />, label: "Completely private", sub: "Your library is visible only to you. Nothing shared, ever" },
  { icon: <Flame className="w-4 h-4" />, label: "You set how far it goes", sub: "From warm and romantic to deeply intimate — your depth, your call" },
];

const PACK1_FEATURES = [
  { text: "1 personalised audio story — yours to keep", special: false },
  { text: "Written around exactly what you want", special: false },
  { text: "Full cast narration — narrator plus character voices", special: false },
  { text: "Original cover art for your story", special: false },
  { text: "Private library — visible only to you", special: false },
  { text: "One-time purchase — no subscription", special: false },
  { text: "After Dark — stories that go further, no limits held back", special: true },
];

const PACK5_FEATURES = [
  { text: "5 personalised audio stories — yours to keep", special: false },
  { text: "Explore different moods, fantasies & scenarios", special: false },
  { text: "Full cast narration — narrator plus character voices", special: false },
  { text: "Original cover art for every story", special: false },
  { text: "Private library — visible only to you", special: false },
  { text: "Credits never expire", special: false },
  { text: "After Dark — stories that go further, no limits held back", special: true },
];

const PACK20_FEATURES = [
  { text: "20 personalised audio stories — yours to keep", special: false },
  { text: "Your own private collection, built around your desires", special: false },
  { text: "Indulge every mood, fantasy & scenario you can imagine", special: false },
  { text: "Full cast narration — narrator plus character voices", special: false },
  { text: "Original cover art for every story", special: false },
  { text: "Private library — visible only to you", special: false },
  { text: "Credits never expire", special: false },
  { text: "After Dark — stories that go further, no limits held back", special: true },
];

const CASTING_DETAILS = [
  { icon: <Users className="w-5 h-5" />, heading: "Cast your characters", body: "Name them. Give them a voice, a presence, a history. Who they are shapes everything — from their first word to the last." },
  { icon: <Sliders className="w-5 h-5" />, heading: "Set the dynamic", body: "Choose the tension, the pace, the power. Slow burn or immediate. Tender or charged. You decide what the air between them feels like." },
  { icon: <Flame className="w-5 h-5" />, heading: "Choose how far it goes", body: "From romantic to deeply intimate — you set the depth. The story goes exactly where you want it, and no further." },
];

const INCLUDED = [
  { icon: <Sparkles className="w-5 h-5" />, label: "Personalised story creation", desc: "Every story is written around your mood, your cast, and your world. Nothing pulled from a shelf." },
  { icon: <Lock className="w-5 h-5" />, label: "Private library access", desc: "Your stories live in your own private archive. No one else can see them — not even us." },
  { icon: <Headphones className="w-5 h-5" />, label: "Full cast narration", desc: "Every story uses a full cast — your chosen narrator plus separate voices for each character. Three voices, one story, heard only by you." },
  { icon: <Bookmark className="w-5 h-5" />, label: "Stories saved to your account", desc: "Return to any story, any time. Resume, replay, or quietly remove — entirely at your discretion." },
];

type PackKey = "pack_1" | "pack_5" | "pack_20";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is After Dark?",
    a: "After Dark is a curated space within The Private Story for stories that explore adult themes with full literary maturity — stories that don't hold back. It's included with every pack, even a single story, accessed discreetly from your library. No extra charge. The content goes further; the quality and craft remain the same.",
  },
  {
    q: "Are my generated stories private?",
    a: "Completely. Your stories are saved only to your account and are not visible to anyone else — including us. You can delete them at any time.",
  },
  {
    q: "What do the credit packs include?",
    a: "Every story credit produces a fully personalised, narrated audio story of approximately 10 minutes — written around your specific cast, mood, and choices. All packs include private library storage, full cast narration — narrator plus separate character voices — and original cover art for each story.",
  },
  {
    q: "Do my credits expire?",
    a: "No. Credits never expire. Use them whenever you like — there's no pressure to create on a schedule.",
  },
  {
    q: "Can I buy more credits later?",
    a: "Yes. Simply return to the pricing page and purchase another pack. Credits stack — if you have 2 remaining and buy 5 more, you'll have 7.",
  },
  {
    q: "What is After Dark and which packs include it?",
    a: "After Dark is the space for stories that go further — written without restraint, for a part of you that doesn't need to justify itself. It's included with every pack, even a single story.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b border-white/8 last:border-0"
      onClick={() => setOpen(!open)}
    >
      <button className="w-full flex items-center justify-between gap-4 py-5 text-left group cursor-pointer">
        <span className="text-sm font-medium text-foreground group-hover:text-foreground transition-colors leading-snug">{q}</span>
        <span className="flex-shrink-0 text-primary/80 group-hover:text-primary transition-colors">
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <p className="text-sm text-muted-foreground/80 leading-relaxed pb-5 pr-8">{a}</p>
      )}
    </div>
  );
}

export default function Pricing() {
  const { isAuthenticated, openSignIn } = useAuth();
  const { pack1, pack5, pack20, currency } = usePricing();
  const search = useSearch();
  const checkoutResult = new URLSearchParams(search).get("checkout");
  const [loadingPlan, setLoadingPlan] = useState<PackKey | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const pendingCheckoutRef = useRef<string | null>(null);

  const doCheckout = async (plan: PackKey) => {
    setLoadingPlan(plan);
    setCheckoutError(null);
    try {
      const res = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, currency, returnPath: (() => { try { const s = sessionStorage.getItem("paywallReturnState"); if (s) { const p = (JSON.parse(s) as { returnPath?: string }).returnPath; if (p) return p; } } catch { /* ignore */ } return window.location.pathname; })() }),
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col"
    >

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative py-28 md:py-40 px-4 text-center overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse at 50% -5%, rgba(201,162,39,0.14) 0%, rgba(123,143,255,0.07) 48%, transparent 72%)",
          }} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>

        <img
          aria-hidden="true"
          src={`${BASE}images/pricing-hero-woman.webp`}
          alt=""
          className="block absolute right-0 top-0 h-full w-full sm:w-[44%] object-cover object-top pointer-events-none select-none opacity-[0.18] sm:opacity-[0.52]"
          style={{
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 22%, black 52%)",
            maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 22%, black 52%)",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          {checkoutResult === "success" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 px-5 py-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Your story credits are ready. Head to your profile to get started.</span>
            </motion.div>
          )}
          {checkoutError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 px-5 py-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{checkoutError}</span>
            </motion.div>
          )}
          <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-6">
            Private access
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-5 leading-tight">
            A story written entirely
            <br className="hidden md:block" />
            <span className="text-primary"> for you alone.</span>
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {[
              { icon: <Sparkles className="w-3 h-3" />, label: "Ready in under 3 minutes" },
              { icon: <Timer className="w-3 h-3" />, label: "~10 mins of narrated audio" },
              { icon: <Lock className="w-3 h-3" />, label: "Private from the first word" },
              { icon: <BookOpen className="w-3 h-3" />, label: "1M+ story configurations" },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/8 text-primary text-[11px] font-medium"
              >
                {icon}
                {label}
              </span>
            ))}
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-4">
            Not chosen from a catalogue. Not written for someone else. Every story created around your cast, your mood, your world — then saved privately to your account, heard only by you.
          </p>
          <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-lg mx-auto mb-4">
            Every pack includes After Dark — a space for stories that go further, with no extra charge and no separate sign-up.
          </p>
          <p className="text-xs text-primary/80 tracking-wide mb-5 font-medium">
            Every personalised story is a fully narrated audio experience — approximately 10 minutes long.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {[
              { icon: <EyeOff className="w-3 h-3" />, text: "Visible to no one else" },
              { icon: <Shield className="w-3 h-3" />, text: "Billed discreetly" },
              { icon: <Trash2 className="w-3 h-3" />, text: "Delete any time" },
            ].map(({ icon, text }, i) => (
              <span key={text} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/55">
                {i > 0 && <span className="w-px h-3 bg-border/30 mr-2" />}
                {icon}
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Reassurance strip                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-4 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {REASSURANCE.map((r) => (
            <div
              key={r.label}
              className="flex flex-col items-center text-center gap-2 px-4 py-5 rounded-2xl border border-border/20 bg-card/20"
            >
              <span className="text-primary/80">{r.icon}</span>
              <p className="text-xs font-semibold text-foreground">{r.label}</p>
              <p className="text-[11px] text-muted-foreground/80 leading-snug">{r.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Stats strip                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-6 px-4 md:px-8 max-w-3xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-center gap-0 divide-x divide-border/20">
          {[
            { stat: "1M+", label: "Story configurations" },
            { stat: "< 3 mins", label: "From first choice to listening" },
            { stat: "100% private", label: "Visible to no one else" },
          ].map(({ stat, label }) => (
            <div key={stat} className="flex flex-col items-center px-8 py-2 gap-0.5">
              <span className="text-lg font-bold text-foreground tracking-tight">{stat}</span>
              <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest text-center">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Creation Room slide                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-12 px-4 md:px-8 max-w-4xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/20 backdrop-blur-sm p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/6 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              <div className="flex-1 max-w-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-primary/70" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary/70">The Creation Room</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-snug mb-3">
                  Your story is built by you,<br className="hidden md:block" /> ready in under 3 minutes.
                </h2>
                <p className="text-sm text-muted-foreground/80 leading-relaxed mb-6">
                  Before a word is written, you decide everything — who's in it, the dynamic between you, how far it goes. The creation process takes about three minutes. Your story takes about ten to listen to.
                </p>
                <button
                  onClick={() => {
                    document.getElementById("pricing-cards")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-105"
                >
                  See pricing below
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-shrink-0 w-full md:w-64">
                <div className="flex items-center gap-2 mb-4">
                  <Timer className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary/80 uppercase tracking-widest">From click to listening</span>
                </div>
                <div className="space-y-2">
                  {[
                    { step: "01", label: "Choose your mood & tone", time: "~30s" },
                    { step: "02", label: "Name & cast your character", time: "~45s" },
                    { step: "03", label: "Set the dynamic", time: "~30s" },
                    { step: "04", label: "Choose your narrator", time: "~15s" },
                    { step: "05", label: "Your story is created", time: "~60s", highlight: true },
                  ].map(({ step, label, time, highlight }) => (
                    <div
                      key={step}
                      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 ${highlight ? "bg-primary/12 border border-primary/25" : "bg-white/[0.02] border border-border/15"}`}
                    >
                      <span className={`text-[10px] font-bold tabular-nums ${highlight ? "text-primary" : "text-muted-foreground/40"}`}>{step}</span>
                      <span className={`text-xs flex-1 ${highlight ? "text-primary font-semibold" : "text-muted-foreground/70"}`}>{label}</span>
                      <span className={`text-[10px] font-medium tabular-nums ${highlight ? "text-primary/80" : "text-muted-foreground/40"}`}>{time}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-bold text-primary">Total: under 3 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Voice Showcase                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-8 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <VoiceShowcase />
      </section>

      <section className="py-4 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <CountryStrip />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Pricing cards — 3 credit packs                                      */}
      {/* ------------------------------------------------------------------ */}
      <section id="pricing-cards" className="py-16 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-3">One-time purchase · Credits never expire</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Choose your private story experience.
          </h2>
          <p className="text-muted-foreground/70 text-sm mt-3 max-w-xl mx-auto">Start with one custom audio story, explore a five-story bundle, or unlock the best-value collection of twenty. No subscription, ever.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">

          {/* Immersive Collection — Best Value (pack_20) */}
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card/40 backdrop-blur-sm p-7 shadow-[0_0_60px_-15px_rgba(201,162,39,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-background/50 pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Immersive Collection</p>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold tracking-wider uppercase">
                  <Star className="w-2.5 h-2.5" /> Best Value
                </span>
              </div>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="font-display text-5xl font-bold text-foreground tabular-nums">{pack20.display}</span>
              </div>
              <p className="text-xs text-muted-foreground/70 mb-2">{pack20.perStoryDisplay} per story — your private collection of 20.</p>

              <div className="space-y-2.5 mb-6">
                {PACK20_FEATURES.map((f) => (
                  <div key={f.text} className="flex items-start gap-2.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${f.special ? "border-primary/80 bg-primary/15" : "border-primary/60 bg-primary/10"}`}>
                      {f.special
                        ? <Moon className="w-2 h-2 text-primary" />
                        : <Check className="w-2.5 h-2.5 text-primary" />
                      }
                    </div>
                    <span className={`text-sm leading-snug ${f.special ? "text-primary/90 font-medium" : "text-foreground/80"}`}>{f.text}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => startCheckout("pack_20")}
                disabled={loadingPlan !== null}
                className="block w-full text-center py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-[0_0_32px_rgba(201,162,39,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingPlan === "pack_20" ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Starting checkout…</span>
                ) : "Unlock 20 Stories"}
              </button>
              <p className="text-center text-[10px] text-muted-foreground/50 mt-3 leading-snug px-2">
                Most chosen by listeners who want more than one experience.
              </p>
            </div>
          </div>

          {/* Immersive Bundle (pack_5) */}
          <div className="relative overflow-hidden rounded-3xl border border-border/30 bg-card/30 backdrop-blur-sm p-7">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 mb-3">Immersive Bundle</p>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="font-display text-5xl font-bold text-foreground tabular-nums">{pack5.display}</span>
              </div>
              <p className="text-xs text-muted-foreground/70 mb-2">{pack5.perStoryDisplay} per story — a flexible pack to explore.</p>

              <div className="space-y-2.5 mb-6">
                {PACK5_FEATURES.map((f) => (
                  <div key={f.text} className="flex items-start gap-2.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${f.special ? "border-primary/80 bg-primary/15" : "border-primary/60 bg-primary/10"}`}>
                      {f.special
                        ? <Moon className="w-2 h-2 text-primary" />
                        : <Check className="w-2.5 h-2.5 text-primary" />
                      }
                    </div>
                    <span className={`text-sm leading-snug ${f.special ? "text-primary/90 font-medium" : "text-foreground/80"}`}>{f.text}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => startCheckout("pack_5")}
                disabled={loadingPlan !== null}
                className="block w-full text-center py-3 rounded-full border border-primary/40 bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingPlan === "pack_5" ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Starting checkout…</span>
                ) : "Get 5 Stories"}
              </button>
              <p className="text-center text-[10px] text-muted-foreground/40 mt-3 leading-snug px-2">
                One-time payment. No subscription. <Link href="/terms" className="underline underline-offset-2 hover:text-muted-foreground/60 transition-colors">Terms apply.</Link>
              </p>
            </div>
          </div>

          {/* Immersive Story — trial (pack_1) */}
          <div className="relative overflow-hidden rounded-3xl border border-border/30 bg-card/30 backdrop-blur-sm p-7">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 mb-3">Immersive Story</p>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="font-display text-5xl font-bold text-foreground tabular-nums">{pack1.display}</span>
              </div>
              <p className="text-xs text-muted-foreground/70 mb-6">The simplest way to try your first private story.</p>

              <div className="space-y-2.5 mb-6">
                {PACK1_FEATURES.map((f) => (
                  <div key={f.text} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full border border-primary/60 bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-primary" />
                    </div>
                    <span className="text-sm leading-snug text-foreground/80">{f.text}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => startCheckout("pack_1")}
                disabled={loadingPlan !== null}
                className="block w-full text-center py-3 rounded-full border border-primary/40 bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingPlan === "pack_1" ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Starting checkout…</span>
                ) : "Create One Story"}
              </button>
              <p className="text-center text-[10px] text-muted-foreground/40 mt-3 leading-snug px-2">
                One-time payment. No subscription. <Link href="/terms" className="underline underline-offset-2 hover:text-muted-foreground/60 transition-colors">Terms apply.</Link>
              </p>
            </div>
          </div>

        </div>

        {/* Credits never expire reassurance */}
        <div className="mt-6 flex items-center justify-center gap-2 text-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
          <span className="text-xs text-muted-foreground/60">Credits never expire — use them on your own schedule</span>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* The Creation Room detail                                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-3xl border border-border/25 bg-card/20 p-10 md:p-16">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary/6 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-primary/70" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary/70">The Creation Room</span>
            </div>
            <div className="max-w-xl mb-10">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
                You build the world.
              </h2>
              <p className="text-muted-foreground/80 leading-relaxed text-lg mb-3">
                Every personalised story begins in the Creation Room — where you decide who's in it, what the energy between them feels like, and exactly how far it goes.
              </p>
              <p className="text-muted-foreground/80 leading-relaxed text-sm">
                This isn't a form. It's a creative act. The story that comes out is one only you could have made — because only you made those choices.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CASTING_DETAILS.map((item) => (
                <div key={item.heading} className="rounded-2xl border border-border/20 bg-card/30 p-6">
                  <span className="text-primary/70 mb-3 block">{item.icon}</span>
                  <p className="text-sm font-semibold text-foreground/90 mb-2">{item.heading}</p>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Privacy                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-12 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-3xl border border-border/20 bg-card/30 p-10 md:p-14">
          <div className="absolute inset-0 bg-gradient-to-br from-background to-card/40 pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary/80" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-3">Privacy, by design</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-5 leading-tight">
                Your library belongs to
                <span className="text-primary"> no one else.</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {[
                  { heading: "No social layer", body: "No feeds. No follows. No discovery. There is nothing to share and no one to share it with." },
                  { heading: "No shared access", body: "Your stories are not visible to other users — or to us. Not even the platform can read them." },
                  { heading: "Billed discreetly", body: "Your statement shows a neutral name. Nothing that identifies the platform or its content." },
                  { heading: "Delete any time", body: "Any story can be permanently removed from your library at any time. Entirely at your discretion." },
                ].map((item) => (
                  <div key={item.heading} className="rounded-xl border border-border/20 bg-card/30 p-5">
                    <p className="text-sm font-semibold text-foreground/90 mb-1.5">{item.heading}</p>
                    <p className="text-xs text-muted-foreground/80 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
              <Link href="/privacy" className="text-xs text-primary/70 hover:text-primary transition-colors">
                Read our privacy policy →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* After Dark teaser                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-12 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div
          className="relative overflow-hidden rounded-3xl border border-border/20 p-10 md:p-14"
          style={{
            backgroundImage: `url(${BASE}images/home-visual-1.webp)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/97 via-background/90 to-background/70 rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 rounded-3xl" />
          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Moon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary/70">After Dark · Included with Five Private Stories & The Full Collection</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-5 leading-tight">
              Stories that go
              <span className="text-primary"> further.</span>
            </h2>
            <p className="text-muted-foreground/80 leading-relaxed mb-4 text-base">
              Some stories want to go further. After Dark is the room where they do — written without restraint, for a part of you that doesn't need to justify itself. The same voice. The same absolute privacy.
            </p>
            <p className="text-muted-foreground/80 leading-relaxed text-sm mb-6">
              Nothing softened. Nothing left out. Included with Five Private Stories and The Full Collection — accessed discreetly from your private library.
            </p>
            <div className="flex flex-col gap-2">
              {[
                "Included with Five Private Stories and The Full Collection",
                "Accessed discreetly from your private library",
                "No extra charge. No separate sign-up.",
              ].map((line) => (
                <div key={line} className="flex items-center gap-2">
                  <Moon className="w-3 h-3 flex-shrink-0" style={{ color: "#9baeff" }} />
                  <span className="text-xs font-medium" style={{ color: "rgba(155,174,255,0.85)" }}>{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Included in every pack                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-3">Every pack includes</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
            The same private experience,
            <br className="hidden md:block" />
            <span className="text-muted-foreground font-normal"> wherever you start.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {INCLUDED.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border/20 bg-card/20 p-6 hover:border-primary/20 hover:bg-primary/4 transition-all"
            >
              <span className="text-primary/70 mb-3 block">{item.icon}</span>
              <p className="text-sm font-semibold text-foreground/90 mb-2">{item.label}</p>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Trust bar                                                            */}
      {/* ------------------------------------------------------------------ */}
      <TrustBar />

      {/* ------------------------------------------------------------------ */}
      {/* FAQ                                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-12 px-4 md:px-8 max-w-2xl mx-auto w-full">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-3">Questions</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Answered quietly.</h2>
        </div>
        <div className="rounded-2xl border border-border/20 bg-card/20 px-6">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} {...faq} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Final CTA — Personalised Erotica door                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-3">Ready to begin?</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Create your personalised erotica.
          </h2>
          <p className="text-muted-foreground/70 text-sm mt-3">Under 3 minutes from first choice to listening.</p>
        </div>
        <PersonalisedEroticaDoor />
      </section>

    </motion.div>
  );
}
