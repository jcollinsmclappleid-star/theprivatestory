const BASE = import.meta.env.BASE_URL;

const SCREEN_STYLE = {
  display: "block",
  mixBlendMode: "screen" as const,
  filter: "brightness(1.15)",
} as const;

interface LogoProps {
  height?: number;
  className?: string;
}

/** Horizontal logo — icon + "THE PRIVATE STORY" text side by side. Best for nav bars. */
export function Logo({ height = 44, className = "" }: LogoProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        lineHeight: 0,
        flexShrink: 0,
      }}
      className={className}
    >
      <img
        src={`${BASE}images/logo-nav.png`}
        alt="The Private Story"
        style={{ height: `${height}px`, width: "auto", ...SCREEN_STYLE }}
      />
    </span>
  );
}

/** Stacked logo — icon above "THE PRIVATE STORY" text. Best for centered/hero placements. */
export function LogoFull({ height = 120, className = "" }: { height?: number; className?: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 0,
        flexShrink: 0,
      }}
      className={className}
    >
      <img
        src={`${BASE}images/logo-full.png`}
        alt="The Private Story"
        style={{ height: `${height}px`, width: "auto", ...SCREEN_STYLE }}
      />
    </span>
  );
}

/** Circle icon only — the woman-in-headphones mark, clipped to a circle. Best for favicons and small badges. */
export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 0,
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
      }}
      className={className}
    >
      <img
        src={`${BASE}images/logo-icon.png`}
        alt="The Private Story"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </span>
  );
}
