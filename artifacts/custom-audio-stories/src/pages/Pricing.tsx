import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useSearch } from "wouter";
import {
  Sparkles, Shield, Lock, Headphones, BookOpen,
  ChevronDown, ChevronRight, Check, Moon,
  EyeOff, Bookmark, Calendar, Plus, Loader2, CheckCircle2, AlertCircle,
  Users, Sliders, Flame,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const BASE = import.meta.env.BASE_URL;
const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const REASSURANCE = [
  { icon: <Sparkles className="w-4 h-4" />, label: "Written around you", sub: "Your choices shape every word" },
  { icon: <EyeOff className="w-4 h-4" />, label: "Completely private", sub: "Your library exists for you alone" },
  { icon: <Moon className="w-4 h-4" />, label: "After Dark included", sub: "Stories that explore further" },
  { icon: <Headphones className="w-4 h-4" />, label: "Ready to listen", sub: "Narrated — press play instantly" },
];

const MONTHLY_FEATURES = [
  { text: "5 personalised stories each month", special: false },
  { text: "Unused stories roll over (up to 10)", special: false },
  { text: "Full access to the curated collection", special: false },
  { text: "Monthly curated releases", special: false },
  { text: "Private library — visible only to you", special: false },
  { text: "Premium voice narration — press play instantly", special: false },
  { text: "Original cover art for every story", special: false },
  { text: "After Dark — stories that explore further", special: true },
];

const ANNUAL_FEATURES = [
  { text: "50 personalised stories per year", special: false },
  { text: "Full access to the curated collection", special: false },
  { text: "Monthly curated releases", special: false },
  { text: "Private library — visible only to you", special: false },
  { text: "Premium voice narration — press play instantly", special: false },
  { text: "Original cover art for every story", special: false },
  { text: "After Dark — stories that explore further", special: true },
];

const CASTING_DETAILS = [
  { icon: <Users className="w-5 h-5" />, heading: "Cast your characters", body: "Name them. Give them a voice, a presence, a history. Who they are shapes everything — from their first word to the last." },
  { icon: <Sliders className="w-5 h-5" />, heading: "Set the dynamic", body: "Choose the tension, the pace, the power. Slow burn or immediate. Tender or charged. You decide what the air between them feels like." },
  { icon: <Flame className="w-5 h-5" />, heading: "Choose how far it goes", body: "From romantic to deeply intimate — you set the depth. The story goes exactly where you want it, and no further." },
];

const LIBRARY_VS_PERSONAL = [
  {
    label: "The Collection",
    accent: "#a78bfa",
    badge: "Included in every plan",
    heading: "Immediate. Beautifully crafted. Always there.",
    body: "A curated library of original stories — available the moment you sign in. No waiting, no creating. Something to listen to tonight, chosen with care. A new release added each month.",
    items: ["Ready immediately", "New story every month", "Across every mood and tone", "Beautifully narrated"],
  },
  {
    label: "Personalised Stories",
    accent: "#c9a227",
    badge: "Your credit allowance",
    heading: "Cast by you. Written for you. Heard only by you.",
    body: "These aren't chosen from a shelf. They're created around your mood, your characters, the dynamic you want — and the exact feeling you want to be left with. No two are alike. None of them exist until you make them.",
    items: ["Nobody else has this story", "Every character cast by you", "Every dynamic, your choice", "Saved privately to your library"],
  },
];

const INCLUDED = [
  { icon: <Sparkles className="w-5 h-5" />, label: "Personalised story creation", desc: "Every story is written around your mood, your cast, and your world. Nothing pulled from a shelf." },
  { icon: <Lock className="w-5 h-5" />, label: "Private library access", desc: "Your stories live in your own private archive. No one else can see them — not even us." },
  { icon: <BookOpen className="w-5 h-5" />, label: "Full curated collection", desc: "Access every story in the collection, available whenever you want something immediate." },
  { icon: <Calendar className="w-5 h-5" />, label: "Monthly curated releases", desc: "A new release added each month — thoughtfully selected for something to return to between your own." },
  { icon: <Headphones className="w-5 h-5" />, label: "Premium voice narration", desc: "A curated selection of voices, chosen for their intimacy and depth. Heard only by you." },
  { icon: <Bookmark className="w-5 h-5" />, label: "Stories saved to your account", desc: "Return to any story, any time. Resume, replay, or quietly remove — entirely at your discretion." },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is the difference between My Stories and the Collection?",
    a: "My Stories is your private archive — every story created specifically for you lives there, visible only to your account. The Collection is a curated library of pre-written stories, available to all members, with a new release added each month.",
  },
  {
    q: "What is After Dark?",
    a: "After Dark is a curated space within The Private Story for stories that explore adult themes with full literary maturity — stories that don't hold back. It's included with every plan, accessed discreetly from your library. No extra charge. The content goes further; the quality and craft remain the same.",
  },
  {
    q: "Are my generated stories private?",
    a: "Completely. Your stories are saved only to your account and are not visible to anyone else — including us. You can delete them at any time.",
  },
  {
    q: "What do I get with each plan?",
    a: "Both plans include personalised story credits — 5 per month or 50 per year — full access to the curated collection, monthly releases, private library storage, premium voice narration, original cover art, and After Dark. The annual plan is equivalent to £14.91 per month.",
  },
  {
    q: "What is included in the curated collection?",
    a: "A carefully selected library of pre-written stories, available to all members. A new release is added each month — giving you something immediate to return to between your own creations.",
  },
  {
    q: "Can I try it without subscribing?",
    a: "Yes. A single personalised story is available for £7.99 — one story, created around your choices, yours to keep. You'll create a free account to access it. Subscribe later if you want more.",
  },
  {
    q: "Can I buy more personalised stories?",
    a: "Yes. Additional personalised stories are available for £3.99 each — for active subscribers only, without changing your plan. They appear alongside your monthly allowance the moment you purchase.",
  },
  {
    q: "Do unused monthly stories roll over?",
    a: "Yes. On the monthly plan, any unused story credits carry forward to the following month, up to a maximum of 10 rollover credits.",
  },
  {
    q: "Can I cancel my monthly plan at any time?",
    a: "Yes. Cancel whenever you like — no forms, no calls. Your stories and library remain fully accessible until the end of your billing period.",
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
        <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors leading-snug">{q}</span>
        <span className="flex-shrink-0 text-primary/50 group-hover:text-primary transition-colors">
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <p className="text-sm text-muted-foreground/70 leading-relaxed pb-5 pr-8">{a}</p>
      )}
    </div>
  );
}

export default function Pricing() {
  const { isAuthenticated, openSignIn } = useAuth();
  const search = useSearch();
  const checkoutResult = new URLSearchParams(search).get("checkout");
  const [loadingPlan, setLoadingPlan] = useState<"monthly" | "annual" | "addon" | "immersive" | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<{ plan: string; subscriptionStatus: string | null } | null>(null);
  const pendingCheckoutRef = useRef<string | null>(null);

  const isActiveSub = usageData?.subscriptionStatus === "active" && usageData?.plan !== "free";

  const doCheckout = async (plan: "monthly" | "annual" | "addon" | "immersive") => {
    setLoadingPlan(plan);
    setCheckoutError(null);
    try {
      const res = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, returnPath: window.location.pathname }),
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
    fetch(`${API_BASE}/api/me/usage`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setUsageData(d); })
      .catch(() => {});

    const pending = pendingCheckoutRef.current ?? (() => {
      try { return sessionStorage.getItem("pendingPricingCheckout"); } catch { return null; }
    })();
    if (pending && ["monthly", "annual", "immersive"].includes(pending)) {
      pendingCheckoutRef.current = null;
      try { sessionStorage.removeItem("pendingPricingCheckout"); } catch { /* ignore */ }
      doCheckout(pending as "monthly" | "annual" | "immersive");
    }
  }, [isAuthenticated]);

  const startCheckout = (plan: "monthly" | "annual" | "addon" | "immersive") => {
    if (!isAuthenticated && plan === "addon") {
      openSignIn();
      return;
    }
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
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `url(${BASE}images/hero-bg.png)`,
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/8 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          {checkoutResult === "success" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 px-5 py-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Your subscription is active — welcome. Head to your profile to see your plan details.</span>
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
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-4">
            Not chosen from a catalogue. Not written for someone else. Every story created around your cast, your mood, your world — then saved privately to your account, heard only by you.
          </p>
          <p className="text-sm text-muted-foreground/50 leading-relaxed max-w-lg mx-auto mb-5">
            Each plan also gives you access to a curated collection, monthly releases, and After Dark — a space for stories that go further.
          </p>
          <p className="text-xs text-muted-foreground/40 tracking-wide">
            Billed discreetly. No subscription name appears on your statement.
          </p>
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
              <span className="text-primary/60">{r.icon}</span>
              <p className="text-xs font-semibold text-foreground/80">{r.label}</p>
              <p className="text-[11px] text-muted-foreground/50 leading-snug">{r.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Pricing cards                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 px-4 md:px-8 max-w-4xl mx-auto w-full">

        {/* Single story / trial card */}
        <div className="mb-5 relative overflow-hidden rounded-3xl border border-white/10 bg-card/20 backdrop-blur-sm p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute inset-0 bg-gradient-to-r from-card/60 to-background/30 pointer-events-none" />
          <div className="relative z-10 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 mb-2">Try it first · No subscription</p>
            <div className="flex items-end gap-2 mb-1">
              <span className="font-display text-4xl font-bold text-foreground">£7.99</span>
              <span className="text-muted-foreground/50 mb-1">one-time</span>
            </div>
            <p className="text-sm text-muted-foreground/60 leading-relaxed max-w-sm mb-4">
              One fully personalised story — cast by you, narrated and illustrated, yours to keep. A free account is created at checkout so you can access and replay it any time.
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                "1 personalised story, created around your choices",
                "Premium voice narration — ready to play",
                "Original cover art generated for your story",
                "Free account included — access any time",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2 h-2 text-primary/60" />
                  </div>
                  <span className="text-xs text-muted-foreground/50">{f}</span>
                </div>
              ))}
              {["Private library storage", "Curated collection access", "Monthly rollover credits", "After Dark"].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border border-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[8px] text-muted-foreground/20 font-bold">–</span>
                  </div>
                  <span className="text-xs text-muted-foreground/30 line-through">{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 flex-shrink-0 w-full md:w-auto">
            <button
              onClick={() => startCheckout("immersive")}
              disabled={loadingPlan !== null}
              className="block w-full md:w-auto text-center px-8 py-3.5 rounded-full border border-white/20 text-foreground font-semibold text-sm hover:bg-white/5 hover:border-white/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loadingPlan === "immersive" ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Starting checkout…</span>
              ) : (
                "Get a single story — £7.99"
              )}
            </button>
            <p className="text-center text-[10px] text-muted-foreground/30 mt-2">Subscribe later to unlock the full experience</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">

          {/* Monthly */}
          <div className="relative overflow-hidden rounded-3xl border border-border/25 bg-card/30 backdrop-blur-sm p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-card/60 to-background/40 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-4">Monthly</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="font-display text-5xl font-bold text-foreground">£29</span>
                <span className="text-muted-foreground/60 mb-1.5">/ month</span>
              </div>
              <p className="text-xs text-muted-foreground/40 mb-8">Billed monthly. Stories yours to keep.</p>

              <div className="space-y-3 mb-8">
                {MONTHLY_FEATURES.map((f) => (
                  <div key={f.text} className="flex items-start gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${f.special ? "border-primary/60 bg-primary/10" : "border-primary/40"}`}>
                      {f.special
                        ? <Moon className="w-2 h-2 text-primary" />
                        : <Check className="w-2.5 h-2.5 text-primary" />
                      }
                    </div>
                    <span className={`text-sm leading-snug ${f.special ? "text-primary/80 font-medium" : "text-muted-foreground/80"}`}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => startCheckout("monthly")}
                disabled={loadingPlan !== null}
                className="block w-full text-center py-3.5 rounded-full border border-primary/40 text-primary font-semibold text-sm hover:bg-primary/10 hover:border-primary/60 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingPlan === "monthly" ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Starting checkout…</span>
                ) : (
                  isAuthenticated ? "Subscribe monthly" : "Get started"
                )}
              </button>

              {/* Prominent cancel anytime */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="flex-1 h-px bg-border/20" />
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/6 border border-primary/15 text-[11px] text-primary/60 font-medium tracking-wide whitespace-nowrap">
                  Cancel any time — stories stay yours
                </span>
                <div className="flex-1 h-px bg-border/20" />
              </div>
            </div>
          </div>

          {/* Annual — Best Value */}
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card/40 backdrop-blur-sm p-8 shadow-[0_0_60px_-15px_rgba(201,162,39,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-background/50 pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Annual</p>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold tracking-wider uppercase">
                  Best value
                </span>
              </div>
              <div className="flex items-end gap-2 mb-1">
                <span className="font-display text-5xl font-bold text-foreground">£179</span>
                <span className="text-muted-foreground/60 mb-1.5">/ year</span>
              </div>
              <p className="text-xs text-muted-foreground/40 mb-8">
                Equivalent to £14.91 per month — less than half the monthly price.
              </p>

              <div className="space-y-3 mb-8">
                {ANNUAL_FEATURES.map((f) => (
                  <div key={f.text} className="flex items-start gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${f.special ? "border-primary/80 bg-primary/15" : "border-primary/60 bg-primary/10"}`}>
                      {f.special
                        ? <Moon className="w-2 h-2 text-primary" />
                        : <Check className="w-2.5 h-2.5 text-primary" />
                      }
                    </div>
                    <span className={`text-sm leading-snug ${f.special ? "text-primary/90 font-medium" : "text-foreground/80"}`}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => startCheckout("annual")}
                disabled={loadingPlan !== null}
                className="block w-full text-center py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-[0_0_32px_rgba(201,162,39,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingPlan === "annual" ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Starting checkout…</span>
                ) : (
                  isAuthenticated ? "Subscribe annually" : "Get started"
                )}
              </button>
              <p className="text-center text-[10px] text-muted-foreground/30 mt-3">
                The most complete experience, at the best rate.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* The Casting Room                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-3xl border border-border/25 bg-card/20 p-10 md:p-16">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary/6 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-primary/70" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary/70">The Casting Room</span>
            </div>
            <div className="max-w-xl mb-10">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
                You build the world.
              </h2>
              <p className="text-muted-foreground/80 leading-relaxed text-lg mb-3">
                Every personalised story begins in the Casting Room — where you decide who's in it, what the energy between them feels like, and exactly how far it goes.
              </p>
              <p className="text-muted-foreground/50 leading-relaxed text-sm">
                This isn't a form. It's a creative act. The story that comes out is one only you could have made — because only you made those choices.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CASTING_DETAILS.map((item) => (
                <div key={item.heading} className="rounded-2xl border border-border/20 bg-card/30 p-6">
                  <span className="text-primary/60 mb-3 block">{item.icon}</span>
                  <p className="text-sm font-semibold text-foreground/90 mb-2">{item.heading}</p>
                  <p className="text-xs text-muted-foreground/60 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Library vs Personalised — Why access feels different                */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-3">Why access feels different here</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight mb-3">
            Two kinds of stories.
            <br className="hidden md:block" />
            <span className="text-muted-foreground font-normal"> Both entirely yours.</span>
          </h2>
          <p className="text-muted-foreground/60 max-w-lg mx-auto text-sm leading-relaxed">
            Every plan gives you access to both. They serve different moments — and together, they mean you always have something waiting.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {LIBRARY_VS_PERSONAL.map((col) => (
            <div
              key={col.label}
              className="rounded-2xl border border-border/20 bg-card/20 p-8 relative overflow-hidden"
            >
              <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none"
                style={{ background: `${col.accent}14` }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: col.accent }}
                  >
                    {col.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-muted-foreground/50 font-medium">
                    {col.badge}
                  </span>
                </div>
                <h3
                  className="font-display text-xl font-bold mb-3 leading-snug"
                  style={{ color: col.accent }}
                >
                  {col.heading}
                </h3>
                <p className="text-sm text-muted-foreground/70 leading-relaxed mb-5">{col.body}</p>
                <div className="space-y-2">
                  {col.items.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: `${col.accent}50` }}
                      >
                        <Check className="w-2 h-2" style={{ color: col.accent }} />
                      </div>
                      <span className="text-xs text-muted-foreground/60">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
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
              <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-3">Privacy, by design</p>
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
                    <p className="text-xs text-muted-foreground/60 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
              <Link href="/privacy" className="text-xs text-primary/60 hover:text-primary transition-colors">
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
            backgroundImage: `url(${BASE}images/home-visual-1.png)`,
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
              <span className="text-xs font-bold uppercase tracking-widest text-primary/70">After Dark · Included with every plan</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-5 leading-tight">
              Stories that go
              <span className="text-primary"> further.</span>
            </h2>
            <p className="text-muted-foreground/80 leading-relaxed mb-4 text-base">
              After Dark is a space within The Private Story for those who want more — stories written with full literary freedom, for an adult imagination. Discreet, crafted, and entirely private.
            </p>
            <p className="text-muted-foreground/50 leading-relaxed text-sm mb-6">
              The same quality and care. The same absolute privacy. Simply no limits on where the story goes.
            </p>
            <div className="flex flex-col gap-2">
              {[
                "Included with every monthly and annual plan",
                "Accessed discreetly from your private library",
                "No extra charge. No separate sign-up.",
              ].map((line) => (
                <div key={line} className="flex items-center gap-2">
                  <Moon className="w-3 h-3 text-primary/50 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground/60">{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Included in every plan                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-3">Every plan includes</p>
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
              <span className="text-primary/60 mb-3 block">{item.icon}</span>
              <p className="text-sm font-semibold text-foreground/90 mb-2">{item.label}</p>
              <p className="text-xs text-muted-foreground/60 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Monthly release section                                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-12 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div
          className="relative overflow-hidden rounded-3xl border border-border/20 bg-card/20 p-10 md:p-14"
          style={{
            backgroundImage: `url(${BASE}images/home-visual-2.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center right",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40 rounded-3xl" />
          <div className="relative z-10 max-w-lg">
            <div className="flex items-center gap-2 mb-5">
              <Calendar className="w-4 h-4 text-primary/70" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary/70">A curated release, every month</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              A collection that
              <br className="hidden md:block" />
              <span className="text-primary"> evolves with you.</span>
            </h2>
            <p className="text-muted-foreground/70 leading-relaxed mb-4">
              Alongside the stories created for you, a curated release is added each month — giving you something immediate to return to between your own creations.
            </p>
            <p className="text-sm text-muted-foreground/45 leading-relaxed">
              Not a constant stream. Not a content farm. A thoughtfully selected addition — an editorial event, released with intention.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Add-on stories                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-12 px-4 md:px-8 max-w-4xl mx-auto w-full">
        <div className="rounded-3xl border border-border/20 bg-card/20 p-10 md:p-12 flex flex-col md:flex-row gap-10 items-center md:items-start">
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary/70" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Additional stories</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
              Continue your experience,
              <br className="hidden md:block" /> whenever you want.
            </h2>
            <p className="text-muted-foreground/70 leading-relaxed mb-4 max-w-md mx-auto md:mx-0">
              Additional personalised stories are available for £3.99 each — whenever the moment calls for it, without changing your plan.
            </p>
            <p className="text-sm text-muted-foreground/40 italic">
              "Add another story without any compromise."
            </p>
          </div>
          <div className="flex-shrink-0 text-center">
            <div className="rounded-2xl border border-primary/20 bg-primary/8 px-8 py-6 flex flex-col items-center gap-4">
              <div>
                <p className="font-display text-4xl font-bold text-primary mb-0.5">£3.99</p>
                <p className="text-xs text-muted-foreground/40">per additional story</p>
              </div>
              {isActiveSub ? (
                <button
                  onClick={() => startCheckout("addon")}
                  disabled={loadingPlan !== null}
                  className="w-full py-2.5 px-5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/20 hover:border-primary/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loadingPlan === "addon" ? (
                    <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Starting…</span>
                  ) : (
                    "Add a story"
                  )}
                </button>
              ) : (
                <p className="text-xs text-muted-foreground/50 text-center max-w-[140px] leading-relaxed">
                  Available to active subscribers only
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FAQ                                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-12 px-4 md:px-8 max-w-2xl mx-auto w-full">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-3">Questions</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Answered quietly.</h2>
        </div>
        <div className="rounded-2xl border border-border/20 bg-card/20 px-6">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} {...faq} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Final CTA                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 px-4 md:px-8 max-w-4xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card/60 to-background p-12 md:p-16 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: `url(${BASE}images/home-visual-1.png)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 to-background/90" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">Your story. Your world.</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Begin the moment
              <br className="hidden md:block" />
              <span className="text-muted-foreground font-normal"> you're ready.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-8 leading-relaxed">
              Private from the first word. Cast by you. Heard only by you. A collection that grows alongside them.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/create"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold text-base hover:bg-primary/90 transition-all hover:scale-105 shadow-[0_0_48px_-12px_rgba(201,162,39,0.4)]"
              >
                <Sparkles className="w-5 h-5" />
                Begin your story
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-border/30 text-muted-foreground/70 hover:text-foreground hover:border-border/60 transition-all text-sm"
              >
                Learn more first
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground/30 mt-6">
              Private from the first word. Monthly plans cancel any time.{" "}
              <Link href="/privacy" className="hover:text-primary transition-colors">How we protect it →</Link>
            </p>
          </div>
        </div>
      </section>

    </motion.div>
  );
}
