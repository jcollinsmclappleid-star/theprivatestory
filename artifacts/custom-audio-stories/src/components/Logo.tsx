const BASE = import.meta.env.BASE_URL;

/**
 * Logo assets ship on a black plate. Screen blend on a site-purple backing
 * replaces that black with the same plum as the rest of the site.
 */
const LOGO_IMG_STYLE = {
  display: "block",
  mixBlendMode: "screen" as const,
  filter: "brightness(1.06) saturate(0.9)",
} as const;

function LogoFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center max-w-full bg-transparent ${className}`}
      style={{ lineHeight: 0, flexShrink: 1 }}
    >
      {children}
    </span>
  );
}

interface LogoProps {
  height?: number;
  className?: string;
  /** Mobile nav — hide the circular icon, show wordmark only. */
  wordmarkOnly?: boolean;
}

/** Horizontal logo — icon + "THE PRIVATE STORY" text side by side. Best for nav bars. */
export function Logo({ height = 44, className = "", wordmarkOnly = false }: LogoProps) {
  if (wordmarkOnly) {
    return (
      <LogoFrame className={`overflow-hidden ${className}`}>
        <img
          src={`${BASE}images/logo-nav.webp`}
          alt="The Private Story"
          style={{
            height: `${height}px`,
            width: "auto",
            maxWidth: "100%",
            objectFit: "contain",
            marginLeft: `-${Math.round(height * 0.92)}px`,
            ...LOGO_IMG_STYLE,
          }}
        />
      </LogoFrame>
    );
  }

  return (
    <LogoFrame className={className}>
      <img
        src={`${BASE}images/logo-nav.webp`}
        alt="The Private Story"
        style={{ height: `${height}px`, width: "auto", maxWidth: "100%", objectFit: "contain", ...LOGO_IMG_STYLE }}
      />
    </LogoFrame>
  );
}

/** Stacked logo — icon above "THE PRIVATE STORY" text. Best for centered/hero placements. */
export function LogoFull({ height = 120, className = "" }: { height?: number; className?: string }) {
  return (
    <LogoFrame className={className}>
      <img
        src={`${BASE}images/logo-full.webp`}
        alt="The Private Story"
        style={{ height: `${height}px`, width: "auto", maxWidth: "100%", objectFit: "contain", ...LOGO_IMG_STYLE }}
      />
    </LogoFrame>
  );
}

/** Favicon emblem — gold headphones on black plate; screen blend on site purple. */
export function LogoFaviconHero({ size = 96, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden bg-transparent ${className}`}
      style={{ lineHeight: 0, flexShrink: 0, width: size, height: size }}
    >
      <img
        src={`${BASE}favicon-512.png`}
        srcSet={`${BASE}favicon-192.png 192w, ${BASE}favicon-512.png 512w`}
        sizes={`${size}px`}
        alt="The Private Story"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          ...LOGO_IMG_STYLE,
        }}
      />
    </span>
  );
}

/** Hero wordmark — favicon emblem above headline (replaces nav wordmark in hero). */
export function LogoHero({ size = 96, className = "" }: { size?: number; className?: string }) {
  return <LogoFaviconHero size={size} className={className} />;
}

/** Hero mark — gold headphones on black plate; screen blend drops the plate on site purple. */
export function LogoHeroMark({ size = 54, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden bg-transparent ${className}`}
      style={{ lineHeight: 0, flexShrink: 0, width: size, height: size }}
      aria-hidden
    >
      <img
        src={`${BASE}images/logo-icon.png`}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          ...LOGO_IMG_STYLE,
        }}
      />
    </span>
  );
}

/** Circle icon only — favicons and small badges (not used in main nav/hero). */
export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-full bg-transparent ${className}`}
      style={{
        lineHeight: 0,
        flexShrink: 0,
        width: size,
        height: size,
      }}
    >
      <img
        src={`${BASE}images/logo-icon.png`}
        alt="The Private Story"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          ...LOGO_IMG_STYLE,
        }}
      />
    </span>
  );
}
