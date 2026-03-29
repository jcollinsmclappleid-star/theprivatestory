import type { StoryCastingData } from "@workspace/api-client-react";

interface CastSituationProps {
  data?: StoryCastingData | null;
  className?: string;
}

const PILL_FIELDS: Array<{ key: keyof Omit<StoryCastingData, "situation" | "situationId">; label: string }> = [
  { key: "pairing",    label: "Pairing" },
  { key: "archetype",  label: "He Is" },
  { key: "chemistry",  label: "Chemistry" },
  { key: "mood",       label: "Mood" },
  { key: "intensity",  label: "Intensity" },
  { key: "atmosphere", label: "Atmosphere" },
  { key: "country",    label: "Country" },
  { key: "city",       label: "City" },
  { key: "setting",    label: "Setting" },
];

export function CastSituation({ data, className = "" }: CastSituationProps) {
  if (!data) return null;

  const pills = PILL_FIELDS.filter(({ key }) => !!data[key]);
  const hasSituation = !!data.situation;

  if (!hasSituation && pills.length === 0) return null;

  return (
    <div className={`pt-8 mt-8 border-t border-white/10 ${className}`}>
      <p className="text-xs font-medium text-primary/60 uppercase tracking-widest mb-4">
        Built for You
      </p>

      {hasSituation && (
        <p className="text-sm italic text-white/60 mb-4 leading-relaxed">
          {data.situation}
        </p>
      )}

      {pills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pills.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10"
            >
              <span className="text-[10px] uppercase tracking-widest text-primary/50 font-medium leading-none">
                {label}
              </span>
              <span className="text-xs text-white/70 font-light leading-none">
                {data[key]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
