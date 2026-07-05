import { motion } from "framer-motion";

export interface VisualChoiceTileProps {
  image: string;
  accent: string;
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
  size?: "tab" | "option" | "scenario";
  bright?: boolean;
}

export function VisualChoiceTile({
  image,
  accent,
  label,
  sublabel,
  selected,
  onClick,
  size = "option",
  bright = true,
}: VisualChoiceTileProps) {
  const isTab = size === "tab";
  const isScenario = size === "scenario";
  const scrimBottom = bright ? 0.72 : 0.92;
  const scrimMid = bright ? 0.28 : 0.5;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: selected ? 1.03 : 1.05, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`relative overflow-hidden rounded-xl border text-left transition-shadow ${
        isTab
          ? "min-h-[84px]"
          : isScenario
            ? "w-[132px] sm:w-[140px] shrink-0 snap-start"
            : "w-[112px] sm:w-[120px] shrink-0 snap-start"
      } ${
        selected
          ? "border-primary/70 ring-2 ring-primary/45 shadow-[0_0_28px_-6px_rgba(201,162,39,0.55)]"
          : "border-white/15 hover:border-white/35 hover:shadow-[0_0_20px_-8px_rgba(201,162,39,0.35)]"
      }`}
      style={{
        boxShadow: selected ? `0 0 32px -8px ${accent}88` : undefined,
      }}
    >
      <img
        src={image}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
          selected ? "opacity-100 scale-105" : bright ? "opacity-95" : "opacity-80"
        }`}
      />
      <div
        className="absolute inset-0"
        style={{
          background: selected
            ? `linear-gradient(to top, rgba(8,6,4,${bright ? 0.82 : 0.95}) 0%, rgba(8,6,4,${bright ? 0.2 : 0.35}) 50%, ${accent}18 100%)`
            : `linear-gradient(to top, rgba(8,6,4,${scrimBottom}) 0%, rgba(8,6,4,${scrimMid}) 55%, rgba(8,6,4,${bright ? 0.08 : 0.25}) 100%)`,
        }}
      />
      {selected && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: `radial-gradient(circle at 50% 20%, ${accent}33 0%, transparent 55%)`,
          }}
        />
      )}
      <div
        className={`relative flex flex-col justify-end h-full ${
          isTab ? "p-2.5 min-h-[84px]" : isScenario ? "aspect-[3/4] p-2.5" : "aspect-[4/5] p-2.5"
        }`}
      >
        {!isTab && (
          <div
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{
              background: accent,
              boxShadow: selected ? `0 0 10px ${accent}` : undefined,
            }}
          />
        )}
        <span
          className={`font-bold text-white leading-tight ${
            isTab ? "text-[9px] uppercase tracking-wide" : isScenario ? "text-[9px] line-clamp-3" : "text-[10px]"
          }`}
        >
          {label}
        </span>
        {sublabel && (
          <span
            className={`text-white/70 truncate leading-tight ${
              isTab ? "text-[8px]" : "text-[9px] mt-0.5"
            }`}
          >
            {sublabel}
          </span>
        )}
      </div>
    </motion.button>
  );
}
