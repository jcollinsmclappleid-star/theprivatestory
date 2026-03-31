interface VoiceAvatarProps {
  voiceId: string;
  size?: "sm" | "md";
}

type AvatarConfig = {
  bg: [string, string];
  glowColor: string;
  glowOpacity: number;
  silhouetteColor: string;
  ring: string;
};

const AVATARS: Record<string, AvatarConfig> = {
  RILOU7YmBhvwJGDGjNmP: {
    bg: ["#1e1508", "#080600"],
    glowColor: "#c9a227",
    glowOpacity: 0.38,
    silhouetteColor: "#c9a227",
    ring: "rgba(201,162,39,0.25)",
  },
  tQ4MEZFJOzsahSEEZtHK: {
    bg: ["#1e0a10", "#09040a"],
    glowColor: "#c4607a",
    glowOpacity: 0.36,
    silhouetteColor: "#c4607a",
    ring: "rgba(196,96,122,0.25)",
  },
  FA6HhUjVbervLw2rNl8M: {
    bg: ["#080f1a", "#060a10"],
    glowColor: "#7ea8c9",
    glowOpacity: 0.3,
    silhouetteColor: "#8ab0cc",
    ring: "rgba(126,168,201,0.2)",
  },
  AeRdCCKzvd23BpJoofzx: {
    bg: ["#111010", "#080707"],
    glowColor: "#8a7d70",
    glowOpacity: 0.22,
    silhouetteColor: "#8a7d70",
    ring: "rgba(138,125,112,0.18)",
  },
  n1PvBOwxb8X6m7tahp2h: {
    bg: ["#0e0e10", "#080808"],
    glowColor: "#7a828f",
    glowOpacity: 0.2,
    silhouetteColor: "#7a828f",
    ring: "rgba(122,130,143,0.18)",
  },
  jfIS2w2yJi0grJZPyEsk: {
    bg: ["#100f0e", "#080807"],
    glowColor: "#807872",
    glowOpacity: 0.2,
    silhouetteColor: "#807872",
    ring: "rgba(128,120,114,0.18)",
  },
};

const ID_SHORT: Record<string, string> = {
  RILOU7YmBhvwJGDGjNmP: "el",
  tQ4MEZFJOzsahSEEZtHK: "ma",
  FA6HhUjVbervLw2rNl8M: "is",
  AeRdCCKzvd23BpJoofzx: "lo",
  n1PvBOwxb8X6m7tahp2h: "de",
  jfIS2w2yJi0grJZPyEsk: "he",
};

export function VoiceAvatar({ voiceId, size = "md" }: VoiceAvatarProps) {
  const cfg = AVATARS[voiceId];
  const s = ID_SHORT[voiceId] ?? voiceId.slice(0, 4);
  const px = size === "sm" ? 40 : 48;

  if (!cfg) return null;

  const bgId   = `${s}-bg`;
  const glowId = `${s}-gl`;
  const blurId = `${s}-bl`;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      style={{
        borderRadius: "50%",
        flexShrink: 0,
        display: "block",
        boxShadow: `0 0 0 1px ${cfg.ring}`,
      }}
    >
      <defs>
        <radialGradient id={bgId} cx="42%" cy="30%" r="72%">
          <stop offset="0%" stopColor={cfg.bg[0]} />
          <stop offset="100%" stopColor={cfg.bg[1]} />
        </radialGradient>

        <radialGradient id={glowId} cx="50%" cy="38%" r="50%">
          <stop offset="0%" stopColor={cfg.glowColor} stopOpacity={cfg.glowOpacity} />
          <stop offset="100%" stopColor={cfg.glowColor} stopOpacity={0} />
        </radialGradient>

        <filter id={blurId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx="24" cy="24" r="24" fill={`url(#${bgId})`} />

      {/* Atmospheric glow — soft bloom behind the silhouette */}
      <ellipse
        cx="24"
        cy="20"
        rx="13"
        ry="11"
        fill={`url(#${glowId})`}
        filter={`url(#${blurId})`}
      />

      {/* Abstract silhouette — head oval */}
      <ellipse
        cx="24"
        cy="17.5"
        rx="7"
        ry="7.8"
        fill={cfg.silhouetteColor}
        opacity={0.28}
      />

      {/* Inner face highlight — softer and smaller */}
      <ellipse
        cx="24"
        cy="16.5"
        rx="4"
        ry="4.5"
        fill={cfg.silhouetteColor}
        opacity={0.18}
      />

      {/* Neck + shoulder fade — abstract shoulder curve */}
      <path
        d="M 18 26 C 18 28.5 20.5 29.5 24 30 C 27.5 29.5 30 28.5 30 26 C 30 27 28 30 26.5 32 L 32 40 L 16 40 L 21.5 32 C 20 30 18 27 18 26 Z"
        fill={cfg.silhouetteColor}
        opacity={0.14}
      />

      {/* Subtle specular — tiny bright spot at top of head */}
      <ellipse
        cx="22"
        cy="13"
        rx="2.5"
        ry="1.8"
        fill={cfg.glowColor}
        opacity={0.22}
      />

      {/* Clip to circle */}
      <circle cx="24" cy="24" r="24" fill="none" />
    </svg>
  );
}
