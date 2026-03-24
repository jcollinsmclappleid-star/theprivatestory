import { Story, Series } from "@workspace/api-client-react";

// Mock data fallback for when the API isn't seeded yet
// We use placeholder images from Unsplash matching the cinematic/moody vibe

export const MOCK_STORIES: Story[] = [
  {
    id: "s1",
    title: "Midnight in Paris",
    description: "A chance encounter in a dimly lit jazz bar leads to an unforgettable night of whispered secrets and lingering touches across the City of Light.",
    mood: "Late Night",
    tags: ["Romance", "City", "Strangers"],
    duration: "12:45",
    coverImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    isPremium: false,
    isNew: true,
  },
  {
    id: "s2",
    title: "The Velvet Rope",
    description: "You've been invited to an exclusive underground club. The air is thick with tension and the person across the room hasn't looked away once.",
    mood: "Forbidden",
    tags: ["Tension", "Exclusive", "Mystery"],
    duration: "15:20",
    coverImage: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80",
    isPremium: true,
    isNew: false,
  },
  {
    id: "s3",
    title: "Slow Burn Morning",
    description: "Rain taps against the windowpane as you slowly wake up. There's no rush to leave the warmth of the tangled sheets.",
    mood: "Slow Burn",
    tags: ["Cozy", "Intimate", "Morning"],
    duration: "10:15",
    coverImage: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80",
    isPremium: false,
    isNew: false,
  },
  {
    id: "s4",
    title: "Your Private Driver",
    description: "The city blurrs past the tinted windows of the town car. The partition is up, and your driver has taken a detour.",
    mood: "Forbidden",
    tags: ["Power", "City", "Night"],
    duration: "08:30",
    coverImage: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80",
    isPremium: true,
    isNew: true,
  },
  {
    id: "s5",
    title: "Breathe With Me",
    description: "A tender, guided experience focusing on grounding yourself in the present moment, accompanied by a soothing, deep voice.",
    mood: "Tender",
    tags: ["Guided", "Relaxation", "Soft"],
    duration: "05:00",
    coverImage: "https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=800&q=80",
    isPremium: false,
    isNew: false,
  },
  {
    id: "s6",
    title: "After the Party",
    description: "The music is still ringing in your ears as you unlock your apartment door. You're finally alone, but not for long.",
    mood: "Late Night",
    tags: ["Aftercare", "Tension"],
    duration: "14:10",
    coverImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
    isPremium: true,
    isNew: false,
  },
  {
    id: "s7",
    title: "Library Whispers",
    description: "Studying late in the grand university library. The silence is deafening, making every glance and accidental brush of hands electric.",
    mood: "First Encounter",
    tags: ["Quiet", "Academic", "Tension"],
    duration: "11:55",
    coverImage: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80",
    isPremium: false,
    isNew: true,
  },
  {
    id: "s8",
    title: "Cabin in the Woods",
    description: "Snowed in for the weekend. The fire is dying down, and there's only one blanket left.",
    mood: "Slow Burn",
    tags: ["Winter", "Cozy", "Isolation"],
    duration: "18:40",
    coverImage: "https://images.unsplash.com/photo-1542661141-6548dbbb9266?w=800&q=80",
    isPremium: true,
    isNew: false,
  },
];

export const MOCK_SERIES: Series[] = [
  {
    id: "ser1",
    title: "The Hotel Manager",
    description: "You checked into room 402 for a quiet weekend, but the enigmatic hotel manager has taken a special interest in your stay. A five-part slow burn romance.",
    mood: "Slow Burn",
    coverImage: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80",
    episodeCount: 5,
    tags: ["Power Dynamic", "Luxury", "Mystery"],
    episodes: [
      { id: "e1", episodeNumber: 1, title: "Checking In", description: "The front desk encounter.", duration: "10:20", isLocked: false },
      { id: "e2", episodeNumber: 2, title: "Room Service", description: "A special delivery at midnight.", duration: "12:15", isLocked: true },
      { id: "e3", episodeNumber: 3, title: "The Penthouse", description: "An invitation you can't refuse.", duration: "14:30", isLocked: true },
      { id: "e4", episodeNumber: 4, title: "Do Not Disturb", description: "Locking the world out.", duration: "15:45", isLocked: true },
      { id: "e5", episodeNumber: 5, title: "Late Checkout", description: "Lingering a little longer.", duration: "18:00", isLocked: true },
    ]
  },
  {
    id: "ser2",
    title: "Midnight Confessions",
    description: "Late night calls with a stranger who understands you perfectly. Intimate, raw, and deeply emotional.",
    mood: "Emotional",
    coverImage: "https://images.unsplash.com/photo-1516528387618-afa90b13e000?w=800&q=80",
    episodeCount: 3,
    tags: ["Long Distance", "Voice", "Intimate"],
    episodes: [
      { id: "e1", episodeNumber: 1, title: "First Call", description: "Dialing the number.", duration: "08:45", isLocked: false },
      { id: "e2", episodeNumber: 2, title: "Deepest Secrets", description: "Opening up in the dark.", duration: "11:20", isLocked: true },
      { id: "e3", episodeNumber: 3, title: "Until Dawn", description: "Watching the sun rise together.", duration: "13:10", isLocked: true },
    ]
  }
];

export const MOODS = [
  "Slow Burn", 
  "Late Night", 
  "Emotional", 
  "Forbidden", 
  "First Encounter", 
  "Tender"
];
