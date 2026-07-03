export type AfterDarkSetting = {
  id: string;
  label: string;
  sub: string;
  gradient: string;
  accent: string;
  image?: string;
};

export type AfterDarkSceneCategory = {
  id: string;
  label: string;
  hint: string;
  sceneIds: string[];
};

export const AFTER_DARK_SCENE_CATEGORIES: AfterDarkSceneCategory[] = [
  {
    id: "forbidden",
    label: "Forbidden Spaces",
    hint: "Invitation only. No cameras. No witnesses.",
    sceneIds: ["Private Club", "The Back Room", "VIP Suite", "Locked Room"],
  },
  {
    id: "exposed",
    label: "On Display",
    hint: "Glass, height, and the thrill of being seen.",
    sceneIds: ["The Glass House", "Penthouse Pool", "Hotel Balcony", "Rooftop 3am"],
  },
  {
    id: "transit",
    label: "In Transit",
    hint: "Nowhere to go. Nowhere you'd rather be.",
    sceneIds: ["Moving Elevator", "First-Class Cabin", "Yacht Cabin"],
  },
  {
    id: "after_hours",
    label: "After Hours",
    hint: "When the performance ends — and something else begins.",
    sceneIds: ["Private Cinema", "Dressing Room", "Private Spa Suite"],
  },
];

export function scenesForCategory(
  categoryId: string,
  allScenes: AfterDarkSetting[],
): AfterDarkSetting[] {
  const cat = AFTER_DARK_SCENE_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return allScenes;
  return cat.sceneIds
    .map((id) => allScenes.find((s) => s.id === id))
    .filter((s): s is AfterDarkSetting => !!s);
}
