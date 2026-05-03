import { useState, useEffect, useRef, useMemo, Fragment, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles, EyeOff, Lock, Headphones, ArrowRight, Heart, Clock, Play, Pause, X } from "lucide-react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import type { SEOPageConfig, ParagraphContent } from "@workspace/seo-data";
import { StoryAnatomyCard } from "@/components/StoryAnatomy";
import { ThreeDoors, MiniDoorCTA } from "@/components/ThreeDoors";

export type { SEOPageConfig };

/**
 * Brand-compliant body-image pool. Every asset listed here is non-human,
 * non-figurative, dark editorial illustration in the amber/burgundy/gold
 * brand palette. NO seo-hero-* images here — they contain figures and break
 * the body-image criteria. Order is preserved so the deterministic rotation
 * is stable.
 */
const BODY_IMAGE_POOL: string[] = [
  "images/seo-body-candlelit-doorway.png",
  "images/seo-body-four-poster-bed.png",
  "images/seo-body-library-at-night.png",
  "images/seo-body-silk-on-velvet.png",
  "images/seo-body-rain-on-window.png",
  "images/seo-body-fireplace-and-wine.png",
  "images/door-romance.png",
  "images/door-afterdark.png",
  "images/door-drift.png",
  "cover-abstract-fallback.png",
];

// Cheap deterministic hash so each page gets a stable rotation seed.
function pageHash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickBodyImages(config: SEOPageConfig, count: number): string[] {
  const pool = config.bodyImages?.length ? config.bodyImages : BODY_IMAGE_POOL;
  if (!pool.length) return [];
  const start = pageHash(config.meta.title) % pool.length;
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(pool[(start + i) % pool.length]);
  return out;
}

/**
 * Parses inline `<a href="...">text</a>` substrings and replaces them with
 * wouter <Link> elements. This is the safety net for the ~140 legacy strings
 * in seo-data/configs.ts that still embed raw HTML — without this, those
 * strings render as visible markup because React escapes them. NEW content
 * should prefer the typed { text, links } paragraph form instead.
 *
 * Safe by construction: we only extract `href` (string) and inner text
 * (string) and feed them to <Link>. No HTML is ever set via dangerouslySetInnerHTML.
 */
const INLINE_LINK_RE = /<a\s+href="([^"]+)">([^<]+)<\/a>/g;

function parseInlineLinks(text: string): ReactNode {
  if (!text.includes("<a ")) return text;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  INLINE_LINK_RE.lastIndex = 0;
  while ((match = INLINE_LINK_RE.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <Link
        key={`il-${match.index}`}
        href={match[1]}
        className="text-primary hover:text-primary/80 underline-offset-2 hover:underline transition-colors"
      >
        {match[2]}
      </Link>
    );
    lastIndex = INLINE_LINK_RE.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>;
}

/** Render a paragraph that may be a plain string or a structured {text, links} object. */
function renderParagraphContent(p: ParagraphContent): ReactNode {
  if (typeof p === "string") return parseInlineLinks(p);
  if (!p.links?.length) return parseInlineLinks(p.text);
  // Structured form: split on each `match` substring (in order) and weave in <Link> elements.
  let remaining = p.text;
  const out: ReactNode[] = [];
  for (let i = 0; i < p.links.length; i++) {
    const { match, href } = p.links[i];
    const idx = remaining.indexOf(match);
    if (idx === -1) continue; // copy drift — fall back to plain text
    if (idx > 0) out.push(remaining.slice(0, idx));
    out.push(
      <Link
        key={`sl-${i}`}
        href={href}
        className="text-primary hover:text-primary/80 underline-offset-2 hover:underline transition-colors"
      >
        {match}
      </Link>
    );
    remaining = remaining.slice(idx + match.length);
  }
  if (remaining) out.push(remaining);
  return <>{out.map((n, i) => <Fragment key={i}>{n}</Fragment>)}</>;
}

type DoorId = "story" | "dark" | "quiet";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

const DOOR_SAMPLE: Record<DoorId, { file: string; voice: string }> = {
  story: { file: "romance",    voice: "Romance · warm, considered" },
  dark:  { file: "after-dark", voice: "After Dark · charged, unhurried" },
  quiet: { file: "drift",      voice: "Drift · slow, calming" },
};

// Lazy-loaded inline sample player. The audio file isn't fetched until click,
// so adding this to the page costs ~0 KB of initial weight.
function InlineSampleButton({ door }: { door: DoorId }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const sample = DOOR_SAMPLE[door] ?? DOOR_SAMPLE.story;

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handle = () => {
    if (!audioRef.current) {
      const a = new Audio(`${BASE_URL}/voice-samples/doors/${sample.file}.mp3`);
      a.preload = "none";
      a.addEventListener("ended", () => setPlaying(false));
      audioRef.current = a;
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  return (
    <button
      type="button"
      onClick={handle}
      className="inline-flex items-center gap-2 mt-4 text-xs text-primary/75 hover:text-primary transition-colors"
      aria-label={playing ? "Pause sample" : `Play 30 second ${sample.voice} sample`}
    >
      <span className="w-7 h-7 rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
        {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 translate-x-[1px]" />}
      </span>
      {playing ? "Pause sample" : "Hear a 30-second sample"}
      <span className="text-muted-foreground/50">· {sample.voice}</span>
    </button>
  );
}

// Mobile-only sticky bottom CTA. Fades in once the visitor scrolls past the hero.
function SEOStickyCTA({ label, href }: { label?: string; href?: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      aria-hidden={!visible}
      className="md:hidden fixed bottom-0 inset-x-0 z-40 px-4 pb-3 pt-4 pointer-events-none"
      style={{
        background: "linear-gradient(0deg, rgba(10,9,8,0.96) 0%, rgba(10,9,8,0.85) 60%, transparent 100%)",
        transform: visible ? "translateY(0)" : "translateY(110%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.3s ease, opacity 0.3s ease",
      }}
    >
      <Link
        href={href ?? "/create"}
        className="pointer-events-auto flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground text-sm font-bold py-3.5 rounded-2xl shadow-[0_0_28px_-6px_rgba(201,162,39,0.5)] hover:bg-primary/90 active:scale-[0.99] transition-all"
      >
        {label ?? "Create your story"} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// Soft exit-intent nudge — desktop: mouse leaves the viewport from the top;
// mobile: visitor scrolls past 85% of the page. Once-per-session via sessionStorage.
// Uses our existing /samples destination — no fake offers, no email capture.
function ExitNudge() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem("tps_exit_nudge_seen") === "1") return;
    } catch { /* ignore */ }
    let triggered = false;
    const fire = () => {
      if (triggered) return;
      triggered = true;
      try { sessionStorage.setItem("tps_exit_nudge_seen", "1"); } catch { /* ignore */ }
      setOpen(true);
    };
    const onMouseOut = (e: MouseEvent) => {
      // Mouse left the viewport from the top edge.
      if (e.clientY <= 0 && (e.relatedTarget === null || (e.relatedTarget as Node)?.nodeName === "HTML")) {
        fire();
      }
    };
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (total > 0 && scrolled >= total * 0.85) fire();
    };
    // Wait a moment so we don't fire on first paint.
    const t = setTimeout(() => {
      document.addEventListener("mouseout", onMouseOut);
      window.addEventListener("scroll", onScroll, { passive: true });
    }, 4000);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-nudge-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-primary/30 bg-background p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-3 right-3 text-muted-foreground/60 hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
        <p className="text-[10px] uppercase tracking-widest text-primary/70 mb-2">Before you go</p>
        <h3 id="exit-nudge-title" className="font-display text-lg text-foreground mb-2">
          Hear what your story would sound like
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          A 30 second narrated sample from each of the three doors. No sign-up.
        </p>
        <Link
          href="/samples"
          onClick={() => setOpen(false)}
          className="block text-center bg-primary text-primary-foreground py-3 rounded-full font-bold text-sm hover:bg-primary/90"
        >
          Hear a sample →
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="block mx-auto mt-3 text-[11px] uppercase tracking-widest text-muted-foreground/50 hover:text-muted-foreground"
        >
          No thanks
        </button>
      </div>
    </div>
  );
}

const TRUST_ITEMS = [
  { icon: <EyeOff className="w-4 h-4" />, label: "Completely private", sub: "No social features. No shared history." },
  { icon: <Sparkles className="w-4 h-4" />, label: "Written around you", sub: "Generated from scratch around your choices" },
  { icon: <Headphones className="w-4 h-4" />, label: "Premium narration", sub: "Professional voices. Ready the moment you create." },
  { icon: <Lock className="w-4 h-4" />, label: "Yours alone", sub: "Only you can ever access your stories" },
  { icon: <Clock className="w-4 h-4" />, label: "Story in minutes", sub: "From first choice to listening — under three minutes" },
  { icon: <Heart className="w-4 h-4" />, label: "The female imagination at its centre", sub: "Designed around female desire, emotional pacing, and private pleasure", colSpan: true },
];

function HeroCTA({ label, href }: { label?: string; href?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <Link
        href={href ?? "/create"}
        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 w-full sm:w-auto"
      >
        {label ?? "Create your story"} <ArrowRight className="w-4 h-4" />
      </Link>
      <Link
        href="/samples"
        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-primary/40 text-primary text-sm font-medium hover:bg-primary/10 transition-colors w-full sm:w-auto"
      >
        <Headphones className="w-4 h-4" /> Hear a sample first
      </Link>
      <Link
        href="/pricing"
        className="text-xs text-white/55 hover:text-white/85 transition-colors text-center sm:text-left sm:ml-1"
      >
        From £19.92/mo · 5 stories included · cancel anytime
      </Link>
    </div>
  );
}

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

  // Door for the inline sample — first door in the filter, fallback to "story" (Romance).
  const sampleDoor: DoorId = doorFilter?.[0] ?? "story";

  // Three deterministic body images for inline interleave (after sections,
  // after scenarios, after fullPicture). Stable per page via title-hash seed.
  const bodyImgs = useMemo(() => pickBodyImages(config, 3), [config]);

  // FAQPage JSON-LD — eligible for Google's expandable FAQ rich result.
  // Memoised so we don't rebuild the JSON string on every render.
  const faqJsonLd = useMemo(() => {
    if (!config.faqs?.length) return null;
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: config.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    });
  }, [config.faqs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {faqJsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: faqJsonLd }}
        />
      )}
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
            <p className="text-white/75 text-xl leading-relaxed max-w-xl mb-7">
              {config.hero.tagline}
            </p>
            <HeroCTA label={config.heroCTALabel} href={config.heroCTAHref} />
            <InlineSampleButton door={sampleDoor} />
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
            <p className="text-muted-foreground text-xl leading-relaxed mb-7">
              {config.hero.tagline}
            </p>
            <HeroCTA label={config.heroCTALabel} href={config.heroCTAHref} />
            <InlineSampleButton door={sampleDoor} />
          </div>
        </div>
      )}

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

      {/* Hoisted mini doors — surface the three doors high on the page so
          skimmers see the choice without scrolling past the trust grid.
          Suppressed on bedtime pages (showSecondaryDoors) which already have
          their own filtered "Also in The Private Story" placement below. */}
      {!showSecondaryDoors && (
        <div className="flex flex-col items-center gap-3 py-6 px-4 border-b border-border/20">
          <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
            Choose your door
          </p>
          <MiniDoorCTA />
        </div>
      )}

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

      {/* Story anatomy — single spec-sheet exhibit showing every axis of
          personalisation. Replaces the old 9-card casting carousel so depth
          is communicated in one focused composition. */}
      {config.showCastingPreview && (
        <div className="w-full border-t border-b border-border/20 bg-background/40 px-4 md:px-8 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-2">
                Anatomy of one story
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Every choice, on one page.
              </h2>
              <p className="text-sm text-muted-foreground/80 mt-3 max-w-xl mx-auto leading-relaxed">
                A real example of one configured story. Eight axes — and one of 2.6 million+ combinations the system can produce for you.
              </p>
            </div>
            <StoryAnatomyCard />
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <Link
                href="/samples"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Headphones className="w-4 h-4" /> Hear narrated samples →
              </Link>
              <span className="text-white/20 text-xs hidden sm:inline">·</span>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                See how every choice works →
              </Link>
            </div>
          </div>
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
            Built with the female imagination at its centre — for anyone who wants private, emotionally intelligent audio storytelling personalised around their mood and tone, not retrieved from a fixed library.
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
                    {renderParagraphContent(p)}
                  </p>
                ))}
              </div>
              {section.bullets && (
                <ul className="mt-5 space-y-3">
                  {section.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-3 text-muted-foreground">
                      <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                      <span className="leading-relaxed">{parseInlineLinks(b)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Inline body image #1 — between sections and How It Works */}
        {bodyImgs[0] && (
          <figure className="mb-16 -mx-4 md:mx-0 md:rounded-2xl overflow-hidden border-y md:border border-border/20">
            <img
              src={`${BASE_URL}/${bodyImgs[0]}`}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="w-full h-auto block"
            />
          </figure>
        )}

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
                  <p className="text-muted-foreground leading-relaxed">{parseInlineLinks(step.body)}</p>
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
            <p className="text-muted-foreground mb-8 leading-relaxed">{parseInlineLinks(config.scenarios.intro)}</p>
          )}
          <div className="space-y-4">
            {config.scenarios.items.map((s, i) => (
              <div key={i} className="rounded-2xl border border-border/40 bg-white/[0.02] p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-3">{s.heading}</h3>
                <p className="text-muted-foreground leading-relaxed">{parseInlineLinks(s.body)}</p>
              </div>
            ))}
          </div>
          {config.scenarios.interstitial && (
            <div className="mt-8">
              <p className="text-muted-foreground italic">{parseInlineLinks(config.scenarios.interstitial)}</p>
            </div>
          )}
        </section>

        {/* Inline body image #2 — between scenarios and the mid-page CTA */}
        {bodyImgs[1] && (
          <figure className="mb-12 -mx-4 md:mx-0 md:rounded-2xl overflow-hidden border-y md:border border-border/20">
            <img
              src={`${BASE_URL}/${bodyImgs[1]}`}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="w-full h-auto block"
            />
          </figure>
        )}

        {/* Mid-page CTA — restrained re-engagement nudge between Scenarios
            and Benefits. Uses the hero CTA copy/href for continuity. */}
        <section className="mb-16 rounded-2xl border border-primary/30 bg-primary/[0.04] px-6 py-7 md:px-8 md:py-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-2">
            Ready when you are
          </p>
          <p className="text-base md:text-lg text-foreground/90 mb-5 leading-snug max-w-md mx-auto">
            A story made for you, in about a minute. Heard only by you.
          </p>
          <HeroCTA label={config.heroCTALabel} href={config.heroCTAHref} />
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
                <p className="text-muted-foreground text-sm leading-relaxed">{parseInlineLinks(b.body)}</p>
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
                {renderParagraphContent(p)}
              </p>
            ))}
          </div>
        </section>

        {/* Inline body image #3 — between fullPicture and the final CTA */}
        {bodyImgs[2] && (
          <figure className="mb-16 -mx-4 md:mx-0 md:rounded-2xl overflow-hidden border-y md:border border-border/20">
            <img
              src={`${BASE_URL}/${bodyImgs[2]}`}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="w-full h-auto block"
            />
          </figure>
        )}

        {/* Final CTA */}
        <section className="mb-16 rounded-2xl border border-border/40 bg-white/[0.02] p-8 md:p-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-5 leading-snug">
            {config.finalCTA.h2}
          </h2>
          <div className="space-y-4 mb-8">
            {config.finalCTA.paragraphs.map((p, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">
                {parseInlineLinks(p)}
              </p>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-3 items-center">
            <Link
              href="/samples"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Headphones className="w-4 h-4" /> Hear a 30-second sample →
            </Link>
            {config.finalCTA.links.length > 0 && (
              <>
                <span className="text-white/15 text-xs hidden sm:inline">·</span>
                {config.finalCTA.links.map((l, i) => (
                  <Link key={i} href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {l.label} →
                  </Link>
                ))}
              </>
            )}
          </div>
        </section>

        {/* USP bridge */}
        <section className="mb-8">
          <p className="text-[11px] text-muted-foreground/40 uppercase tracking-widest font-medium mb-3">How The Private Story works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/samples"
              className="group rounded-xl border border-primary/30 bg-primary/[0.04] hover:border-primary/50 hover:bg-primary/[0.08] p-4 transition-all duration-200"
            >
              <p className="text-sm font-medium text-primary group-hover:text-primary mb-1 flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5" /> Hear samples
              </p>
              <p className="text-xs text-muted-foreground/70 leading-relaxed">30-second narrated openings from each door — listen before you create.</p>
            </Link>
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
        <section className="mb-12">
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
      </div>

      {/* Three Doors — moved below the body so trope-specific intent isn't gated by a generic choice */}
      <div className="border-t border-border/20 py-12 px-4">
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2">
            The Three Private Doors
          </p>
          <p className="text-sm text-muted-foreground/70">
            Romance, After Dark, or Drift — every story is generated for you, privately, around the door you choose.
          </p>
        </div>
        <ThreeDoors filter={doorFilter} />
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-16">
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
                    {parseInlineLinks(faq.a)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Mobile-only sticky bottom CTA — keeps the create button one tap away */}
      <SEOStickyCTA label={config.heroCTALabel} href={config.heroCTAHref} />

      {/* Soft exit-intent / scroll-end nudge — once per session */}
      <ExitNudge />
    </motion.div>
  );
}
