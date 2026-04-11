import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles, EyeOff, Lock, Headphones, ArrowRight, Heart } from "lucide-react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import type { SEOPageConfig } from "@workspace/seo-data";
import CastingPreview from "@/components/CastingPreview";
import { ThreeDoors, MiniDoorCTA } from "@/components/ThreeDoors";

export type { SEOPageConfig };

type DoorId = "story" | "dark" | "quiet";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

const TRUST_ITEMS = [
  { icon: <EyeOff className="w-4 h-4" />, label: "Completely private", sub: "No social, no history shared" },
  { icon: <Sparkles className="w-4 h-4" />, label: "Made for you", sub: "Generated around your choices" },
  { icon: <Headphones className="w-4 h-4" />, label: "Narrated audio", sub: "Ready to listen instantly" },
  { icon: <Lock className="w-4 h-4" />, label: "Yours alone", sub: "Only you can access your stories" },
  { icon: <Heart className="w-4 h-4" />, label: "Designed for the female imagination", sub: "Emotionally intelligent, agency-first, privacy-led", colSpan: true },
];

export default function SEOPage({
  config,
  doorFilter,
  showSecondaryDoors,
}: {
  config: SEOPageConfig;
  doorFilter?: DoorId[];
  showSecondaryDoors?: boolean;
}) {
  useSEO({ title: config.meta.title, description: config.meta.description });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero — with optional background image */}
      {config.heroImage ? (
        <div className="relative w-full min-h-[340px] md:min-h-[440px] flex items-end overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={`${BASE_URL}/${config.heroImage}`}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
          </div>
          <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-14 md:py-20">
            {config.hero.badge && (
              <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-5">
                {config.hero.badge}
              </span>
            )}
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight drop-shadow-xl">
              {config.hero.h1}
            </h1>
            <p className="text-white/75 text-xl leading-relaxed max-w-xl">
              {config.hero.tagline}
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto px-4 pt-16 pb-0">
          <div className="mb-14">
            {config.hero.badge && (
              <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-5">
                {config.hero.badge}
              </span>
            )}
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              {config.hero.h1}
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed">
              {config.hero.tagline}
            </p>
          </div>
        </div>
      )}

      {/* Three Doors — choose your path */}
      <ThreeDoors filter={doorFilter} />

      {/* USP stats block — propagates to all SEO pages */}
      <div className="py-8 px-4 border-b border-border/20">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
            Nothing else goes this deep
          </p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-display font-bold text-primary leading-none">2.6M+</span>
            <span className="text-xs text-muted-foreground/70 leading-snug text-left max-w-[140px]">unique personalised story combinations</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-1">
            {[
              { n: "50+",  label: "Countries" },
              { n: "12",   label: "Historical eras" },
              { n: "14",   label: "Archetypes" },
              { n: "9",    label: "Chemistries" },
              { n: "200+", label: "Situations" },
            ].map(({ n, label }) => (
              <div key={label} className="text-center">
                <p className="text-sm font-bold text-primary/80 leading-none">{n}</p>
                <p className="text-[9px] text-muted-foreground/60 uppercase tracking-widest mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary doors — for bedtime pages: "Also in The Private Story" */}
      {showSecondaryDoors && doorFilter && (() => {
        const secondaryIds = (["story", "dark", "quiet"] as DoorId[]).filter(id => !doorFilter.includes(id));
        if (!secondaryIds.length) return null;
        return (
          <div className="flex flex-col items-center gap-3 py-4 px-4">
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)" }}>
              Also in The Private Story
            </p>
            <MiniDoorCTA filter={secondaryIds} />
          </div>
        );
      })()}

      {/* Casting Preview — soft version */}
      {config.showCastingPreview && (
        <div className="w-full border-t border-b border-border/20 bg-background/50 px-4 md:px-8 overflow-hidden">
          <CastingPreview soft />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-16">

        {/* Structured intro */}
        <div className="mb-12 space-y-4 text-muted-foreground text-base leading-relaxed border-l-2 border-primary/30 pl-5">
          <p>
            <strong className="text-foreground font-semibold">What this is:</strong>{" "}
            {config.hero.tagline}
          </p>
          <p>
            <strong className="text-foreground font-semibold">Who it's for:</strong>{" "}
            Designed for the female imagination — adults who want private, emotionally intelligent audio storytelling personalised around their mood and tone, not retrieved from a fixed library.
          </p>
          <p>
            <strong className="text-foreground font-semibold">How it works:</strong>{" "}
            {config.howItWorks[0].heading}. {config.howItWorks[1]?.heading}. {config.howItWorks[2]?.heading}.
          </p>
        </div>

        {/* Trust bar */}
        <div className="grid grid-cols-2 gap-3 mb-16">
          {TRUST_ITEMS.map((t, i) => (
            <div key={i} className={`flex items-start gap-3 rounded-xl border border-border/30 bg-white/[0.02] p-4 ${'colSpan' in t ? 'col-span-2' : ''}`}>
              <div className="mt-0.5 text-primary/70">{t.icon}</div>
              <div>
                <p className="text-sm font-medium text-foreground">{t.label}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">{t.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Content sections */}
        <div className="space-y-12 mb-16">
          {config.sections.map((section, i) => (
            <section key={i}>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-5 leading-snug">
                {section.h2}
              </h2>
              <div className="space-y-4">
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="text-muted-foreground text-lg leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
              {section.bullets && (
                <ul className="mt-5 space-y-3">
                  {section.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-3 text-muted-foreground">
                      <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* How it works */}
        <section className="mb-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 leading-snug">
            How It Works
          </h2>
          <div className="space-y-8">
            {config.howItWorks.map((step, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex-shrink-0 w-9 h-9 rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center text-primary text-sm font-bold font-display">
                  {i + 1}
                </div>
                <div className="pt-1.5">
                  <h3 className="font-semibold text-foreground mb-2">{step.heading}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Scenarios */}
        <section className="mb-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4 leading-snug">
            {config.scenarios.h2 ?? "What This Can Sound Like"}
          </h2>
          {config.scenarios.intro && (
            <p className="text-muted-foreground mb-8 leading-relaxed">{config.scenarios.intro}</p>
          )}
          <div className="space-y-4">
            {config.scenarios.items.map((s, i) => (
              <div key={i} className="rounded-2xl border border-border/40 bg-white/[0.02] p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-3">{s.heading}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          {config.scenarios.interstitial && (
            <div className="mt-8">
              <p className="text-muted-foreground italic">{config.scenarios.interstitial}</p>
            </div>
          )}
        </section>

        {/* Benefits */}
        <section className="mb-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 leading-snug">
            {config.benefits.h2 ?? "What Makes This Different"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {config.benefits.items.map((b, i) => (
              <div key={i} className="rounded-xl border border-border/30 bg-white/[0.01] p-5">
                <h3 className="font-semibold text-foreground mb-2">{b.heading}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Full picture */}
        <section className="mb-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6 leading-snug">
            {config.fullPicture.h2}
          </h2>
          <div className="space-y-4">
            {config.fullPicture.paragraphs.map((p, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mb-16 rounded-2xl border border-border/40 bg-white/[0.02] p-8 md:p-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-5 leading-snug">
            {config.finalCTA.h2}
          </h2>
          <div className="space-y-4 mb-8">
            {config.finalCTA.paragraphs.map((p, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">
                {p}
              </p>
            ))}
          </div>
          {config.finalCTA.links.length > 0 && (
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {config.finalCTA.links.map((l, i) => (
                <Link key={i} href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {l.label} →
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* USP bridge */}
        <section className="mb-8">
          <p className="text-[11px] text-muted-foreground/40 uppercase tracking-widest font-medium mb-3">How The Private Story works</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/personalised-audio-stories"
              className="group rounded-xl border border-border/30 bg-white/[0.02] hover:border-primary/30 hover:bg-primary/[0.03] p-4 transition-all duration-200"
            >
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors mb-1">Personalised audio stories</p>
              <p className="text-xs text-muted-foreground/70 leading-relaxed">What personalisation means — and why it's different from choosing from a library.</p>
            </Link>
            <Link
              href="/create-your-own-audio-story"
              className="group rounded-xl border border-border/30 bg-white/[0.02] hover:border-primary/30 hover:bg-primary/[0.03] p-4 transition-all duration-200"
            >
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors mb-1">Create your own audio story</p>
              <p className="text-xs text-muted-foreground/70 leading-relaxed">The choices you make — and how they shape the story that's created for you.</p>
            </Link>
          </div>
        </section>

        {/* Discover more */}
        <section className="mb-16">
          <div className="rounded-xl border border-border/20 bg-white/[0.01] px-6 py-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-0.5">Explore all story types</p>
              <p className="text-xs text-muted-foreground/70">Twenty-four different ways into a story made for you.</p>
            </div>
            <Link
              href="/discover"
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Discover <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-border/30">
            {config.faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left py-5 flex items-start justify-between gap-4"
                >
                  <span className="font-medium text-foreground leading-snug">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="pb-5 text-muted-foreground text-sm leading-relaxed -mt-1">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </motion.div>
  );
}
