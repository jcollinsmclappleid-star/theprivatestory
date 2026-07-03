import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Sparkles, Headphones, PenLine, Check, X,
  Lock, ChevronRight, ArrowDown,
  Users, Heart, MapPin, Zap, BookOpen, Layers, SlidersHorizontal,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { usePricing } from "@/hooks/usePricing";
import { VoiceShowcase } from "@/components/VoiceShowcase";
import { TrustBar } from "@/components/TrustBar";
import { HowItWorksHero, hiwAct4Src } from "@/components/HowItWorksHero";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay },
});

const SECTION_LABEL = "text-xs font-bold uppercase tracking-[0.28em] text-primary mb-3";
const CARD =
  "relative rounded-2xl border border-white/10 bg-white/[0.03] hover:border-primary/25 hover:bg-primary/[0.04] transition-all overflow-hidden";

const PERSONALISATION_PILLARS = [
  { stat: "6", label: "Pairing options", detail: "Her & Him, Her & Her, MFM, and more" },
  { stat: "19", label: "Character archetypes", detail: "Name them. Describe them. Cast them." },
  { stat: "200+", label: "Settings & situations", detail: "Countries, eras, and starting points" },
  { stat: "17", label: "Desire categories", detail: "Tags that shape how it's written" },
  { stat: "1M+", label: "Possible stories", detail: "Yours has never existed before" },
];

const PERSONALISATION_STACK = [
  { step: 1, title: "Who is in the story?", body: "Pairing and heritage set pronouns for every line.", slug: "desire-they", accent: "#e879a0" },
  { step: 2, title: "What pulls them together?", body: "Chemistry, archetype, and the fantasy you choose.", slug: "tension", accent: "#c9a227" },
  { step: 3, title: "Where does it unfold?", body: "Country, setting, era — or a world entirely yours.", slug: "scene", accent: "#34d399" },
  { step: 4, title: "How do you want it written?", body: "Desire tags, intensity, voice — nothing held back unless you want it.", slug: "yours", accent: "#a78bfa" },
  { step: 5, title: "We write & narrate it", body: "Original prose + full cast audio, saved privately to you.", slug: "devotion", accent: "#c9a227" },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    icon: <SlidersHorizontal className="w-4 h-4" />,
    accent: "#c9a227",
    heading: "Build your brief",
    body: "Five acts — who, fantasy, world, desires, intensity. Each choice feeds the story. Nothing is pre-written for you.",
  },
  {
    step: "02",
    icon: <PenLine className="w-4 h-4" />,
    accent: "#e879a0",
    heading: "We write to your spec",
    body: "Original fiction shaped around every selection — your cast, your dynamic, your tags, your narrator.",
  },
  {
    step: "03",
    icon: <Headphones className="w-4 h-4" />,
    accent: "#a78bfa",
    heading: "Play it privately",
    body: "Full cast narration, original cover art, saved to your library. Visible only to you.",
  },
];

const CASTING_FEATURES = [
  {
    icon: <Users className="w-4 h-4" />,
    accent: "#e879a0",
    label: "The Pairing",
    desc: "Six pairings. Pronouns and perspective follow your cast automatically.",
    examples: ["Her & Him", "Her & Her", "MFM", "Her & Them"],
    slug: "desire-they",
  },
  {
    icon: <Zap className="w-4 h-4" />,
    accent: "#c9a227",
    label: "The Chemistry",
    desc: "Who moves first, who holds back — the tension between them is yours to set.",
    examples: ["Slow Surrender", "Forbidden Pull", "Push & Pull", "Rivals"],
    slug: "tension",
  },
  {
    icon: <BookOpen className="w-4 h-4" />,
    accent: "#6b8cce",
    label: "The Archetype",
    desc: "19 distinct character types. Name them. Add the details that make them real.",
    examples: ["The Executive", "The Stranger", "The Artist", "The Professor"],
    slug: "submission-worship",
  },
  {
    icon: <MapPin className="w-4 h-4" />,
    accent: "#34d399",
    label: "The Setting",
    desc: "200+ places across countries and eras — Paris 1920s to a penthouse at midnight.",
    examples: ["Paris, 1920s", "Victorian London", "Luxury Hotel", "Mountain Retreat"],
    slug: "dark-fantasy",
  },
  {
    icon: <Heart className="w-4 h-4" />,
    accent: "#a78bfa",
    label: "Your Desires",
    desc: "17 categories of tags — restraint, praise, tension, romance — written into the prose.",
    examples: ["Slow Burn", "Praise Kink", "Power Exchange", "Forbidden"],
    slug: "feel",
  },
  {
    icon: <Layers className="w-4 h-4" />,
    accent: "#e11d48",
    label: "The Situation",
    desc: "Where the story starts — colleagues, strangers, exes, one night only.",
    examples: ["She works for him", "One night only", "Seven years later", "Strangers, delayed"],
    slug: "plot",
  },
];

const LIBRARY_VS = {
  them: [
    "Pick from a catalogue someone else curated",
    "Hope the cast and dynamic feel close enough",
    "Same story thousands of others have heard",
    "Intensity fixed — take it or leave it",
  ],
  us: [
    "You choose every layer of the brief",
    "Your cast, your chemistry, your pronouns",
    "Original fiction — never replicated",
    "Intensity dial from intimate to explicit",
  ],
};

export default function HowItWorks() {
  const { pack1, pack5, pack20 } = usePricing();
  useSEO({
    title: "How It Works — Personalised Erotic Audio | The Private Story",
    description:
      "Build a brief — cast, chemistry, setting, desires, intensity. We write and narrate an original story around your choices. Private, unique, ready in minutes.",
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col w-full">

      <HowItWorksHero priceDisplay={pack1.display} />

      <div className="relative z-10 space-y-0">

        {/* ── Personalisation by numbers ── */}
        <section className="py-10 px-4 md:px-8 border-b border-white/6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 max-w-xl mx-auto">
              <p className={SECTION_LABEL}>Built around you</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight">
                Personalisation isn&apos;t a feature.{" "}
                <span className="text-primary">It&apos;s the product.</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {PERSONALISATION_PILLARS.map((p) => (
                <div
                  key={p.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center hover:border-primary/25 transition-colors"
                >
                  <p className="font-display text-2xl md:text-3xl font-bold text-primary tabular-nums">{p.stat}</p>
                  <p className="text-xs font-bold text-white mt-1">{p.label}</p>
                  <p className="text-[10px] text-white/55 mt-1 leading-snug">{p.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Personalisation stack (visual journey) ── */}
        <section className="py-14 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-start">
            <div>
              <p className={SECTION_LABEL}>The brief you build</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
                Five layers.{" "}
                <span className="text-primary">One story that could only be yours.</span>
              </h2>
              <p className="text-white/80 text-base leading-relaxed mb-6">
                Each step adds detail the writer must honour. By the end, your brief reads like a casting document — and the finished audio follows it line for line.
              </p>
              <Link
                href="/after-dark"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Build your brief now
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {PERSONALISATION_STACK.map((layer, i) => (
                <motion.div
                  key={layer.step}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className={`${CARD} flex gap-0`}
                >
                  <div className="relative w-24 sm:w-28 flex-shrink-0">
                    <img
                      src={hiwAct4Src(layer.slug)}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0c0a10]/90" />
                  </div>
                  <div className="flex-1 p-4 flex gap-3 items-start">
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border"
                      style={{ borderColor: `${layer.accent}50`, color: layer.accent, background: `${layer.accent}15` }}
                    >
                      {layer.step}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug">{layer.title}</h3>
                      <p className="text-xs text-white/70 mt-0.5 leading-relaxed">{layer.body}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className="flex justify-center pt-2 text-white/30">
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </div>
              <div className={`${CARD} p-5 border-primary/30 bg-primary/[0.06] text-center`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Output</p>
                <p className="font-display text-lg font-bold text-white">Your private audio story</p>
                <p className="text-xs text-white/65 mt-1">Written once · narrated · never shared</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Not a library ── */}
        <motion.section {...fade(0.05)} className="py-10 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="relative rounded-3xl border border-primary/20 bg-[#0c0a10]/80 overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              aria-hidden
              style={{ background: "radial-gradient(ellipse at 80% 0%, rgba(201,162,39,0.12) 0%, transparent 55%)" }}
            />
            <div className="relative px-8 py-8 md:py-10">
              <div className="text-center mb-8">
                <p className={SECTION_LABEL}>Why personalisation matters</p>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                  A catalogue vs. a story built for you
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-3xl mx-auto">
                <div className="p-6 md:border-r border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">Streaming catalogues</p>
                  <div className="space-y-3">
                    {LIBRARY_VS.them.map((item) => (
                      <div key={item} className="flex items-start gap-2.5">
                        <X className="w-3.5 h-3.5 text-white/25 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-white/35 line-through leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-primary/[0.06]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80 mb-4">The Private Story</p>
                  <div className="space-y-3">
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
        </motion.section>

        {/* ── Three steps ── */}
        <section id="process" className="py-14 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <p className={SECTION_LABEL}>From brief to audio</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              Three steps.{" "}
              <span className="text-primary">Under three minutes of your time.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent pointer-events-none" />
            {HOW_IT_WORKS_STEPS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`${CARD} p-6`}
              >
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl pointer-events-none"
                  style={{ background: `${item.accent}12` }}
                />
                <div className="flex items-center gap-3 mb-3 relative z-10">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border"
                    style={{ borderColor: `${item.accent}40`, background: `${item.accent}12`, color: item.accent }}
                  >
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">{item.step}</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5 relative z-10">{item.heading}</h3>
                <p className="text-xs text-white/75 leading-relaxed relative z-10">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Every choice you control (with art) ── */}
        <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="mb-10 max-w-2xl">
            <p className={SECTION_LABEL}>Every dimension</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              Six decisions.{" "}
              <span className="text-primary">Thousands of combinations each.</span>
            </h2>
            <p className="text-white/80 leading-relaxed">
              Tap any tile in the studio and the story shifts. Change the pairing and pronouns rewrite. Change the tags and the scenes rewrite. Nothing is decorative — it all lands in the script.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CASTING_FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className={CARD}
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={hiwAct4Src(f.slug)}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                    style={{ objectPosition: "50% 20%" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a10] via-[#0c0a10]/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center border"
                      style={{ borderColor: `${f.accent}50`, background: `${f.accent}20`, color: f.accent }}
                    >
                      {f.icon}
                    </div>
                    <span className="text-sm font-bold text-white">{f.label}</span>
                  </div>
                </div>
                <div className="p-4 pt-3">
                  <p className="text-xs text-white/75 leading-relaxed mb-3">{f.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {f.examples.map((ex) => (
                      <span
                        key={ex}
                        className="px-2 py-0.5 rounded-full border text-[10px] font-medium"
                        style={{ borderColor: `${f.accent}25`, color: `${f.accent}bb`, background: `${f.accent}08` }}
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Sample ── */}
        <motion.section {...fade(0.05)} className="py-6 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="rounded-3xl border border-primary/25 bg-[#0d0a06] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" aria-hidden />
            <div className="relative z-10 max-w-lg">
              <p className={SECTION_LABEL}>Proof before you build</p>
              <h3 className="font-display text-xl md:text-2xl font-bold text-white mb-2">
                Samples show the craft. Your story shows your choices.
              </h3>
              <p className="text-sm text-white/75">
                Editor&apos;s picks are fixed scenarios — listen to the narration quality, then imagine it with your cast.
              </p>
            </div>
            <Link
              href="/samples"
              className="relative z-10 flex-shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-[0_0_32px_-6px_rgba(201,162,39,0.5)]"
            >
              <Headphones className="w-4 h-4" />
              Hear samples — free
            </Link>
          </div>
        </motion.section>

        {/* ── Voices ── */}
        <section className="py-12 px-4 md:px-8 max-w-5xl mx-auto w-full">
          <div className="text-center mb-8">
            <p className={SECTION_LABEL}>You choose the narrator too</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight">
              Hear each voice before you commit —{" "}
              <span className="text-primary">then lock it into your brief.</span>
            </h2>
          </div>
          <VoiceShowcase />
        </section>

        {/* ── Deliverable ── */}
        <section className="py-14 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <p className={SECTION_LABEL}>What lands in your library</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              One brief in.{" "}
              <span className="text-primary">A complete private story out.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: <PenLine className="w-5 h-5" />, accent: "#c9a227", heading: "Original script", body: "Every choice from your brief reflected in the prose — not a template with blanks filled in." },
              { icon: <Headphones className="w-5 h-5" />, accent: "#e879a0", heading: "Full cast audio", body: "Narrator plus separate voices for each character. Press play and disappear into it." },
              { icon: <Lock className="w-5 h-5" />, accent: "#a78bfa", heading: "Private forever", body: "Saved to your account only. Replay, resume, or delete — your call, always." },
            ].map((item) => (
              <div key={item.heading} className={`${CARD} flex flex-col gap-3 p-6`}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center border"
                  style={{ borderColor: `${item.accent}40`, background: `${item.accent}12`, color: item.accent }}
                >
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold text-white">{item.heading}</h3>
                <p className="text-xs text-white/75 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <TrustBar />

        {/* ── Pricing ── */}
        <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="rounded-3xl border border-primary/20 bg-[#0c0a10]/90 p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center mb-8">
              <div className="flex-1">
                <p className={SECTION_LABEL}>Pay once per story</p>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight">
                  Each credit = one fully personalised story.
                </h2>
                <p className="text-sm text-white/75 mt-2 max-w-sm leading-relaxed">
                  No subscription. Build a new brief whenever you want a different cast, mood, or intensity.
                </p>
              </div>
              <Link
                href="/pricing"
                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/10 transition-all whitespace-nowrap"
              >
                See all packs
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 relative overflow-hidden shadow-[0_0_40px_-12px_rgba(201,162,39,0.2)] flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-3">20 stories</p>
                <span className="font-display text-3xl font-bold text-white tabular-nums">{pack20.display}</span>
                <p className="text-xs text-white/70 my-4 flex-1"><span className="tabular-nums">{pack20.perStoryDisplay}</span> per story</p>
                <Link href="/pricing" className="py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold text-center hover:bg-primary/90 transition-all">
                  Unlock 20 Stories
                </Link>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6 flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-3">5 stories</p>
                <span className="font-display text-3xl font-bold text-white tabular-nums">{pack5.display}</span>
                <p className="text-xs text-white/70 my-4 flex-1"><span className="tabular-nums">{pack5.perStoryDisplay}</span> per story</p>
                <Link href="/pricing" className="py-2.5 rounded-full border border-white/20 text-sm font-semibold text-white/85 text-center hover:border-primary/40 hover:text-primary transition-all">
                  Get 5 Stories
                </Link>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6 flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-3">Try one</p>
                <span className="font-display text-3xl font-bold text-white tabular-nums">{pack1.display}</span>
                <p className="text-xs text-white/70 my-4 flex-1">Build your first brief</p>
                <Link href="/after-dark" className="py-2.5 rounded-full border border-white/20 text-sm font-semibold text-white/85 text-center hover:border-primary/40 hover:text-primary transition-all">
                  Start personalising
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <motion.section {...fade(0.1)} className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="relative overflow-hidden rounded-3xl border border-primary/25 px-8 py-14 text-center flex flex-col items-center gap-6">
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
              <img
                src={hiwAct4Src("yours")}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0810] via-[#0a0810]/92 to-[#0a0810]/85" />
            </div>
            <div className="relative z-10 max-w-lg">
              <p className={SECTION_LABEL}>Ready when you are</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                Your cast. Your desires. Your story.
              </h2>
              <p className="text-white/80">
                The brief takes minutes. The story is written around every choice you make.
              </p>
            </div>
            <Link
              href="/after-dark"
              className="relative z-10 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-[0_0_28px_-8px_rgba(201,162,39,0.55)]"
            >
              <Sparkles className="w-4 h-4" />
              Build your brief — from {pack1.display}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.section>

      </div>
    </motion.div>
  );
}
