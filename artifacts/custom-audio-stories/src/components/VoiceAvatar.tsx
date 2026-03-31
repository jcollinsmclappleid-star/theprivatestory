interface VoiceAvatarProps {
  voiceId: string;
  size?: "sm" | "md";
}

type AvatarConfig = {
  bgLight: string;
  bgDark: string;
  rimLight: string;
  rimGlow: string;
};

const AVATARS: Record<string, AvatarConfig> = {
  RILOU7YmBhvwJGDGjNmP: {
    bgLight: "#2a1f0a",
    bgDark: "#0f0804",
    rimLight: "#d4a853",
    rimGlow: "#c9a227",
  },
  tQ4MEZFJOzsahSEEZtHK: {
    bgLight: "#2a1015",
    bgDark: "#0f0508",
    rimLight: "#d4768a",
    rimGlow: "#c4607a",
  },
  FA6HhUjVbervLw2rNl8M: {
    bgLight: "#0f1a2a",
    bgDark: "#060a10",
    rimLight: "#8db5d9",
    rimGlow: "#7ea8c9",
  },
  AeRdCCKzvd23BpJoofzx: {
    bgLight: "#1a1612",
    bgDark: "#0a0804",
    rimLight: "#9a8d80",
    rimGlow: "#8a7d70",
  },
  n1PvBOwxb8X6m7tahp2h: {
    bgLight: "#141418",
    bgDark: "#08080c",
    rimLight: "#8a92a0",
    rimGlow: "#7a828f",
  },
  jfIS2w2yJi0grJZPyEsk: {
    bgLight: "#181614",
    bgDark: "#0a0804",
    rimLight: "#8f8780",
    rimGlow: "#807872",
  },
};

export function VoiceAvatar({ voiceId, size = "md" }: VoiceAvatarProps) {
  const cfg = AVATARS[voiceId];
  const w = size === "sm" ? 40 : 48;
  const viewBox = "0 0 48 48";

  if (!cfg) return null;

  return (
    <svg
      width={w}
      height={w}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        borderRadius: "50%",
        flexShrink: 0,
        display: "block",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`bg-${voiceId}`} cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor={cfg.bgLight} />
          <stop offset="100%" stopColor={cfg.bgDark} />
        </radialGradient>

        <radialGradient id={`rim-${voiceId}`} cx="25%" cy="20%" r="50%">
          <stop offset="0%" stopColor={cfg.rimLight} stopOpacity="0.5" />
          <stop offset="50%" stopColor={cfg.rimGlow} stopOpacity="0.15" />
          <stop offset="100%" stopColor={cfg.rimGlow} stopOpacity="0" />
        </radialGradient>

        <filter id={`blur-${voiceId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>

        <filter id={`soft-blur-${voiceId}`}>
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx="24" cy="24" r="24" fill={`url(#bg-${voiceId})`} />

      {/* Rim lighting — directional highlight from left/top */}
      <ellipse
        cx="20"
        cy="18"
        rx="16"
        ry="14"
        fill={`url(#rim-${voiceId})`}
      />

      {/* Head silhouette — blurred oval */}
      <ellipse
        cx="24"
        cy="16"
        rx="6.5"
        ry="7.5"
        fill="rgba(0,0,0,0.4)"
        filter={`url(#blur-${voiceId})`}
      />

      {/* Face inner — softer shadow */}
      <ellipse
        cx="24"
        cy="15.5"
        rx="4"
        ry="5"
        fill="rgba(0,0,0,0.25)"
        filter={`url(#soft-blur-${voiceId})`}
      />

      {/* Neck — subtle downward taper */}
      <path
        d="M 21 24 Q 24 25.5 27 24"
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="2"
        fill="none"
        filter={`url(#soft-blur-${voiceId})`}
      />

      {/* Shoulder silhouette — implied width */}
      <ellipse
        cx="24"
        cy="28"
        rx="10"
        ry="6"
        fill="rgba(0,0,0,0.15)"
        filter={`url(#blur-${voiceId})`}
      />

      {/* Subtle highlight on upper shoulder */}
      <ellipse
        cx="19"
        cy="26"
        rx="4"
        ry="2.5"
        fill={cfg.rimGlow}
        opacity="0.2"
        filter={`url(#soft-blur-${voiceId})`}
      />

      {/* Soft inner glow center — atmospheric */}
      <circle
        cx="24"
        cy="24"
        r="18"
        fill="none"
        stroke={cfg.rimGlow}
        strokeWidth="0.5"
        opacity="0.1"
      />
    </svg>
  );
}
