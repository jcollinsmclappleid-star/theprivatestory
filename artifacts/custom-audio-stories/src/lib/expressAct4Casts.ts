/**
 * Unique character briefs per Act IV category.
 * Same painterly style as restraint-bdsm + tension; NEVER reuse the same faces.
 * Includes Her & Her + MFM; never Him & Him.
 */

export type Act4CastType = "Her & Him" | "Her & Her" | "MFM" | "Her solo" | "Her + supernatural";

export type Act4CharacterBrief = {
  cast: Act4CastType;
  /** Distinct faces — written into generation prompts */
  characters: string;
  scene: string;
  /** Approved on disk — skip regeneration */
  skipIfExists?: boolean;
};

export const EXPRESS_ACT4_CHARACTER_BRIEFS: Record<string, Act4CharacterBrief> = {
  "restraint-bdsm": {
    cast: "Her & Him",
    skipIfExists: true,
    characters: "Black woman, natural coiled updo, gold earrings, red dress",
    scene: "candlelit private club, crimson silk cord loosely at wrists, shadowed man in dark suit, power exchange through gaze",
  },
  tension: {
    cast: "Her & Him",
    skipIfExists: true,
    characters: "Black woman, coiled updo, red backless gown; white man, dark hair, charcoal suit",
    scene: "art gallery after hours, inches apart, champagne, forbidden rivals electricity, neither touching",
  },
  "submission-worship": {
    cast: "Her & Him",
    characters: "East Asian woman, sleek black bob, ivory silk robe; Arab man, trimmed beard, white open-collar shirt",
    scene: "penthouse window at night, city lights, his adoring gaze, her hand on his cheek, devotion through expression",
  },
  "her-dominance": {
    cast: "Her & Him",
    characters: "South Asian woman, long dark hair, emerald black dress; Nordic man, blond stubble, grey suit kneeling posture",
    scene: "leather chair, private study, she holds his chin, female dominance through poise, violet candlelight",
  },
  "desire-she": {
    cast: "Her solo",
    characters: "Latina woman, wavy chestnut hair loose on shoulders, copper silk robe",
    scene: "vanity mirror, candlelit bedroom, private longing expression, emotional solo portrait",
  },
  "desire-he": {
    cast: "Her & Him",
    characters: "West African man, close-cropped hair, strong jaw, white shirt open at collar",
    scene: "rain-streaked window at night, city neon, restrained hunger in his expression, wanting her",
  },
  "desire-they": {
    cast: "Her & Her",
    characters: "Indigenous woman, long straight black hair, copper gown; blonde woman, fair skin, chignon, navy dress",
    scene: "rooftop bar after hours, close conversation, city lights, forbidden electricity, champagne, no men",
  },
  feel: {
    cast: "Her & Her",
    characters: "East Asian woman, short black hair; Black woman, shoulder-length locs — different pair from desire-they",
    scene: "sun-flooded bedroom, forehead to forehead, soft linens, tender embrace, fully clothed, morning light",
  },
  "praise-words": {
    cast: "Her & Him",
    characters: "Middle Eastern woman, honey-toned skin, dark curls pinned up; Mediterranean man, olive skin, whispering close",
    scene: "candlelit dinner table, his mouth near her ear, her eyes closed, breathless intimacy, formal wear",
  },
  "dark-fantasy": {
    cast: "Her & Him",
    skipIfExists: true,
    characters: "White woman, blonde hair, sleek black dress; white man, brown hair, open-collar shirt",
    scene: "modern luxury hotel penthouse, city skyline night, power-play tension, NO text in scene",
  },
  "after-gala": {
    cast: "Her & Her",
    skipIfExists: true,
    characters:
      "Black woman, elegant updo, emerald gown and stole; South Asian woman, low bun, midnight blue cocktail dress",
    scene:
      "hotel corridor after charity gala, suite door, champagne, stolen charged glance, NO text on doors",
  },
  "penthouse-hotel-mf": {
    cast: "Her & Him",
    skipIfExists: true,
    characters: "White woman, blonde hair, black dress; white man, brown hair, open shirt dark trousers",
    scene: "Luxury Hotel penthouse suite, floor-to-ceiling windows, city night, champagne marble counter",
  },
  "london-townhouse-mf": {
    cast: "Her & Him",
    skipIfExists: true,
    characters: "White woman, auburn hair, burgundy dress; white man, dark hair, shirt sleeves",
    scene: "London Chelsea townhouse evening, rain on windows, study doorway reunion, modern interior",
  },
  "private-yacht-mf": {
    cast: "Her & Him",
    skipIfExists: true,
    characters: "White woman, blonde hair, ivory linen dress; white man, dark hair, white linen shirt",
    scene: "Private Yacht sundeck Monaco harbor night, city lights water, slow surrender railing",
  },
  "office-after-hours-mf": {
    cast: "Her & Him",
    skipIfExists: true,
    characters: "White woman, dark blonde hair, navy blazer dress; white man, light brown hair, loosened tie",
    scene: "Office After Hours glass boardroom, city lights, empty floor, her standing his seated",
  },
  "adjoining-suites-mfm": {
    cast: "MFM",
    skipIfExists: true,
    characters: "White woman, chestnut hair, emerald dress; two white men in tuxedos, attention on her",
    scene: "Luxury Hotel corridor adjoining suite doors ajar, MFM tension not male couple, champagne",
  },
  "caribbean-mfm": {
    cast: "MFM",
    skipIfExists: true,
    characters:
      "Towering athletic Black man white linen; white woman coral sundress; second man background resort wear",
    scene: "Caribbean beach house veranda sunset, turquoise sea, charged group dynamic, attention on her",
  },
  "her-her-bw": {
    cast: "Her & Her",
    skipIfExists: true,
    characters: "Black woman natural curls emerald slip; white woman auburn waves cream robe",
    scene: "luxury hotel suite balcony night, F+F intimate closeness, contemporary",
  },
  "elevator-mf": {
    cast: "Her & Him",
    skipIfExists: true,
    characters: "Racially ambiguous woman olive skin red dress; racially ambiguous man medium brown skin black shirt",
    scene: "modern glass elevator night city lights, confined charged proximity, no floor numbers visible",
  },
  "style-written": {
    cast: "Her & Him",
    characters: "Mixed-heritage woman, freckles, auburn waves; South Asian man, glasses, rolled shirtsleeves",
    scene: "four-poster bed with scattered books and handwritten pages, literary romance, burgundy bedding, candlelight",
  },
  yours: {
    cast: "Her & Her",
    characters: "Afro-Latina woman, natural afro, gold hoops; Korean woman, straight black hair, cream slip dress",
    scene: "ornate vanity mirror, one adjusting pearl necklace, other close behind hands on shoulders, candlelight",
  },
  romance: {
    cast: "Her & Her",
    characters: "Black woman, box braids, linen dress; white woman, strawberry blonde updo, sage dress — different from other Her & Her pairs",
    scene: "European villa terrace golden hour, seated close, olive trees, tender companionship, amber haze",
  },
  devotion: {
    cast: "MFM",
    characters: "Golden-brown woman, curly hair, emerald gown; Black man, bald, tuxedo; white man, silver hair, tuxedo — attention on her, men not a couple",
    scene: "candlelit private club table, champagne, she commands the conversation",
  },
  plot: {
    cast: "Her & Him",
    characters: "Indigenous woman, rain-damp dark hair, wool coat; East Asian man, gentle features, dark coat",
    scene: "rain-wet stone doorstep at night, recognition after years apart, hands almost touching, amber streetlamp",
  },
  scene: {
    cast: "MFM",
    characters: "Latina woman, dark ponytail, crimson cocktail dress; Middle Eastern man, tuxedo; Black man, tuxedo — different trio from devotion, attention on her",
    scene: "VIP suite sofa, city skyline, champagne, late night formal sophistication",
  },
  ending: {
    cast: "Her & Him",
    characters: "White woman, red hair loose on pillow; Black man, soft fade haircut — different couple from restraint/tension",
    scene: "dawn through sheer curtains, facing each other in bed, tender smiles, fingers intertwined on pillow",
  },
};
