interface VoiceAvatarProps {
  voiceId: string;
  size?: "sm" | "md";
}

const PORTRAIT_AVATARS: Record<string, string> = {
  PB6BdkFkZLbI39GHdnbQ: "images/avatar-isla.webp",     // Lisa
  aTxZrSrp47xsP6Ot4Kgd: "images/avatar-isla.webp",     // Kayla
  D9MdulIxfrCUUJcGNQon: "images/avatar-eleanor.webp",  // Sofia
  tQ4MEZFJOzsahSEEZtHK: "images/avatar-maya.webp",     // Maya
  AeRdCCKzvd23BpJoofzx: "images/avatar-nathaniel.webp", // James
  n1PvBOwxb8X6m7tahp2h: "images/avatar-caleb.webp",    // Ethan
  jfIS2w2yJi0grJZPyEsk: "images/avatar-oliver.webp",   // Theo
  FA6HhUjVbervLw2rNl8M: "images/avatar-eleanor.webp", // Clara (legacy)
};

export function VoiceAvatar({ voiceId, size = "md" }: VoiceAvatarProps) {
  const px = size === "sm" ? 40 : 48;
  const BASE_URL = import.meta.env.BASE_URL;

  const imagePath = PORTRAIT_AVATARS[voiceId];
  if (!imagePath) return null;

  return (
    <img
      src={`${BASE_URL}${imagePath}`}
      alt="Voice"
      loading="lazy"
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
