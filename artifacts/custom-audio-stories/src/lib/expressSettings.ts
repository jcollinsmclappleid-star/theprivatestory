import {
  AFTER_DARK_SETTINGS,
  CONTEMPORARY_SETTINGS,
  HISTORICAL_SETTINGS,
} from "@/components/CastingRoom";
import type { PlaceTile } from "@/lib/worldSelection";

export type SettingGroup = "exclusive" | "contemporary" | "historical";

export type ExpressSettingOption = PlaceTile & {
  group: SettingGroup;
  gradient?: string;
};

function toTile(
  s: {
    id: string;
    label: string;
    sub: string;
    accent: string;
    image?: string;
    gradient?: string;
  },
  group: SettingGroup,
): ExpressSettingOption {
  return {
    id: s.id,
    label: s.label,
    sub: s.sub,
    accent: s.accent,
    image: s.image,
    gradient: s.gradient,
    group,
  };
}

export const ALL_EXPRESS_SETTINGS: ExpressSettingOption[] = [
  ...AFTER_DARK_SETTINGS.map((s) => toTile(s, "exclusive")),
  ...CONTEMPORARY_SETTINGS.map((s) => toTile(s, "contemporary")),
  ...HISTORICAL_SETTINGS.map((s) => toTile(s, "historical")),
];

export const SETTING_GROUP_LABELS: Record<SettingGroup, string> = {
  exclusive: "After Dark Exclusive",
  contemporary: "Contemporary",
  historical: "Historical Era",
};

export function getSettingById(id: string): ExpressSettingOption | undefined {
  return ALL_EXPRESS_SETTINGS.find((s) => s.id === id);
}

/** Featured quick-pick tiles in Act III (subset) */
export const FEATURED_EXPRESS_SETTINGS = ALL_EXPRESS_SETTINGS.filter((s) =>
  [
    "Luxury Hotel",
    "Private Club",
    "VIP Suite",
    "Office After Hours",
    "Penthouse Suite",
    "European Villa",
    "Victorian London (1880s)",
    "Belle Époque Paris (1900s)",
    "Private Members Club",
    "Rooftop Bar",
    "Private Yacht",
    "Moving Elevator",
    "Regency England (1810s)",
  ].includes(s.id),
);
