import type { Story, Series, Scene } from "@workspace/api-client-react";

const STOCK_COVERS = [
  "/cover-slow-burn.png",
  "/cover-romance.png",
  "/cover-forbidden.png",
  "/cover-nostalgic.png",
  "/cover-passionate.png",
  "/cover-playful.png",
  "/cover-slow-burn.png",
  "/cover-forbidden.png",
];

const SCENE_IMAGES = [
  "/cover-romance.png",
  "/cover-nostalgic.png",
  "/cover-passionate.png",
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
