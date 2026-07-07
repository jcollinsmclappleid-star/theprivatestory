import { buildPresetFromSelections, type CastCategoryId } from "@/components/BriefBuilder";
import type { AnatomyPreset } from "@/components/StoryAnatomy";
import { act4 } from "@/lib/chemistryImages";

export type HomeStoryShowcase = {
  id: string;
  title: string;
  tagline: string;
  image: string;
  intensity: string;
  situationLabel?: string;
  selections: Record<CastCategoryId, string>;
};

/** Example generated stories — selections + cover art for homepage carousel. */
export const HOME_STORY_SHOWCASES: HomeStoryShowcase[] = [
  {
    id: "penthouse-clause",
    title: "The Penthouse Clause",
    tagline: "She wrote the terms. He signed without asking what they were.",
    image: act4("penthouse-hotel-mf"),
    intensity: "Explicit",
    situationLabel: "The arrangement",
    selections: {
      pairing: "Her & Him",
      chemistry: "Power Play",
      archetype: "The Executive",
      setting: "Luxury hotel",
      voice: "Lisa",
    },
  },
  {
    id: "fog-cheyne-walk",
    title: "Fog on Cheyne Walk",
    tagline: "He shouldn't be in her study. She should have locked the door.",
    image: act4("london-townhouse-mf"),
    intensity: "Warm",
    situationLabel: "Unexpected reunion",
    selections: {
      pairing: "Her & Him",
      chemistry: "Forbidden Pull",
      archetype: "The Professor",
      setting: "Victorian London",
      voice: "Sofia",
    },
  },
  {
    id: "what-she-asked-for",
    title: "What She Asked For",
    tagline: "Permission for everything — and she gave it, slowly.",
    image: act4("private-yacht-mf"),
    intensity: "Warm",
    situationLabel: "Worship in whispers",
    selections: {
      pairing: "Her & Him",
      chemistry: "Slow Surrender",
      archetype: "The Charmer",
      setting: "Private yacht",
      voice: "Theo",
    },
  },
  {
    id: "her-agenda",
    title: "Her Agenda",
    tagline: "The door locked. The meeting was hers to run.",
    image: act4("office-after-hours-mf"),
    intensity: "Explicit",
    situationLabel: "Office after hours",
    selections: {
      pairing: "Her & Him",
      chemistry: "Power Play",
      archetype: "The Executive",
      setting: "Office after hours",
      voice: "James",
    },
  },
  {
    id: "two-keys-one-suite",
    title: "Two Keys, One Suite",
    tagline: "Adjoining doors. One of them knocked twice.",
    image: act4("adjoining-suites-mfm"),
    intensity: "Explicit",
    situationLabel: "Adjoining suites",
    selections: {
      pairing: "Her & Him & Him",
      chemistry: "Slow Surrender",
      archetype: "The Stranger",
      setting: "Luxury hotel",
      voice: "Maya",
    },
  },
  {
    id: "after-the-gala",
    title: "After the Gala",
    tagline: "They weren't supposed to leave together. They did anyway.",
    image: act4("after-gala"),
    intensity: "Warm",
    situationLabel: "One last dance",
    selections: {
      pairing: "Her & Her",
      chemistry: "Push & Pull",
      archetype: "The Stranger",
      setting: "Luxury hotel",
      voice: "Maya",
    },
  },
  {
    id: "heat-on-the-veranda",
    title: "Heat on the Veranda",
    tagline: "Two men. One terrace. She didn't pretend she hadn't noticed.",
    image: act4("caribbean-mfm"),
    intensity: "Explicit",
    situationLabel: "Caribbean evening",
    selections: {
      pairing: "Her & Him & Him",
      chemistry: "Power Play",
      archetype: "The Stranger",
      setting: "Private yacht",
      voice: "Lisa",
    },
  },
  {
    id: "midnight-balcony",
    title: "Midnight on the Balcony",
    tagline: "She crossed the room. That was answer enough.",
    image: act4("her-her-bw"),
    intensity: "Warm",
    situationLabel: "Suite balcony",
    selections: {
      pairing: "Her & Her",
      chemistry: "Slow Surrender",
      archetype: "The Charmer",
      setting: "Luxury hotel",
      voice: "Maya",
    },
  },
  {
    id: "thirty-floors",
    title: "Thirty Floors",
    tagline: "The elevator slowed. Neither of them stepped back.",
    image: act4("elevator-mf"),
    intensity: "Warm",
    situationLabel: "Moving elevator",
    selections: {
      pairing: "Her & Him",
      chemistry: "Forbidden Pull",
      archetype: "The Stranger",
      setting: "Luxury hotel",
      voice: "James",
    },
  },
];

export function presetForShowcase(story: HomeStoryShowcase): AnatomyPreset {
  return buildPresetFromSelections(story.selections, {
    intensity: story.intensity,
    situationLabel: story.situationLabel,
    title: story.title,
    teaser: story.tagline,
  });
}

/** @deprecated use HOME_STORY_SHOWCASES */
export const HOME_MOOD_SLIDES = HOME_STORY_SHOWCASES;
