export interface Story {
  id: string;
  title: string;
  description: string;
  mood: string;
  tags: string[];
  duration: string;
  coverImage: string;
  audioUrl?: string;
  isPremium: boolean;
  isNew: boolean;
  isSeries?: boolean;
  seriesName?: string;
  seriesEpisode?: number;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  description: string;
  duration: string;
  isLocked: boolean;
  audioUrl?: string;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  mood: string;
  coverImage: string;
  episodeCount: number;
  episodes: Episode[];
  tags: string[];
}

const coverImages = [
  "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800&q=80",
  "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
  "https://images.unsplash.com/photo-1518756131217-31eb79b20e8f?w=800&q=80",
  "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
  "https://images.unsplash.com/photo-1499678329028-101435549a4e?w=800&q=80",
  "https://images.unsplash.com/photo-1516562309708-05f3b2b2c238?w=800&q=80",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80",
  "https://images.unsplash.com/photo-1521575107034-e0fa0b594529?w=800&q=80",
  "https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=800&q=80",
  "https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800&q=80",
  "https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=800&q=80",
  "https://images.unsplash.com/photo-1495908333425-29a1e0918c5f?w=800&q=80",
  "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
];

export const mockStories: Story[] = [
  { id: "s1", title: "The Last Train to Midnight", description: "A chance encounter on an empty train rewrites everything you thought you knew about longing.", mood: "Late Night", tags: ["slow-burn", "strangers", "tension"], duration: "8 min", coverImage: coverImages[0], isPremium: false, isNew: true },
  { id: "s2", title: "Silk and Smoke", description: "He finds you in the dimly lit corner of the bar. Neither of you is meant to be there.", mood: "Forbidden", tags: ["forbidden", "desire", "bar"], duration: "10 min", coverImage: coverImages[1], isPremium: false, isNew: false },
  { id: "s3", title: "The Slow Burn", description: "You've worked beside him for months. Tonight the electricity can no longer be ignored.", mood: "Slow Burn", tags: ["coworkers", "tension", "build-up"], duration: "12 min", coverImage: coverImages[2], isPremium: true, isNew: false },
  { id: "s4", title: "Rain on Glass", description: "Stranded at a roadside inn, two strangers share the only room left. And a fire.", mood: "First Encounter", tags: ["strangers", "slow-burn", "cozy"], duration: "9 min", coverImage: coverImages[3], isPremium: false, isNew: true },
  { id: "s5", title: "Velvet Hours", description: "The gallery closes and he stays behind, just to hear you describe the painting you love most.", mood: "Tender", tags: ["art", "intimate", "romantic"], duration: "7 min", coverImage: coverImages[4], isPremium: true, isNew: false },
  { id: "s6", title: "Midnight in Montmartre", description: "Paris after dark. A borrowed jacket. The way he says your name in French.", mood: "Late Night", tags: ["paris", "romance", "travel"], duration: "5 min", coverImage: coverImages[5], isPremium: false, isNew: false },
  { id: "s7", title: "The Forbidden Archive", description: "The library was supposed to close an hour ago. You both forgot to leave.", mood: "Forbidden", tags: ["books", "forbidden", "secret"], duration: "11 min", coverImage: coverImages[6], isPremium: true, isNew: true },
  { id: "s8", title: "All That Remains", description: "He left three years ago. Now he's standing at your door in the rain, asking for five minutes.", mood: "Emotional", tags: ["reunion", "longing", "second-chance"], duration: "15 min", coverImage: coverImages[7], isPremium: true, isNew: false },
  { id: "s9", title: "Five Floors Down", description: "The elevator stops. The lights flicker. You are very close, and suddenly very aware of his breathing.", mood: "First Encounter", tags: ["elevator", "tension", "close-quarters"], duration: "5 min", coverImage: coverImages[8], isPremium: false, isNew: false },
  { id: "s10", title: "The Summer Garden", description: "Evening light. Bare feet on warm stone. The way he looks at you like you are the whole summer.", mood: "Tender", tags: ["summer", "romantic", "gentle"], duration: "8 min", coverImage: coverImages[9], isPremium: false, isNew: true },
  { id: "s11", title: "Studio Sessions", description: "He writes music. You translate it into something more dangerous — movement.", mood: "Slow Burn", tags: ["music", "dance", "creative-tension"], duration: "13 min", coverImage: coverImages[10], isPremium: true, isNew: false },
  { id: "s12", title: "The Night Shift", description: "The hospital is quiet. He brings you coffee. This has been going on for months.", mood: "Late Night", tags: ["hospital", "slow-burn", "coworkers"], duration: "10 min", coverImage: coverImages[11], isPremium: false, isNew: false },
  { id: "s13", title: "Glass Walls", description: "Corner offices, glass walls, and a rivalry that was never just about work.", mood: "Forbidden", tags: ["office", "rivals", "forbidden"], duration: "14 min", coverImage: coverImages[12], isPremium: true, isNew: false },
  { id: "s14", title: "Before the Storm", description: "You always knew you'd fall for him. You just didn't think it would happen here, in front of everyone.", mood: "Emotional", tags: ["public", "confession", "emotional"], duration: "9 min", coverImage: coverImages[13], isPremium: false, isNew: false },
  { id: "s15", title: "The Fireplace Manuscript", description: "A rented cabin. A handwritten manuscript. And a man who writes like he knows you.", mood: "Slow Burn", tags: ["writer", "cabin", "discovery"], duration: "12 min", coverImage: coverImages[14], isPremium: true, isNew: true },
  { id: "s16", title: "Stolen Weekend", description: "An accidental weekend away becomes the only thing you'll think about for years.", mood: "First Encounter", tags: ["travel", "adventure", "spontaneous"], duration: "5 min", coverImage: coverImages[0], isPremium: false, isNew: false },
  { id: "s17", title: "The Curator", description: "He built the museum. You are the only piece he cannot own.", mood: "Forbidden", tags: ["art", "power", "desire"], duration: "11 min", coverImage: coverImages[1], isPremium: true, isNew: false },
  { id: "s18", title: "Pressed Flowers", description: "You find a book in the charity shop. Inside: a pressed flower, a name, and a note for you.", mood: "Tender", tags: ["mystery", "gentle", "wonder"], duration: "7 min", coverImage: coverImages[2], isPremium: false, isNew: true },
  { id: "s19", title: "After the Exhibition", description: "The guests have left. The champagne is flat. He asks if you want to stay.", mood: "Late Night", tags: ["art", "intimacy", "night"], duration: "5 min", coverImage: coverImages[3], isPremium: false, isNew: false },
  { id: "s20", title: "Letters Never Sent", description: "You read the letters he wrote but never posted. Every one of them is to you.", mood: "Emotional", tags: ["letters", "longing", "revelation"], duration: "13 min", coverImage: coverImages[4], isPremium: true, isNew: true },
  { id: "s21", title: "The Arrangement", description: "A business arrangement. A shared apartment. Lines that blur every time the lights go out.", mood: "Forbidden", tags: ["arrangement", "roommate", "slow-burn"], duration: "10 min", coverImage: coverImages[5], isPremium: false, isNew: false, isSeries: true, seriesName: "The Arrangement", seriesEpisode: 1 },
  { id: "s22", title: "Rooftop at 2am", description: "You find each other on the roof every sleepless night. He brings whiskey. You bring quiet.", mood: "Late Night", tags: ["rooftop", "night", "whiskey"], duration: "8 min", coverImage: coverImages[6], isPremium: false, isNew: false },
  { id: "s23", title: "The Diagnosis", description: "The news changes everything. So does the way he holds your hand when you tell him.", mood: "Emotional", tags: ["emotional", "love", "vulnerable"], duration: "12 min", coverImage: coverImages[7], isPremium: true, isNew: false },
  { id: "s24", title: "Morning Light", description: "He is still there when you wake up. Neither of you planned this. Neither of you minds.", mood: "Tender", tags: ["morning", "soft", "gentle"], duration: "5 min", coverImage: coverImages[8], isPremium: false, isNew: true },
  { id: "s25", title: "The Chef's Table", description: "A private table, a seven-course tasting menu, and a chef who wants to know what you taste like happy.", mood: "Slow Burn", tags: ["food", "luxury", "slow-burn"], duration: "11 min", coverImage: coverImages[9], isPremium: true, isNew: false },
  { id: "s26", title: "Borrowed Time", description: "You only have tonight. Both of you know it. Neither of you is willing to waste it.", mood: "First Encounter", tags: ["one-night", "passion", "bittersweet"], duration: "9 min", coverImage: coverImages[10], isPremium: false, isNew: false },
  { id: "s27", title: "The Last Chapter", description: "An editor and her author have spent two years sharing their voices. Tonight they share more.", mood: "Forbidden", tags: ["publishing", "creative", "forbidden"], duration: "14 min", coverImage: coverImages[11], isPremium: true, isNew: true },
  { id: "s28", title: "Candlelight", description: "The power goes out across the whole neighbourhood. He is at your door within minutes.", mood: "Tender", tags: ["power-cut", "neighbour", "candlelight"], duration: "5 min", coverImage: coverImages[12], isPremium: false, isNew: false },
  { id: "s29", title: "The Return", description: "He has been in Tokyo for two years. You have been fine. Then he texts: I'm back.", mood: "Emotional", tags: ["return", "longing", "reunion"], duration: "10 min", coverImage: coverImages[13], isPremium: true, isNew: false },
  { id: "s30", title: "Deep Water", description: "An island. A sailing boat. And nowhere to run from the conversation you've been avoiding for months.", mood: "Slow Burn", tags: ["island", "sailing", "confrontation"], duration: "15 min", coverImage: coverImages[14], isPremium: true, isNew: true },
];

export const mockSeries: Series[] = [
  {
    id: "sr1",
    title: "The Arrangement",
    description: "A business arrangement turns into something neither of them planned. A five-part slow-burn series that unfolds across shared spaces, late nights, and words spoken in the dark.",
    mood: "Forbidden",
    coverImage: coverImages[5],
    episodeCount: 5,
    tags: ["slow-burn", "roommate", "forbidden", "series"],
    episodes: [
      { id: "sr1e1", episodeNumber: 1, title: "Ground Rules", description: "Establish the terms. Ignore the tension.", duration: "10 min", isLocked: false },
      { id: "sr1e2", episodeNumber: 2, title: "The First Breach", description: "One evening breaks all the rules.", duration: "11 min", isLocked: false },
      { id: "sr1e3", episodeNumber: 3, title: "Aftermath", description: "Neither of you speaks about it. Both of you think about nothing else.", duration: "12 min", isLocked: true },
      { id: "sr1e4", episodeNumber: 4, title: "Undone", description: "The arrangement is no longer enough.", duration: "13 min", isLocked: true },
      { id: "sr1e5", episodeNumber: 5, title: "What We Are", description: "An ending. Or a beginning. You decide.", duration: "14 min", isLocked: true },
    ],
  },
  {
    id: "sr2",
    title: "The Glass House",
    description: "A remote commission. A modernist house with floor-to-ceiling windows. An architect who sees everything — and wants to know if you let anyone see you.",
    mood: "Slow Burn",
    coverImage: coverImages[10],
    episodeCount: 4,
    tags: ["architect", "isolation", "slow-burn", "series"],
    episodes: [
      { id: "sr2e1", episodeNumber: 1, title: "Blueprint", description: "The house is not finished. Neither is he.", duration: "9 min", isLocked: false },
      { id: "sr2e2", episodeNumber: 2, title: "The Open Plan", description: "Living in open space with someone teaches you things.", duration: "10 min", isLocked: false },
      { id: "sr2e3", episodeNumber: 3, title: "Glass", description: "You can see everything. You choose to stay.", duration: "11 min", isLocked: true },
      { id: "sr2e4", episodeNumber: 4, title: "The Light That Remains", description: "What's left when there are no walls between you.", duration: "12 min", isLocked: true },
    ],
  },
  {
    id: "sr3",
    title: "Midnight Letters",
    description: "An anonymous correspondence across apartment walls. Notes slipped under doors. A voice you recognise but a face you've never seen.",
    mood: "Tender",
    coverImage: coverImages[3],
    episodeCount: 3,
    tags: ["letters", "mystery", "romance", "series"],
    episodes: [
      { id: "sr3e1", episodeNumber: 1, title: "The First Letter", description: "Someone knows exactly what you needed to hear.", duration: "8 min", isLocked: false },
      { id: "sr3e2", episodeNumber: 2, title: "Reply", description: "You write back. Nothing is the same.", duration: "9 min", isLocked: false },
      { id: "sr3e3", episodeNumber: 3, title: "The Door", description: "Tonight you find out who is on the other side.", duration: "10 min", isLocked: true },
    ],
  },
  {
    id: "sr4",
    title: "The Other Side of the World",
    description: "An international project. A hotel room in a city neither of you calls home. Three weeks and a time difference that will change everything.",
    mood: "First Encounter",
    coverImage: coverImages[7],
    episodeCount: 4,
    tags: ["travel", "strangers", "intense", "series"],
    episodes: [
      { id: "sr4e1", episodeNumber: 1, title: "Arrivals", description: "You both arrive in the wrong terminal. Somehow.", duration: "9 min", isLocked: false },
      { id: "sr4e2", episodeNumber: 2, title: "The Project", description: "Working together was not supposed to feel like this.", duration: "10 min", isLocked: false },
      { id: "sr4e3", episodeNumber: 3, title: "Room Service", description: "An excuse becomes an invitation.", duration: "11 min", isLocked: true },
      { id: "sr4e4", episodeNumber: 4, title: "Departures", description: "The last morning. The question neither of you will ask.", duration: "12 min", isLocked: true },
    ],
  },
];
