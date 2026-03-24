import type { Story, Series, Scene } from "@workspace/api-client-react";

const STOCK_COVERS = [
  "https://images.unsplash.com/photo-1510215682820-2216503c5d6c?w=800&q=80", // Wine glass
  "https://images.unsplash.com/photo-1478144592103-25e218a04891?w=800&q=80", // Dark moody room
  "https://images.unsplash.com/photo-1516644406208-8e67f70b3b4f?w=800&q=80", // Rain on window
  "https://images.unsplash.com/photo-1498622205843-3b0ac17be8aa?w=800&q=80", // City lights blur
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80", // Sparkles dark
  "https://images.unsplash.com/photo-1499914485622-a88fac536970?w=800&q=80", // Abstract warm light
  "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&q=80", // Silk fabric
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80", // Dark rose
];

const SCENE_IMAGES = [
  "https://images.unsplash.com/photo-1502814407886-f633dfa06fb3?w=1200&q=80",
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=80",
  "https://images.unsplash.com/photo-1513274291888-2df82eeb2957?w=1200&q=80",
];

const MOODS = ["Slow Burn", "Late Night", "Emotional", "Forbidden", "First Encounter", "Tender"];

function createMockScenes(): Scene[] {
  return [
    { id: 1, text: "The evening started quietly...", visualPrompt: "quiet evening", durationEstimate: 60, image: SCENE_IMAGES[0] },
    { id: 2, text: "A sudden knock at the door...", visualPrompt: "door knock", durationEstimate: 60, image: SCENE_IMAGES[1] },
    { id: 3, text: "Eyes met across the dim room...", visualPrompt: "eyes meeting", durationEstimate: 60, image: SCENE_IMAGES[2] },
  ];
}

export const MOCK_STORIES: Story[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `story-${i + 1}`,
  title: [
    "Midnight Whispers", "The Last Train", "Velvet Shadows", "Unspoken Words",
    "Rain On Glass", "A Fleeting Glance", "The Watchmaker's Secret", "Echoes in the Dark"
  ][i % 8] + (i > 7 ? ` ${i}` : ""),
  description: "An immersive journey into the depths of emotion. Lose yourself in a story crafted for intimate, quiet moments.",
  mood: MOODS[i % MOODS.length],
  tags: ["Atmospheric", "Deep Voice", "Relaxing"],
  duration: `${Math.floor(Math.random() * 10) + 3}:${Math.floor(Math.random() * 50) + 10}`,
  coverImage: STOCK_COVERS[i % STOCK_COVERS.length],
  isPremium: i % 3 === 0,
  isNew: i % 5 === 0,
  scenes: createMockScenes(),
  audioUrl: undefined, // Simulated playback
}));

export const MOCK_SERIES: Series[] = Array.from({ length: 5 }).map((_, i) => ({
  id: `series-${i + 1}`,
  title: ["The Paris Letters", "Neon City Tales", "Fading Embers", "The Monarch Hotel", "Ocean Drive"][i],
  description: "An exclusive multi-part audio experience exploring connection and consequence in a beautifully realized world.",
  mood: MOODS[i % MOODS.length],
  coverImage: STOCK_COVERS[(i + 3) % STOCK_COVERS.length],
  episodeCount: 4,
  tags: ["Drama", "Multi-part", "Cinematic"],
  episodes: Array.from({ length: 4 }).map((_, j) => ({
    id: `ep-${i}-${j}`,
    episodeNumber: j + 1,
    title: `Chapter ${j + 1}: The Awakening`,
    description: "The story unfolds further into the night.",
    duration: "12:45",
    isLocked: j > 0, // First episode free
  }))
}));
