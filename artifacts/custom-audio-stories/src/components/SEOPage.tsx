import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles, EyeOff, Lock, Headphones, ArrowRight } from "lucide-react";
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
    const faqSchema = {
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
    const faqScript = document.createElement("script");
    faqScript.type = "application/ld+json";
    faqScript.id = "faq-schema";
    faqScript.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(faqScript);

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "The Private Story", "item": "https://theprivatestory.com" },
        { "@type": "ListItem", "position": 2, "name": "Discover All Story Types", "item": "https://theprivatestory.com/discover" },
        { "@type": "ListItem", "position": 3, "name": config.hero.h1, "item": window.location.href },
      ],
    };
    const breadcrumbScript = document.createElement("script");
    breadcrumbScript.type = "application/ld+json";
    breadcrumbScript.id = "breadcrumb-schema";
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    const webPageSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": config.meta.title,
      "description": config.meta.description,
      "url": window.location.href,
      "dateModified": new Date().toISOString().split("T")[0],
      "publisher": {
        "@type": "Organization",
        "name": "The Private Story",
        "url": "https://theprivatestory.com",
      },
      "breadcrumb": { "@id": breadcrumbScript.id },
    };
    const webPageScript = document.createElement("script");
    webPageScript.type = "application/ld+json";
    webPageScript.id = "webpage-schema";
    webPageScript.textContent = JSON.stringify(webPageSchema);
    document.head.appendChild(webPageScript);

    return () => {
      document.getElementById("faq-schema")?.remove();
      document.getElementById("breadcrumb-schema")?.remove();
      document.getElementById("webpage-schema")?.remove();
    };
  }, [config.faqs, config.hero.h1, config.meta.title, config.meta.description]);

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

        {/* Structured intro — explicitly states what this page is, who it's for, how it works */}
        <div className="mb-12 space-y-4 text-muted-foreground text-base leading-relaxed border-l-2 border-primary/30 pl-5">
          <p>
            <strong className="text-foreground font-semibold">What this is:</strong>{" "}
            {config.hero.tagline}
          </p>
          <p>
            <strong className="text-foreground font-semibold">Who it's for:</strong>{" "}
            Adult women who want private, emotionally intelligent audio storytelling — personalised around their mood, not retrieved from a fixed library.
          </p>
          <p>
            <strong className="text-foreground font-semibold">How it works:</strong>{" "}
            {config.howItWorks[0].heading}. {config.howItWorks[1]?.heading}. {config.howItWorks[2]?.heading}.
          </p>
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

        {/* USP bridge — links every SEO page back to the core USP content pages */}
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
