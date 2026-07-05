import { useState } from "react";
import { Link } from "wouter";
import { MAIN_FUNNEL_DOOR } from "@/lib/mainFunnelDoor";

export function MiniDoorCTA(_props: { filter?: Array<"story" | "dark" | "quiet"> } = {}) {
  const [miniHovered, setMiniHovered] = useState(false);
  const door = MAIN_FUNNEL_DOOR;
  return (
    <div className="flex flex-col items-center gap-6">
      <p
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.85)",
        }}
      >
        Personalised erotica — private to you
      </p>
      <div className="flex items-end justify-center gap-4">
        {(() => {
          const isMin = miniHovered;
          return (
            <Link href={door.href}>
              <div
                onMouseEnter={() => setMiniHovered(true)}
                onMouseLeave={() => setMiniHovered(false)}
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
        })()}
      </div>
    </div>
  );
}
