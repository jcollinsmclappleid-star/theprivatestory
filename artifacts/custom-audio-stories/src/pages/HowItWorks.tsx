import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Sparkles, Headphones, Globe, PenLine, Check,
  Lock, EyeOff, Bookmark, Calendar, ChevronRight,
  Users, Heart, MapPin, Zap, BookOpen, Layers,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { VoiceShowcase } from "@/components/VoiceShowcase";

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    icon: <Globe className="w-4 h-4" />,
    accent: "#c9a227",
    heading: "Shape your story in the Creation Room",
    body: "Choose who's in your story, the energy between them, where it's set, and the mood you want to be left with. Every choice is yours — nothing defaults to someone else's idea of what you want.",
  },
  {
    step: "02",
    icon: <PenLine className="w-4 h-4" />,
    accent: "#e879a0",
    heading: "We write and narrate it for you",
    body: "An original story shaped entirely around your choices — written to your cast, your setting, your emotional tone. Then narrated, so you can press play rather than read.",
  },
  {
    step: "03",
    icon: <Headphones className="w-4 h-4" />,
    accent: "#a78bfa",
    heading: "Yours to keep, privately",
    body: "Ready in minutes, saved to your private library, and visible only to you. Return to it whenever you want. No one else can see it — not even us.",
  },
];

const CASTING_FEATURES = [
  {
    icon: <Users className="w-4 h-4" />,
    accent: "#e879a0",
    label: "The Pairing",
    desc: "Five pairings. Choose the dynamic and we write to it.",
    examples: ["Her & Him", "Her & Her", "Him & Him", "Her & Them"],
  },
  {
    icon: <Zap className="w-4 h-4" />,
    accent: "#c9a227",
    label: "The Chemistry",
    desc: "The tension, the pull, the energy between them — chosen by you.",
    examples: ["Slow Surrender", "Forbidden Pull", "Push & Pull", "Rivals"],
  },
  {
    icon: <BookOpen className="w-4 h-4" />,
    accent: "#6b8cce",
    label: "The Archetype",
    desc: "Cast the other character from 14 distinct archetypes. Name them. Describe them.",
    examples: ["The Executive", "The Stranger", "The Artist", "The Professor"],
  },
  {
    icon: <MapPin className="w-4 h-4" />,
    accent: "#34d399",
    label: "The Setting",
    desc: "50+ countries, 12 historical eras, or an entirely your own world.",
    examples: ["Paris, 1920s", "Victorian London", "Luxury Hotel", "Mountain Retreat"],
  },
  {
    icon: <Heart className="w-4 h-4" />,
    accent: "#a78bfa",
    label: "The Mood",
    desc: "The emotional tone the story carries from the first line to the last.",
    examples: ["Slow Burn", "Quiet Intensity", "Late Night", "Unspoken"],
  },
  {
    icon: <Layers className="w-4 h-4" />,
    accent: "#e11d48",
    label: "The Situation",
    desc: "200+ starting points — or let us choose one for you. The context that gives every story its own charge.",
    examples: ["She works for him", "One night only", "Seven years later", "Strangers, delayed"],
  },
];

const MONTHLY_FEATURES = [
  "5 Immersive Stories each month",
  "Full access to the curated collection",
  "Monthly curated releases",
  "Private library storage",
  "Premium narration — press play instantly",
  "Original cover art for every story",
];

const ANNUAL_FEATURES = [
  "50 Immersive Stories per year",
  "Full access to the curated collection",
  "Monthly curated releases",
  "Private library storage",
  "Premium narration — press play instantly",
  "Original cover art for every story",
];

const TRUST_POINTS = [
  {
    icon: <EyeOff className="w-4 h-4" />,
    label: "Visible only to you",
    desc: "Your library is private to your account. No social features, no history shared.",
  },
  {
    icon: <Bookmark className="w-4 h-4" />,
    label: "Saved forever, quietly",
    desc: "Return to any story, any time. Resume, replay, or quietly remove — your call.",
  },
  {
    icon: <Calendar className="w-4 h-4" />,
    label: "Something new every month",
    desc: "A curated release added to the collection each month — something to return to between your own.",
  },
];

export default function HowItWorks() {
  useSEO({
    title: "How It Works — Create Your Personalised Audio Story | The Private Story",
    description:
      "Choose your cast, your world, and your mood. We write and narrate a story built entirely around your choices — private, original, and ready to play in minutes.",
  });

  return (
    <div className="flex flex-col w-full">

      {/* ── Hero ── */}
      <section className="relative w-full min-h-[600px] md:min-h-[720px] flex flex-col justify-center pt-12 pb-20 px-4 md:px-8 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hiw-hero-bg.png`}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/8">
                <Sparkles className="w-3.5 h-3.5 text-primary/70" />
                <span className="text-[11px] font-semibold text-primary/70 uppercase tracking-widest">
                  Personalised audio story
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
              A story built around{" "}
              <span className="text-primary">you.</span>
              <br className="hidden md:block" />
              Entirely yours to keep.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-4 leading-relaxed max-w-xl">
              Not chosen from a shelf. Not written for someone else. A story that starts
              where your imagination already is — shaped to your mood, your cast, and the
              feeling you want to be left with.
            </p>
            <p className="text-base text-muted-foreground/70 mb-10 leading-relaxed max-w-xl">
              Written, narrated, and saved privately to your account — ready to play in minutes.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href="/create"
                className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-base hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-glow"
              >
                <Sparkles className="w-5 h-5" />
                Build your story
              </Link>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-2 px-6 py-4 rounded-full border border-white/15 text-white/50 hover:text-white/70 hover:border-white/25 hover:bg-white/5 transition-all font-medium cursor-pointer"
              >
                See how it works
              </a>
            </div>

            <div className="flex items-center gap-5 mt-8">
              {[
                { n: "50+", label: "Countries & settings" },
                { n: "14", label: "Character archetypes" },
                { n: "200+", label: "Story situations" },
              ].map(({ n, label }) => (
                <div key={label} className="text-center">
                  <p className="text-sm font-bold text-primary">{n}</p>
                  <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How it works (3 steps) ── */}
      <section id="how-it-works" className="py-14 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-4">
            How it works
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
            In under a minute, your story
            <br className="hidden md:block" />
            <span className="text-muted-foreground font-normal"> is ready to play.</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm leading-relaxed">
            No browsing hoping something fits. No compromising. A story that starts exactly
            where your imagination already is.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent pointer-events-none" />
          {HOW_IT_WORKS_STEPS.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative rounded-2xl border border-border/20 bg-card/20 p-6 hover:border-primary/20 hover:bg-primary/4 transition-all"
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
                <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/30 uppercase">
                  {item.step}
                </span>
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1.5 relative z-10 leading-snug">
                {item.heading}
              </h3>
              <p className="text-xs text-muted-foreground/60 leading-relaxed relative z-10">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── The Casting Room ── */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-10">
          <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-4">
            The Creation Room
          </span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
                You build the world.
                <br className="hidden md:block" />
                <span className="text-primary"> We write it into existence.</span>
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-3">
                The Creation Room is where your story takes shape — one deliberate choice at a
                time. You choose who's in the room, what pulls them together, the setting that
                holds it all, and the mood that runs underneath every line.
              </p>
              <p className="text-sm text-muted-foreground/70 leading-relaxed">
                Each choice adds a layer. By the time you reach the end, the story already
                feels like it belongs to you — because it does. Nothing left to chance,
                nothing left to someone else's imagination.
              </p>
            </div>
            <Link
              href="/create"
              className="flex-shrink-0 flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full font-bold text-sm hover:bg-primary/90 transition-all hover:shadow-glow"
            >
              <Sparkles className="w-4 h-4" />
              Open the Creation Room
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CASTING_FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="relative rounded-2xl border border-border/20 bg-card/15 p-5 hover:border-border/40 hover:bg-card/25 transition-all overflow-hidden"
            >
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-60"
                style={{ background: `${f.accent}18` }}
              />
              <div className="flex items-center gap-2.5 mb-3 relative z-10">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border"
                  style={{ borderColor: `${f.accent}40`, background: `${f.accent}12`, color: f.accent }}
                >
                  {f.icon}
                </div>
                <span className="text-xs font-bold text-foreground/80 tracking-wide">{f.label}</span>
              </div>
              <p className="text-xs text-muted-foreground/60 leading-relaxed mb-3 relative z-10">{f.desc}</p>
              <div className="flex flex-wrap gap-1.5 relative z-10">
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
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center">
          <Link
            href="/create"
            className="flex items-center gap-2 px-7 py-3 rounded-full border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/10 transition-all"
          >
            Start casting your story
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Voice narrator showcase ── */}
      <section className="py-12 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <VoiceShowcase />
      </section>

      {/* ── What you get ── */}
      <section className="py-14 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-3">
            What you get at the end
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
            A complete, original story —
            <br className="hidden md:block" />
            <span className="text-primary"> written, narrated, illustrated.</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto text-base leading-relaxed">
            Not a text file. Not a rough draft. A finished story — narrated in a voice that
            fits, with original cover art — ready to play the moment it's created.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: <PenLine className="w-5 h-5" />,
              accent: "#c9a227",
              heading: "Written for you",
              body: "An original story — not a template — shaped around every choice you made in the Creation Room. No two stories are alike.",
            },
            {
              icon: <Headphones className="w-5 h-5" />,
              accent: "#e879a0",
              heading: "Ready to play",
              body: "Narrated and waiting. Press play when you want — wherever you are. No reading required.",
            },
            {
              icon: <Lock className="w-5 h-5" />,
              accent: "#a78bfa",
              heading: "Privately yours",
              body: "Saved to your account. Visible to no one else. Return to it, replay it, or quietly remove it — entirely at your discretion.",
            },
          ].map((item) => (
            <div
              key={item.heading}
              className="flex flex-col gap-3 rounded-2xl border border-border/20 bg-card/15 p-6"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center border"
                style={{ borderColor: `${item.accent}40`, background: `${item.accent}12`, color: item.accent }}
              >
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-foreground">{item.heading}</h3>
              <p className="text-xs text-muted-foreground/60 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl border border-border/25 bg-card/20 p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center mb-8">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
                Access
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
                One subscription.
                <br className="hidden md:block" /> Private stories whenever the moment calls.
              </h2>
              <p className="text-sm text-muted-foreground/60 mt-2 max-w-sm leading-relaxed">
                Every plan includes the full curated collection, monthly releases, private
                library, narration, and original cover art.
              </p>
            </div>
            <Link
              href="/pricing"
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/10 transition-all whitespace-nowrap"
            >
              See all plan details
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Monthly */}
            <div className="rounded-2xl border border-border/25 bg-background/30 p-6 flex flex-col">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-3">
                Monthly
              </p>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="font-display text-3xl font-bold text-foreground">£29</span>
                <span className="text-muted-foreground/50 text-sm mb-0.5">/ month</span>
              </div>
              <p className="text-xs text-muted-foreground/40 mb-4">Cancel any time.</p>
              <div className="space-y-2 mb-5">
                {MONTHLY_FEATURES.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-primary/60 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground/70 leading-snug">{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/pricing"
                className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-border/40 bg-background/40 text-sm font-semibold text-foreground/70 hover:border-primary/40 hover:text-primary transition-all"
              >
                Choose Monthly
              </Link>
            </div>

            {/* Annual */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 relative overflow-hidden shadow-[0_0_40px_-12px_rgba(201,162,39,0.2)] flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  Annual
                </p>
                <span className="px-1.5 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[9px] font-bold tracking-wider uppercase">
                  Best value
                </span>
              </div>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="font-display text-3xl font-bold text-foreground">£179</span>
                <span className="text-muted-foreground/50 text-sm mb-0.5">/ year</span>
              </div>
              <p className="text-xs text-muted-foreground/40 mb-4">
                £14.91/month — less than half the monthly price.
              </p>
              <div className="space-y-2 mb-5">
                {ANNUAL_FEATURES.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-foreground/80 leading-snug">{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/pricing"
                className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-[0_0_24px_-4px_rgba(201,162,39,0.4)]"
              >
                Choose Annual
              </Link>
            </div>

            {/* Add-on */}
            <div className="rounded-2xl border border-border/20 bg-background/20 p-6 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-3">
                  Additional stories
                </p>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="font-display text-3xl font-bold text-foreground">£3.99</span>
                  <span className="text-muted-foreground/50 text-sm mb-0.5">/ story</span>
                </div>
                <p className="text-xs text-muted-foreground/50 leading-relaxed mt-3">
                  Add more whenever you want — without changing your plan. Each one written,
                  narrated, and private to you.
                </p>
              </div>
              <Link
                href="/pricing"
                className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-border/40 bg-background/40 text-sm font-semibold text-foreground/70 hover:border-primary/40 hover:text-primary transition-all"
              >
                See all options
              </Link>
            </div>
          </div>

          {/* Reassurance row */}
          <div className="text-center space-y-2">
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground/40">
              {[
                "Private library included",
                "Cancel monthly anytime",
                "Add more stories whenever you want",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary/30 inline-block" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust section ── */}
      <section className="py-14 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRUST_POINTS.map((t) => (
            <div key={t.label} className="flex items-start gap-4 p-6 rounded-2xl border border-border/15 bg-card/10">
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                {t.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">{t.label}</p>
                <p className="text-xs text-muted-foreground/60 leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold text-base hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-glow"
          >
            <Sparkles className="w-5 h-5" />
            Build your story
          </Link>
          <p className="text-xs text-muted-foreground/40 mt-4">
            No commitment needed to start. Cancel monthly, any time.
          </p>
        </div>
      </section>

    </div>
  );
}
