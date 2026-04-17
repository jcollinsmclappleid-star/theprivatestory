import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, EyeOff, Lock, Headphones, Sparkles } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { ThreeDoors, MiniDoorCTA } from "@/components/ThreeDoors";

export interface CompetitorPageConfig {
  slug: string;
  competitorName: string;
  metaTitle: string;
  metaDescription: string;
  badge: string;
  h1: string;
  tagline: string;
  intro: string;
  sections: { h2: string; body: string }[];
  faqs: { q: string; a: string }[];
}

const TRUST_ITEMS = [
  { icon: <EyeOff className="w-4 h-4" />, label: "Completely private", sub: "No social, no history shared" },
  { icon: <Sparkles className="w-4 h-4" />, label: "Made for you", sub: "Generated around your choices" },
  { icon: <Headphones className="w-4 h-4" />, label: "Narrated audio", sub: "Ready to listen instantly" },
  { icon: <Lock className="w-4 h-4" />, label: "Yours alone", sub: "Only you can access your stories" },
];

export default function CompetitorPage({ config }: { config: CompetitorPageConfig }) {
  useSEO({ title: config.metaTitle, description: config.metaDescription });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero */}
      <div className="max-w-2xl mx-auto px-4 pt-16 pb-0">
        <div className="mb-10">
          <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-5">
            {config.badge}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {config.h1}
          </h1>
          <p className="text-muted-foreground text-xl leading-relaxed">
            {config.tagline}
          </p>
        </div>
      </div>

      {/* After Dark — featured door */}
      <ThreeDoors filter={["dark"]} />

      {/* Stats block */}
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

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-16">

        {/* Editorial note */}
        <div className="mb-12 p-5 rounded-xl border border-border/30 bg-white/[0.02]">
          <p className="text-sm text-muted-foreground/80 italic leading-relaxed">
            {config.intro}
          </p>
        </div>

        {/* Trust items */}
        <div className="grid grid-cols-2 gap-3 mb-16">
          {TRUST_ITEMS.map((t, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border/30 bg-white/[0.02] p-4">
              <div className="mt-0.5 text-primary/70">{t.icon}</div>
              <div>
                <p className="text-sm font-medium text-foreground">{t.label}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">{t.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison sections */}
        <div className="space-y-10 mb-16">
          {config.sections.map((section, i) => (
            <div key={i}>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
                {section.h2}
              </h2>
              <div
                className="text-muted-foreground leading-relaxed prose prose-invert prose-a:text-primary prose-a:no-underline hover:prose-a:underline max-w-none"
                dangerouslySetInnerHTML={{ __html: section.body }}
              />
            </div>
          ))}
        </div>

        {/* FAQs */}
        {config.faqs.length > 0 && (
          <div className="mb-16">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
              Frequently asked questions
            </h2>
            <div className="space-y-2">
              {config.faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/30 bg-white/[0.02] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="text-sm font-medium text-foreground pr-4">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-primary/60 shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Creation room CTA */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-3">The Creation Room</p>
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            Choose every detail.
          </h2>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed max-w-md mx-auto">
            The mood, the chemistry, the setting, the intensity — all yours. The story is written around exactly what you choose.
          </p>
          <MiniDoorCTA filter={["dark"]} />
        </div>

      </div>
    </motion.div>
  );
}
