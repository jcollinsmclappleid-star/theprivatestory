import { Sparkles } from "lucide-react";

const BASE = import.meta.env.BASE_URL;

/** Single gold-door config for /after-dark funnel CTAs. */
export const MAIN_FUNNEL_DOOR = {
  id: "story",
  room: "Personalised Erotica",
  name: "Personalised Erotica",
  shortName: "Personalised",
  tagline:
    "Erotic audio written and narrated around you — intimate, explicit when you choose, entirely private.",
  cta: "Create your fantasy",
  href: "/after-dark",
  Icon: Sparkles,
  image: `${BASE}images/door-romance.webp`,
  accent: "#c9a227",
  rgb: "201,162,39",
  labelColor: "rgba(201,162,39,0.72)",
  nameColor: "#e8d5a0",
  taglineColor: "rgba(201,162,39,0.90)",
  bg: "linear-gradient(180deg, #1d1105 0%, #130d07 55%, #0b0906 100%)",
  border: "rgba(201,162,39,0.24)",
  borderHover: "rgba(201,162,39,0.70)",
  borderPulse: "rgba(201,162,39,0.42)",
  glow: "rgba(201,162,39,0.20)",
  glowPulse: "rgba(201,162,39,0.10)",
  panelBorder: "rgba(201,162,39,0.13)",
  panelBorderHover: "rgba(201,162,39,0.30)",
  knob: "rgba(201,162,39,0.28)",
  knobHover: "rgba(201,162,39,0.65)",
  underLight: "rgba(201,162,39,0.14)",
  teasers: [
    { text: "Cast the dynamic. Set the intensity.", blur: false },
    { text: "From slow burn to explicitly unrestrained.", blur: false },
    { text: "Written fresh. Heard only by you.", blur: false },
  ],
  moodImages: [
    { src: `${BASE}images/category-historical_romance.webp`, x: 8, y: 7, rot: -4, w: 52 },
    { src: `${BASE}images/category-forbidden_desire.webp`, x: 52, y: 11, rot: 3, w: 50 },
    { src: `${BASE}images/category-slow_burn.webp`, x: 10, y: 40, rot: -6, w: 48 },
    { src: `${BASE}images/category-second_chance.webp`, x: 50, y: 43, rot: 5, w: 50 },
  ],
} as const;
