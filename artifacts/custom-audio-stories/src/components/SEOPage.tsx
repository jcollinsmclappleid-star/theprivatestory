import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles, EyeOff, Lock, Headphones, Star } from "lucide-react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";

export interface SEOPageConfig {
  meta: { title: string; description: string };
  hero: {
    badge?: string;
    h1: string;
    tagline: string;
  };
  sections: Array<{
    h2: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
  howItWorks: Array<{ heading: string; body: string }>;
  scenarios: {
    h2?: string;
    intro?: string;
    items: Array<{ heading: string; body: string }>;
    interstitial?: string;
  };
  benefits: {
    h2?: string;
    items: Array<{ heading: string; body: string }>;
  };
  fullPicture: {
    h2: string;
    paragraphs: string[];
  };
  finalCTA: {
    h2: string;
    paragraphs: string[];
    primary: { label: string; href: string };
    links: Array<{ label: string; href: string }>;
  };
  faqs: Array<{ q: string; a: string }>;
}

const TRUST_ITEMS = [
  { icon: <EyeOff className="w-4 h-4" />, label: "Completely private", sub: "No social, no history shared" },
  { icon: <Sparkles className="w-4 h-4" />, label: "Made for you", sub: "Generated around your choices" },
  { icon: <Headphones className="w-4 h-4" />, label: "Narrated audio", sub: "Ready to listen instantly" },
  { icon: <Lock className="w-4 h-4" />, label: "Yours alone", sub: "Only you can access your stories" },
];

export default function SEOPage({ config }: { config: SEOPageConfig }) {
  useSEO({ title: config.meta.title, description: config.meta.description });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": config.faqs.map((faq) => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a,
        },
      })),
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-schema";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => {
      document.getElementById("faq-schema")?.remove();
    };
  }, [config.faqs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-2xl mx-auto px-4 py-16">

        {/* Hero */}
        <div className="mb-14">
          {config.hero.badge && (
            <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-5">
              {config.hero.badge}
            </span>
          )}
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {config.hero.h1}
          </h1>
          <p className="text-muted-foreground text-xl leading-relaxed mb-8">
            {config.hero.tagline}
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/90 to-primary text-primary-foreground px-6 py-3 rounded-full font-medium text-sm hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            {config.finalCTA.primary.label}
          </Link>
        </div>

        {/* Trust bar */}
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
            <div className="mt-8 text-center">
              <p className="text-muted-foreground italic mb-5">{config.scenarios.interstitial}</p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 border border-primary/40 text-primary px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/10 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {config.finalCTA.primary.label}
              </Link>
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
          <div className="flex flex-col gap-4">
            <Link
              href={config.finalCTA.primary.href}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/90 to-primary text-primary-foreground px-6 py-3 rounded-full font-medium text-sm w-fit hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              {config.finalCTA.primary.label}
            </Link>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {config.finalCTA.links.map((l, i) => (
                <Link key={i} href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {l.label} →
                </Link>
              ))}
            </div>
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
