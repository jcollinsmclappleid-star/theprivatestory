import { HOME_DIMENSION_STATS } from "@/lib/homeBriefUtils";

interface CreativityStripProps {
  activeKeys: Set<string>;
  className?: string;
}

export function CreativityStrip({ activeKeys, className = "" }: CreativityStripProps) {
  return (
    <div className={`rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3 md:px-4 ${className}`}>
      <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/45 mb-2.5 text-center">
        What you can shape
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {HOME_DIMENSION_STATS.map(({ key, label, total }) => {
          const lit = activeKeys.has(key);
          return (
            <div
              key={key}
              className={`text-center rounded-lg px-1 py-2 transition-colors ${
                lit ? "bg-primary/10 border border-primary/25" : "border border-transparent"
              }`}
            >
              <p
                className={`text-sm font-bold tabular-nums ${
                  lit ? "text-primary" : "text-white/70"
                }`}
              >
                {total}
              </p>
              <p className="text-[8px] uppercase tracking-wider text-white/45 leading-tight mt-0.5">
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
