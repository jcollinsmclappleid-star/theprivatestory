import { Link } from "wouter";
import { Sparkles, Moon, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const BASE = import.meta.env.BASE_URL;

const DOORS = [
  {
    id: "story",
    room: "The Story Room",
    name: "Romance",
    shortName: "Romance",
    tagline: "Tension, atmosphere, the feeling you're after.",
    cta: "Create My Story",
    href: "/create",
    Icon: Sparkles,
    image: `${BASE}images/door-romance.png`,
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
    sceneFragments: [
      { text: "Forbidden Pull", x: 12, y: 7,  rot: -3, size: 11, italic: true  },
      { text: "They can't stop.",  x: 46, y: 11, rot: -1, size:  8, italic: true  },
      { text: "Victorian London",  x: 44, y: 20, rot:  2, size: 10, italic: false },
      { text: "The Stranger",      x: 13, y: 34, rot: -5, size:  9, italic: false },
      { text: "Slow Surrender",    x:  8, y: 47, rot:  1, size: 10, italic: false },
      { text: "Luxury Hotel",      x: 50, y: 42, rot:  4, size:  9, italic: false },
      { text: "Inevitable",        x: 20, y: 58, rot: -4, size: 13, italic: false },
      { text: "Charged Dynamic",   x: 52, y: 58, rot:  2, size:  8, italic: false },
    ],
  },
  {
    id: "quiet",
    room: "The Quiet Room",
    name: "Bedtime Stories",
    shortName: "Drift",
    tagline: "Calm, warm, written to let you drift.",
    cta: "Explore Drift",
    href: "/drift",
    Icon: Moon,
    image: `${BASE}images/door-drift.png`,
    accent: "#56b4e0",
    rgb: "86,180,224",
    labelColor: "rgba(86,180,224,0.68)",
    nameColor: "#b8e4f5",
    taglineColor: "rgba(86,180,224,0.44)",
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
    teasers: [
      { text: "Rain on a window. Almost midnight.", blur: false },
      { text: "A voice written for the quiet hour.", blur: false },
      { text: "Close your eyes. This one starts slowly.", blur: false },
    ],
    sceneFragments: [
      { text: "Mountain Retreat",      x: 13, y:  7, rot: -2, size: 10, italic: false },
      { text: "Slow Burn",             x: 52, y: 14, rot: -1, size: 12, italic: false },
      { text: "Rain on a window",      x: 42, y: 22, rot:  3, size: 10, italic: true  },
      { text: "Almost midnight",       x: 15, y: 34, rot: -4, size: 11, italic: true  },
      { text: "Georgian Scotland",     x: 44, y: 39, rot:  2, size:  9, italic: false },
      { text: "Snowbound. Firelit.",   x:  9, y: 48, rot: -1, size:  9, italic: true  },
      { text: "Quiet Intensity",       x: 46, y: 54, rot:  3, size: 10, italic: false },
      { text: "Lingering",             x: 18, y: 59, rot:  1, size: 12, italic: false },
    ],
  },
  {
    id: "dark",
    room: "After Dark",
    name: "Erotica",
    shortName: "After Dark",
    tagline: "Further. Unrestrained. Entirely yours.",
    cta: "Enter After Dark",
    href: "/after-dark",
    Icon: Moon,
    image: `${BASE}images/door-afterdark.png`,
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
    sceneFragments: [
      { text: "Private Club",              x: 13, y:  7, rot: -3, size: 11, italic: false },
      { text: "Rooftop, 3am",              x: 46, y: 14, rot:  2, size: 10, italic: true  },
      { text: "No names. No history.",     x:  7, y: 30, rot: -2, size:  8, italic: true  },
      { text: "VIP Suite",                 x: 52, y: 36, rot:  4, size: 12, italic: false },
      { text: "City below. No witnesses.", x:  6, y: 46, rot: -1, size:  8, italic: true  },
      { text: "Invitation only.",          x: 42, y: 52, rot:  3, size: 10, italic: false },
      { text: "Further.",                  x: 18, y: 58, rot: -5, size: 15, italic: false },
      { text: "Nothing held back.",        x: 50, y: 58, rot:  1, size:  8, italic: true  },
    ],
  },
];

// ---------------------------------------------------------------------------
// MiniDoorCTA — standalone reusable mini doors (named export)
// ---------------------------------------------------------------------------

export function MiniDoorCTA() {
  const [miniHovered, setMiniHovered] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-center gap-6">
      <p
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.20)",
        }}
      >
        Choose where your story begins
      </p>
      <div className="flex items-end justify-center gap-4">
        {DOORS.map((door) => {
          const isMin = miniHovered === door.id;
          return (
            <Link key={door.id} href="/create">
              <div
                onMouseEnter={() => setMiniHovered(door.id)}
                onMouseLeave={() => setMiniHovered(null)}
                style={{
                  width: "76px",
                  height: "114px",
                  background: door.bg,
                  border: `1px solid ${isMin ? door.borderHover : door.border}`,
                  borderRadius: "50px 50px 5px 5px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingBottom: "12px",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: isMin ? "translateY(-5px) scale(1.05)" : "translateY(0) scale(1)",
                  boxShadow: isMin
                    ? `0 0 40px -8px ${door.glow}, 0 12px 28px -12px rgba(0,0,0,0.8)`
                    : `0 4px 16px -8px rgba(0,0,0,0.6)`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "55px",
                    background: `radial-gradient(ellipse at 50% -10%, ${isMin ? door.glow : door.glowPulse} 0%, transparent 70%)`,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: "22%",
                    top: "54%",
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: isMin ? door.knobHover : door.knob,
                    transition: "background 0.3s ease",
                  }}
                />
                <span
                  style={{
                    position: "relative",
                    zIndex: 1,
                    fontSize: "8px",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: isMin ? door.nameColor : door.labelColor,
                    textAlign: "center",
                    transition: "color 0.3s ease",
                    lineHeight: 1.3,
                    paddingInline: "4px",
                  }}
                >
                  {door.shortName}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ThreeDoors — main hero component
// ---------------------------------------------------------------------------

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
    <section className="py-4 px-4 md:px-8 max-w-7xl mx-auto w-full">
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
                {/* Woman listening — world imagery */}
                <img
                  src={door.image}
                  alt=""
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    width: "100%",
                    height: "68%",
                    objectFit: "cover",
                    objectPosition: "center top",
                    borderRadius: "110px 110px 0 0",
                    maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.5) 45%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.5) 45%, transparent 100%)",
                    pointerEvents: "none",
                    zIndex: 1,
                    transition: "opacity 0.4s ease",
                    opacity: isHovered ? 0.85 : 0.65,
                  }}
                />

                {/* Scene fragments — faded casting-room words layered over the scene */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                >
                  {door.sceneFragments.map((frag, fi) => (
                    <span
                      key={fi}
                      style={{
                        position: "absolute",
                        left: `${frag.x}%`,
                        top: `${frag.y}%`,
                        fontSize: `${frag.size}px`,
                        fontStyle: frag.italic ? "italic" : "normal",
                        fontWeight: frag.italic ? 400 : 600,
                        letterSpacing: frag.italic ? "0.01em" : "0.12em",
                        textTransform: frag.italic ? "none" : "uppercase",
                        color: `rgba(${door.rgb},1)`,
                        opacity: isHovered ? 0.18 : 0.07,
                        transform: `rotate(${frag.rot}deg)`,
                        transition: `opacity 0.5s ease ${fi * 0.04}s`,
                        whiteSpace: "nowrap",
                        userSelect: "none",
                        lineHeight: 1,
                      }}
                    >
                      {frag.text}
                    </span>
                  ))}
                </div>

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
                    zIndex: 2,
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
                    zIndex: 2,
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
                    zIndex: 3,
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
                    zIndex: 3,
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
                    zIndex: 4,
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

      {/* ------------------------------------------------------------------ */}
      {/* Mini door CTA — choose your path                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-14 pb-4">
        <MiniDoorCTA />
      </div>
    </section>
  );
}
