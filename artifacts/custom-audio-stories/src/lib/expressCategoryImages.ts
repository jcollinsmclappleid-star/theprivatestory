/** Act IV category imagery — bespoke generated hero art + stock alternates */

import { expressAct4ImagePath } from "@/lib/expressAct4Slugs";

export type ExpressCategoryGallery = {
  primary: string;
  alternates: string[];
  focus: string;
  glow: string;
};

export const EXPRESS_CATEGORY_GALLERIES: Record<string, ExpressCategoryGallery> = {
  "Restraint & BDSM": {
    primary: expressAct4ImagePath("Restraint & BDSM"),
    alternates: [
      "images/category-dominant_surrendered.webp",
      "images/chemistry/power_play.webp",
      "images/seo-body-silk-on-velvet.webp",
    ],
    focus: "center 38%",
    glow: "#c0392b",
  },
  "Submission & Worship": {
    primary: expressAct4ImagePath("Submission & Worship"),
    alternates: [
      "images/category-explicit_collection.webp",
      "images/chemistry/worship.webp",
      "images/seo-body-lovers-embrace.webp",
    ],
    focus: "center 42%",
    glow: "#e879a0",
  },
  "Her Dominance": {
    primary: expressAct4ImagePath("Her Dominance"),
    alternates: [
      "images/chemistry/leads.webp",
      "images/category-dominant_surrendered.webp",
      "images/settings/penthouse_suite.webp",
    ],
    focus: "center 35%",
    glow: "#f472b6",
  },
  "What does she really want?": {
    primary: expressAct4ImagePath("What does she really want?"),
    alternates: [
      "images/category-forbidden_desire.webp",
      "images/seo-body-whisper-close.webp",
      "images/seo-body-shoulder-whisper.webp",
    ],
    focus: "center 40%",
    glow: "#fb7185",
  },
  "What does he really want?": {
    primary: expressAct4ImagePath("What does he really want?"),
    alternates: [
      "images/category-forbidden_desire.webp",
      "images/chemistry/forbidden_pull.webp",
      "images/chemistry/takes_charge.webp",
    ],
    focus: "center 40%",
    glow: "#fb7185",
  },
  "What do they really want?": {
    primary: expressAct4ImagePath("What do they really want?"),
    alternates: [
      "images/category-emotional_desire.webp",
      "images/chemistry/equal_tension.webp",
      "images/seo-body-hands-entwined.webp",
    ],
    focus: "center 42%",
    glow: "#818cf8",
  },
  "How do you want to feel?": {
    primary: expressAct4ImagePath("How do you want to feel?"),
    alternates: [
      "images/express-act4-elevator-mf.webp",
      "images/express-act4-her-her-bw.webp",
      "images/seo-body-bedroom-glow.webp",
    ],
    focus: "center 48%",
    glow: "#e879a0",
  },
  "Words & Praise": {
    primary: expressAct4ImagePath("Words & Praise"),
    alternates: [
      "images/seo-body-shoulder-whisper.webp",
      "images/seo-body-listening-in-silk.webp",
      "images/chemistry/worship.webp",
    ],
    focus: "center 40%",
    glow: "#f0a0bc",
  },
  "Dark Fantasy": {
    primary: expressAct4ImagePath("Dark Fantasy"),
    alternates: [
      expressAct4ImagePath("After the Gala"),
      "images/express-act4-office-after-hours-mf.webp",
      "images/settings/penthouse_suite.webp",
    ],
    focus: "center 38%",
    glow: "#7c3aed",
  },
  "What's between them?": {
    primary: expressAct4ImagePath("What's between them?"),
    alternates: [
      "images/express-act4-london-townhouse-mf.webp",
      "images/category-forbidden_desire.webp",
      "images/chemistry/rivals.webp",
    ],
    focus: "center 44%",
    glow: "#fb923c",
  },
  "How do you want it written?": {
    primary: expressAct4ImagePath("How do you want it written?"),
    alternates: [
      "images/seo-body-four-poster-bed.webp",
      "images/rooms/the_edge.webp",
      "images/settings/luxury_hotel.webp",
    ],
    focus: "center 50%",
    glow: "#c9a227",
  },
  "What makes this yours?": {
    primary: expressAct4ImagePath("What makes this yours?"),
    alternates: [
      "images/seo-body-morning-sheets.webp",
      "images/category-slow_burn.webp",
      "images/seo-body-candlelit-doorway.webp",
    ],
    focus: "center 52%",
    glow: "#e879a0",
  },
  "Pure Romance": {
    primary: expressAct4ImagePath("Pure Romance"),
    alternates: [
      "images/express-act4-her-her-bw.webp",
      expressAct4ImagePath("After the Gala"),
      "images/seo-body-lovers-embrace.webp",
    ],
    focus: "center 46%",
    glow: "#f472b6",
  },
  "Praise & Devotion": {
    primary: expressAct4ImagePath("Praise & Devotion"),
    alternates: [
      "images/express-act4-caribbean-mfm.webp",
      "images/seo-body-lovers-embrace.webp",
      "images/chemistry/worship.webp",
    ],
    focus: "center 42%",
    glow: "#e879a0",
  },
  "Story Arc & Plot": {
    primary: expressAct4ImagePath("Story Arc & Plot"),
    alternates: [
      "images/category-second_chance.webp",
      "images/category-historical_romance.webp",
      "images/seo-body-rain-on-window.webp",
    ],
    focus: "center 45%",
    glow: "#818cf8",
  },
  "Just the Scene": {
    primary: expressAct4ImagePath("Just the Scene"),
    alternates: [
      "images/express-act4-adjoining-suites-mfm.webp",
      "images/express-act4-private-yacht-mf.webp",
      "images/settings/vip_suite.webp",
    ],
    focus: "center 40%",
    glow: "#c0392b",
  },
  "How does it end?": {
    primary: expressAct4ImagePath("How does it end?"),
    alternates: [
      "images/seo-body-embrace-window.webp",
      "images/seo-body-morning-sheets.webp",
      "images/seo-body-dancing-close.webp",
    ],
    focus: "center 50%",
    glow: "#e879a0",
  },
};

/** Flat map for backwards compat — primary image only */
export const EXPRESS_CATEGORY_IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(EXPRESS_CATEGORY_GALLERIES).map(([k, v]) => [k, v.primary]),
);

export function getCategoryGallery(heading: string): ExpressCategoryGallery {
  return (
    EXPRESS_CATEGORY_GALLERIES[heading] ?? {
      primary: expressAct4ImagePath("Restraint & BDSM"),
      alternates: ["images/seo-body-bedroom-glow.webp", "images/chemistry/lovers.webp"],
      focus: "center 40%",
      glow: "#e879a0",
    }
  );
}

export function getCategoryImagePool(heading: string): string[] {
  const g = getCategoryGallery(heading);
  return [g.primary, ...g.alternates];
}

export function getCategoryThumb(heading: string): string {
  return getCategoryGallery(heading).primary;
}

export const EXPRESS_CATEGORY_SHORT: Record<string, string> = {
  "Restraint & BDSM": "Restraint",
  "Submission & Worship": "Worship",
  "Her Dominance": "Her leads",
  "What does she really want?": "Desire",
  "What does he really want?": "Desire",
  "What do they really want?": "Desire",
  "How do you want to feel?": "Feel",
  "Words & Praise": "Praise",
  "Dark Fantasy": "Dark",
  "What's between them?": "Tension",
  "How do you want it written?": "Style",
  "What makes this yours?": "Yours",
  "Pure Romance": "Romance",
  "Praise & Devotion": "Devotion",
  "Story Arc & Plot": "Plot",
  "Just the Scene": "Scene",
  "How does it end?": "Ending",
};
