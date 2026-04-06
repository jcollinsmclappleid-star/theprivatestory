import { Link } from "wouter";
import { Sparkles, Moon, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const DOORS = [
  {
    id: "story",
    room: "The Story Room",
    name: "Romance",
    tagline: "Tension, atmosphere, the feeling you're after.",
    cta: "Create My Story",
    href: "/create",
    Icon: Sparkles,
    accent: "#c9a227",
    rgb: "201,162,39",
    labelColor: "rgba(201,162,39,0.72)",
    nameColor: "#e8d5a0",
    taglineColor: "rgba(201,162,39,0.46)",
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
    teasers: [
      { text: "Forbidden Pull · Victorian London", blur: false },
      { text: "He should have left an hour ago.", blur: false },
      { text: "Her name is yours. So is his.", blur: false },
    ],
  },
  {
    id: "quiet",
    room: "The Quiet Room",
    name: "Bedtime Stories",
    tagline: "Calm, warm, written to let you drift.",
    cta: "Explore Drift",
    href: "/drift",
    Icon: Moon,
    accent: "#8b8fff",
    rgb: "99,102,241",
    labelColor: "rgba(99,102,241,0.68)",
    nameColor: "#c8caff",
    taglineColor: "rgba(155,158,255,0.46)",
    bg: "linear-gradient(180deg, #08081d 0%, #060614 55%, #070709 100%)",
    border: "rgba(99,102,241,0.20)",
    borderHover: "rgba(99,102,241,0.62)",
    borderPulse: "rgba(99,102,241,0.38)",
    glow: "rgba(99,102,241,0.18)",
    glowPulse: "rgba(99,102,241,0.08)",
    panelBorder: "rgba(99,102,241,0.11)",
    panelBorderHover: "rgba(99,102,241,0.26)",
    knob: "rgba(99,102,241,0.26)",
    knobHover: "rgba(99,102,241,0.60)",
    underLight: "rgba(99,102,241,0.10)",
    teasers: [
      { text: "Rain on a window. Almost midnight.", blur: false },
      { text: "A voice written for the quiet hour.", blur: false },
      { text: "Close your eyes. This one starts slowly.", blur: false },
    ],
  },
  {
    id: "dark",
    room: "After Dark",
    name: "Erotica",
    tagline: "Further. Unrestrained. Entirely yours.",
    cta: "Enter After Dark",
    href: "/after-dark",
    Icon: Moon,
    accent: "#7b8fff",
    rgb: "123,143,255",
    labelColor: "rgba(123,143,255,0.68)",
    nameColor: "#9baeff",
    taglineColor: "rgba(123,143,255,0.44)",
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
    teasers: [
      { text: "Further than the others.", blur: false },
      { text: "Only you will know what's behind this door.", blur: false },
      { text: "Nothing held back.", blur: true },
    ],
  },
];

export function ThreeDoors() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pulsing, setPulsing] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsing((p) => (p + 1) % 3);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-12">
        <p
          className="text-[9px] font-bold uppercase tracking-[0.40em] mb-5"
          style={{ color: "rgba(255,255,255,0.15)" }}
        >
          Three Doors
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">
          Which door calls to you?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.28)" }} className="text-sm max-w-[220px] mx-auto leading-relaxed">
          Your story is on the other side.
        </p>
      </div>

      {/* The three doors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-4xl mx-auto">
        {DOORS.map((door, idx) => {
          const isHovered = hovered === door.id;
          const isPulsing = hovered === null && pulsing === idx;

          return (
            <Link key={door.id} href={door.href}>
              <div
                onMouseEnter={() => setHovered(door.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: door.bg,
                  border: `1px solid ${isHovered ? door.borderHover : isPulsing ? door.borderPulse : door.border}`,
                  boxShadow: isHovered
                    ? `0 0 70px -12px ${door.glow}, 0 24px 48px -20px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.04)`
                    : isPulsing
                    ? `0 0 35px -12px ${door.glowPulse}, 0 8px 24px -16px rgba(0,0,0,0.7)`
                    : `0 8px 24px -16px rgba(0,0,0,0.6)`,
                  transform: isHovered
                    ? "translateY(-6px) scale(1.02)"
                    : isPulsing
                    ? "translateY(-1px) scale(1.002)"
                    : "translateY(0) scale(1)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  borderRadius: "110px 110px 8px 8px",
                  cursor: "pointer",
                  minHeight: "420px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Arch glow — light bleeding through the top of the door */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "200px",
                    background: `radial-gradient(ellipse at 50% -15%, ${isHovered ? door.glow : isPulsing ? door.glowPulse : "rgba(255,255,255,0.008)"} 0%, transparent 70%)`,
                    transition: "background 0.5s ease",
                    pointerEvents: "none",
                  }}
                />

                {/* Under-door light — glows at the bottom when hovered */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: "10%",
                    right: "10%",
                    height: "3px",
                    background: isHovered
                      ? `radial-gradient(ellipse at 50% 100%, ${door.underLight} 0%, transparent 80%)`
                      : "transparent",
                    transition: "background 0.4s ease",
                    filter: "blur(3px)",
                    pointerEvents: "none",
                  }}
                />

                {/* Top inset door panel (arched) */}
                <div
                  style={{
                    position: "absolute",
                    top: "9%",
                    left: "13%",
                    right: "13%",
                    height: "34%",
                    border: `1px solid ${isHovered ? door.panelBorderHover : door.panelBorder}`,
                    borderRadius: "80px 80px 4px 4px",
                    boxShadow: isHovered ? `inset 0 6px 24px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.02)` : "none",
                    transition: "all 0.4s ease",
                    pointerEvents: "none",
                  }}
                />

                {/* Bottom inset door panel (rectangular) */}
                <div
                  style={{
                    position: "absolute",
                    top: "47%",
                    bottom: "9%",
                    left: "13%",
                    right: "13%",
                    border: `1px solid ${isHovered ? door.panelBorderHover : door.panelBorder}`,
                    borderRadius: "4px",
                    boxShadow: isHovered ? `inset 0 4px 16px rgba(0,0,0,0.4)` : "none",
                    transition: "all 0.4s ease",
                    pointerEvents: "none",
                  }}
                />

                {/* Door knob */}
                <div
                  style={{
                    position: "absolute",
                    right: "17%",
                    top: "60%",
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    background: isHovered ? door.knobHover : door.knob,
                    boxShadow: isHovered
                      ? `0 0 10px 3px rgba(${door.rgb},0.40), inset 0 1px 2px rgba(255,255,255,0.2)`
                      : "none",
                    transition: "all 0.4s ease",
                    pointerEvents: "none",
                  }}
                />

                {/* Content — bottom-aligned */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    flex: 1,
                    padding: "28px",
                    paddingBottom: "32px",
                  }}
                >
                  {/* Teaser lines — revealed on hover */}
                  <div
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? "translateY(0)" : "translateY(14px)",
                      transition: "all 0.38s ease",
                      marginBottom: "18px",
                    }}
                  >
                    {door.teasers.map((teaser, ti) => (
                      <p
                        key={ti}
                        style={{
                          fontSize: "11px",
                          lineHeight: 1.7,
                          color: `rgba(${door.rgb},${0.72 - ti * 0.20})`,
                          filter: teaser.blur ? "blur(2.5px)" : "none",
                          marginBottom: "3px",
                          transition: `all 0.38s ease ${ti * 0.07}s`,
                        }}
                      >
                        {teaser.text}
                      </p>
                    ))}
                  </div>

                  {/* Room label */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      marginBottom: "10px",
                    }}
                  >
                    <door.Icon style={{ width: 11, height: 11, color: door.labelColor, flexShrink: 0 }} />
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 700,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: door.labelColor,
                      }}
                    >
                      {door.room}
                    </span>
                  </div>

                  {/* Category name */}
                  <p
                    className="font-display"
                    style={{
                      fontSize: "clamp(22px, 4vw, 30px)",
                      fontWeight: 700,
                      lineHeight: 1.15,
                      color: door.nameColor,
                      marginBottom: "8px",
                    }}
                  >
                    {door.name}
                  </p>

                  {/* Tagline */}
                  <p
                    style={{
                      fontSize: "12px",
                      lineHeight: 1.65,
                      color: door.taglineColor,
                      marginBottom: "20px",
                    }}
                  >
                    {door.tagline}
                  </p>

                  {/* CTA pill */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "7px 16px",
                      borderRadius: "999px",
                      background: `rgba(${door.rgb},${isHovered ? 0.18 : 0.09})`,
                      border: `1px solid rgba(${door.rgb},${isHovered ? 0.58 : 0.30})`,
                      color: door.nameColor,
                      width: "fit-content",
                      transition: "all 0.4s ease",
                    }}
                  >
                    <ChevronRight style={{ width: 11, height: 11 }} />
                    {door.cta}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer hint */}
      <p
        className="text-center mt-8"
        style={{ fontSize: "10px", color: "rgba(255,255,255,0.12)", letterSpacing: "0.05em" }}
      >
        Every door leads to a different world. Only one has your name on it.
      </p>
    </section>
  );
}
