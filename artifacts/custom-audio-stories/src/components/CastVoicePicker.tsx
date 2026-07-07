import { useEffect, useMemo, useState } from "react";
import { VoiceAvatar } from "@/components/VoiceAvatar";
import { VoiceSamplePlayer } from "@/components/VoiceSamplePlayer";
import {
  type CastVoiceRole,
  defaultCastVoices,
  getCastRoleChips,
  getVoicesForCastRole,
  voiceDisplayName,
} from "@/lib/voices";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Props = {
  pairing: string;
  narratorVoiceId: string;
  charAVoiceId: string;
  charBVoiceId: string;
  onNarrator: (id: string) => void;
  onCharA: (id: string) => void;
  onCharB: (id: string) => void;
  /** Express dark styling */
  variant?: "express" | "studio";
};

export function CastVoicePicker({
  pairing,
  narratorVoiceId,
  charAVoiceId,
  charBVoiceId,
  onNarrator,
  onCharA,
  onCharB,
  variant = "studio",
}: Props) {
  const [activeRole, setActiveRole] = useState<CastVoiceRole>("narrator");
  const chips = useMemo(() => getCastRoleChips(pairing), [pairing]);
  const isExpress = variant === "express";

  useEffect(() => {
    const defaults = defaultCastVoices(narratorVoiceId, pairing);
    if (charAVoiceId === narratorVoiceId) onCharA(defaults.charA);
    if (charBVoiceId === narratorVoiceId) onCharB(defaults.charB);
  }, [narratorVoiceId, charAVoiceId, charBVoiceId, pairing, onCharA, onCharB]);

  const activeVoiceId =
    activeRole === "narrator" ? narratorVoiceId : activeRole === "charA" ? charAVoiceId : charBVoiceId;

  const roleVoices = getVoicesForCastRole(activeRole, pairing, narratorVoiceId);

  const setActiveVoice = (id: string) => {
    if (activeRole === "narrator") {
      onNarrator(id);
      const next = defaultCastVoices(id, pairing);
      if (charAVoiceId === id || !charAVoiceId) onCharA(next.charA);
      if (charBVoiceId === id || !charBVoiceId) onCharB(next.charB);
    } else if (activeRole === "charA") {
      onCharA(id);
    } else {
      onCharB(id);
    }
  };

  const chipClass = (selected: boolean) =>
    isExpress
      ? `px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
          selected
            ? "border-[#e879a0]/60 bg-[#e879a0]/15 text-white"
            : "border-white/15 text-white/65 hover:border-white/30"
        }`
      : `px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
          selected
            ? "border-primary/60 bg-primary/15 text-foreground"
            : "border-border/40 text-muted-foreground hover:border-primary/40"
        }`;

  const cardClass = (selected: boolean) =>
    isExpress
      ? `w-full text-left rounded-xl border p-3 transition-all ${
          selected
            ? "border-[#e879a0]/50 bg-[#e879a0]/10"
            : "border-white/10 bg-black/30 hover:border-white/25"
        }`
      : `w-full text-left rounded-2xl border p-4 transition-all ${
          selected
            ? "border-2 border-primary bg-gradient-to-b from-primary/20 to-primary/5"
            : "border-2 border-border/30 bg-card/40 hover:border-primary/50"
        }`;

  return (
    <div className="space-y-4">
      <div>
        <p
          className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${
            isExpress ? "text-white/45" : "text-muted-foreground/60"
          }`}
        >
          Your full cast — tap a role, then pick a voice
        </p>
        <div className="flex flex-wrap gap-2">
          {chips.map(({ role, label }) => {
            const voiceId = role === "narrator" ? narratorVoiceId : role === "charA" ? charAVoiceId : charBVoiceId;
            const name = voiceDisplayName(voiceId);
            const selected = activeRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setActiveRole(role)}
                className={chipClass(selected)}
              >
                <span className="opacity-70">{label}</span>
                <span className="mx-1">·</span>
                <span>{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        {roleVoices.map((voice) => {
          const selected = activeVoiceId === voice.id;
          const title = voice.displayName ? `${voice.displayName} — ${voice.label}` : voice.label;
          return (
            <button key={voice.id} type="button" onClick={() => setActiveVoice(voice.id)} className={cardClass(selected)}>
              <div className="flex items-center gap-3">
                <VoiceAvatar voiceId={voice.id} size="sm" />
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold text-sm ${isExpress ? "text-white" : "text-foreground"}`}>
                      {title}
                    </span>
                    {voice.recommendLabel && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold uppercase">
                        {voice.recommendLabel}
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] mt-0.5 line-clamp-2 ${isExpress ? "text-white/55" : "text-muted-foreground"}`}>
                    {voice.desc}
                  </p>
                </div>
              </div>
              {selected && (
                <div className="mt-3 pt-2 border-t border-white/10">
                  <VoiceSamplePlayer src={`${API_BASE}/api/voice-samples/${voice.id}`} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p className={`text-[10px] leading-relaxed ${isExpress ? "text-white/40" : "text-muted-foreground/50"}`}>
        Three voices, one story — narrator carries the prose; {chips[1]?.label.toLowerCase()} and{" "}
        {chips[2]?.label.toLowerCase()} speak their lines.
      </p>
    </div>
  );
}

/** Resolve display name from voice id for brief summaries. */
export function castSummaryNames(narratorId: string, charA: string, charB: string) {
  return {
    narrator: voiceDisplayName(narratorId),
    charA: voiceDisplayName(charA),
    charB: voiceDisplayName(charB),
  };
}
