import { VOICE_IDENTITY } from "../lib/voices";

interface VoiceAvatarProps {
  voiceId: string;
  size?: "sm" | "md";
}

export function VoiceAvatar({ voiceId, size = "md" }: VoiceAvatarProps) {
  const identity = VOICE_IDENTITY[voiceId];
  const dim = size === "sm" ? "w-10 h-10" : "w-12 h-12";

  if (!identity) return null;

  return (
    <div
      className={`${dim} rounded-full flex-shrink-0 relative overflow-hidden ring-1 ${identity.ring} bg-gradient-to-br ${identity.gradient}`}
    >
      <svg
        viewBox="0 0 48 48"
        className="absolute inset-0 w-full h-full"
        fill="none"
        aria-hidden="true"
      >
        <ellipse cx="24" cy="19" rx="8.5" ry="9.5" fill={identity.svgFill} opacity="0.35" />
        <path
          d="M 9 46 Q 13 33 24 30.5 Q 35 33 39 46"
          fill={identity.svgFill}
          opacity="0.25"
        />
        <ellipse cx="24" cy="19" rx="5" ry="6" fill={identity.svgFill} opacity="0.15" />
      </svg>
    </div>
  );
}
