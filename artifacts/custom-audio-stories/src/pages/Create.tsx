import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Wand2, Play, Volume2, ChevronLeft, Headphones, Heart, Shuffle, BookOpen, X, Check, LogIn, Globe, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGenerateFullStory } from "@workspace/api-client-react";
import type { FullGeneratedStory } from "@workspace/api-client-react";
import { useAudioPlayer } from "@/store/use-audio-player";
import { useAuth } from "@/hooks/useAuth";
import { CastingRoom } from "@/components/CastingRoom";
import type { CastingRoomResult } from "@/components/CastingRoom";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const formSchema = z.object({
  mood: z.string().min(1),
  intensity: z.string(),
  voiceFeel: z.string(),
  storyLength: z.string(),
  scenarioCard: z.string().optional().default(""),
  cinematicVisuals: z.boolean(),
  emotionalFocus: z.boolean(),
  whoIsHe: z.string().optional().default(""),
  dynamic: z.string().optional().default(""),
  ending: z.string().optional().default(""),
  setting: z.string().optional().default(""),
  storyMode: z.string().default("romance"),
  experienceTags: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof formSchema>;

interface ApiSubtheme {
  id: string;
  name: string;
  tags: string[];
  intensity: number | "variable";
  is_custom: boolean;
  custom_placeholder: string | null;
}

interface ApiCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  mood: string;
  explicit_level: string;
  subthemes: ApiSubtheme[];
}

const STORY_PATHS = [
  {
    id: "romance",
    label: "Romance",
    tagline: "Connection before everything",
    description: "A story led by feeling. Intimacy is a natural consequence of chemistry — unhurried and real.",
    suggestedIntensity: "Tender",
    highlightIntensities: ["Tender", "Heated"],
    mood: "Emotional",
  },
  {
    id: "slow_burn",
    label: "Slow Burn",
    tagline: "The almost is everything",
    description: "What is held back matters as much as what is given. The space between you is the story.",
    suggestedIntensity: "Tender",
    highlightIntensities: ["Tender", "Heated"],
    mood: "Slow Burn",
  },
  {
    id: "passionate",
    label: "Passionate",
    tagline: "Feeling and desire, equally",
    description: "Emotion doesn't restrain desire — it deepens it. Both are fully, unapologetically present.",
    suggestedIntensity: "Heated",
    highlightIntensities: ["Heated", "Explicit"],
    mood: "Emotional",
  },
  {
    id: "playful",
    label: "Playful",
    tagline: "Desire with a smile",
    description: "Witty, warm, and charged. The banter is the foreplay and neither of you is pretending otherwise.",
    suggestedIntensity: "Heated",
    highlightIntensities: ["Tender", "Heated"],
    mood: "Emotional",
  },
  {
    id: "nostalgic",
    label: "Nostalgic",
    tagline: "It was always going to be you",
    description: "History between you. Old feelings finding new permission. The story was written long before tonight.",
    suggestedIntensity: "Tender",
    highlightIntensities: ["Tender", "Heated"],
    mood: "Slow Burn",
  },
  {
    id: "forbidden",
    label: "Forbidden",
    tagline: "The wanting is complicated",
    description: "There are reasons you shouldn't. None of them are persuasive enough.",
    suggestedIntensity: "Heated",
    highlightIntensities: ["Heated", "Explicit", "Scorching"],
    mood: "Forbidden",
  },
  {
    id: "unrestrained",
    label: "Unrestrained",
    tagline: "Nothing withheld",
    description: "Desire as the complete story. Every moment written with full presence and no restraint.",
    suggestedIntensity: "Explicit",
    highlightIntensities: ["Explicit", "Scorching"],
    mood: "Late Night",
  },
];

const PATH_EXPERIENCE_TAGS: Record<string, string[]> = {
  romance: [
    "Old feelings finding new words",
    "Chemistry without agenda",
    "Vulnerable and completely seen",
    "Tenderness as the whole story",
    "A love forming in the quiet",
    "Safe enough to want",
    "Two people who finally say it",
    "Closeness that took a long time coming",
    "The moment the pretending stops",
    "He is paying attention to all of it",
    "A feeling that keeps returning",
    "Something real underneath everything",
  ],
  slow_burn: [
    "The anticipation is everything",
    "Restraint as a form of desire",
    "Every glance carries meaning",
    "The patience before the moment",
    "He waits for you to decide",
    "Wanting without reaching yet",
    "A tension that keeps building",
    "Almost — again and again",
    "The long pause before yes",
    "His restraint is doing something to me",
    "We are very carefully not touching",
    "One of us will break first",
  ],
  passionate: [
    "The moment it finally tips",
    "Something real between you",
    "No longer holding back",
    "Equal wanting, equal intensity",
    "Deep attraction breaking open",
    "A feeling that becomes physical",
    "Raw and completely present",
    "Desire that surprises you both",
    "All that restraint, released",
    "He is as undone as I am",
    "The chemistry was always this",
    "Every touch is an admission",
  ],
  playful: [
    "The banter that becomes something else",
    "He is trying not to smile",
    "A dare neither of us planned to lose",
    "Sharp enough to be foreplay",
    "Light on the surface, charged underneath",
    "He's too clever not to notice",
    "We both know exactly what this is",
    "The tension hidden inside the joke",
    "He makes me laugh and then looks at me like that",
    "Every game has a winner",
    "Playful until it suddenly isn't",
    "This started as nothing and became everything",
  ],
  nostalgic: [
    "Old history, new permission",
    "We never finished what we started",
    "The version of you he still remembers",
    "Years collapsed into one moment",
    "He looks at me like he always did",
    "Something between us that never quite closed",
    "The past was always going to find us here",
    "A reunion that was supposed to be simple",
    "The old feelings are entirely current",
    "I forgot what it felt like until now",
    "We don't have to say it — we both know",
    "This was always where we were going",
  ],
  forbidden: [
    "He shouldn't, and neither should you",
    "Power alive in the room",
    "Something with edges",
    "The risk is part of the pull",
    "Control held, then released",
    "Complicated wanting",
    "A line that keeps moving",

    "Both of us knowing this is a mistake",
    "The wanting that makes no sense",
    "Rules that are bending under pressure",
    "The forbidden thing is the only thing",
  ],
  unrestrained: [
    "Complete presence, nothing held back",
    "He knows exactly what you need",
    "Pure, unmediated desire",
    "Every moment fully written",
    "Total surrender",
    "The space between wanting and having, erased",
    "Nothing implied where it can be named",
    "Desire without apology",
    "All of it, completely",
    "He is not being careful",
    "No pauses, no holding back",
    "Entirely consumed",
  ],
};

const INTENSITIES = [
  { id: "Tender", label: "Tender", desc: "Emotional, slow burn, almost-touch" },
  { id: "Heated", label: "Heated", desc: "Desire building, physical presence" },
  { id: "Explicit", label: "Explicit", desc: "Fully rendered, nothing held back" },
  { id: "Scorching", label: "Scorching", desc: "Maximum intensity, no restraint" },
];

const WHO_IS_HE_GROUPS = [
  {
    heading: "The Forbidden",
    items: [
      "My boss",
      "Someone else's husband",
      "Someone I shouldn't want",
      "My personal trainer",
      "My driver",
      "A man in a suit who looked at me once",
    ],
  },
  {
    heading: "The Unknown",
    items: [
      "A stranger I'll never see again",
      "Someone who only passes through",
      "Someone famous who shouldn't know my name",
      "A professor who remembers everything",
      "A gallery owner who spoke to me like he already knew me",
      "A man with a past he doesn't talk about",
    ],
  },
  {
    heading: "The Familiar",
    items: [
      "My ex",
      "An old friend who finally says it",
      "Someone who has read every room I've ever been in",
    ],
  },
  {
    heading: "The Devoted",
    items: [
      "Someone I've wanted for a long time",
      "Someone who wants only me",
      "A bodyguard with orders not to touch me",
      "A man who doesn't need to explain himself",
    ],
  },
];

const DYNAMIC_OPTIONS = [
  "He pursues, I decide",
  "I take what I want",
  "Equal desire, equal intensity",
  "He's completely in control",
  "I'm completely in control",
  "We've been circling this for months",
  "He's patient until he isn't",
  "I dare him to follow through",
];

const ENDING_OPTIONS = [
  "Left wanting more",
  "Fully satisfied",
  "Tender afterglow",
  "Unresolved and open",
  "A promise of more",
  "Something shifts between you",
  "He says the thing he's been holding back",
];

const VOICE_OPTIONS = [
  { id: "Soft Voice",      label: "Soft",      desc: "Warm, close, intimate. Like she's only speaking to you." },
  { id: "Deep Voice",      label: "Deep",      desc: "Unhurried and low. Presence without effort." },
  { id: "Breathy Voice",   label: "Breathy",   desc: "Each word close to your ear. Barely restrained." },
  { id: "Confident Voice", label: "Confident", desc: "Clear, assured, slightly playful." },
];

const LENGTH_OPTIONS = [
  { id: "3 min",  label: "Short",    detail: "~8 minutes",  desc: "Quick and complete. One scene, fully realised." },
  { id: "5 min",  label: "Standard", detail: "~15 minutes", desc: "A full story arc. Build, tension, resolution." },
  { id: "10 min", label: "Extended", detail: "~25 minutes", desc: "Unhurried. Room to breathe, linger, and land." },
];

const SCENARIO_GROUPS = [
  {
    heading: "The Situation",
    items: [
      "One last night before everything changes between you",
      "You've been pretending not to want each other for months",
      "Weeks of messages and this is the first time you've actually met",
      "You walked into the wrong room, and he was already in it",
      "A work trip that became something neither of you planned",
      "A dare that went further than either of you intended",
      "A reunion that was supposed to be simple and uncomplicated",
      "Stuck together by circumstance with nowhere else to go",
      "You're both pretending this is professional",
      "He showed up somewhere you didn't expect him",
    ],
  },
  {
    heading: "The Tension",
    items: [
      "Something between you that should be forbidden",
      "He has a specific kind of power over you and both of you know it",
      "Years of unfinished business, one night to settle it",
      "He knows exactly what you want and is making you wait",
      "A secret you've both been keeping about how you feel",
      "He's seen something in you that no one else has noticed",
      "A boundary that has been bending for months",
      "The chemistry between you has no context and no explanation",
      "He is very careful around you, for reasons neither of you says aloud",
      "You both know something is about to happen",
    ],
  },
  {
    heading: "The Feeling",
    items: [
      "Being completely undone by someone who knows how",
      "Feeling safe enough to want what you actually want",
      "The specific pleasure of giving in, completely",
      "Being wanted without any reservation or condition",
      "The surrender of being truly seen by someone",
      "Being the only thing he is thinking about",
      "A boundary you didn't know you had, slowly dissolving",
      "Something you've been running from finally catching you",
      "The relief of not having to pretend anymore",
      "The feeling of being chosen, completely and deliberately",
    ],
  },
  {
    heading: "The Moment",
    items: [
      "He reaches for you and stops himself",
      "You're both talking about something else and neither of you is listening",
      "He says your name differently than anyone else does",
      "The exact second when both of you stop pretending",
      "A touch that's technically nothing and changes everything",
      "He looks at you and you stop being able to form a sentence",
      "The silence that turns into something neither of you planned",
      "He moves closer than is strictly necessary",
      "You ask him to stay and both of you know what that means",
      "He reaches out and puts his hand over yours, and doesn't move it",
    ],
  },
  {
    heading: "The Setting",
    items: [
      "A Tokyo hotel room, midnight, rain on the window",
      "A private members' club in Mayfair, after hours",
      "The last carriage of a night train through the Alps",
      "A borrowed beach house in January, nobody else for miles",
      "A rooftop apartment in Paris at 2am",
      "A hillside villa terrace above Positano at dusk",
      "A boutique hotel in Marrakech, the city noise below",
      "A private charter cabin on a transatlantic flight",
      "A glass-walled apartment in Singapore, city lights below",
      "A flooded piazza in Venice in November",
    ],
  },
];

const WORLD_REGIONS = [
  {
    heading: "British Isles",
    places: [
      "England", "Scotland", "Wales", "Ireland", "Northern Ireland",
      "London", "Edinburgh", "Dublin", "Bath", "The Scottish Highlands",
      "Cornwall", "The Cotswolds", "Oxford", "Cambridge", "Brighton",
      "Bristol", "Manchester", "York", "Belfast", "Inverness",
      "St Andrews", "The Lake District", "Whitby", "Glastonbury",
    ],
  },
  {
    heading: "Europe",
    places: [
      "France", "Italy", "Spain", "Portugal", "Greece",
      "Monaco", "Switzerland", "Austria", "Belgium", "Netherlands",
      "Germany", "Sweden", "Norway", "Denmark", "Finland",
      "Poland", "Czech Republic", "Hungary", "Romania", "Croatia",
      "Montenegro", "Iceland", "Malta", "Cyprus",
      "Paris", "Rome", "Barcelona", "Lisbon", "Athens",
      "Venice", "Florence", "Positano", "The Amalfi Coast", "Santorini",
      "Mykonos", "Ibiza", "Tuscany", "Lake Como", "Capri",
      "Prague", "Budapest", "Vienna", "Copenhagen", "Amsterdam",
      "Stockholm", "Dubrovnik", "St. Moritz", "Chamonix",
      "Porto", "Lyon", "Seville", "Nice", "Naples", "Bruges",
      "Tallinn", "Riga", "Valletta", "Split", "Kotor", "Ljubljana",
      "Interlaken", "Lugano", "Salzburg", "Ghent", "Bruges",
      "Marseille", "Bordeaux", "Cannes", "Biarritz", "Antibes",
      "Bologna", "Verona", "Siena", "Palermo", "Taormina",
      "Malaga", "Valencia", "Granada", "Bilbao", "San Sebastian",
      "Cinque Terre", "The Dolomites", "Lake Bled", "Hallstatt",
    ],
  },
  {
    heading: "Americas",
    places: [
      "United States", "Canada", "Mexico", "Brazil", "Argentina",
      "Colombia", "Chile", "Peru", "Cuba", "Jamaica",
      "Dominican Republic", "Bahamas", "Barbados", "St. Lucia", "Antigua",
      "St. Barths", "Turks & Caicos", "Aruba", "Cayman Islands", "Grenada",
      "Costa Rica", "Panama", "Ecuador", "Uruguay",
      "New York", "Los Angeles", "Miami", "New Orleans", "San Francisco",
      "Las Vegas", "Chicago", "Havana", "Buenos Aires", "Rio de Janeiro",
      "Tulum", "Cartagena", "Nashville", "Boston", "Seattle",
      "Denver", "Vancouver", "Montreal", "Quebec City", "Bogotá",
      "Medellín", "Montevideo", "Asunción", "Santa Fe", "Charleston", "Savannah",
      "Palm Beach", "Santa Barbara", "Napa Valley", "Cape Cod",
    ],
  },
  {
    heading: "Asia Pacific",
    places: [
      "Japan", "South Korea", "Thailand", "Vietnam",
      "Indonesia", "Singapore", "Malaysia", "Philippines", "India",
      "Sri Lanka", "Cambodia", "Hong Kong", "Taiwan", "China",
      "Maldives", "Nepal",
      "Tokyo", "Kyoto", "Bali", "Bangkok", "Singapore City",
      "Seoul", "Osaka", "Hanoi", "Ho Chi Minh City", "Chiang Mai",
      "Kuala Lumpur", "Penang", "Colombo", "Galle", "Mumbai",
      "Jaipur", "Udaipur", "Goa", "Kathmandu", "Luang Prabang",
      "Taipei", "Macau", "Phuket", "Koh Samui", "Siem Reap",
    ],
  },
  {
    heading: "Oceania",
    places: [
      "Australia", "New Zealand", "Fiji",
      "Sydney", "Melbourne", "Auckland", "Queenstown", "Byron Bay",
      "Christchurch", "Hobart", "Noumea", "The Whitsundays", "The Great Barrier Reef",
      "Noosa", "Margaret River", "Rottnest Island",
    ],
  },
  {
    heading: "Middle East & Africa",
    places: [
      "United Arab Emirates", "Saudi Arabia", "Jordan", "Lebanon", "Turkey",
      "Qatar", "Oman", "Morocco", "Egypt", "South Africa",
      "Kenya", "Tanzania", "Seychelles", "Mauritius", "Zanzibar",
      "Rwanda", "Ethiopia", "Ghana", "Senegal",
      "Dubai", "Abu Dhabi", "Istanbul", "Beirut", "Amman",
      "Marrakech", "Cape Town", "Nairobi", "Muscat", "Doha",
      "Casablanca", "Dakar", "Accra", "Kigali", "Addis Ababa",
      "Petra", "Wadi Rum", "Aswan", "Luxor", "Essaouira",
      "The Algarve", "Fez", "Tangier",
    ],
  },
  {
    heading: "Iconic Venues",
    places: [
      "A private island",
      "A superyacht at anchor",
      "A private charter flight",
      "A mountain retreat in the Alps",
      "A château in the Loire Valley",
      "A clifftop villa in Santorini",
      "A vineyard estate in Tuscany",
      "An oceanfront estate",
      "A penthouse above the city",
      "A safari lodge at sunset",
      "A colonial-era hotel in the tropics",
      "A rainforest treehouse",
      "A lakeside cabin in winter",
    ],
  },
];

const TIME_OF_DAY_OPTIONS = ["Dawn", "Morning", "Afternoon", "Evening", "Midnight"];
const SEASON_OPTIONS = ["Spring", "Summer", "Autumn", "Winter"];

const LOADING_PHASES = [
  { label: "Architecting your story…", sub: "Building the emotional arc and scene structure" },
  { label: "Writing the narrative…", sub: "Crafting the scenes, tension, and pacing" },
  { label: "Reviewing your story…", sub: "Checking emotional quality and depth" },
  { label: "Refining the ending…", sub: "Ensuring every scene lands the way it should" },
  { label: "Composing the visuals…", sub: "Designing cinematic imagery for each scene" },
  { label: "Rendering the artwork…", sub: "Generating premium visuals in parallel" },
  { label: "Narrating your story…", sub: "Bringing the voice to life" },
];

const VARIATION_OPTIONS = [
  { id: "softer", label: "Softer", description: "More tenderness, less tension." },
  { id: "darker", label: "Darker", description: "Heavier atmosphere, deeper pull." },
  { id: "slower", label: "Slower", description: "Longer pauses, more emotional build." },
  { id: "more_emotional", label: "More Emotional", description: "More vulnerability, more emotional weight." },
  { id: "new_ending", label: "New Ending", description: "Keep the story, change the final note." },
  { id: "new_setting", label: "New Setting", description: "Keep the chemistry, move the world around it." },
  { id: "continue_chemistry", label: "Continue the Chemistry", description: "Carry the emotional thread forward." },
];

function ScenarioPicker({ value, onChange }: { value: string; onChange: (text: string) => void }) {
  return (
    <div className="space-y-5 mt-4">
      {SCENARIO_GROUPS.map((group) => (
        <div key={group.heading}>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-2.5">
            {group.heading}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {group.items.map((item) => {
              const isSelected = value === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onChange(isSelected ? "" : item)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all text-sm leading-snug ${
                    isSelected
                      ? "border-primary bg-primary/10 text-foreground shadow-glow"
                      : "border-border/30 bg-card/30 text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-primary/5"
                  }`}
                >
                  {isSelected && (
                    <Check className="w-3 h-3 text-primary inline mr-1.5 mb-0.5 flex-shrink-0" />
                  )}
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function WorldPicker({ value, onChange }: { value: string; onChange: (place: string) => void }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const filtered = search.trim()
    ? WORLD_REGIONS.map((r) => ({
        heading: r.heading,
        places: r.places.filter((p) => p.toLowerCase().includes(search.toLowerCase())),
      })).filter((r) => r.places.length > 0)
    : WORLD_REGIONS;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm ${
          value
            ? "border-primary/50 bg-primary/5 text-foreground"
            : "border-border/50 text-muted-foreground hover:border-primary/30"
        }`}
      >
        <span className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary/60 flex-shrink-0" />
          {value || "Choose a world…"}
        </span>
        {value && (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>
      {open && (
        <div className="absolute z-30 left-0 right-0 mt-2 max-h-80 rounded-2xl border border-border/60 bg-background/98 backdrop-blur-sm shadow-2xl overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border/30 flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/60 border border-border/30">
              <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search places…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-3 space-y-4">
            {filtered.map((region) => (
              <div key={region.heading}>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary/50 mb-1.5 px-1">
                  {region.heading}
                </p>
                <div className="space-y-0.5">
                  {region.places.map((place) => (
                    <button
                      key={place}
                      type="button"
                      onClick={() => {
                        onChange(value === place ? "" : place);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center justify-between ${
                        value === place
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                      }`}
                    >
                      <span>{place}</span>
                      {value === place && <Check className="w-3 h-3 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OptionCard({
  option,
  selected,
  onSelect,
}: {
  option: { id: string; label: string; description: string };
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(option.id)}
      className={`w-full text-left p-4 rounded-2xl border transition-all ${
        selected
          ? "border-primary bg-primary/10 shadow-glow"
          : "border-border/30 bg-card/40 hover:border-primary/30 hover:bg-primary/5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground text-sm mb-0.5">{option.label}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{option.description}</p>
        </div>
        {selected && <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />}
      </div>
    </button>
  );
}

export default function Create() {
  const { isAuthenticated, isLoading: authLoading, openSignIn, user } = useAuth();
  const [ageConfirmed, setAgeConfirmed] = useState(() => {
    try { return localStorage.getItem("age_confirmed") === "true"; } catch { return false; }
  });
  const [step, setStep] = useState<"casting" | "preset-prompt" | "form" | "generating" | "result">("casting");
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [result, setResult] = useState<FullGeneratedStory | null>(null);
  const [resultSaved, setResultSaved] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [lastCastingData, setLastCastingData] = useState<Record<string, unknown> | null>(null);
  const [presetSaved, setPresetSaved] = useState(false);
  const [myUsualPreset, setMyUsualPreset] = useState<{ id: number; name: string; castingData: Record<string, unknown> } | null>(null);
  const [myUsualLoading, setMyUsualLoading] = useState(false);
  const [myUsualApplied, setMyUsualApplied] = useState(false);

  const [formPreset, setFormPreset] = useState<Record<string, unknown> | null>(null);
  const [formPresetSaving, setFormPresetSaving] = useState(false);
  const [formPresetFlash, setFormPresetFlash] = useState(false);
  const [showFormPresetSavePrompt, setShowFormPresetSavePrompt] = useState(false);

  const [generationError, setGenerationError] = useState<{ message: string; isSubscriptionLimit: boolean } | null>(null);
  const [usageData, setUsageData] = useState<{ plan: string; used: number; limit: number; storiesRemaining: number; renewDate: string | null } | null>(null);

  const [variationModalOpen, setVariationModalOpen] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<string>("softer");
  const [isGeneratingVariation, setIsGeneratingVariation] = useState(false);

  const [presetNameDraft, setPresetNameDraft] = useState("");
  const [pendingCastingData, setPendingCastingData] = useState<Record<string, unknown> | null>(null);
  const [perspective, setPerspective] = useState<"your" | "her" | "his" | "their">("your");
  const [castingPairing, setCastingPairing] = useState<string | undefined>();
  const [castingHeritage, setCastingHeritage] = useState<string | undefined>();
  const [castingAtmosphere, setCastingAtmosphere] = useState<string | undefined>();
  const [castingChemistry, setCastingChemistry] = useState<string | undefined>();
  // Structured appearance fields — individual chip selections (no free text)
  const [castingAppearBuild, setCastingAppearBuild] = useState<string | undefined>();
  const [castingAppearHeight, setCastingAppearHeight] = useState<string | undefined>();
  const [castingAppearColouring, setCastingAppearColouring] = useState<string | undefined>();
  const [castingAppearEyes, setCastingAppearEyes] = useState<string | undefined>();
  const [castingAppearFeatures, setCastingAppearFeatures] = useState<string[] | undefined>();
  const [castingListenerName, setCastingListenerName] = useState<string | undefined>();
  const [castingPartnerName, setCastingPartnerName] = useState<string | undefined>();
  const [castingCountry, setCastingCountry] = useState<string | undefined>();
  const [castingCity, setCastingCity] = useState<string | undefined>();
  const [castingSituationId, setCastingSituationId] = useState<string | undefined>();

  const [timeOfDay, setTimeOfDay] = useState("");
  const [season, setSeason] = useState("");
  const [isSurprising, setIsSurprising] = useState(false);

  const phaseTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const { play, isPlaying, togglePlay, progress, currentStory } = useAudioPlayer();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: "Emotional",
      intensity: "Tender",
      voiceFeel: "Soft Voice",
      storyLength: "5 min",
      scenarioCard: "",
      cinematicVisuals: true,
      emotionalFocus: false,
      whoIsHe: "",
      dynamic: "",
      ending: "",
      setting: "",
      storyMode: "romance",
      experienceTags: [],
    },
  });

  const handleSavePreset = useCallback(async () => {
    if (!lastCastingData || !isAuthenticated) return;
    const archetype = lastCastingData.archetype as string ?? "";
    const dynamic = lastCastingData.dynamic as string ?? "";
    const name = [archetype, dynamic].filter(Boolean).join(" · ") || "My Cast";
    try {
      await fetch(`${API_BASE}/api/me/presets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, castingData: lastCastingData }),
      });
      setPresetSaved(true);
    } catch { /* ignore */ }
  }, [lastCastingData, isAuthenticated]);

  const handleResultSave = useCallback(async () => {
    if (!result || savePending) return;
    setSavePending(true);
    const nextSaved = !resultSaved;
    setResultSaved(nextSaved);
    try {
      await fetch(`${API_BASE}/api/save-story`, {
        method: nextSaved ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ storyId: result.id }),
      });
      if (nextSaved) {
        fetch(`${API_BASE}/api/update-taste`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ mood: result.mood, event: "saved" }),
        }).catch(() => {});
      }
    } catch {
      setResultSaved(!nextSaved);
    } finally {
      setSavePending(false);
    }
  }, [result, resultSaved, savePending]);

  const startLoadingPhase = useCallback(() => {
    phaseTimersRef.current.forEach(clearTimeout);
    phaseTimersRef.current = [];
    setLoadingPhase(0);
    const phaseMs = [8000, 20000, 12000, 12000, 12000, 35000, 20000];
    let cumulativeMs = 0;
    phaseMs.forEach((ms, i) => {
      cumulativeMs += ms;
      phaseTimersRef.current.push(setTimeout(() => setLoadingPhase(Math.min(i + 1, LOADING_PHASES.length - 1)), cumulativeMs));
    });
  }, []);

  const stopLoadingPhase = useCallback(() => {
    phaseTimersRef.current.forEach(clearTimeout);
    phaseTimersRef.current = [];
  }, []);

  const applyResultToPlayer = useCallback((data: FullGeneratedStory) => {
    if (data.audioUrl) {
      const storyForPlayer = {
        id: data.id,
        title: data.title,
        description: data.description,
        mood: data.mood,
        tags: [data.mood],
        duration: data.duration,
        coverImage: data.images.cover,
        audioUrl: data.audioUrl,
        isPremium: false,
        isNew: true,
        scenes: data.scenes.map((s, i) => ({
          ...s,
          image: data.images.scenes[i],
        })),
      };
      setTimeout(() => play(storyForPlayer as Parameters<typeof play>[0]), 300);
    }
  }, [play]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${API_BASE}/api/me/usage`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setUsageData(d); })
      .catch(() => {});
  }, [isAuthenticated]);

  const generateMutation = useGenerateFullStory({
    mutation: {
      onSuccess: (data) => {
        stopLoadingPhase();
        setGenerationError(null);
        setResult(data);
        setResultSaved(false);
        setStep("result");
        applyResultToPlayer(data);
        // Refresh usage after successful generation
        if (isAuthenticated) {
          fetch(`${API_BASE}/api/me/usage`, { credentials: "include" })
            .then((r) => r.ok ? r.json() : null)
            .then((d) => { if (d) setUsageData(d); })
            .catch(() => {});
        }
      },
      onError: (err: unknown) => {
        stopLoadingPhase();
        const status = (err as { status?: number }).status;
        const rawMessage = err instanceof Error ? err.message : "Generation failed. Please try again.";
        const message = rawMessage.replace(/^HTTP \d{3} [^:]+:\s*/, "").trim();
        const isSubscriptionLimit = status === 402;
        setGenerationError({ message, isSubscriptionLimit });
        setStep("form");
      },
    },
  });

  useEffect(() => {
    const qcp = sessionStorage.getItem("quickCreateParams");
    if (qcp) {
      sessionStorage.removeItem("quickCreateParams");
      try {
        const params = JSON.parse(qcp) as FormData;
        Object.entries(params).forEach(([k, v]) => form.setValue(k as keyof FormData, v as never));
        setStep("generating");
        startLoadingPhase();
        generateMutation.mutateAsync({ data: params }).finally(() => stopLoadingPhase());
      } catch { /* ignore */ }
      return;
    }
    const cp = sessionStorage.getItem("castingPreset");
    if (cp) {
      sessionStorage.removeItem("castingPreset");
      try {
        const casting = JSON.parse(cp) as Record<string, string>;
        form.setValue("whoIsHe", casting.archetype ?? "");
        form.setValue("dynamic", casting.dynamic ?? "");
        form.setValue("intensity", casting.intensity ?? "");
        form.setValue("mood", casting.mood ?? "Emotional");
        form.setValue("storyMode", casting.storyMode ?? "romance");
        if (casting.pairing) setCastingPairing(casting.pairing);
        setStep("form");
      } catch { /* ignore */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch the user's most recent casting preset when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${API_BASE}/api/me/presets`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data: Array<{ id: number; name: string; castingData: Record<string, unknown> }> | null) => {
        if (Array.isArray(data) && data.length > 0) {
          setMyUsualPreset(data[0]);
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  // Fetch the user's saved "My Usual" form preset when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${API_BASE}/api/presets/my-usual`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data: { castingData: Record<string, unknown> } | null) => {
        if (data?.castingData) setFormPreset(data.castingData);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleLoadMyUsual = useCallback(() => {
    if (!myUsualPreset) return;
    setMyUsualLoading(true);
    const c = myUsualPreset.castingData;
    if (c.archetype) form.setValue("whoIsHe", String(c.archetype));
    if (c.dynamic) form.setValue("dynamic", String(c.dynamic));
    if (c.intensity) form.setValue("intensity", String(c.intensity));
    if (c.mood) form.setValue("mood", String(c.mood));
    if (c.storyMode) form.setValue("storyMode", String(c.storyMode));
    if (c.setting) form.setValue("setting", String(c.setting));
    if (c.pairing) setCastingPairing(String(c.pairing));
    setLastCastingData(myUsualPreset.castingData);
    setPendingCastingData(myUsualPreset.castingData);
    setMyUsualApplied(true);
    setMyUsualLoading(false);
    setStep("preset-prompt");
  }, [myUsualPreset, form]);

  const handleLoadFormPreset = useCallback(() => {
    if (!formPreset) return;
    const p = formPreset;
    if (typeof p.storyMode === "string") form.setValue("storyMode", p.storyMode);
    if (typeof p.mood === "string") form.setValue("mood", p.mood);
    if (typeof p.intensity === "string") form.setValue("intensity", p.intensity);
    if (typeof p.voiceFeel === "string") form.setValue("voiceFeel", p.voiceFeel);
    if (typeof p.storyLength === "string") form.setValue("storyLength", p.storyLength);
    if (typeof p.scenarioCard === "string") form.setValue("scenarioCard", p.scenarioCard);
    if (typeof p.whoIsHe === "string") form.setValue("whoIsHe", p.whoIsHe);
    if (typeof p.dynamic === "string") form.setValue("dynamic", p.dynamic);
    if (typeof p.ending === "string") form.setValue("ending", p.ending);
    if (typeof p.setting === "string") form.setValue("setting", p.setting);
    if (typeof p.timeOfDay === "string") setTimeOfDay(p.timeOfDay);
    if (typeof p.season === "string") setSeason(p.season);
    if (p.perspective === "your" || p.perspective === "her" || p.perspective === "his" || p.perspective === "their") setPerspective(p.perspective);
    setFormPresetFlash(true);
    setTimeout(() => setFormPresetFlash(false), 1500);
  }, [formPreset, form]);

  const handleSaveFormPreset = useCallback(async () => {
    if (formPresetSaving) return;
    setFormPresetSaving(true);
    const presetData: Record<string, unknown> = {
      storyMode: form.getValues("storyMode"),
      mood: form.getValues("mood"),
      intensity: form.getValues("intensity"),
      voiceFeel: form.getValues("voiceFeel"),
      storyLength: form.getValues("storyLength"),
      scenarioCard: form.getValues("scenarioCard") ?? "",
      whoIsHe: form.getValues("whoIsHe") ?? "",
      dynamic: form.getValues("dynamic") ?? "",
      ending: form.getValues("ending") ?? "",
      setting: form.getValues("setting") ?? "",
      timeOfDay,
      season,
      perspective,
    };
    try {
      const res = await fetch(`${API_BASE}/api/presets/my-usual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ castingData: presetData }),
      });
      if (res.ok) {
        const data = (await res.json()) as { castingData: Record<string, unknown> };
        setFormPreset(data.castingData);
        setShowFormPresetSavePrompt(false);
        setFormPresetFlash(true);
        setTimeout(() => setFormPresetFlash(false), 1500);
      }
    } catch { /* ignore */ } finally {
      setFormPresetSaving(false);
    }
  }, [form, timeOfDay, season, perspective, formPresetSaving]);

  const handleGenerateVariation = useCallback(async () => {
    if (!result || isGeneratingVariation) return;
    setVariationModalOpen(false);
    setIsGeneratingVariation(true);
    setStep("generating");
    startLoadingPhase();

    try {
      const res = await fetch(`${API_BASE}/api/generate-variation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ storyId: result.id, variation_type: selectedVariation }),
      });
      if (!res.ok) throw new Error("Variation generation failed");
      const data = await res.json() as FullGeneratedStory;
      stopLoadingPhase();
      setResult(data);
      setResultSaved(false);
      setStep("result");
      applyResultToPlayer(data);
    } catch {
      stopLoadingPhase();
      setStep("result");
    } finally {
      setIsGeneratingVariation(false);
    }
  }, [result, isGeneratingVariation, selectedVariation, startLoadingPhase, stopLoadingPhase, applyResultToPlayer]);

  const handleCastingComplete = useCallback((casting: CastingRoomResult) => {
    const allTags = [...(casting.customTags ?? [])];

    const castingSnapshot = {
      archetype: casting.archetype,
      whoIsHe: casting.archetype,
      dynamic: casting.dynamic,
      setting: casting.setting,
      intensity: casting.intensity,
      mood: casting.mood,
      storyMode: casting.storyMode,
      pairing: casting.pairing,
      heritage: casting.heritage || undefined,
      atmosphere: casting.atmosphere || undefined,
      chemistry: casting.chemistry || undefined,
      country: casting.country || undefined,
      city: casting.city || undefined,
      voiceFeel: form.getValues("voiceFeel"),
      storyLength: form.getValues("storyLength"),
    };

    setLastCastingData(castingSnapshot);
    setPendingCastingData(castingSnapshot);
    setCastingPairing(casting.pairing);
    setCastingHeritage(casting.heritage || undefined);
    setCastingAtmosphere(casting.atmosphere || undefined);
    setCastingChemistry(casting.chemistry || undefined);
    setCastingCountry(casting.country || undefined);
    setCastingCity(casting.city || undefined);
    // Structured appearance fields
    setCastingAppearBuild(casting.appearBuild || undefined);
    setCastingAppearHeight(casting.appearHeight || undefined);
    setCastingAppearColouring(casting.appearColouring || undefined);
    setCastingAppearEyes(casting.appearEyes || undefined);
    setCastingAppearFeatures(casting.appearFeatures || undefined);
    setCastingListenerName(casting.listenerName || undefined);
    setCastingPartnerName(casting.partnerName || undefined);
    setCastingSituationId(casting.situationId || undefined);
    setPresetSaved(false);

    form.setValue("whoIsHe", casting.archetype);
    form.setValue("dynamic", casting.dynamic);
    form.setValue("setting", casting.setting);
    form.setValue("intensity", casting.intensity);
    form.setValue("mood", casting.mood);
    form.setValue("storyMode", casting.storyMode);
    form.setValue("experienceTags", allTags);

    const suggestedName = [casting.archetype, casting.dynamic].filter(Boolean).join(" · ") || "My Cast";
    setPresetNameDraft(suggestedName);

    if (isAuthenticated) {
      setStep("preset-prompt");
    } else {
      setStep("generating");
      startLoadingPhase();
      generateMutation.mutateAsync({
        data: {
          mood: casting.mood,
          intensity: casting.intensity,
          voiceFeel: form.getValues("voiceFeel"),
          storyLength: form.getValues("storyLength"),
          scenarioCard: form.getValues("scenarioCard") || undefined,
          timeOfDay: timeOfDay || undefined,
          season: season || undefined,
          perspective: casting.perspective === "your" ? "you" : casting.perspective === "their" ? "they" : casting.perspective,
          cinematicVisuals: true,
          emotionalFocus: casting.mood === "Emotional",
          whoIsHe: casting.archetype || undefined,
          dynamic: casting.dynamic || undefined,
          setting: casting.setting || undefined,
          storyMode: casting.storyMode || undefined,
          experienceTags: allTags.length ? allTags : undefined,
          pairing: casting.pairing || undefined,
          heritage: casting.heritage || undefined,
          atmosphere: casting.atmosphere || undefined,
          chemistry: casting.chemistry || undefined,
          appearBuild: casting.appearBuild || undefined,
          appearHeight: casting.appearHeight || undefined,
          appearColouring: casting.appearColouring || undefined,
          appearEyes: casting.appearEyes || undefined,
          appearFeatures: casting.appearFeatures?.length ? casting.appearFeatures : undefined,
          listenerName: casting.listenerName || undefined,
          partnerName: casting.partnerName || undefined,
          country: casting.country || undefined,
          city: casting.city || undefined,
          situationId: casting.situationId || undefined,
        },
      }).finally(() => stopLoadingPhase());
    }
  }, [form, generateMutation, isAuthenticated, startLoadingPhase, stopLoadingPhase, timeOfDay, season]);

  const handleStartGenerating = useCallback(async (savePreset: boolean, presetName: string) => {
    if (savePreset && pendingCastingData && presetName.trim()) {
      fetch(`${API_BASE}/api/me/presets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: presetName.trim(), castingData: pendingCastingData }),
      }).then(() => setPresetSaved(true)).catch(() => {});
    }

    setStep("generating");
    startLoadingPhase();

    // perspective: CastingRoom uses "your"/"her"/"his"/"their" but API uses "you"/"her"/"his"/"they"
    const apiPerspective = perspective === "your" ? "you" : perspective === "their" ? "they" : perspective;

    try {
      await generateMutation.mutateAsync({
        data: {
          mood: form.getValues("mood"),
          intensity: form.getValues("intensity"),
          voiceFeel: form.getValues("voiceFeel"),
          storyLength: form.getValues("storyLength"),
          scenarioCard: form.getValues("scenarioCard") || undefined,
          timeOfDay: timeOfDay || undefined,
          season: season || undefined,
          perspective: apiPerspective,
          cinematicVisuals: true,
          emotionalFocus: form.getValues("mood") === "Emotional",
          whoIsHe: form.getValues("whoIsHe") || undefined,
          dynamic: form.getValues("dynamic") || undefined,
          setting: form.getValues("setting") || undefined,
          storyMode: form.getValues("storyMode") || undefined,
          experienceTags: form.getValues("experienceTags")?.length ? form.getValues("experienceTags") : undefined,
          pairing: castingPairing,
          heritage: castingHeritage || undefined,
          atmosphere: castingAtmosphere || undefined,
          chemistry: castingChemistry || undefined,
          appearBuild: castingAppearBuild || undefined,
          appearHeight: castingAppearHeight || undefined,
          appearColouring: castingAppearColouring || undefined,
          appearEyes: castingAppearEyes || undefined,
          appearFeatures: castingAppearFeatures?.length ? castingAppearFeatures : undefined,
          listenerName: castingListenerName || undefined,
          partnerName: castingPartnerName || undefined,
          country: castingCountry || undefined,
          city: castingCity || undefined,
          situationId: castingSituationId || undefined,
        },
      });
    } finally {
      stopLoadingPhase();
    }
  }, [form, generateMutation, pendingCastingData, startLoadingPhase, stopLoadingPhase, perspective, timeOfDay, season, castingPairing, castingHeritage, castingAtmosphere, castingChemistry, castingAppearBuild, castingAppearHeight, castingAppearColouring, castingAppearEyes, castingAppearFeatures, castingListenerName, castingPartnerName, castingCountry, castingCity, castingSituationId]);

  const selectedMode = form.watch("storyMode");
  const selectedTags = form.watch("experienceTags") ?? [];
  const watchedScenario = form.watch("scenarioCard") ?? "";
  const watchedSetting = form.watch("setting") ?? "";
  const watchedWhoIsHe = form.watch("whoIsHe") ?? "";
  const watchedDynamic = form.watch("dynamic") ?? "";
  const watchedIntensity = form.watch("intensity") ?? "";

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubthemeId, setSelectedSubthemeId] = useState<string | null>(null);

  const resetToFreshCasting = useCallback(() => {
    setPerspective("your");
    setCastingPairing(undefined);
    setCastingHeritage(undefined);
    setCastingAtmosphere(undefined);
    setCastingChemistry(undefined);
    setCastingAppearBuild(undefined);
    setCastingAppearHeight(undefined);
    setCastingAppearColouring(undefined);
    setCastingAppearEyes(undefined);
    setCastingAppearFeatures(undefined);
    setCastingListenerName(undefined);
    setCastingPartnerName(undefined);
    setCastingCountry(undefined);
    setCastingCity(undefined);
    setCastingSituationId(undefined);
    setTimeOfDay("");
    setSeason("");
    setSelectedCategoryId(null);
    setSelectedSubthemeId(null);
    setResult(null);
    setResultSaved(false);
    setSavePending(false);
    setPresetSaved(false);
    setMyUsualApplied(false);
    setFormPreset(null);
    setLastCastingData(null);
    form.reset();
    setStep("casting");
  }, [form]);

  const { data: apiCategories = [] } = useQuery<ApiCategory[]>({
    queryKey: ["story-categories"],
    queryFn: () =>
      fetch(`${API_BASE}/api/categories`, { credentials: "include" }).then(r => r.json()),
    staleTime: Infinity,
  });

  const handleCategorySelect = (catId: string) => {
    if (selectedCategoryId === catId) {
      setSelectedCategoryId(null);
      setSelectedSubthemeId(null);
      setCustomSubthemeText("");
    } else {
      setSelectedCategoryId(catId);
      setSelectedSubthemeId(null);
      setCustomSubthemeText("");
    }
  };

  const handleSubthemeSelect = (subId: string) => {
    setSelectedSubthemeId(prev => (prev === subId ? null : subId));
    setCustomSubthemeText("");
  };

  const handlePathSelect = (pathId: string) => {
    const path = STORY_PATHS.find(p => p.id === pathId);
    if (!path) return;
    form.setValue("storyMode", pathId);
    form.setValue("intensity", path.suggestedIntensity);
    form.setValue("mood", path.mood);
    form.setValue("experienceTags", []);
  };

  const toggleExperienceTag = (tag: string) => {
    const current = form.getValues("experienceTags") ?? [];
    const next = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    form.setValue("experienceTags", next);
  };

  const handleSurpriseMe = useCallback(() => {
    if (isSurprising) return;
    setIsSurprising(true);
    setTimeout(() => {
      function pick<T,>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

      if (apiCategories.length > 0) {
        const randomCat = pick(apiCategories);
        const nonCustomSubs = randomCat.subthemes.filter(s => !s.is_custom);
        const randomSub = nonCustomSubs.length > 0 ? pick(nonCustomSubs) : null;
        setSelectedCategoryId(randomCat.id);
        setSelectedSubthemeId(randomSub?.id ?? null);
        setCustomSubthemeText("");
      } else {
        const path = pick(STORY_PATHS);
        handlePathSelect(path.id);
      }

      const allScenarios = SCENARIO_GROUPS.flatMap(g => g.items);
      form.setValue("scenarioCard", pick(allScenarios));
      const allWhoIsHe = WHO_IS_HE_GROUPS.flatMap(g => g.items);
      form.setValue("whoIsHe", pick(allWhoIsHe));
      form.setValue("dynamic", pick(DYNAMIC_OPTIONS));
      form.setValue("ending", pick(ENDING_OPTIONS));

      const allPlaces = WORLD_REGIONS.flatMap(r => r.places);
      form.setValue("setting", pick(allPlaces));

      setTimeOfDay(pick(TIME_OF_DAY_OPTIONS));
      setSeason(pick(SEASON_OPTIONS));
      setIsSurprising(false);
    }, 450);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, isSurprising, apiCategories]);

  const onSubmit = async (data: FormData) => {
    setStep("generating");
    startLoadingPhase();

    // perspective: form state uses "your"/"her"/"his"/"their", API uses "you"/"her"/"his"/"they"
    const apiPerspective = perspective === "your" ? "you" : perspective === "their" ? "they" : perspective;

    try {
      await generateMutation.mutateAsync({
        data: {
          mood: data.mood,
          intensity: data.intensity,
          voiceFeel: data.voiceFeel,
          storyLength: data.storyLength,
          scenarioCard: data.scenarioCard || undefined,
          timeOfDay: timeOfDay || undefined,
          season: season || undefined,
          perspective: apiPerspective,
          cinematicVisuals: data.cinematicVisuals,
          emotionalFocus: data.emotionalFocus,
          whoIsHe: data.whoIsHe || undefined,
          dynamic: data.dynamic || undefined,
          ending: data.ending || undefined,
          setting: data.setting || undefined,
          storyMode: data.storyMode || undefined,
          categoryId: selectedCategoryId || undefined,
          subthemeId: selectedSubthemeId || undefined,
          experienceTags: data.experienceTags?.length ? data.experienceTags : undefined,
          pairing: castingPairing,
          heritage: castingHeritage || undefined,
          atmosphere: castingAtmosphere || undefined,
          chemistry: castingChemistry || undefined,
          appearBuild: castingAppearBuild || undefined,
          appearHeight: castingAppearHeight || undefined,
          appearColouring: castingAppearColouring || undefined,
          appearEyes: castingAppearEyes || undefined,
          appearFeatures: castingAppearFeatures?.length ? castingAppearFeatures : undefined,
        },
      });
    } finally {
      stopLoadingPhase();
    }
  };

  const OptionPill = ({
    label,
    field,
    value,
  }: {
    label: string;
    field: keyof FormData;
    value: string;
  }) => {
    const isSelected = form.watch(field) === value;
    return (
      <button
        type="button"
        onClick={() => form.setValue(field, value as never)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
          isSelected
            ? "bg-primary text-primary-foreground border-primary shadow-glow"
            : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
        }`}
      >
        {label}
      </button>
    );
  };

  const OptionalPill = ({
    label,
    field,
    value,
  }: {
    label: string;
    field: keyof FormData;
    value: string;
  }) => {
    const current = form.watch(field) as string;
    const isSelected = current === value;
    return (
      <button
        type="button"
        onClick={() => form.setValue(field, (isSelected ? "" : value) as never)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
          isSelected
            ? "bg-primary text-primary-foreground border-primary shadow-glow"
            : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
        }`}
      >
        {label}
      </button>
    );
  };

  const currentPath = STORY_PATHS.find(p => p.id === selectedMode) ?? STORY_PATHS[0];
  const currentTags = PATH_EXPERIENCE_TAGS[selectedMode] ?? [];

  const isThisPlaying = isPlaying && currentStory?.id === result?.id;
  const activeSceneIndex = result
    ? Math.min(Math.floor(progress * result.scenes.length), result.scenes.length - 1)
    : 0;
  const activeSceneImage = result?.images?.scenes?.[activeSceneIndex] ?? result?.images?.cover ?? "";

  const buildPreviewSentence = (): string => {
    const path = STORY_PATHS.find(p => p.id === selectedMode);
    const watchedVoice = form.watch("voiceFeel");
    const voiceOption = VOICE_OPTIONS.find(v => v.id === watchedVoice);
    const hasContent = path || watchedWhoIsHe || watchedSetting || watchedDynamic || timeOfDay || season;
    if (!hasContent) return "";
    const intro = path ? `A ${path.label} story` : "Your story";
    const contextParts: string[] = [];
    if (watchedSetting) contextParts.push(watchedSetting);
    if (timeOfDay) contextParts.push(timeOfDay.toLowerCase());
    if (season) contextParts.push(season);
    const contextLine = contextParts.length ? `, ${contextParts.join(", ")}` : "";
    const characterParts: string[] = [];
    if (watchedWhoIsHe) characterParts.push(watchedWhoIsHe.charAt(0).toLowerCase() + watchedWhoIsHe.slice(1));
    if (watchedDynamic) characterParts.push(watchedDynamic.charAt(0).toLowerCase() + watchedDynamic.slice(1));
    const characterLine = characterParts.length ? ` — ${characterParts.join(", ")}` : "";
    const voiceLine = voiceOption ? ` · ${voiceOption.label} voice` : "";
    return `${intro}${contextLine}${characterLine}${voiceLine}.`;
  };

  const formSections = [
    { label: "Theme", filled: !!(selectedCategoryId || selectedMode) },
    { label: "Scene", filled: !!(watchedScenario || watchedSetting) },
    { label: "Character", filled: !!watchedWhoIsHe },
    { label: "Dynamic", filled: !!watchedDynamic },
    { label: "Intensity", filled: !!watchedIntensity },
    { label: "Ending", filled: !!form.watch("ending") },
  ];

  if (!ageConfirmed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl px-4">
        <div className="w-full max-w-md rounded-3xl border border-border/40 bg-card/80 shadow-2xl p-8 flex flex-col items-center text-center gap-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">Adults only</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              This platform contains explicit adult content. By continuing, you confirm you are{" "}
              <span className="text-foreground font-semibold">18 years of age or older</span>.
            </p>
          </div>
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => {
                try { localStorage.setItem("age_confirmed", "true"); } catch { /* ignore */ }
                setAgeConfirmed(true);
              }}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-glow"
            >
              I am 18 or older — continue
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              I'm under 18 — leave
            </button>
          </div>
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            Your confirmation is stored locally on this device. No personal data is collected.
          </p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  /* AUTH_GATE_DISABLED — restore before launch
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Sign in to create a story</h2>
          <p className="text-muted-foreground max-w-sm">
            Your romantic story is crafted just for you and saved to your private library.
          </p>
        </div>
        <button
          onClick={openSignIn}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Sign In to Continue
        </button>
      </div>
    );
  }
  */

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">

        {step === "casting" && (
          <motion.div
            key="casting"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {myUsualPreset && !myUsualApplied && (
              <div className="max-w-2xl mx-auto px-4 pt-6 pb-0 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMyUsual}
                  disabled={myUsualLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-all"
                >
                  <Wand2 className="w-4 h-4" />
                  {myUsualLoading ? "Loading…" : `My Usual: ${myUsualPreset.name}`}
                </button>
              </div>
            )}
            <CastingRoom
              onComplete={handleCastingComplete}
              onSkip={() => setStep("form")}
            />
          </motion.div>
        )}

        {step === "preset-prompt" && (
          <motion.div
            key="preset-prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 max-w-md mx-auto"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Wand2 className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Save this casting?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Give your combination a name so you can reuse it in one tap from your profile.
              </p>
            </div>
            <div className="w-full space-y-3">
              <input
                type="text"
                value={presetNameDraft}
                onChange={(e) => setPresetNameDraft(e.target.value)}
                maxLength={80}
                placeholder="e.g. CEO · Slow Burn"
                className="w-full px-4 py-3 rounded-xl border border-border/40 bg-card/60 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50"
              />
              <button
                onClick={() => handleStartGenerating(true, presetNameDraft)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-glow text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Save &amp; Write My Story
              </button>
              <button
                onClick={() => handleStartGenerating(false, "")}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Skip — just write it
              </button>
            </div>
          </motion.div>
        )}

        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-3xl mx-auto px-4 py-8 space-y-8"
          >
            <div>
              <button
                onClick={() => setStep("casting")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Casting Room
              </button>
              {generationError && (
                <div className={`rounded-2xl p-4 mb-6 border ${generationError.isSubscriptionLimit ? "bg-amber-950/30 border-amber-500/30" : "bg-destructive/10 border-destructive/30"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-sm font-semibold mb-1 ${generationError.isSubscriptionLimit ? "text-amber-300" : "text-destructive"}`}>
                        {generationError.isSubscriptionLimit ? "Story allowance reached" : "Generation failed"}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{generationError.message}</p>
                      {!generationError.isSubscriptionLimit && (
                        <button
                          type="button"
                          onClick={() => { setGenerationError(null); form.handleSubmit(onSubmit)(); }}
                          className="mt-2 text-xs text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                        >
                          Try again
                        </button>
                      )}
                    </div>
                    <button type="button" onClick={() => setGenerationError(null)} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-primary mb-2">Story Studio</p>
                  <h1 className="font-display text-4xl font-bold text-foreground mb-2">Create Your Private Story</h1>
                  <p className="text-muted-foreground">Choose your experience, then shape the details.</p>
                  {usageData && usageData.plan !== "free" && (
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {usageData.storiesRemaining > 0
                        ? <><span className="text-primary font-medium">{usageData.storiesRemaining} {usageData.storiesRemaining === 1 ? "story" : "stories"} remaining</span> this {usageData.plan === "annual" ? "year" : "month"}</>
                        : <span className="text-amber-400">Story allowance used — renews {usageData.renewDate ? new Date(usageData.renewDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "soon"}</span>
                      }
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 mt-1 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={formPreset ? handleLoadFormPreset : () => setShowFormPresetSavePrompt(v => !v)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm transition-all ${
                        formPresetFlash
                          ? "border-primary/60 bg-primary/15 text-primary"
                          : formPreset
                            ? "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                            : "border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${formPreset ? "fill-current" : ""}`} />
                      {formPresetFlash ? "Loaded ✓" : "My Usual"}
                    </button>
                    {formPreset && (
                      <button
                        type="button"
                        onClick={handleSaveFormPreset}
                        disabled={formPresetSaving}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1 py-1 disabled:opacity-50"
                      >
                        {formPresetSaving ? "Saving…" : "Update my usual"}
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSurpriseMe}
                    disabled={isSurprising}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm transition-all ${
                      isSurprising
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    <Shuffle className={`w-3.5 h-3.5 ${isSurprising ? "animate-spin" : ""}`} />
                    {isSurprising ? "Surprising…" : "Surprise Me"}
                  </button>
                </div>
              </div>
              {showFormPresetSavePrompt && !formPreset && (
                <div className="glass-panel rounded-xl px-4 py-3 flex items-center justify-between gap-3 mt-2">
                  <p className="text-sm text-foreground">Save your current selections as your usual?</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={handleSaveFormPreset}
                      disabled={formPresetSaving}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {formPresetSaving ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFormPresetSavePrompt(false)}
                      className="px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground border border-border/50 transition-colors"
                    >
                      Not now
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Section Progress Dots */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {formSections.map((section, i) => (
                <div key={section.label} className="flex items-center gap-1 flex-shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full transition-all ${
                        section.filled ? "bg-primary" : "bg-border/50"
                      }`}
                    />
                    <span className={`text-[10px] font-medium ${section.filled ? "text-primary/70" : "text-muted-foreground/50"}`}>
                      {section.label}
                    </span>
                  </div>
                  {i < formSections.length - 1 && (
                    <div className={`w-6 h-px mb-3 mx-0.5 ${section.filled ? "bg-primary/30" : "bg-border/30"}`} />
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Whose Story? — Perspective selector + name fields */}
              <div className="glass-panel rounded-2xl p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Whose story is this?</label>
                  <p className="text-xs text-muted-foreground mb-4">Choose the perspective the story is written from.</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(["your", "her", "his"] as const).map((p) => {
                      const labels = { your: "Your Story", her: "Her Story", his: "His Story" };
                      const descs = { your: "Written as you", her: "Written as her", his: "Written as him" };
                      const isSelected = perspective === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPerspective(p)}
                          className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border text-center transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-glow"
                              : "border-border/30 bg-card/30 hover:border-primary/30 hover:bg-primary/5"
                          }`}
                        >
                          <span className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>
                            {labels[p]}
                          </span>
                          <span className="text-xs text-muted-foreground">{descs[p]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Story Theme — Category Picker */}
              <div className="glass-panel rounded-2xl p-6">
                <label className="block text-sm font-medium text-foreground mb-1">Story Theme</label>
                <p className="text-xs text-muted-foreground mb-5">Choose the world your story lives in.</p>

                {apiCategories.length === 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="h-20 rounded-2xl bg-card/30 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {apiCategories.map((cat) => {
                      const isSelected = selectedCategoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategorySelect(cat.id)}
                          className={`text-left p-3 rounded-2xl border transition-all flex flex-col gap-1 ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-glow"
                              : "border-border/30 bg-card/30 hover:border-primary/30 hover:bg-primary/5"
                          }`}
                        >
                          <span className="text-xl leading-none">{cat.icon}</span>
                          <p className={`font-semibold text-xs leading-tight ${isSelected ? "text-primary" : "text-foreground"}`}>
                            {cat.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 leading-tight line-clamp-2">
                            {cat.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Subtheme picker — appears when a category is selected */}
                <AnimatePresence>
                  {selectedCategoryId && (() => {
                    const cat = apiCategories.find(c => c.id === selectedCategoryId);
                    if (!cat) return null;
                    const selectedSub = cat.subthemes.find(s => s.id === selectedSubthemeId);
                    return (
                      <motion.div
                        key={selectedCategoryId}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 pt-5 border-t border-border/30">
                          <p className="text-xs font-medium text-foreground mb-1">Subtheme</p>
                          <p className="text-xs text-muted-foreground mb-3">Pick the specific flavour of your {cat.name} story.</p>
                          <div className="flex flex-wrap gap-2">
                            {cat.subthemes.map((sub) => {
                              const isSel = selectedSubthemeId === sub.id;
                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={() => handleSubthemeSelect(sub.id)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                    isSel
                                      ? "bg-primary text-primary-foreground border-primary shadow-glow"
                                      : "border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                  }`}
                                >
                                  {isSel && <Check className="w-3 h-3 flex-shrink-0" />}
                                  {sub.name}
                                </button>
                              );
                            })}
                          </div>

                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>

              {/* Experience Tags — path-specific multi-select */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedMode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="glass-panel rounded-2xl p-6"
                >
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Shape this story
                  </label>
                  <p className="text-xs text-muted-foreground mb-4">
                    Select the feelings and elements you want woven into the narrative — choose as many as resonate.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleExperienceTag(tag)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-glow"
                              : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                  {selectedTags.length > 0 && (
                    <p className="text-xs text-primary/60 mt-3">
                      {selectedTags.length} {selectedTags.length === 1 ? "element" : "elements"} selected
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Your Scenario — card picker */}
              <div className="glass-panel rounded-2xl p-6">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-foreground">Your Scenario</label>
                  {watchedScenario && (
                    <button
                      type="button"
                      onClick={() => form.setValue("scenarioCard", "")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  Tap a card to set the scene — tap again to clear it. Optional.
                </p>
                <ScenarioPicker
                  value={watchedScenario}
                  onChange={(text) => form.setValue("scenarioCard", text)}
                />

                {/* World / Setting */}
                <div className="mt-5 pt-5 border-t border-border/20">
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Where does it happen?{" "}
                    <span className="text-muted-foreground/60 font-normal">(optional — sets the world and cultural texture of the story)</span>
                  </label>
                  <WorldPicker
                    value={watchedSetting}
                    onChange={(place) => form.setValue("setting", place)}
                  />
                </div>

                {/* Time of Day */}
                <div className="mt-4 pt-4 border-t border-border/20">
                  <label className="block text-xs font-medium text-muted-foreground mb-2.5">
                    Time of day{" "}
                    <span className="text-muted-foreground/60 font-normal">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TIME_OF_DAY_OPTIONS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTimeOfDay(timeOfDay === t ? "" : t)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          timeOfDay === t
                            ? "bg-primary text-primary-foreground border-primary shadow-glow"
                            : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Season */}
                <div className="mt-4 pt-4 border-t border-border/20">
                  <label className="block text-xs font-medium text-muted-foreground mb-2.5">
                    Season{" "}
                    <span className="text-muted-foreground/60 font-normal">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SEASON_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSeason(season === s ? "" : s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          season === s
                            ? "bg-primary text-primary-foreground border-primary shadow-glow"
                            : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Who is He? */}
              <div className="glass-panel rounded-2xl p-6">
                <label className="block text-sm font-medium text-foreground mb-1">Who is He?</label>
                <p className="text-xs text-muted-foreground mb-4">Optional — tap to select, tap again to clear</p>
                <div className="space-y-4">
                  {WHO_IS_HE_GROUPS.map((group) => (
                    <div key={group.heading}>
                      <p className="text-xs font-semibold uppercase tracking-widest text-primary/50 mb-2">
                        {group.heading}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((opt) => (
                          <OptionalPill key={opt} label={opt} field="whoIsHe" value={opt} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* The Dynamic */}
              <div className="glass-panel rounded-2xl p-6">
                <label className="block text-sm font-medium text-foreground mb-1">The Dynamic</label>
                <p className="text-xs text-muted-foreground mb-4">Optional — how does the power sit between you?</p>
                <div className="flex flex-wrap gap-2">
                  {DYNAMIC_OPTIONS.map((opt) => (
                    <OptionalPill key={opt} label={opt} field="dynamic" value={opt} />
                  ))}
                </div>
              </div>

              {/* Intensity */}
              <div className="glass-panel rounded-2xl p-6">
                <label className="block text-sm font-medium text-foreground mb-1">Intensity</label>
                <p className="text-xs text-muted-foreground mb-4">
                  How far does the story go?
                  {!selectedCategoryId && currentPath.highlightIntensities.length < 4 && (
                    <span className="text-primary/60"> · Suggested for {currentPath.label}: {currentPath.highlightIntensities.join(", ")}</span>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {INTENSITIES.map((item) => {
                    const isSelected = form.watch("intensity") === item.id;
                    const isHighlighted = selectedCategoryId ? true : currentPath.highlightIntensities.includes(item.id);
                    const isMuted = !isHighlighted;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => form.setValue("intensity", item.id)}
                        className={`p-4 rounded-2xl border transition-all text-left relative ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-glow"
                            : isMuted
                              ? "border-border/20 bg-card/20 hover:border-primary/20 hover:bg-primary/3 opacity-60 hover:opacity-80"
                              : "border-border/40 bg-card/40 hover:border-primary/30 hover:bg-primary/5"
                        }`}
                      >
                        <p className={`font-semibold text-sm mb-0.5 ${isSelected ? "text-primary" : isMuted ? "text-muted-foreground" : "text-foreground"}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground leading-snug">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* How does it end? */}
              <div className="glass-panel rounded-2xl p-6">
                <label className="block text-sm font-medium text-foreground mb-1">How does it end?</label>
                <p className="text-xs text-muted-foreground mb-4">Optional — tap to select, tap again to clear</p>
                <div className="flex flex-wrap gap-2">
                  {ENDING_OPTIONS.map((opt) => (
                    <OptionalPill key={opt} label={opt} field="ending" value={opt} />
                  ))}
                </div>
              </div>

              {/* Voice, Length, Enhancements */}
              <div className="glass-panel rounded-2xl p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Narrator Voice</label>
                  <p className="text-xs text-muted-foreground mb-3">How the story is read aloud to you.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {VOICE_OPTIONS.map((v) => {
                      const isSelected = form.watch("voiceFeel") === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => form.setValue("voiceFeel", v.id, { shouldDirty: true })}
                          className={`text-left px-4 py-3 rounded-xl border transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border/30 bg-card/30 hover:border-primary/30 hover:bg-primary/5"
                          }`}
                        >
                          <p className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>{v.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{v.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Length</label>
                  <p className="text-xs text-muted-foreground mb-3">How long you'd like your story to be.</p>
                  <div className="grid grid-cols-3 gap-2">
                    {LENGTH_OPTIONS.map((l) => {
                      const isSelected = form.watch("storyLength") === l.id;
                      return (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => form.setValue("storyLength", l.id, { shouldDirty: true })}
                          className={`text-left px-4 py-3 rounded-xl border transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border/30 bg-card/30 hover:border-primary/30 hover:bg-primary/5"
                          }`}
                        >
                          <p className={`text-sm font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>{l.label}</p>
                          <p className={`text-xs font-medium mt-0.5 ${isSelected ? "text-primary/70" : "text-muted-foreground"}`}>{l.detail}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-snug">{l.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-4">Enhancements</label>
                  <div className="space-y-3">
                    {[
                      { field: "cinematicVisuals" as const, label: "Cinematic Visuals", sub: "AI-generated artwork for each scene" },
                      { field: "emotionalFocus" as const, label: "Emotional Focus", sub: "Prioritise emotional depth and vulnerability" },
                    ].map(({ field, label, sub }) => (
                      <label key={field} className="flex items-center gap-4 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            {...form.register(field)}
                            className="sr-only"
                          />
                          <div
                            className={`w-10 h-6 rounded-full transition-all ${form.watch(field) ? "bg-primary" : "bg-border/50"}`}
                            onClick={() => form.setValue(field, !form.watch(field))}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.watch(field) ? "left-5" : "left-1"}`} />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground">{sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Combination Preview */}
              {buildPreviewSentence() && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel rounded-2xl p-5 border border-primary/20 bg-primary/5"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-2">Your story so far</p>
                  <p className="text-sm text-foreground/90 leading-relaxed italic">
                    {buildPreviewSentence()}
                  </p>
                  {watchedScenario && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                      Scene: <span className="italic">"{watchedScenario}"</span>
                    </p>
                  )}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={generateMutation.isPending}
                className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <Wand2 className="w-5 h-5" />
                Generate My Story
              </button>
            </form>
          </motion.div>
        )}

        {step === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <div className="relative mb-10">
              <div className="w-20 h-20 rounded-full border border-primary/20 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-8 h-8 text-primary" />
                </motion.div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border border-primary/10"
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={loadingPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                  {LOADING_PHASES[loadingPhase].label}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {LOADING_PHASES[loadingPhase].sub}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex gap-2 items-center">
              {LOADING_PHASES.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i === loadingPhase ? 32 : i < loadingPhase ? 16 : 8,
                    opacity: i <= loadingPhase ? 1 : 0.3,
                  }}
                  className={`h-1 rounded-full ${i <= loadingPhase ? "bg-primary" : "bg-border"}`}
                  transition={{ duration: 0.4 }}
                />
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-8 max-w-xs">
              Our AI is running a full cinematic pipeline — story planning, writing, visual generation, and narration.
            </p>
          </motion.div>
        )}

        {step === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto px-4 py-8 space-y-8"
          >
            <button
              onClick={resetToFreshCasting}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Create another
            </button>

            {result.variant_type && (
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <Shuffle className="w-3.5 h-3.5" />
                Variation: {VARIATION_OPTIONS.find(v => v.id === result.variant_type)?.label ?? result.variant_type}
              </div>
            )}
            {result.parent_story_id && !result.variant_type && (
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <BookOpen className="w-3.5 h-3.5" />
                Continued story
              </div>
            )}

            <div className="glass-panel rounded-3xl overflow-hidden">
              <div className="relative aspect-video">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeSceneIndex}
                    src={activeSceneImage}
                    alt={`Scene ${activeSceneIndex + 1}`}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

                <div className="absolute bottom-0 left-0 p-8 z-10">
                  <p className="text-primary text-xs font-medium uppercase tracking-widest mb-2">
                    {result.mood} · AI Generated
                  </p>
                  <h1 className="font-display text-4xl font-bold text-foreground mb-3">
                    {result.title}
                  </h1>
                  <p className="text-muted-foreground text-base max-w-xl leading-relaxed">
                    {result.description}
                  </p>
                </div>

                {isThisPlaying && (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-primary text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {result.scenes[activeSceneIndex]?.heading ?? `Scene ${activeSceneIndex + 1}`}
                  </div>
                )}
              </div>

              <div className="p-8">
                <div className="flex items-center gap-4 mb-8 flex-wrap">
                  {result.audioUrl ? (
                    <button
                      onClick={togglePlay}
                      className="flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-glow"
                    >
                      {isThisPlaying ? (
                        <Volume2 className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                      {isThisPlaying ? "Playing…" : "Play Story"}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 bg-muted/30 text-muted-foreground px-6 py-3 rounded-full border border-border/50 text-sm">
                      <Headphones className="w-4 h-4" />
                      Connect ElevenLabs for audio narration
                    </div>
                  )}
                  <button
                    onClick={handleResultSave}
                    disabled={savePending}
                    className={`p-3 rounded-full border transition-all disabled:opacity-50 ${
                      resultSaved
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                    title={resultSaved ? "Saved to library" : "Save to library"}
                  >
                    <Heart className={`w-5 h-5 ${resultSaved ? "fill-current" : ""}`} />
                  </button>
                  <span className="text-muted-foreground text-sm">
                    {result.duration} · {result.scenes.length} scenes
                  </span>
                </div>

                {/* Save casting combo as a preset */}
                {isAuthenticated && lastCastingData && (
                  <div className="flex items-center gap-2">
                    {presetSaved ? (
                      <p className="text-xs text-primary flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        Casting saved — find it in your profile
                      </p>
                    ) : (
                      <button
                        onClick={handleSavePreset}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 underline-offset-2 hover:underline"
                      >
                        Save this casting combination
                      </button>
                    )}
                  </div>
                )}

                {isThisPlaying && (
                  <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                    <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">
                      Reading Along
                    </p>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap font-light">
                        {result.scenes[activeSceneIndex]?.text ?? ""}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Scene {activeSceneIndex + 1} of {result.scenes.length} · {result.scenes[activeSceneIndex]?.heading}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
                    Story Scenes
                  </p>
                  {result.scenes.map((scene, i) => {
                    const isActiveScene = currentStory?.id === result.id && activeSceneIndex === i;
                    return (
                      <motion.div
                        key={scene.id}
                        animate={{
                          borderColor: isActiveScene
                            ? "hsl(var(--primary) / 0.5)"
                            : "hsl(var(--border) / 0.3)",
                          backgroundColor: isActiveScene
                            ? "hsl(var(--primary) / 0.05)"
                            : "transparent",
                        }}
                        className="flex gap-4 p-4 rounded-xl border transition-colors"
                      >
                        {result.images.scenes[i] && (
                          <div className="relative flex-shrink-0">
                            <img
                              src={result.images.scenes[i]}
                              alt={scene.heading ?? `Scene ${i + 1}`}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            {isActiveScene && (
                              <div className="absolute inset-0 rounded-lg border-2 border-primary/60 flex items-center justify-center bg-black/30">
                                <Volume2 className="w-4 h-4 text-primary" />
                              </div>
                            )}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">
                              {i + 1}.
                            </span>
                            <span className="text-sm font-medium text-foreground truncate">
                              {scene.heading ?? `Scene ${i + 1}`}
                            </span>
                            {isActiveScene && (
                              <span className="text-xs text-primary font-medium flex-shrink-0">
                                · Now playing
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {scene.text}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Full Story Read-Along Section */}
            {result.images?.cover && (
              <div className="rounded-2xl overflow-hidden border border-border/30">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/20 bg-card/60">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                    Full Story
                  </p>
                  <p className="text-xs text-muted-foreground">{result.scenes.length} scenes</p>
                </div>
                <div
                  className="relative max-h-[70vh] overflow-y-auto"
                  style={{
                    backgroundImage: `url(${result.images.cover})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: "local",
                  }}
                >
                  <div className="p-8 space-y-10 bg-black/75">
                    {result.scenes.map((scene, i) => (
                      <div key={scene.id ?? i}>
                        <p className="text-xs font-medium text-primary/70 uppercase tracking-widest mb-3">
                          {scene.heading ?? `Scene ${i + 1}`}
                        </p>
                        <p className="text-base leading-[1.9] text-white/90 font-light whitespace-pre-wrap">
                          {scene.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => setVariationModalOpen(true)}
                disabled={isGeneratingVariation}
                className="flex items-center justify-center gap-2 border border-border/50 text-foreground py-4 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Shuffle className="w-4 h-4" />
                Regenerate Variation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Variation Modal */}
      <AnimatePresence>
        {variationModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setVariationModalOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="w-full max-w-lg bg-card border border-border/40 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-border/30 flex items-start justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Regenerate this story</h2>
                  <p className="text-sm text-muted-foreground mt-1">Keep the emotional core, shift the shape.</p>
                </div>
                <button
                  onClick={() => setVariationModalOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-2 max-h-[60vh] overflow-y-auto">
                {VARIATION_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.id}
                    option={opt}
                    selected={selectedVariation === opt.id}
                    onSelect={setSelectedVariation}
                  />
                ))}
              </div>

              <div className="p-6 border-t border-border/30 flex gap-3">
                <button
                  onClick={() => setVariationModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-border/50 text-muted-foreground text-sm font-medium hover:text-foreground hover:border-primary/30 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateVariation}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-glow"
                >
                  Generate Variation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
