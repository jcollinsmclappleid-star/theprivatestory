interface VoiceAvatarProps {
  voiceId: string;
  size?: "sm" | "md";
}

const AVATAR_IMAGES: Record<string, string> = {
  RILOU7YmBhvwJGDGjNmP: "images/avatar-eleanor.png",
  tQ4MEZFJOzsahSEEZtHK: "images/avatar-maya.png",
  FA6HhUjVbervLw2rNl8M: "images/avatar-isla.png",
  AeRdCCKzvd23BpJoofzx: "images/avatar-eleanor.png",
  n1PvBOwxb8X6m7tahp2h: "images/avatar-maya.png",
  jfIS2w2yJi0grJZPyEsk: "images/avatar-isla.png",
};

export function VoiceAvatar({ voiceId, size = "md" }: VoiceAvatarProps) {
  const imagePath = AVATAR_IMAGES[voiceId];
  const px = size === "sm" ? 40 : 48;
  const BASE_URL = import.meta.env.BASE_URL;

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
