/** Shared world / place data for Express flow and Casting Room handoff */

export type PlaceTile = {
  id: string;
  label: string;
  sub: string;
  image?: string;
  accent: string;
};

export const FEATURED_COUNTRIES: {
  name: string;
  flag: string;
  preview: string;
  settingImage: string;
}[] = [
  { name: "France", flag: "🇫🇷", preview: "Wine-dark afternoons, café tables at dusk, and a city that has always known desire.", settingImage: "images/settings/belle_epoque.webp" },
  { name: "Italy", flag: "🇮🇹", preview: "Heat on terracotta, voices spilling from every window, and passion worn openly.", settingImage: "images/settings/european_villa.webp" },
  { name: "United Kingdom", flag: "🇬🇧", preview: "Rain on Georgian stone, pub warmth after midnight, and a restraint that breaks slowly.", settingImage: "images/settings/victorian_london.webp" },
  { name: "Greece", flag: "🇬🇷", preview: "Whitewashed walls, cobalt water, and afternoons that stretch until they become evenings.", settingImage: "images/settings/ancient_mediterranean.webp" },
  { name: "Monaco", flag: "🇲🇨", preview: "Old money, salt air off the harbour, and the intimacy of a very small world.", settingImage: "images/settings/private_yacht.webp" },
  { name: "Morocco", flag: "🇲🇦", preview: "Marrakech's labyrinth, riad courtyards, lantern light and spice — desire at Africa's edge.", settingImage: "images/settings/mountain_retreat.webp" },
  { name: "Japan", flag: "🇯🇵", preview: "Kyoto's wabi-sabi restraint, Tokyo's neon — precision masking feeling.", settingImage: "images/settings/feudal_japan.webp" },
  { name: "Bali", flag: "🇮🇩", preview: "Ubud's rice-terrace quiet and a spirituality woven into every touch.", settingImage: "images/settings/beach_house.webp" },
  { name: "Maldives", flag: "🇲🇻", preview: "Overwater bungalows — the world reduced to water, light, and absolute privacy.", settingImage: "images/settings/private_yacht.webp" },
  { name: "USA", flag: "🇺🇸", preview: "New York's electricity, New Orleans' heat, LA's golden hour — a continent of contrast.", settingImage: "images/settings/penthouse_suite.webp" },
  { name: "Argentina", flag: "🇦🇷", preview: "Buenos Aires' tango and steak dinners — Latin passion worn without apology.", settingImage: "images/settings/rooftop_bar.webp" },
  { name: "UAE", flag: "🇦🇪", preview: "Desert luxury at its limit — Dubai's vertical excess after dark.", settingImage: "images/settings/penthouse_suite.webp" },
  { name: "Spain", flag: "🇪🇸", preview: "Late dinners, flamenco after midnight, and a heat that never quite fades.", settingImage: "images/settings/european_villa.webp" },
  { name: "Thailand", flag: "🇹🇭", preview: "Bangkok's temple-and-traffic charge, island evenings where sea meets firelight.", settingImage: "images/settings/beach_house.webp" },
  { name: "Australia", flag: "🇦🇺", preview: "Sydney harbour drama, Byron Bay's coast — confidence by the water.", settingImage: "images/settings/beach_house.webp" },
  { name: "Mexico", flag: "🇲🇽", preview: "Tequila and ancient cities, Tulum's jungle cenotes — full-colour desire.", settingImage: "images/settings/european_villa.webp" },
];

export const COUNTRY_CITIES: Record<string, string[]> = {
  France: ["Paris", "Nice", "Lyon", "Provence", "Côte d'Azur", "Bordeaux"],
  Italy: ["Rome", "Florence", "Venice", "Amalfi Coast", "Milan", "Sicily"],
  "United Kingdom": ["London", "Edinburgh", "Bath", "Cotswolds", "Manchester", "Cornwall"],
  Greece: ["Athens", "Santorini", "Mykonos", "Crete", "Corfu"],
  Monaco: ["Monte Carlo"],
  Morocco: ["Marrakech", "Fes", "Casablanca", "Essaouira"],
  Japan: ["Tokyo", "Kyoto", "Osaka", "Hakone"],
  Bali: ["Seminyak", "Ubud", "Uluwatu", "Canggu"],
  Maldives: ["North Malé Atoll", "Baa Atoll", "Ari Atoll"],
  USA: ["New York", "Los Angeles", "New Orleans", "Miami", "Chicago", "San Francisco"],
  Argentina: ["Buenos Aires", "Bariloche", "Mendoza"],
  UAE: ["Dubai", "Abu Dhabi"],
  Spain: ["Barcelona", "Madrid", "Seville", "Ibiza", "Marbella"],
  Thailand: ["Bangkok", "Phuket", "Chiang Mai", "Koh Samui"],
  Australia: ["Sydney", "Melbourne", "Byron Bay", "Gold Coast"],
  Mexico: ["Mexico City", "Tulum", "Cancún", "Oaxaca"],
};

export const EXPRESS_SETTINGS: PlaceTile[] = [
  { id: "Luxury Hotel", label: "Luxury Hotel", sub: "A room for one night only", image: "images/settings/luxury_hotel.webp", accent: "#c9a227" },
  { id: "Victorian London (1880s)", label: "Victorian London", sub: "Fog, corsets, what's unspeakable and felt", image: "images/settings/victorian_london.webp", accent: "#9ca3af" },
  { id: "Private Yacht", label: "Private Yacht", sub: "Open water. No escape.", image: "images/settings/private_yacht.webp", accent: "#0ea5e9" },
  { id: "European Villa", label: "European Villa", sub: "Heat, terraces, no schedule", image: "images/settings/european_villa.webp", accent: "#d97706" },
  { id: "Private Club", label: "Private Club", sub: "Invitation only. No cameras.", image: "images/settings/private_club.webp", accent: "#fb7185" },
  { id: "VIP Suite", label: "VIP Suite", sub: "No names. No history. No morning.", image: "images/settings/vip_suite.webp", accent: "#f43f5e" },
  { id: "Office After Hours", label: "Office After Hours", sub: "Everyone else has gone.", image: "images/settings/office_after_hours.webp", accent: "#818cf8" },
  { id: "Belle Époque Paris (1900s)", label: "Belle Époque Paris", sub: "Absinthe, salons, decadent evenings", image: "images/settings/belle_epoque.webp", accent: "#f59e0b" },
  { id: "Penthouse Suite", label: "Penthouse Suite", sub: "City below. Glass between you and the world.", image: "images/settings/penthouse_suite.webp", accent: "#c084fc" },
  { id: "Private Members Club", label: "Members Club", sub: "Velvet booths. Whispered power.", image: "images/settings/private_members_club.webp", accent: "#fcd34d" },
  { id: "Rooftop Bar", label: "Rooftop Bar", sub: "City spread out. A decision.", image: "images/settings/rooftop_bar.webp", accent: "#e879a0" },
  { id: "Regency England (1810s)", label: "Regency England", sub: "Letters never sent. Country-house urgency.", image: "images/settings/regency_england.webp", accent: "#fcd34d" },
];

export const EXPRESS_ATMOSPHERES = [
  "Candlelit", "Midnight", "Stormy", "Firelit", "Electric", "Languid", "Golden Hour", "Rain",
] as const;

export const EXPRESS_MOODS = [
  { id: "Forbidden", hint: "Wrong — and exactly why you want it" },
  { id: "Raw", hint: "Nothing polished. Nothing held back." },
  { id: "Burning", hint: "Urgent. Consuming. Now." },
  { id: "Charged", hint: "Every glance a promise" },
  { id: "Surrender", hint: "You stop choosing safe" },
  { id: "Breathless", hint: "Neither of you is in control" },
  { id: "Slow Burn", hint: "Weeks of almost — finally" },
  { id: "Reckless", hint: "Consequences can wait" },
] as const;

export function getCountryPreview(name: string): string | undefined {
  return FEATURED_COUNTRIES.find((c) => c.name === name)?.preview;
}

export function getCountrySettingImage(name: string): string | undefined {
  return FEATURED_COUNTRIES.find((c) => c.name === name)?.settingImage;
}

export function suggestSettingForScenarioRoom(roomId: string): string {
  const map: Record<string, string> = {
    power_exchange: "Private Members Club",
    the_forbidden: "Office After Hours",
    slow_burn: "European Villa",
    dark_territory: "VIP Suite",
    more_than_two: "Luxury Hotel",
    sweet_and_savage: "Luxury Hotel",
    the_edge: "Penthouse Suite",
    eyes_on_us: "Rooftop Bar",
    in_character: "Belle Époque Paris (1900s)",
  };
  return map[roomId] ?? "Luxury Hotel";
}

export function suggestAfterDarkSceneForRoom(roomId: string): string {
  const map: Record<string, string> = {
    power_exchange: "Private Club",
    the_forbidden: "The Back Room",
    dark_territory: "VIP Suite",
    more_than_two: "VIP Suite",
    eyes_on_us: "The Glass House",
    slow_burn: "Private Spa Suite",
    in_character: "Dressing Room",
    the_edge: "Locked Room",
    sweet_and_savage: "Hotel Balcony",
  };
  return map[roomId] ?? "Private Club";
}

export function suggestCountryForSetting(settingId: string): string | undefined {
  if (settingId.includes("London") || settingId.includes("Regency")) return "United Kingdom";
  if (settingId.includes("Paris") || settingId.includes("Belle")) return "France";
  if (settingId.includes("Victorian")) return "United Kingdom";
  return undefined;
}
