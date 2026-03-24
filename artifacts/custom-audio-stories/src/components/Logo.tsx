interface LogoProps {
  height?: number;
  className?: string;
}

export function Logo({ height = 56, className = "" }: LogoProps) {
  const w = Math.round(height * (200 / 290));
  return (
    <svg
      viewBox="0 0 200 290"
      width={w}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", flexShrink: 0 }}
    >
      {/* Arch frame */}
      <path
        d="M 38 178 L 38 88 Q 38 20 100 20 Q 162 20 162 88 L 162 178 Z"
        fill="none"
        stroke="#c9a06a"
        strokeWidth="1.6"
        opacity="0.85"
      />
      {/* Bottom bar of arch */}
      <line x1="38" y1="178" x2="162" y2="178" stroke="#c9a06a" strokeWidth="1" opacity="0.5" />

      {/* Crescent moon — outer arc */}
      <path
        d="M 100 50 A 30 30 0 1 1 86 127 A 20 20 0 1 0 100 50 Z"
        fill="#c9a06a"
        opacity="0.75"
      />

      {/* Stars / sparkles */}
      {/* Top-right sparkle */}
      <path
        d="M 143 38 L 144.4 42 L 148.5 43.3 L 144.4 44.6 L 143 48.5 L 141.6 44.6 L 137.5 43.3 L 141.6 42 Z"
        fill="#c9a06a"
        opacity="0.7"
      />
      {/* Small stars */}
      <circle cx="55" cy="52" r="1.8" fill="#c9a06a" opacity="0.6" />
      <circle cx="148" cy="68" r="1.2" fill="#c9a06a" opacity="0.5" />
      <circle cx="62" cy="148" r="1.2" fill="#c9a06a" opacity="0.4" />
      <circle cx="140" cy="140" r="1.5" fill="#c9a06a" opacity="0.45" />
      <circle cx="50" cy="110" r="1" fill="#c9a06a" opacity="0.35" />
      <circle cx="152" cy="105" r="1" fill="#c9a06a" opacity="0.35" />

      {/* Floating quill / pen stroke beneath moon */}
      <path
        d="M 78 155 Q 100 148 122 155"
        fill="none"
        stroke="#c9a06a"
        strokeWidth="0.8"
        opacity="0.4"
        strokeLinecap="round"
      />

      {/* "After Dusk" — main wordmark */}
      <text
        x="100"
        y="212"
        textAnchor="middle"
        fontFamily="'Playfair Display', Georgia, 'Times New Roman', serif"
        fontSize="25"
        fontWeight="500"
        fill="#c9a06a"
        letterSpacing="0.5"
      >
        After Dusk
      </text>

      {/* Decorative lines + STORIES */}
      <line x1="26" y1="228" x2="60" y2="228" stroke="#c9a06a" strokeWidth="0.8" opacity="0.6" />
      <text
        x="100"
        y="233"
        textAnchor="middle"
        fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
        fontSize="8.5"
        fill="#c9a06a"
        letterSpacing="4.5"
        opacity="0.9"
      >
        STORIES
      </text>
      <line x1="140" y1="228" x2="174" y2="228" stroke="#c9a06a" strokeWidth="0.8" opacity="0.6" />

      {/* Tagline dots */}
      <circle cx="88" cy="250" r="1" fill="#c9a06a" opacity="0.3" />
      <circle cx="100" cy="250" r="1" fill="#c9a06a" opacity="0.3" />
      <circle cx="112" cy="250" r="1" fill="#c9a06a" opacity="0.3" />
    </svg>
  );
}

export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return <Logo height={size} className={className} />;
}
