import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import {
  BEDTIME_ROOMS,
  BEDTIME_SCENARIOS,
  type BedtimeScenario,
} from "@/lib/bedtimeScenarios";

const ACCENT = "#6366f1";

function ScenarioCard({
  scenario,
  selected,
  onClick,
}: {
  scenario: BedtimeScenario;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-shrink-0 w-56 text-left rounded-xl border p-4 transition-all overflow-hidden ${
        selected ? "ring-1" : "hover:border-white/20"
      }`}
      style={
        selected
          ? { borderColor: `${scenario.accent}66`, boxShadow: `0 0 20px ${scenario.accent}28` }
          : undefined
      }
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${scenario.gradient} opacity-80`} />
      {selected && (
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 30% 30%, ${scenario.accent}12 0%, transparent 60%)` }}
        />
      )}
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: scenario.accent }}>
          Drift
        </p>
        <p className="text-sm font-semibold text-foreground mb-2 leading-snug">{scenario.label}</p>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{scenario.sub}</p>
      </div>
    </button>
  );
}

type Props = {
  selected: BedtimeScenario | null;
  onSelect: (scenario: BedtimeScenario | null) => void;
  onContinue: (scenario: BedtimeScenario) => void;
  onBack?: () => void;
};

export function BedtimeScenarioPicker({ selected, onSelect, onContinue, onBack }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="max-w-3xl mx-auto px-4 py-12"
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}

      <div className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
          Drift
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
          Where does tonight begin?
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
          Slow, sensory, unhurried. Choose the mood — the story settles around it.
        </p>
      </div>

      <div className="space-y-10 mb-10">
        {BEDTIME_ROOMS.map((room) => {
          const roomScenarios = BEDTIME_SCENARIOS.filter((s) => s.room === room.id);
          return (
            <div key={room.id}>
              <div className="mb-4 px-1">
                <h2 className="font-display text-lg font-bold" style={{ color: room.accent }}>
                  {room.name}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">{room.sub}</p>
              </div>
              <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-brand">
                <div className="flex gap-3 w-max">
                  {roomScenarios.map((scenario) => (
                    <ScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      selected={selected?.id === scenario.id}
                      onClick={() => {
                        const next = selected?.id === scenario.id ? null : scenario;
                        onSelect(next);
                        if (next) onContinue(next);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
