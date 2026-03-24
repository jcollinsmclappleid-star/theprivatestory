const BASE = import.meta.env.BASE_URL;

interface LogoProps {
  height?: number;
  className?: string;
}

export function Logo({ height = 136, className = "" }: LogoProps) {
  // SVG viewBox is 200 × 290 units
  // The PNG (1024×1536) is scaled so the arch illustration fills the top 195 units,
  // then "Your Romantic / STORY" text fills the remaining ~95 units.
  //
  // PNG content estimates:
  //   arch+person region: x≈100–920, y≈90–800  (820 × 710 px)
  //   "Custom Audio Stories" text: y≈820–1200   (clipped away)
  //
  // Scale = 200 / 820 = 0.2439
  //   → rendered PNG size: 250 × 375 SVG units
  //   → x offset: -(100 × 0.2439) = -24.4
  //   → y offset: -(90  × 0.2439) = -22.0
  //   → clip height: 710 × 0.2439 = 173 units  (clips off old text)
  const w = Math.round(height * (200 / 290));
  const logoSrc = `${BASE}images/logo.png`;

  return (
    <svg
      viewBox="0 0 200 290"
      width={w}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={className}
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <clipPath id="archClip">
          <rect x="0" y="0" width="200" height="175" />
        </clipPath>
      </defs>

      {/* Original arch + person illustration from PNG, old text clipped off */}
      <image
        href={logoSrc}
        x="-24"
        y="-22"
        width="250"
        height="375"
        clipPath="url(#archClip)"
        preserveAspectRatio="none"
      />

      {/* "Your Romantic" — main wordmark */}
      <text
        x="100"
        y="209"
        textAnchor="middle"
        fontFamily="'Playfair Display', Georgia, 'Times New Roman', serif"
        fontSize="21"
        fontWeight="500"
        fill="#c9a06a"
        letterSpacing="0.3"
      >
        Your Romantic
      </text>

      {/* Decorative lines + STORY */}
      <line x1="24" y1="225" x2="60" y2="225" stroke="#c9a06a" strokeWidth="0.8" opacity="0.65" />
      <text
        x="100"
        y="230"
        textAnchor="middle"
        fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
        fontSize="8.5"
        fill="#c9a06a"
        letterSpacing="5"
        opacity="0.9"
      >
        STORY
      </text>
      <line x1="140" y1="225" x2="176" y2="225" stroke="#c9a06a" strokeWidth="0.8" opacity="0.65" />
    </svg>
  );
}

export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return <Logo height={size} className={className} />;
}
