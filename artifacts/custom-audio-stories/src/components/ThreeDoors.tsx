import { Link } from "wouter";
import { Sparkles, Moon } from "lucide-react";
import { useState } from "react";

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
    labelColor: "rgba(201,162,39,0.75)",
    nameColor: "#e8d5a0",
    taglineColor: "rgba(201,162,39,0.50)",
    bg: "linear-gradient(170deg, #1c1005 0%, #120d07 40%, #0a0906 100%)",
    border: "rgba(201,162,39,0.28)",
    borderHover: "rgba(201,162,39,0.65)",
    glow: "rgba(201,162,39,0.12)",
    ctaBg: "rgba(201,162,39,0.12)",
    ctaBorder: "rgba(201,162,39,0.40)",
    ctaColor: "#c9a227",
    shimmer: "rgba(201,162,39,0.04)",
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
    labelColor: "rgba(99,102,241,0.70)",
    nameColor: "#c8caff",
    taglineColor: "rgba(155,158,255,0.50)",
    bg: "linear-gradient(170deg, #08081c 0%, #060614 40%, #070709 100%)",
    border: "rgba(99,102,241,0.25)",
    borderHover: "rgba(99,102,241,0.58)",
    glow: "rgba(99,102,241,0.10)",
    ctaBg: "rgba(99,102,241,0.12)",
    ctaBorder: "rgba(99,102,241,0.38)",
    ctaColor: "#9b9fff",
    shimmer: "rgba(99,102,241,0.04)",
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
    labelColor: "rgba(123,143,255,0.70)",
    nameColor: "#9baeff",
    taglineColor: "rgba(123,143,255,0.48)",
    bg: "linear-gradient(170deg, #05050f 0%, #040408 40%, #060608 100%)",
    border: "rgba(123,143,255,0.22)",
    borderHover: "rgba(123,143,255,0.55)",
    glow: "rgba(123,143,255,0.10)",
    ctaBg: "rgba(123,143,255,0.10)",
    ctaBorder: "rgba(123,143,255,0.35)",
    ctaColor: "#9baeff",
    shimmer: "rgba(123,143,255,0.03)",
  },
];

export function ThreeDoors() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="py-14 px-4 md:px-8 max-w-7xl mx-auto w-full">
      <div className="text-center mb-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40 mb-3">
          Choose your experience
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
          Where does your story begin?
        </h2>
        <p className="text-muted-foreground/60 text-sm mt-3 max-w-sm mx-auto leading-relaxed">
          Three rooms. Three experiences. One door to open.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {DOORS.map((door) => {
          const isHovered = hovered === door.id;
          return (
            <Link key={door.id} href={door.href}>
              <div
                onMouseEnter={() => setHovered(door.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: door.bg,
                  border: `1px solid ${isHovered ? door.borderHover : door.border}`,
                  boxShadow: isHovered
                    ? `0 0 40px -8px ${door.glow}, inset 0 1px 0 ${door.shimmer}`
                    : `inset 0 1px 0 ${door.shimmer}`,
                  transform: isHovered ? "translateY(-3px) scale(1.01)" : "translateY(0) scale(1)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                className="relative overflow-hidden rounded-2xl p-7 md:p-8 cursor-pointer min-h-[280px] md:min-h-[320px] flex flex-col justify-between"
              >
                {/* Atmospheric top glow */}
                <div
                  className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 50% -20%, ${door.glow} 0%, transparent 70%)`,
                  }}
                />

                {/* Door frame lines — subtle vertical structure */}
                <div
                  className="absolute top-6 bottom-6 left-5 w-px pointer-events-none"
                  style={{ background: `linear-gradient(to bottom, transparent, ${door.border}, transparent)` }}
                />
                <div
                  className="absolute top-6 bottom-6 right-5 w-px pointer-events-none"
                  style={{ background: `linear-gradient(to bottom, transparent, ${door.border}, transparent)` }}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-5">
                    <door.Icon
                      className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ color: door.labelColor }}
                    />
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.2em]"
                      style={{ color: door.labelColor }}
                    >
                      {door.room}
                    </span>
                  </div>

                  <p
                    className="font-display text-3xl md:text-4xl font-bold leading-tight mb-3"
                    style={{ color: door.nameColor }}
                  >
                    {door.name}
                  </p>

                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: door.taglineColor }}
                  >
                    {door.tagline}
                  </p>
                </div>

                {/* CTA */}
                <div className="relative z-10 mt-8">
                  <span
                    className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full transition-all"
                    style={{
                      background: door.ctaBg,
                      border: `1px solid ${isHovered ? door.borderHover : door.ctaBorder}`,
                      color: door.ctaColor,
                    }}
                  >
                    <door.Icon className="w-3 h-3" />
                    {door.cta}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
