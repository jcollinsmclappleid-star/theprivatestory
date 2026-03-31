interface VoiceAvatarProps {
  voiceId: string;
  size?: "sm" | "md";
}

type AvatarConfig = {
  baseGrad: string;
  glowColor: string;
};

const AVATARS: Record<string, AvatarConfig> = {
  RILOU7YmBhvwJGDGjNmP: {
    baseGrad: "linear-gradient(135deg, rgba(201,162,39,0.6) 0%, rgba(139,90,43,0.4) 50%, rgba(80,40,20,0.3) 100%)",
    glowColor: "rgba(201,162,39,0.35)",
  },
  tQ4MEZFJOzsahSEEZtHK: {
    baseGrad: "linear-gradient(135deg, rgba(196,96,122,0.6) 0%, rgba(140,70,90,0.4) 50%, rgba(80,30,50,0.3) 100%)",
    glowColor: "rgba(196,96,122,0.35)",
  },
  FA6HhUjVbervLw2rNl8M: {
    baseGrad: "linear-gradient(135deg, rgba(126,168,201,0.5) 0%, rgba(90,130,160,0.35) 50%, rgba(50,80,120,0.2) 100%)",
    glowColor: "rgba(126,168,201,0.25)",
  },
  AeRdCCKzvd23BpJoofzx: {
    baseGrad: "linear-gradient(135deg, rgba(138,125,112,0.5) 0%, rgba(100,85,70,0.3) 50%, rgba(50,40,30,0.2) 100%)",
    glowColor: "rgba(138,125,112,0.2)",
  },
  n1PvBOwxb8X6m7tahp2h: {
    baseGrad: "linear-gradient(135deg, rgba(122,130,143,0.5) 0%, rgba(90,100,120,0.3) 50%, rgba(50,60,80,0.2) 100%)",
    glowColor: "rgba(122,130,143,0.2)",
  },
  jfIS2w2yJi0grJZPyEsk: {
    baseGrad: "linear-gradient(135deg, rgba(128,120,114,0.5) 0%, rgba(90,80,70,0.3) 50%, rgba(50,40,30,0.2) 100%)",
    glowColor: "rgba(128,120,114,0.2)",
  },
};

export function VoiceAvatar({ voiceId, size = "md" }: VoiceAvatarProps) {
  const cfg = AVATARS[voiceId];
  const w = size === "sm" ? 40 : 48;
  const h = size === "sm" ? 40 : 48;

  if (!cfg) return null;

  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: "50%",
        flexShrink: 0,
        overflow: "hidden",
        boxShadow: `0 0 0 1px rgba(255,255,255,0.1), inset 0 0 16px ${cfg.glowColor}`,
        background: cfg.baseGrad,
        backdropFilter: "blur(1px)",
        position: "relative",
      }}
    >
      {/* Blurred silhouette — head oval */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "55%",
          height: "45%",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
          filter: "blur(8px)",
        }}
      />

      {/* Shoulder/neck softness */}
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "50%",
          borderRadius: "50% 50% 0 0",
          background: "rgba(255,255,255,0.08)",
          filter: "blur(10px)",
        }}
      />

      {/* Soft inner glow center */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70%",
          height: "70%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${cfg.glowColor} 0%, transparent 70%)`,
          filter: "blur(6px)",
        }}
      />
    </div>
  );
}
