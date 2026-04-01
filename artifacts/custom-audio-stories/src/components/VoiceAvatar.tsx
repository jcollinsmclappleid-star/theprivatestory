interface VoiceAvatarProps {
  voiceId: string;
  size?: "sm" | "md";
}

const PORTRAIT_AVATARS: Record<string, string> = {
  FA6HhUjVbervLw2rNl8M: "images/avatar-eleanor.png",  // Clara
  tQ4MEZFJOzsahSEEZtHK: "images/avatar-maya.png",     // Maya
  aTxZrSrp47xsP6Ot4Kgd: "images/avatar-isla.png",     // Kayla
  AeRdCCKzvd23BpJoofzx: "images/avatar-nathaniel.png", // Nathaniel
};

const MALE_SILHOUETTE_IDS = new Set([
  "n1PvBOwxb8X6m7tahp2h", // Deep
  "jfIS2w2yJi0grJZPyEsk", // Oliver
]);

function MaleSilhouette({ px }: { px: number }) {
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        borderRadius: "50%",
        flexShrink: 0,
        display: "block",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "linear-gradient(160deg, #1a1008 0%, #0d0a05 100%)",
      }}
      aria-hidden="true"
    >
      <circle cx="24" cy="16" r="7" fill="#c9a22760" />
      <ellipse cx="24" cy="36" rx="11" ry="8" fill="#c9a22740" />
    </svg>
  );
}

export function VoiceAvatar({ voiceId, size = "md" }: VoiceAvatarProps) {
  const px = size === "sm" ? 40 : 48;
  const BASE_URL = import.meta.env.BASE_URL;

  if (MALE_SILHOUETTE_IDS.has(voiceId)) {
    return <MaleSilhouette px={px} />;
  }

  const imagePath = PORTRAIT_AVATARS[voiceId];
  if (!imagePath) return null;

  return (
    <img
      src={`${BASE_URL}${imagePath}`}
      alt="Voice"
      width={px}
      height={px}
      style={{
        borderRadius: "50%",
        flexShrink: 0,
        display: "block",
        objectFit: "cover",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
      aria-hidden="true"
    />
  );
}
