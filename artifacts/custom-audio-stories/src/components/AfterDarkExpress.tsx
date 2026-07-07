import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, SlidersHorizontal, MapPin, Globe2, X } from "lucide-react";
import { IntensityDial, INTENSITY_LEVELS } from "@/components/IntensityDial";
import { StoryAnatomyCard } from "@/components/StoryAnatomy";
import { StoryTagStudio, getTagDisplayLabel, AFTER_DARK_TAG_CAP, getExpressTagBlockReason } from "@/components/StoryTagStudio";
import { VoiceSamplePlayer } from "@/components/VoiceSamplePlayer";
import { VOICES } from "@/lib/voices";
import { CastVoicePicker } from "@/components/CastVoicePicker";
import { ExpressCategoryHero } from "@/components/ExpressCategoryHero";
import { EXPRESS_CATEGORY_SHORT, getCategoryGallery, getCategoryImagePool } from "@/lib/expressCategoryImages";
import { preloadImages } from "@/lib/preloadImages";
import {
  buildPresetFromSelections,
  intensityToIndex,
  type CategoryId,
} from "@/components/BriefBuilder";
import { castingIntensityToHome, scenarioAllowsPairing, type ExpressScenario } from "@/lib/afterDarkExpress";
import type { CastingRoomResult } from "@/components/CastingRoom";
import {
  buildArchetypes,
  buildChemistries,
  COUNTRY_CITIES,
  COUNTRY_CULTURAL_PREVIEW,
  COUNTRY_FLAGS,
  getValidPerspectiveIds,
  HERITAGES,
  PAIRINGS,
  PERSPECTIVES,
} from "@/components/CastingRoom";
import { getScenarioImage } from "@/lib/scenarioImages";
import { FEATURED_EXPRESS_SETTINGS, getSettingById, ALL_EXPRESS_SETTINGS, SETTING_GROUP_LABELS } from "@/lib/expressSettings";
import { SettingPickerModal } from "@/components/SettingPickerModal";
import {
  FEATURED_COUNTRIES,
  getCountryPreview,
  getCountrySettingImage,
} from "@/lib/worldSelection";
import { CountryPickerModal } from "@/components/CountryPickerModal";
import { buildExpressSummaryGroups, buildExpressSummaryLine } from "@/lib/expressStorySummary";
import { defaultCategoryForRoom, suggestExpressTags } from "@/lib/expressTagSuggestions";
import { resolveExpressCategoryImage } from "@/lib/expressAct4Slugs";
import { HorizontalScrollRow, VerticalScrollCol } from "@/components/ScrollRowHint";
import { ExpressCharacterNames } from "@/components/ExpressCharacterNames";
import { PAIRING_IMAGES } from "@/lib/chemistryImages";
import { preloadExpressPairingImages } from "@/lib/preloadHomeAssets";
import { SituationLiteraryPanel } from "@/components/SituationPicker";
import { SITUATIONS } from "@/data/situations";
import { interpolateHomeSituation } from "@/lib/homeBriefUtils";

const BASE = import.meta.env.BASE_URL;

/** Fast-suite palette — aligned with full Creation Room crimson / rose */
export const EXPRESS_CRIMSON = "#c0392b";
export const EXPRESS_ROSE = "#e879a0";
export const EXPRESS_WINE = "#922b21";

export type ExpressFunnelPhase =
  | "express_pairing"
  | "express_situation"
  | "express_fantasy"
  | "express_world"
  | "express_scenes";

function act4Img(path: string) {
  return resolveExpressCategoryImage(path, BASE);
}

function ExpressStepNav({
  onBack,
  backLabel = "Back",
  onOpenStudio,
  showBack = true,
}: {
  onBack?: () => void;
  backLabel?: string;
  onOpenStudio: () => void;
  showBack?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-5">
      {showBack && onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "rgba(232,160,154,0.75)" }}
        >
          <ChevronLeft className="w-4 h-4" />
          {backLabel}
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onOpenStudio}
        className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
        style={{
          borderColor: `${EXPRESS_CRIMSON}44`,
          color: "rgba(232,160,154,0.9)",
          background: `${EXPRESS_CRIMSON}12`,
        }}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Full studio
      </button>
    </div>
  );
}

export const EXPRESS_ACTS = ["Who", "Fantasy", "World", "Situation", "Yours", "Unlock"] as const;
export type ExpressActIndex = 0 | 1 | 2 | 3 | 4 | 5;

export function ExpressActProgress({ current, compact }: { current: ExpressActIndex; compact?: boolean }) {
  const visibleIndex = Math.min(current, 4) as 0 | 1 | 2 | 3 | 4;
  return (
    <div className={`flex items-center gap-1.5 ${compact ? "mb-0" : "mb-6"}`}>
      {EXPRESS_ACTS.slice(0, 5).map((label, i) => (
        <div key={label} className="flex items-center gap-1.5 flex-1 min-w-0">
          <div
            className="h-1 flex-1 rounded-full transition-colors"
            style={{
              background:
                i <= visibleIndex
                  ? `linear-gradient(90deg, ${EXPRESS_CRIMSON}, ${EXPRESS_ROSE})`
                  : "rgba(255,255,255,0.1)",
            }}
          />
          <span
            className="text-[8px] font-bold uppercase tracking-wider shrink-0 hidden sm:inline"
            style={{ color: i === visibleIndex ? EXPRESS_ROSE : "rgba(255,255,255,0.3)" }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Sticky progress + one-line story context on mobile (replaces chip rows) */
export function ExpressActHeader({
  current,
  brief,
}: {
  current: ExpressActIndex;
  brief: ExpressBriefState;
}) {
  const summary = buildExpressSummaryLine(brief, current);
  return (
    <div className="sticky top-20 z-30 w-full py-3 mb-5 bg-black/92 backdrop-blur-lg border-b border-white/8 lg:static lg:z-auto lg:top-auto lg:bg-transparent lg:border-0 lg:py-0 lg:mb-6">
      <ExpressActProgress current={current} compact />
      {summary && (
        <p className="text-[11px] text-white/55 mt-2 leading-snug line-clamp-2 lg:hidden">{summary}</p>
      )}
    </div>
  );
}

/* ── Living brief — persistent arousal + progress ─────────────────── */

export type ExpressBriefState = {
  scenario: ExpressScenario | null;
  pairing: string | null;
  perspective: CastingRoomResult["perspective"] | null;
  intensity: CastingRoomResult["intensity"];
  country: string;
  city: string;
  setting: string;
  afterDarkScene: string;
  atmosphere: string;
  heritage: string;
  chemistry: string;
  archetype: string;
  mood: string;
  voiceName: string;
  customTags: string[];
  situationId: string;
  situationLabel: string;
  listenerName?: string;
  partnerName?: string;
};

export function ExpressLivingBrief({ brief }: { brief: ExpressBriefState }) {
  const { scenario, pairing } = brief;
  if (!scenario && !pairing) return null;

  const groups = buildExpressSummaryGroups(brief);
  const pairingCover = pairing ? PAIRING_IMAGES[pairing] : null;
  const cover =
    (scenario && getScenarioImage(scenario.id, scenario.room, BASE)) ??
    (pairingCover ? `${BASE}${pairingCover}` : null) ??
    (brief.country ? `${BASE}${getCountrySettingImage(brief.country) ?? ""}` : null);

  const homeIntensity = castingIntensityToHome(brief.intensity);
  const selections: Record<CategoryId, string> = {
    pairing: brief.pairing ?? "Her & Him",
    chemistry: brief.chemistry,
    archetype: brief.archetype,
    setting: (brief.afterDarkScene || brief.setting) || scenario?.label || "Your story",
    intensity: homeIntensity,
    voice: brief.voiceName,
  };
  const preset = buildPresetFromSelections(
    {
      pairing: selections.pairing,
      chemistry: selections.chemistry,
      archetype: selections.archetype,
      setting: selections.setting,
      voice: selections.voice,
    },
    {
      intensity: homeIntensity,
      title: scenario?.label ?? pairing ?? "After Dark",
    },
  );

  const rows = [
    groups.who && { label: "Who", value: groups.who },
    groups.situation && { label: "Situation", value: groups.situation },
    groups.fantasy && { label: "Fantasy", value: groups.fantasy },
    groups.world && { label: "World", value: groups.world },
    groups.heat && { label: "Heat", value: groups.heat },
    groups.desires && { label: "Desires", value: groups.desires },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div
      className="rounded-2xl overflow-hidden border bg-black/50 backdrop-blur-md"
      style={{ borderColor: `${EXPRESS_CRIMSON}28`, boxShadow: `0 0 40px ${EXPRESS_CRIMSON}08` }}
    >
      {cover && (
        <div className="relative h-28 overflow-hidden">
          <img src={cover} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            {scenario ? (
              <>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#e879a0]">{scenario.darkness}</p>
                <p className="font-display font-bold text-white text-sm leading-tight line-clamp-2">{scenario.label}</p>
              </>
            ) : (
              <>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#e879a0]">Your story</p>
                <p className="font-display font-bold text-white text-sm leading-tight">{pairing}</p>
              </>
            )}
          </div>
        </div>
      )}
      <div className="p-3 space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="text-xs leading-snug">
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/35">{row.label}</span>
            <p className="text-white/80 mt-0.5">{row.value}</p>
          </div>
        ))}
        {scenario && (
          <StoryAnatomyCard preset={preset} showMotion={false} />
        )}
        <p className="text-[9px] text-white/40 text-center pt-1">
          {INTENSITY_LEVELS[intensityToIndex(homeIntensity)]?.label ?? homeIntensity} · building live
        </p>
      </div>
    </div>
  );
}

type PairingOption = { id: string; label: string; sub: string; accent: string; gradient: string };
type RoomOption = { id: string; name: string; accent: string; image?: string };

function ImageTile({
  image,
  label,
  sub,
  selected,
  onClick,
  className = "",
  accent,
}: {
  image?: string;
  label: string;
  sub?: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border text-left transition-all ${className} ${
        selected
          ? "shadow-[0_0_28px_rgba(192,57,43,0.28)]"
          : "border-white/10 hover:border-[#c0392b]/30"
      }`}
      style={selected ? { borderColor: `${EXPRESS_CRIMSON}66` } : undefined}
    >
      {image && (
        <img src={`${BASE}${image}`} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
      <div className="relative z-10 p-3 flex flex-col justify-end min-h-[88px]">
        {accent && (
          <span className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: accent }}>
            After Dark
          </span>
        )}
        <p className="font-semibold text-white text-sm leading-tight">{label}</p>
        {sub && <p className="text-white/65 text-[10px] line-clamp-2 mt-0.5">{sub}</p>}
      </div>
    </button>
  );
}

type WhoSubStep = "pairing" | "perspective" | "heritage";

/* ── Act I · Who (pairing → perspective → heritage) ───────────────── */

export function AfterDarkExpressPairing({
  pairings,
  selectedPairing,
  perspective,
  heritage,
  onPairing,
  onPerspective,
  onHeritage,
  onContinue,
  onBack,
  onOpenStudio,
  brief,
}: {
  pairings: PairingOption[];
  selectedPairing: string | null;
  perspective: CastingRoomResult["perspective"] | null;
  heritage: string;
  onPairing: (id: string) => void;
  onPerspective: (id: CastingRoomResult["perspective"]) => void;
  onHeritage: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
  onOpenStudio: () => void;
  brief: ExpressBriefState;
}) {
  const [subStep, setSubStep] = useState<WhoSubStep>("pairing");
  const pairingCfg = PAIRINGS.find((p) => p.id === selectedPairing);
  const heroImage = selectedPairing ? PAIRING_IMAGES[selectedPairing] : null;
  const heritageCfg = HERITAGES.find((h) => h.id === heritage);
  const perspectiveCfg = PERSPECTIVES.find((p) => p.id === perspective);
  const validPerspectives = getValidPerspectiveIds(selectedPairing ?? undefined);
  const isSameGender =
    !!pairingCfg && pairingCfg.protagonistPronouns === pairingCfg.partnerPronouns;
  const canContinue = !!selectedPairing && !!perspective && !!heritage;

  useEffect(() => {
    preloadExpressPairingImages();
  }, []);

  useEffect(() => {
    if (!selectedPairing) setSubStep("pairing");
  }, [selectedPairing]);

  const stepTitle =
    subStep === "pairing"
      ? "Who's in the story?"
      : subStep === "perspective"
        ? "Whose story is this?"
        : "Heritage — who are they?";

  const stepHint =
    subStep === "pairing"
      ? "Choose the pairing — every choice after this adapts to who's in your story."
      : subStep === "perspective"
        ? isSameGender
          ? "Same pronouns for both — pick who you follow so dominance and desire stay clear."
          : "Choose who the story follows — you in the moment, or your character throughout."
        : "This shapes how both characters look on the cover and in every scene.";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-28 md:pb-16 w-full min-w-0">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
        <div className="min-w-0">
          <ExpressActHeader current={0} brief={brief} />
          <ExpressStepNav onBack={onBack} backLabel="Back to After Dark" onOpenStudio={onOpenStudio} />

          <p className="text-[10px] font-bold uppercase tracking-[0.28em] mb-2" style={{ color: EXPRESS_ROSE }}>
            Act I · Who&apos;s in the story
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
            Start with who — and who they are
          </h1>
          <p className="text-sm text-white/60 mb-6 max-w-lg">
            Pairing, perspective, and heritage set every pronoun, tag, and cover image.
          </p>

          <div className="flex items-center gap-2 mb-6">
            {(["pairing", "perspective", "heritage"] as const).map((s, i) => {
              const active = subStep === s;
              const done =
                (s === "pairing" && !!selectedPairing) ||
                (s === "perspective" && !!perspective) ||
                (s === "heritage" && !!heritage);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    if (s === "perspective" && !selectedPairing) return;
                    if (s === "heritage" && (!selectedPairing || !perspective)) return;
                    setSubStep(s);
                  }}
                  className={`flex-1 rounded-full py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    active ? "text-white" : done ? "text-white/70" : "text-white/35"
                  }`}
                  style={
                    active
                      ? { background: `${EXPRESS_CRIMSON}55`, border: `1px solid ${EXPRESS_CRIMSON}66` }
                      : { border: "1px solid rgba(255,255,255,0.08)" }
                  }
                >
                  {i + 1}. {s === "pairing" ? "Pairing" : s === "perspective" ? "Perspective" : "Heritage"}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {selectedPairing && heroImage && subStep !== "pairing" && (
              <motion.div
                key={`${selectedPairing}-${subStep}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="relative mb-6 rounded-2xl overflow-hidden min-h-[180px] md:min-h-[200px]"
                style={{ border: `1px solid ${EXPRESS_CRIMSON}35`, boxShadow: `0 0 48px ${EXPRESS_CRIMSON}15` }}
              >
                <img
                  src={`${BASE}${heroImage}`}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
                <div className="relative z-10 p-6 flex flex-col justify-end min-h-[180px] md:min-h-[200px]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] mb-1" style={{ color: EXPRESS_ROSE }}>
                    {pairingCfg?.label}
                    {perspectiveCfg ? ` · ${perspectiveCfg.label}` : ""}
                  </p>
                  <h2 className="font-display text-2xl font-bold text-white">
                    {subStep === "heritage" && heritageCfg && heritage !== "Ambiguous"
                      ? `${heritageCfg.label} — ${heritageCfg.sub}`
                      : subStep === "perspective" && perspectiveCfg
                        ? perspectiveCfg.sub
                        : pairingCfg?.sub}
                  </h2>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-[10px] font-bold uppercase tracking-widest text-white/45 mb-1">
            {stepTitle}
          </p>
          <p className="text-sm text-white/55 mb-4 max-w-lg">{stepHint}</p>

          {subStep === "pairing" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
              {pairings.map((p) => {
                const img = PAIRING_IMAGES[p.id];
                const selected = selectedPairing === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onPairing(p.id);
                      setSubStep("perspective");
                    }}
                    className={`relative overflow-hidden rounded-xl border p-3 min-h-[88px] text-left transition-all ${
                      selected ? "ring-1" : "border-white/10 hover:border-[#c0392b]/35"
                    }`}
                    style={
                      selected
                        ? { borderColor: `${EXPRESS_CRIMSON}55`, boxShadow: `0 0 20px ${EXPRESS_CRIMSON}22` }
                        : undefined
                    }
                  >
                    {img && (
                      <img
                        src={`${BASE}${img}`}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 w-full h-full object-cover opacity-55"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient}`} style={{ opacity: 0.65 }} />
                    <p className="relative z-10 font-semibold text-white text-sm">{p.label}</p>
                    <p className="relative z-10 text-[10px] text-white/60 mt-0.5">{p.sub}</p>
                  </button>
                );
              })}
            </div>
          )}

          {subStep === "perspective" && selectedPairing && (
            <div className="grid gap-2.5 mb-8">
              {PERSPECTIVES.filter((p) => validPerspectives.includes(p.id)).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onPerspective(p.id);
                    setSubStep("heritage");
                  }}
                  className={`relative overflow-hidden rounded-xl border p-4 text-left transition-all ${
                    perspective === p.id ? "ring-1" : "border-white/10 hover:border-[#c0392b]/35"
                  }`}
                  style={
                    perspective === p.id
                      ? { borderColor: `${p.accent}66`, boxShadow: `0 0 20px ${p.accent}22` }
                      : undefined
                  }
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient}`} style={{ opacity: 0.55 }} />
                  <p className="relative z-10 font-semibold text-white">{p.label}</p>
                  <p className="relative z-10 text-sm text-white/70 mt-0.5">{p.sub}</p>
                </button>
              ))}
            </div>
          )}

          {subStep === "heritage" && selectedPairing && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
              {HERITAGES.map((h) => (
                <ImageTile
                  key={h.id}
                  image={h.image}
                  label={h.label}
                  sub={h.sub}
                  accent={h.accent}
                  selected={heritage === h.id}
                  onClick={() => onHeritage(h.id)}
                  className="min-h-[96px]"
                />
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {subStep !== "pairing" && (
              <button
                type="button"
                onClick={() =>
                  setSubStep(subStep === "heritage" ? "perspective" : "pairing")
                }
                className="px-5 py-4 rounded-2xl font-semibold text-sm text-white/70 border border-white/15"
              >
                Back
              </button>
            )}
            <button
              type="button"
              disabled={!canContinue}
              onClick={onContinue}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm text-white disabled:opacity-40"
              style={{
                background: canContinue
                  ? `linear-gradient(135deg, ${EXPRESS_CRIMSON}, ${EXPRESS_WINE})`
                  : "rgba(255,255,255,0.08)",
                boxShadow: canContinue ? `0 0 32px ${EXPRESS_CRIMSON}55` : "none",
              }}
            >
              Continue — choose your situation
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="hidden lg:block lg:sticky lg:top-20">
          <ExpressLivingBrief brief={brief} />
        </div>
      </div>
    </div>
  );
}

/* ── Act II · Situation (200+ scenes) ─────────────────────────────── */

export function AfterDarkExpressSituation({
  selectedPairing,
  situationId,
  situationLabel,
  onSituation,
  onContinue,
  onBack,
  onOpenStudio,
  brief,
}: {
  selectedPairing: string;
  situationId: string;
  situationLabel: string;
  onSituation: (id: string, label: string) => void;
  onContinue: () => void;
  onBack: () => void;
  onOpenStudio: () => void;
  brief: ExpressBriefState;
}) {
  const activeSit = SITUATIONS.find((s) => s.id === situationId);
  const previewText = activeSit
    ? interpolateHomeSituation(activeSit, selectedPairing)
    : situationLabel || "Choose what happens — or let us surprise you.";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 pb-32 md:pb-16 w-full min-w-0">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
        <div className="min-w-0">
          <ExpressActHeader current={3} brief={brief} />
          <ExpressStepNav
            onBack={onBack}
            backLabel="Back to the world"
            onOpenStudio={onOpenStudio}
          />

          <p className="text-[10px] font-bold uppercase tracking-[0.28em] mb-2" style={{ color: EXPRESS_ROSE }}>
            Act IV · The situation
          </p>
          <h1 className="font-display text-2xl md:text-4xl font-bold text-white leading-tight mb-2">
            What&apos;s happening?
          </h1>
          <p className="text-sm text-white/60 mb-5 max-w-lg">
            The literary setup — read the scene in your pronouns. No stock photos, just the writing.
          </p>

          <SituationLiteraryPanel
            pairing={selectedPairing}
            situationId={situationId}
            situationLabel={situationLabel}
            previewText={previewText}
            hideBrowseAll
            compact
            fullBrief={{
              pairing: selectedPairing,
              chemistry: brief.chemistry,
              archetype: brief.archetype,
              setting: brief.setting,
              voice: brief.voiceName,
              intensity: castingIntensityToHome(brief.intensity),
              situationId: situationId || undefined,
              situationLabel: situationLabel || undefined,
            }}
            onChange={onSituation}
          />
        </div>

        <div className="hidden lg:block lg:sticky lg:top-20">
          <ExpressLivingBrief brief={brief} />
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 z-30 md:static md:mt-8 px-4 pb-4 pt-3 md:p-0 bg-gradient-to-t from-[#0a0608] via-[#0a0608]/95 to-transparent md:from-transparent md:via-transparent pointer-events-none md:pointer-events-auto">
        <button
          type="button"
          onClick={onContinue}
          className="pointer-events-auto w-full md:flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm text-white min-h-[52px]"
          style={{
            background: `linear-gradient(135deg, ${EXPRESS_CRIMSON}, ${EXPRESS_WINE})`,
            boxShadow: `0 0 32px ${EXPRESS_CRIMSON}55`,
          }}
        >
          {situationId ? "Continue — make it yours" : "Skip — make it yours"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Act III · Fantasy (centrepiece) ─────────────────────────────────── */

export function AfterDarkExpressFantasy({
  rooms,
  curatedScenarios,
  allScenarios,
  selectedPairing,
  activeRoomTab,
  selectedScenario,
  intensityIndex,
  homeBriefBanner,
  onRoomTab,
  onScenario,
  onIntensity,
  onContinue,
  onBack,
  onOpenStudio,
  adaptScenarioText,
  brief,
}: {
  rooms: RoomOption[];
  curatedScenarios: ExpressScenario[];
  allScenarios: ExpressScenario[];
  selectedPairing: string;
  activeRoomTab: string;
  selectedScenario: ExpressScenario | null;
  intensityIndex: number;
  homeBriefBanner?: boolean;
  onRoomTab: (tab: string) => void;
  onScenario: (s: ExpressScenario) => void;
  onIntensity: (index: number) => void;
  onContinue: () => void;
  onBack: () => void;
  onOpenStudio: () => void;
  adaptScenarioText?: (text: string) => string;
  brief: ExpressBriefState;
}) {
  const adapt = adaptScenarioText ?? ((t: string) => t);
  const heroCover = selectedScenario
    ? getScenarioImage(selectedScenario.id, selectedScenario.room, BASE)
    : null;

  const displayedScenarios = useMemo(() => {
    const base =
      activeRoomTab === "featured"
        ? curatedScenarios
        : allScenarios.filter((s) => s.room === activeRoomTab);
    return base.filter((s) => scenarioAllowsPairing(s, selectedPairing));
  }, [activeRoomTab, curatedScenarios, allScenarios, selectedPairing]);

  const roomCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of allScenarios) {
      if (!scenarioAllowsPairing(s, selectedPairing)) continue;
      counts[s.room] = (counts[s.room] ?? 0) + 1;
    }
    return counts;
  }, [allScenarios, selectedPairing]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-28 md:pb-16 w-full min-w-0">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
        <div className="min-w-0">
          <ExpressActHeader current={1} brief={brief} />
          <ExpressStepNav onBack={onBack} backLabel="Back to who's in the story" onOpenStudio={onOpenStudio} />

          {homeBriefBanner && (
            <div
              className="mb-5 px-4 py-3 rounded-xl border text-sm text-white/85"
              style={{ borderColor: `${EXPRESS_CRIMSON}40`, background: `${EXPRESS_CRIMSON}12` }}
            >
              Your brief from home — pick the fantasy that matches it.
            </div>
          )}

          <p className="text-[10px] font-bold uppercase tracking-[0.28em] mb-2" style={{ color: EXPRESS_ROSE }}>
            Act II · Your fantasy
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
            What are you imagining?
          </h1>
          <p className="text-sm text-white/60 mb-6 max-w-lg">
            Browse by room — cinematic After Dark fantasies. The situation comes next, in words.
          </p>

          <AnimatePresence mode="wait">
            {selectedScenario && heroCover && (
              <motion.div
                key={selectedScenario.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="relative mb-4 md:mb-6 rounded-2xl overflow-hidden min-h-[200px] md:min-h-[280px]"
                style={{ border: `1px solid ${EXPRESS_CRIMSON}40`, boxShadow: `0 0 56px ${EXPRESS_CRIMSON}18` }}
              >
                <img
                  src={heroCover}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover object-[center_25%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/15" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
                <div className="relative z-10 p-6 md:p-8 flex flex-col justify-end min-h-[240px] md:min-h-[300px] max-w-xl">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.24em] mb-2"
                    style={{ color: selectedScenario.accent }}
                  >
                    {selectedScenario.darkness}
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
                    {adapt(selectedScenario.label)}
                  </h2>
                  <p className="text-sm md:text-base text-white/85 italic leading-relaxed">
                    &ldquo;{adapt(selectedScenario.sub)}&rdquo;
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <HorizontalScrollRow className="flex gap-2 overflow-x-auto pb-2 mb-4 snap-x snap-mandatory scrollbar-hide">
            <button
              type="button"
              onClick={() => onRoomTab("featured")}
              className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
                activeRoomTab === "featured"
                  ? "text-white"
                  : "border-white/12 text-white/55 hover:border-[#c0392b]/35"
              }`}
              style={
                activeRoomTab === "featured"
                  ? { borderColor: `${EXPRESS_CRIMSON}66`, background: `${EXPRESS_CRIMSON}18` }
                  : undefined
              }
            >
              Featured · {curatedScenarios.length}
            </button>
            {rooms.map((room) => {
              const count = roomCounts[room.id] ?? 0;
              if (count === 0) return null;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => onRoomTab(room.id)}
                  className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${
                    activeRoomTab === room.id
                      ? "border-white/40 bg-white/10 text-white"
                      : "border-white/12 text-white/55 hover:border-white/25"
                  }`}
                  style={activeRoomTab === room.id ? { borderColor: `${room.accent}66` } : undefined}
                >
                  {room.name} · {count}
                </button>
              );
            })}
          </HorizontalScrollRow>

          <HorizontalScrollRow className="flex sm:grid sm:grid-cols-3 gap-3 sm:gap-2 max-h-none sm:max-h-[320px] overflow-x-auto sm:overflow-y-auto overscroll-contain pb-2 sm:pr-1 mb-6 sm:mb-8 snap-x snap-mandatory scrollbar-hide">
            {displayedScenarios.map((s) => {
              const selected = selectedScenario?.id === s.id;
              const cover = getScenarioImage(s.id, s.room, BASE);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onScenario(s)}
                  className={`relative flex-shrink-0 w-[140px] sm:w-auto snap-start rounded-xl border overflow-hidden text-left transition-all min-h-[120px] sm:min-h-[100px] ${
                    selected ? "ring-1" : "border-white/10 hover:border-[#c0392b]/35"
                  }`}
                  style={
                    selected
                      ? { borderColor: `${EXPRESS_CRIMSON}66`, boxShadow: `0 0 24px ${EXPRESS_CRIMSON}25` }
                      : undefined
                  }
                >
                  {cover && (
                    <img src={cover} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-80" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/20" />
                  <div className="relative z-10 p-3 flex flex-col justify-end min-h-[120px] sm:min-h-[100px]">
                    <p className="font-semibold text-white text-xs leading-tight line-clamp-2">{adapt(s.label)}</p>
                  </div>
                </button>
              );
            })}
          </HorizontalScrollRow>

          <p className="text-[10px] font-bold uppercase tracking-widest text-white/45 mb-3">How explicit?</p>
          <IntensityDial activeIndex={intensityIndex} onChange={onIntensity} />

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              type="button"
              disabled={!selectedScenario}
              onClick={onContinue}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm text-white disabled:opacity-40"
              style={{
                background: selectedScenario
                  ? `linear-gradient(135deg, ${EXPRESS_CRIMSON}, ${EXPRESS_WINE})`
                  : "rgba(255,255,255,0.08)",
                boxShadow: selectedScenario ? `0 0 32px ${EXPRESS_CRIMSON}55` : "none",
              }}
            >
              Continue — choose the world
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="hidden lg:block lg:sticky lg:top-20">
          <ExpressLivingBrief brief={brief} />
        </div>
      </div>
    </div>
  );
}

/* ── Act III · World + the heat between them ─────────────────────── */

export function AfterDarkExpressWorld({
  scenario,
  selectedPairing,
  country,
  city,
  setting,
  chemistry,
  archetype,
  voiceName,
  narratorVoiceId,
  charAVoiceId,
  charBVoiceId,
  onCountry,
  onCity,
  onSetting,
  onChemistry,
  onArchetype,
  onVoice,
  onNarratorVoice,
  onCharAVoice,
  onCharBVoice,
  onContinue,
  onBack,
  onOpenStudio,
  brief,
}: {
  scenario: ExpressScenario;
  selectedPairing: string | null;
  country: string;
  city: string;
  setting: string;
  chemistry: string;
  archetype: string;
  voiceName: string;
  narratorVoiceId: string;
  charAVoiceId: string;
  charBVoiceId: string;
  onCountry: (c: string) => void;
  onCity: (c: string) => void;
  onSetting: (s: string) => void;
  onChemistry: (v: string) => void;
  onArchetype: (v: string) => void;
  onVoice: (v: string) => void;
  onNarratorVoice: (id: string) => void;
  onCharAVoice: (id: string) => void;
  onCharBVoice: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
  onOpenStudio: () => void;
  brief: ExpressBriefState;
}) {
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [settingPickerOpen, setSettingPickerOpen] = useState(false);
  const selectedSettingData = setting ? getSettingById(setting) : undefined;
  const countryCount = Object.keys(COUNTRY_CITIES).length;
  const preview =
    (country && getCountryPreview(country)) ||
    (country && COUNTRY_CULTURAL_PREVIEW[country]) ||
    null;
  const cities = country ? (COUNTRY_CITIES[country] ?? []) : [];
  const canContinue = !!country && !!setting;
  const flag = country ? COUNTRY_FLAGS[country] : null;

  const chemistries = useMemo(
    () => (selectedPairing ? buildChemistries(selectedPairing) : []),
    [selectedPairing],
  );
  const archetypes = useMemo(
    () => (selectedPairing ? buildArchetypes(selectedPairing) : []),
    [selectedPairing],
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-28 md:pb-16 w-full min-w-0">
      <CountryPickerModal
        open={countryPickerOpen}
        selected={country}
        onSelect={onCountry}
        onClose={() => setCountryPickerOpen(false)}
      />
      <SettingPickerModal
        open={settingPickerOpen}
        selected={setting}
        onSelect={onSetting}
        onClose={() => setSettingPickerOpen(false)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 lg:gap-8 items-start">
        <div className="min-w-0">
          <ExpressActHeader current={2} brief={brief} />
          <ExpressStepNav onBack={onBack} backLabel="Back to fantasy" onOpenStudio={onOpenStudio} />

          <div className="flex items-center gap-2 mb-2">
            <Globe2 className="w-4 h-4" style={{ color: EXPRESS_ROSE }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: EXPRESS_ROSE }}>
              Act III · The world — and the heat
            </p>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
            Where does <span style={{ color: scenario.accent }}>{scenario.label}</span> unfold?
          </h1>
          <p className="text-sm text-white/60 mb-6 max-w-lg">
            {countryCount} countries, eras, and private rooms — written into every scene. No generic backdrop.
          </p>

          <div className="rounded-2xl border bg-white/[0.02] p-4 sm:p-5 mb-6" style={{ borderColor: `${EXPRESS_CRIMSON}28` }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] mb-4" style={{ color: EXPRESS_ROSE }}>Where it unfolds</p>

            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/45">Country</p>
              <button
                type="button"
                onClick={() => setCountryPickerOpen(true)}
                className="text-[11px] font-semibold text-[#e879a0] hover:text-[#f0a0bc] underline underline-offset-2"
              >
                Browse all {countryCount} →
              </button>
            </div>

            <div className="hidden sm:grid sm:grid-cols-4 gap-2 mb-4">
              {FEATURED_COUNTRIES.map((c) => {
                const selected = country === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => onCountry(c.name)}
                    className={`relative overflow-hidden rounded-xl border p-3 text-left min-h-[72px] transition-all ${
                      selected ? "border-[#e879a0]/50 bg-[#e879a0]/10" : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <span className="text-xl leading-none">{c.flag}</span>
                    <p className="font-semibold text-white text-xs mt-1">{c.name}</p>
                  </button>
                );
              })}
            </div>

            <div className="sm:hidden mb-4">
              <select
                value={country}
                onChange={(e) => onCountry(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-sm text-white appearance-none"
              >
                <option value="">Choose a country…</option>
                {FEATURED_COUNTRIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
                <option value="" disabled>— Browse all for full list —</option>
              </select>
              <button
                type="button"
                onClick={() => setCountryPickerOpen(true)}
                className="mt-2 text-[11px] font-semibold text-[#e879a0] underline underline-offset-2"
              >
                Browse all {countryCount} countries
              </button>
            </div>

            {country && (
              <div className="mb-4 flex items-center gap-2">
                {flag && <span className="text-2xl">{flag}</span>}
                <span className="text-sm font-semibold text-white">{country}</span>
                <button
                  type="button"
                  onClick={() => setCountryPickerOpen(true)}
                  className="text-xs text-white/45 hover:text-white/70 underline underline-offset-2 ml-1"
                >
                  Change
                </button>
              </div>
            )}

            {preview && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 pl-4 border-l-2 border-[#e879a0]/50"
              >
                <p className="font-display text-base italic text-white/90 leading-relaxed">&ldquo;{preview}&rdquo;</p>
              </motion.div>
            )}

            {country && cities.length > 0 && (
              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/45 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> City
                </p>
                <select
                  value={city}
                  onChange={(e) => onCity(e.target.value)}
                  className="w-full sm:w-auto sm:min-w-[200px] rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white"
                >
                  <option value="">Any city</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="border-t border-white/8 pt-4 mt-2">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/45">Room · era</p>
                <button
                  type="button"
                  onClick={() => setSettingPickerOpen(true)}
                  className="text-[11px] font-semibold text-[#e879a0] hover:text-[#f0a0bc] underline underline-offset-2 hidden sm:inline"
                >
                  Browse all {ALL_EXPRESS_SETTINGS.length} →
                </button>
              </div>

              <div className="sm:hidden mb-3">
                <select
                  value={setting}
                  onChange={(e) => onSetting(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-sm text-white"
                >
                  <option value="">Choose a room or era…</option>
                  {(["exclusive", "contemporary", "historical"] as const).map((group) => (
                    <optgroup key={group} label={SETTING_GROUP_LABELS[group]}>
                      {ALL_EXPRESS_SETTINGS.filter((s) => s.group === group).map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setSettingPickerOpen(true)}
                  className="mt-2 text-[11px] font-semibold text-[#e879a0] underline underline-offset-2"
                >
                  Browse all {ALL_EXPRESS_SETTINGS.length} with preview
                </button>
              </div>

              <AnimatePresence mode="wait">
                {selectedSettingData && (
                  <motion.div
                    key={setting}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="relative mb-4 rounded-xl overflow-hidden border border-white/15 min-h-[140px] md:min-h-[180px]"
                  >
                    {selectedSettingData.image && (
                      <img
                        src={`${BASE}${selectedSettingData.image}`}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
                    <div className="relative z-10 p-4 flex flex-col justify-end min-h-[140px] md:min-h-[180px]">
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: selectedSettingData.accent }}>
                        Your world
                      </p>
                      <h3 className="font-display text-lg md:text-xl font-bold text-white">{selectedSettingData.label}</h3>
                      <p className="text-xs text-white/75 italic mt-1 line-clamp-2">&ldquo;{selectedSettingData.sub}&rdquo;</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="hidden sm:flex sm:grid sm:grid-cols-3 gap-2">
                {FEATURED_EXPRESS_SETTINGS.map((s) => (
                  <ImageTile
                    key={s.id}
                    image={s.image}
                    label={s.label}
                    sub={s.sub}
                    selected={setting === s.id}
                    onClick={() => onSetting(s.id)}
                    className="min-h-[100px]"
                  />
                ))}
              </div>
            </div>
          </div>

          <details open className="my-8 pt-6 border-t border-white/10 group">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-2 mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#e879a0]">
                  The heat between them
                </p>
                <p className="text-sm text-white/55 mt-1">Dynamic, archetype, and who tells the story</p>
              </div>
              <span className="text-xs text-white/40 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="pt-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/45 mb-2">
              Dynamic — who moves first?
            </p>
            {selectedPairing && PAIRINGS.find((p) => p.id === selectedPairing)?.protagonistPronouns === PAIRINGS.find((p) => p.id === selectedPairing)?.partnerPronouns && (
              <p className="text-xs text-white/50 mb-3 italic">
                Same pronouns in this pairing — &ldquo;Your partner dominates&rdquo; is your love interest; &ldquo;You dominate&rdquo; is your character.
              </p>
            )}
            <HorizontalScrollRow className="flex gap-2 overflow-x-auto pb-2 mb-6 snap-x snap-mandatory">
              {chemistries.map((o) => (
                <ImageTile
                  key={o.id}
                  image={o.image}
                  label={o.label}
                  sub={o.sub}
                  selected={chemistry === o.id}
                  onClick={() => onChemistry(o.id)}
                  className="flex-shrink-0 w-[160px] snap-start min-h-[120px]"
                />
              ))}
            </HorizontalScrollRow>

            <p className="text-[10px] font-bold uppercase tracking-widest text-white/45 mb-2">Who are they?</p>
            <VerticalScrollCol className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6 max-h-[220px] overflow-y-auto pr-1">
              {archetypes.map((o) => (
                <ImageTile
                  key={o.id}
                  image={o.image}
                  label={o.label}
                  sub={o.sub}
                  selected={archetype === o.id}
                  onClick={() => onArchetype(o.id)}
                  className="min-h-[96px]"
                />
              ))}
            </VerticalScrollCol>

            <p className="text-xs text-white/50 mb-3">
              Lisa is our recommended narrator — tap a role chip to pick narrator or character voices.
            </p>
            <CastVoicePicker
              pairing={selectedPairing ?? "Her & Him"}
              narratorVoiceId={narratorVoiceId}
              charAVoiceId={charAVoiceId}
              charBVoiceId={charBVoiceId}
              onNarrator={(id) => {
                onNarratorVoice(id);
                const v = VOICES.find((voice) => voice.id === id);
                if (v?.displayName) onVoice(v.displayName);
              }}
              onCharA={onCharAVoice}
              onCharB={onCharBVoice}
              variant="express"
            />
            </div>
          </details>

          <div className="flex flex-col sm:flex-row gap-3 sticky bottom-0 py-3 bg-gradient-to-t from-black/90 to-transparent -mx-4 px-4 sm:static sm:bg-none sm:p-0 sm:m-0">
            <button
              type="button"
              disabled={!canContinue}
              onClick={onContinue}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm text-white disabled:opacity-40"
              style={{
                background: canContinue
                  ? `linear-gradient(135deg, ${EXPRESS_CRIMSON}, ${EXPRESS_WINE})`
                  : "rgba(255,255,255,0.08)",
                boxShadow: canContinue ? `0 0 32px ${EXPRESS_CRIMSON}55` : "none",
              }}
            >
              Continue — make it yours
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="hidden lg:block lg:sticky lg:top-20">
          <ExpressLivingBrief brief={brief} />
        </div>
      </div>
    </div>
  );
}

/* Legacy — cast step merged into Act I (pairing) + Act III (heat) */
export const AfterDarkExpressCast = AfterDarkExpressPairing;

/* ── Act IV · Make it yours — tag studio (conversion peak) ───────── */

const EXPRESS_CATEGORY_SUB: Record<string, string> = {
  "Restraint & BDSM": "Bound, blindfolded, begging — how far the surrender goes",
  "Submission & Worship": "On their knees. Every word of praise you want heard.",
  "Her Dominance": "She sets every rule — they follow, or else",
  "Your dominance": "You set every rule — your partner follows, or else",
  "What does she really want?": "The desire she's never said out loud",
  "What does he really want?": "What he's been holding back — finally written",
  "What do they really want?": "The hunger between them, finally named",
  "How do you want to feel?": "Breathless, adored, undone — you choose the register",
  "Words & Praise": "Exactly what you want whispered while it happens",
  "Dark Fantasy": "When the rules break — power, risk, impossible want",
  "What's between them?": "The charge before anyone touches",
  "How do you want it written?": "Languid and literary — or raw and explicit",
  "What makes this yours?": "The detail that makes it unmistakably your fantasy",
  "Pure Romance": "When tenderness is the whole story — and still burns",
  "Praise & Devotion": "Adoration woven through every scene, every breath",
  "Story Arc & Plot": "The slow climb — or the fall that takes all night",
  "Just the Scene": "No buildup. Start in the middle of it.",
  "How does it end?": "The final note — satisfied, ruined, or wanting more",
};

function getExpressCategoryTabs(protagonistPronouns: string, partnerPronouns?: string): string[] {
  const isShe = !protagonistPronouns.startsWith("he") && !protagonistPronouns.startsWith("they");
  const isHe = protagonistPronouns.startsWith("he");
  const isThey = protagonistPronouns.startsWith("they");
  const sameGender = !!partnerPronouns && protagonistPronouns === partnerPronouns;
  const skip = new Set<string>();
  if (isShe) {
    skip.add("What does he really want?");
    skip.add("What do they really want?");
  }
  if (isHe) {
    skip.add("What does she really want?");
    skip.add("What do they really want?");
    skip.add("Her Dominance");
    skip.add("Your dominance");
  }
  if (isThey) {
    skip.add("What does she really want?");
    skip.add("What does he really want?");
    skip.add("Her Dominance");
    skip.add("Your dominance");
  }
  let tabs = Object.keys(EXPRESS_CATEGORY_SHORT).filter((h) => !skip.has(h));
  if (sameGender) {
    tabs = tabs.map((h) => (h === "Her Dominance" ? "Your dominance" : h));
  }
  return tabs;
}

export function AfterDarkExpressMakeItYours({
  selectedPairing,
  customTags,
  listenerName,
  partnerName,
  onListenerName,
  onPartnerName,
  onTagToggle,
  onReveal,
  onSkip,
  onBack,
  onOpenStudio,
  brief,
}: {
  selectedPairing: string | null;
  customTags: string[];
  listenerName: string;
  partnerName: string;
  onListenerName: (name: string) => void;
  onPartnerName: (name: string) => void;
  onTagToggle: (tag: string) => void;
  onReveal: () => void;
  onSkip: () => void;
  onBack: () => void;
  onOpenStudio: () => void;
  brief: ExpressBriefState;
}) {
  const [noteDismissed, setNoteDismissed] = useState(false);
  const pairingCfg = PAIRINGS.find((p) => p.id === selectedPairing);
  const protagonistPronouns = pairingCfg?.protagonistPronouns ?? "she/her";
  const partnerPronouns = pairingCfg?.partnerPronouns ?? "he/him";
  const isSameGender = protagonistPronouns === partnerPronouns;

  const categoryTabs = useMemo(
    () => getExpressCategoryTabs(protagonistPronouns, partnerPronouns),
    [protagonistPronouns, partnerPronouns],
  );

  useEffect(() => {
    const urls = categoryTabs.flatMap((heading) =>
      getCategoryImagePool(heading).map((path) => act4Img(path)),
    );
    preloadImages(urls);
  }, [categoryTabs]);

  const [activeTagCategory, setActiveTagCategory] = useState(() =>
    defaultCategoryForRoom(brief.scenario?.room),
  );
  const [tagPulse, setTagPulse] = useState(0);
  const [categoryPickCounts, setCategoryPickCounts] = useState<Record<string, number>>({});
  const [tagBlockHint, setTagBlockHint] = useState<string | null>(null);

  useEffect(() => {
    const preferred = defaultCategoryForRoom(brief.scenario?.room);
    if (categoryTabs.includes(preferred)) {
      setActiveTagCategory(preferred);
    }
  }, [brief.scenario?.room, categoryTabs]);

  const handleTagToggle = (tag: string) => {
    if (customTags.includes(tag)) {
      setTagBlockHint(null);
      onTagToggle(tag);
      setTagPulse((n) => n + 1);
      return;
    }
    const block = getExpressTagBlockReason(
      tag,
      customTags,
      protagonistPronouns,
      partnerPronouns,
    );
    if (block) {
      setTagBlockHint(`${block.message} ${block.solution}`);
      return;
    }
    setTagBlockHint(null);
    onTagToggle(tag);
    setTagPulse((n) => n + 1);
  };

  const protagonistP = protagonistPronouns === "he/him"
    ? { subject: "He", object: "him" }
    : protagonistPronouns === "they/them"
      ? { subject: "They", object: "them" }
      : { subject: "She", object: "her" };

  const fallbackCover =
    (brief.scenario && getScenarioImage(brief.scenario.id, brief.scenario.room, BASE)) ??
    (selectedPairing && PAIRING_IMAGES[selectedPairing]
      ? `${BASE}${PAIRING_IMAGES[selectedPairing]}`
      : `${BASE}images/category-explicit_collection.webp`);

  const suggestedTags = useMemo(
    () =>
      suggestExpressTags({
        scenario: brief.scenario,
        chemistry: brief.chemistry,
        mood: brief.mood,
        protagonistPronouns,
        selectedTags: customTags,
        max: 5,
      }),
    [brief.scenario, brief.chemistry, brief.mood, protagonistPronouns, customTags],
  );

  const tagCap = AFTER_DARK_TAG_CAP;
  const desirePct = Math.min(100, (customTags.length / tagCap) * 100);

  return (
    <div className="relative max-w-5xl mx-auto px-4 py-6 pb-44 md:pb-36 w-full min-w-0">
      <div className="relative z-10 min-w-0">
      <ExpressActHeader current={4} brief={brief} />
      <ExpressStepNav onBack={onBack} backLabel="Back to situation" onOpenStudio={onOpenStudio} />

      <ExpressCategoryHero
        category={activeTagCategory}
        categoryTabs={categoryTabs}
        activeCategory={activeTagCategory}
        onCategoryChange={setActiveTagCategory}
        subtitle={EXPRESS_CATEGORY_SUB[activeTagCategory] ?? "Tell us exactly how you want it written."}
        pulseKey={tagPulse}
        fallbackCover={fallbackCover}
        categoryPickCounts={categoryPickCounts}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6 items-start">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            {isSameGender && !noteDismissed ? (
              <div className="flex items-start gap-2 flex-1 max-w-lg">
                <p className="text-xs text-white/45 italic">
                  {protagonistP.subject.toLowerCase()} = your character · {protagonistP.object} = your love interest
                </p>
                <button
                  type="button"
                  onClick={() => setNoteDismissed(true)}
                  className="text-white/35 hover:text-white/60 flex-shrink-0"
                  aria-label="Dismiss note"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-white/50 italic flex-1">
                Every choice is written in — explicit, personal, unrestrained.
              </p>
            )}
            <button
              type="button"
              onClick={onSkip}
              className="text-xs text-white/45 hover:text-[#e879a0] transition-colors whitespace-nowrap flex-shrink-0"
            >
              Surprise me →
            </button>
          </div>

          {tagBlockHint && (
            <p className="mb-4 text-xs text-amber-200/90 bg-amber-950/40 border border-amber-500/30 rounded-xl px-4 py-3 leading-relaxed">
              {tagBlockHint}
            </p>
          )}

          {suggestedTags.length > 0 && (
            <div className="mb-5 rounded-xl border border-[#e879a0]/25 overflow-hidden bg-[#1a0008]/50">
              <div className="relative h-16 overflow-hidden">
                <img
                  src={act4Img(getCategoryGallery(activeTagCategory).alternates[0] ?? getCategoryGallery(activeTagCategory).primary)}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/25" />
                <p className="relative z-10 px-4 pt-4 text-[10px] font-bold uppercase tracking-wider text-[#e879a0]">
                  Suggested for your fantasy
                </p>
              </div>
              <HorizontalScrollRow className="px-3 pb-3 flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                {suggestedTags.map((tag) => {
                  const block = customTags.includes(tag)
                    ? null
                    : getExpressTagBlockReason(tag, customTags, protagonistPronouns, partnerPronouns);
                  const disabled = !!block;
                  return (
                  <button
                    key={tag}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleTagToggle(tag)}
                    title={block ? `${block.message} ${block.solution}` : undefined}
                    className={`flex-shrink-0 snap-start px-4 py-2.5 rounded-full text-xs font-semibold border text-white transition-all ${
                      disabled
                        ? "border-white/10 bg-black/20 text-white/35 cursor-not-allowed"
                        : "border-[#e879a0]/40 bg-black/40 hover:bg-[#e879a0]/20 hover:shadow-[0_0_20px_rgba(232,121,160,0.25)]"
                    }`}
                  >
                    + {getTagDisplayLabel(tag)}
                  </button>
                  );
                })}
              </HorizontalScrollRow>
            </div>
          )}

          <ExpressCharacterNames
            listenerName={listenerName}
            partnerName={partnerName}
            onListenerName={onListenerName}
            onPartnerName={onPartnerName}
            protagonistLabel={
              protagonistPronouns === "he/him"
                ? "Your character's name"
                : protagonistPronouns === "they/them"
                  ? "Your character's name"
                  : "Your character's name"
            }
            partnerLabel={
              partnerPronouns === "he/him"
                ? "His name"
                : partnerPronouns === "they/them"
                  ? "Their name"
                  : "Her name"
            }
          />

          <StoryTagStudio
            selectedTags={customTags}
            onTagToggle={handleTagToggle}
            afterDark
            express
            expressTabbed
            expressHeroMode
            hideCategoryNav
            activeCategoryHeading={activeTagCategory}
            onActiveCategoryChange={setActiveTagCategory}
            onCategoryCountsChange={setCategoryPickCounts}
            accentColor={EXPRESS_CRIMSON}
            protagonistPronouns={protagonistPronouns}
            partnerPronouns={partnerPronouns}
            isSameGender={isSameGender}
          />

        </div>

        <div className="hidden lg:block lg:sticky lg:top-20">
          <ExpressLivingBrief brief={brief} />
        </div>
      </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-30 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t backdrop-blur-xl bg-gradient-to-t from-black via-black/95 to-black/80"
        style={{ borderColor: `${EXPRESS_CRIMSON}40` }}
      >
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #c0392b, #e879a0)" }}
                animate={{ width: `${desirePct}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-[11px] tabular-nums text-white/50 whitespace-nowrap">
              {customTags.length}/{tagCap}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p className="text-xs text-white/55 flex-1 text-center sm:text-left">
              {customTags.length > 0
                ? `${customTags.length} desire${customTags.length === 1 ? "" : "s"} locked in — written exactly as you chose.`
                : "Tap what you want written in — or surprise me and we'll infer from your fantasy."}
            </p>
            <button
              type="button"
              onClick={onReveal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm text-white"
              style={{
                background: "linear-gradient(135deg, #c0392b, #922b21)",
                boxShadow: customTags.length > 0 ? "0 0 40px rgba(192,57,43,0.5)" : "0 0 24px rgba(192,57,43,0.25)",
              }}
            >
              <Sparkles className="w-4 h-4" />
              {customTags.length >= 3 ? "Write it exactly like this" : "Reveal my story"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use AfterDarkExpressMakeItYours */
export const AfterDarkExpressScenes = AfterDarkExpressMakeItYours;

export const AfterDarkExpressAct1 = AfterDarkExpressPairing;
export const AfterDarkExpressAct2 = AfterDarkExpressFantasy;
export const AfterDarkExpressYours = AfterDarkExpressMakeItYours;
