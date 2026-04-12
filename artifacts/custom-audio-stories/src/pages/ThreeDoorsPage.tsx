import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Sparkles, Moon, ArrowRight } from "lucide-react";

const BASE = import.meta.env.BASE_URL;

const DOORS = [
  {
    id: "story",
    name: "Romance",
    room: "The Story Room",
    tagline: "Tension, atmosphere, the feeling you're after.",
    href: "/create",
    cta: "Create My Story",
    ctaIcon: Sparkles,
    image: `${BASE}images/door-romance.png`,
    accent: "#c9a227",
    rgb: "201,162,39",
    nameColor: "#e8d5a0",
    labelColor: "rgba(201,162,39,0.72)",
    taglineColor: "rgba(201,162,39,0.90)",
    bg: "linear-gradient(180deg, #1d1105 0%, #130d07 55%, #0b0906 100%)",
    border: "rgba(201,162,39,0.24)",
    borderHover: "rgba(201,162,39,0.70)",
    borderPulse: "rgba(201,162,39,0.42)",
    glow: "rgba(201,162,39,0.20)",
    glowPulse: "rgba(201,162,39,0.10)",
    panelBorder: "rgba(201,162,39,0.13)",
    panelBorderHover: "rgba(201,162,39,0.30)",
    knob: "rgba(201,162,39,0.28)",
    knobHover: "rgba(201,162,39,0.65)",
    underLight: "rgba(201,162,39,0.14)",
    moodImages: [
      { src: `${BASE}images/category-historical_romance.png`, x: 8,  y: 7,  rot: -4, w: 52 },
      { src: `${BASE}images/category-forbidden_desire.png`,   x: 52, y: 11, rot:  3, w: 50 },
      { src: `${BASE}images/category-slow_burn.png`,          x: 10, y: 40, rot: -6, w: 48 },
      { src: `${BASE}images/category-second_chance.png`,      x: 50, y: 43, rot:  5, w: 50 },
    ],
    description: "Every story is built around the specific pull you're after — forbidden, slow, sharp, or deeply felt. You decide who they are, what they're called, and exactly how far things go. The words are written for you and no one else. A story that sounds like a secret.",
    tags: [
      "Forbidden pull",
      "Historical desire",
      "Slow burn",
      "Second chance",
      "Enemies to lovers",
      "Dark romance",
      "Quiet intensity",
    ],
    details: ["Cast it yourself", "Around 10 mins per story (varies)", "Entirely private", "Saved to your account"],
    ageGate: false,
    comparisonTone: "Romantic & emotionally charged",
    comparisonIntensity: 3,
    comparisonNote: "Tension, longing, and the pull before it finally breaks.",
  },
  {
    id: "dark",
    name: "After Dark",
    room: "The Story Room",
    tagline: "You build it. They narrate it. You hear it alone.",
    href: "/after-dark",
    cta: "Enter After Dark",
    ctaIcon: Moon,
    image: `${BASE}images/door-afterdark.png`,
    accent: "#7b8fff",
    rgb: "123,143,255",
    nameColor: "#9baeff",
    labelColor: "rgba(123,143,255,0.68)",
    taglineColor: "rgba(123,143,255,0.90)",
    bg: "linear-gradient(180deg, #05050f 0%, #040409 55%, #060608 100%)",
    border: "rgba(123,143,255,0.18)",
    borderHover: "rgba(123,143,255,0.60)",
    borderPulse: "rgba(123,143,255,0.35)",
    glow: "rgba(123,143,255,0.16)",
    glowPulse: "rgba(123,143,255,0.07)",
    panelBorder: "rgba(123,143,255,0.10)",
    panelBorderHover: "rgba(123,143,255,0.24)",
    knob: "rgba(123,143,255,0.24)",
    knobHover: "rgba(123,143,255,0.58)",
    underLight: "rgba(123,143,255,0.09)",
    moodImages: [
      { src: `${BASE}images/category-dark_romance.png`,         x:  9, y:  7, rot: -4, w: 52 },
      { src: `${BASE}images/category-dominant_surrendered.png`, x: 50, y: 10, rot:  3, w: 50 },
      { src: `${BASE}images/category-forbidden_desire.png`,     x: 28, y: 22, rot: -2, w: 46 },
      { src: `${BASE}images/category-late_night.png`,           x: 10, y: 41, rot: -6, w: 48 },
      { src: `${BASE}images/category-explicit_collection.png`,  x: 48, y: 44, rot:  5, w: 50 },
    ],
    description: "You don't pick from a list. You build it from scratch. Name your character, choose the dynamic — power exchange, tender intensity, something darker. Shape the scene. Then a narrator brings it to life, directly in your ears. Spicy, unrestrained, and built to your exact specification. Nothing template, nothing generic. Every detail yours, every time.",
    tags: [
      "Power Exchange",
      "The Forbidden",
      "Slow Burn",
      "In Character",
      "Eyes On Us",
      "Sweet & Savage",
      "More Than Two",
      "The Edge",
      "Dark Territory",
      "Her Power",
    ],
    details: ["Spicy adult content", "18+ adults only", "Name & cast your character", "Every detail built by you"],
    ageGate: true,
    comparisonTone: "Spicy & unrestrained",
    comparisonIntensity: 4,
    comparisonNote: "Adult fiction built to your exact specification.",
  },
  {
    id: "quiet",
    name: "Drift",
    room: "The Quiet Room",
    tagline: "Calm, warm, written to let you drift.",
    href: "/drift",
    cta: "Explore Drift",
    ctaIcon: Moon,
    image: `${BASE}images/door-drift.png`,
    accent: "#56b4e0",
    rgb: "86,180,224",
    nameColor: "#b8e4f5",
    labelColor: "rgba(86,180,224,0.68)",
    taglineColor: "rgba(86,180,224,0.90)",
    bg: "linear-gradient(180deg, #04111a 0%, #030d14 55%, #050a0d 100%)",
    border: "rgba(86,180,224,0.20)",
    borderHover: "rgba(86,180,224,0.62)",
    borderPulse: "rgba(86,180,224,0.36)",
    glow: "rgba(86,180,224,0.18)",
    glowPulse: "rgba(86,180,224,0.08)",
    panelBorder: "rgba(86,180,224,0.11)",
    panelBorderHover: "rgba(86,180,224,0.26)",
    knob: "rgba(86,180,224,0.24)",
    knobHover: "rgba(86,180,224,0.58)",
    underLight: "rgba(86,180,224,0.10)",
    moodImages: [
      { src: `${BASE}images/category-slow_burn.png`,        x: 10, y:  7, rot: -3, w: 52 },
      { src: `${BASE}images/category-late_night.png`,       x: 50, y: 11, rot:  4, w: 50 },
      { src: `${BASE}images/category-emotional_desire.png`, x: 12, y: 41, rot: -5, w: 48 },
      { src: `${BASE}images/category-second_chance.png`,    x: 49, y: 45, rot:  3, w: 50 },
    ],
    description: "Written for the hour when everything else has gone quiet. Intimate and warm — the specific comfort of a voice that knows exactly what the late night feels like. Softly sensual, emotionally close. Close your eyes. This one starts slowly and holds you all the way through.",
    tags: [
      "The Late Night",
      "Come Home",
      "Warm Weight",
      "The Long Week",
      "Last Hour",
      "Rain on a window",
      "Almost asleep",
    ],
    details: ["Softly sensual", "Written for the quiet hour", "Emotionally close", "Around 10 mins per story (varies)"],
    ageGate: false,
    comparisonTone: "Warm & intimately close",
    comparisonIntensity: 2,
    comparisonNote: "Presence, warmth, and the feeling of not being alone.",
  },
];

function DoorCard({ door, tall = false }: { door: typeof DOORS[0]; tall?: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={door.href}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: door.bg,
          border: `1px solid ${hovered ? door.borderHover : door.border}`,
          boxShadow: hovered
            ? `0 0 80px -12px ${door.glow}, 0 24px 48px -20px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.04)`
            : `0 8px 24px -16px rgba(0,0,0,0.6)`,
          transform: hovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          borderRadius: "110px 110px 8px 8px",
          cursor: "pointer",
          minHeight: tall ? "560px" : "420px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <img
          src={door.image}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute", top: 0, left: 0, right: 0,
            width: "100%", height: "68%",
            objectFit: "cover", objectPosition: "center top",
            borderRadius: "110px 110px 0 0",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.5) 45%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.5) 45%, transparent 100%)",
            pointerEvents: "none", zIndex: 1,
            transition: "opacity 0.4s ease",
            opacity: hovered ? 0.85 : 0.65,
          }}
        />

        {door.moodImages.map((img, mi) => (
          <div
            key={mi}
            style={{
              position: "absolute",
              left: `${img.x}%`, top: `${img.y}%`,
              width: `${img.w}px`, height: `${Math.round(img.w * 1.35)}px`,
              transform: `rotate(${img.rot}deg)`,
              opacity: hovered ? 0.72 : 0.40,
              transition: `opacity 0.55s ease ${mi * 0.06}s`,
              pointerEvents: "none", zIndex: 2,
              borderRadius: "3px", overflow: "hidden",
              boxShadow: "0 3px 12px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.10)",
            }}
          >
            <img src={img.src} alt="" aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}

        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "200px", background: `radial-gradient(ellipse at 50% -15%, ${hovered ? door.glow : "rgba(255,255,255,0.008)"} 0%, transparent 70%)`, transition: "background 0.5s ease", pointerEvents: "none", zIndex: 2 }} />
        <div style={{ position: "absolute", top: "9%", left: "13%", right: "13%", height: "34%", border: `1px solid ${hovered ? door.panelBorderHover : door.panelBorder}`, borderRadius: "80px 80px 4px 4px", transition: "all 0.4s ease", pointerEvents: "none", zIndex: 3 }} />
        <div style={{ position: "absolute", top: "47%", bottom: "9%", left: "13%", right: "13%", border: `1px solid ${hovered ? door.panelBorderHover : door.panelBorder}`, borderRadius: "4px", transition: "all 0.4s ease", pointerEvents: "none", zIndex: 3 }} />
        <div style={{ position: "absolute", right: "17%", top: "60%", width: "9px", height: "9px", borderRadius: "50%", background: hovered ? door.knobHover : door.knob, boxShadow: hovered ? `0 0 10px 3px rgba(${door.rgb},0.40)` : "none", transition: "all 0.4s ease", pointerEvents: "none", zIndex: 4 }} />

        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", justifyContent: "flex-end", flex: 1, padding: "28px", paddingBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "10px" }}>
            <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: door.labelColor }}>{door.room}</span>
          </div>
          <p className="font-display" style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 700, lineHeight: 1.15, color: door.nameColor, marginBottom: "8px" }}>{door.name}</p>
          <p style={{ fontSize: "12px", lineHeight: 1.65, color: door.taglineColor, marginBottom: "20px" }}>{door.tagline}</p>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 700, padding: "7px 16px", borderRadius: "999px", background: `rgba(${door.rgb},${hovered ? 0.18 : 0.09})`, border: `1px solid rgba(${door.rgb},${hovered ? 0.58 : 0.30})`, color: door.nameColor, width: "fit-content", transition: "all 0.4s ease" }}>
            <ArrowRight style={{ width: 11, height: 11 }} />
            {door.cta}
          </span>
        </div>
      </div>
    </Link>
  );
}

function IntensityDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1 mt-1">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: i <= level ? "currentColor" : "rgba(255,255,255,0.12)" }}
        />
      ))}
    </div>
  );
}

export default function ThreeDoorsPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-[#060608]"
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-4 sm:px-8 pt-8 pb-4 max-w-7xl mx-auto flex items-center gap-4">
        <Link href="/">
          <button className="flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-foreground transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
        </Link>
      </div>

      {/* ── Hero copy ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-center px-4 pt-6 pb-10"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-5">
          Three worlds. One private.
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-5">
          Behind each door,<br className="hidden sm:block" />
          <span className="text-white/50 font-normal"> something different waits.</span>
        </h1>
        <p className="text-muted-foreground/70 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          All three are private. All three are built around you. The question is
          which kind of story is calling right now.
        </p>
      </motion.div>

      {/* ── Three doors hero ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="px-4 sm:px-8 max-w-5xl mx-auto mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {DOORS.map((door) => (
            <DoorCard key={door.id} door={door} tall />
          ))}
        </div>
      </motion.div>

      {/* ── Per-door detail sections ────────────────────────────── */}
      <div className="px-4 sm:px-8 max-w-5xl mx-auto mt-14 space-y-6">
        {DOORS.map((door, idx) => (
          <motion.div
            key={door.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
            style={{
              background: `linear-gradient(135deg, rgba(${door.rgb},0.06) 0%, rgba(0,0,0,0) 60%)`,
              border: `1px solid rgba(${door.rgb},0.14)`,
            }}
            className="rounded-2xl p-7 md:p-9"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              {/* Left — description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ color: door.accent, background: `rgba(${door.rgb},0.12)`, border: `1px solid rgba(${door.rgb},0.25)` }}
                  >
                    {door.room}
                  </span>
                  {door.ageGate && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-red-400/70 bg-red-500/8 border border-red-500/18">
                      18+ Adults only
                    </span>
                  )}
                </div>

                <h2
                  className="font-display text-2xl md:text-3xl font-bold mb-3 leading-snug"
                  style={{ color: door.nameColor }}
                >
                  {door.name}
                </h2>

                <p className="text-muted-foreground/80 text-sm leading-relaxed mb-6 max-w-lg">
                  {door.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-7">
                  {door.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium px-3 py-1.5 rounded-full"
                      style={{ color: `rgba(${door.rgb},0.9)`, background: `rgba(${door.rgb},0.08)`, border: `1px solid rgba(${door.rgb},0.20)` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Link href={door.href}>
                  <button
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105 hover:brightness-110"
                    style={{ background: `rgba(${door.rgb},0.18)`, border: `1px solid rgba(${door.rgb},0.50)`, color: door.nameColor }}
                  >
                    <door.ctaIcon className="w-4 h-4" />
                    {door.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>

              {/* Right — detail pills */}
              <div className="flex-shrink-0 md:w-48">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">
                  What to expect
                </p>
                <ul className="space-y-2">
                  {door.details.map((d) => (
                    <li
                      key={d}
                      className="flex items-center gap-2 text-xs font-medium"
                      style={{ color: `rgba(${door.rgb},0.80)` }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: door.accent }}
                      />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Comparison strip ───────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="px-4 sm:px-8 max-w-5xl mx-auto mt-16 mb-8"
      >
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-white/25 mb-3">Compare</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Side by side.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DOORS.map((door) => (
            <div
              key={door.id}
              className="rounded-2xl p-6"
              style={{
                background: `linear-gradient(160deg, rgba(${door.rgb},0.07) 0%, rgba(0,0,0,0) 70%)`,
                border: `1px solid rgba(${door.rgb},0.16)`,
              }}
            >
              <p
                className="font-display text-lg font-bold mb-1"
                style={{ color: door.nameColor }}
              >
                {door.name}
              </p>
              <p className="text-xs mb-4" style={{ color: `rgba(${door.rgb},0.70)` }}>
                {door.comparisonTone}
              </p>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/25 mb-1.5">Intensity</p>
                  <div style={{ color: door.accent }}>
                    <IntensityDots level={door.comparisonIntensity} />
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 mt-1.5 leading-relaxed">
                    {door.comparisonNote}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/25 mb-1.5">Story length</p>
                  <p className="text-xs font-medium" style={{ color: `rgba(${door.rgb},0.80)` }}>Around 10 mins per story (varies)</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/25 mb-1.5">Personalisation</p>
                  <p className="text-xs font-medium" style={{ color: `rgba(${door.rgb},0.80)` }}>Full casting — your name, your dynamic</p>
                </div>

                {door.ageGate && (
                  <div className="pt-1">
                    <p className="text-[11px] text-red-400/60 font-medium">18+ adults only</p>
                  </div>
                )}
              </div>

              <Link href={door.href}>
                <button
                  className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-110"
                  style={{ background: `rgba(${door.rgb},0.14)`, border: `1px solid rgba(${door.rgb},0.35)`, color: door.nameColor }}
                >
                  {door.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── Final CTA ──────────────────────────────────────────── */}
      <section className="px-4 sm:px-8 max-w-5xl mx-auto py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-white/25 mb-5">
          All plans include all three worlds
        </p>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
          One subscription. Every door open.
        </h2>
        <p className="text-muted-foreground/60 text-sm max-w-sm mx-auto mb-8">
          Every plan includes the full creation room across Romance, After Dark, and Drift.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/pricing">
            <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all hover:scale-105">
              <Sparkles className="w-4 h-4" />
              See pricing
            </button>
          </Link>
          <Link href="/">
            <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border/30 text-muted-foreground/70 hover:text-foreground hover:border-border/60 transition-all text-sm">
              Back to home
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground/40 mt-6">
          Private from the first word. Monthly plans cancel any time.{" "}
          <Link href="/privacy" className="hover:text-primary/70 transition-colors">How we protect it →</Link>
        </p>
      </section>
    </motion.div>
  );
}
