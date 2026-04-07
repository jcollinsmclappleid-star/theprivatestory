import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Wand2, Play, Volume2, ChevronLeft, Headphones, Heart, Shuffle, BookOpen, X, Check, LogIn, Globe, Search, Lock, Moon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGenerateFullStory } from "@workspace/api-client-react";
import type { FullGeneratedStory } from "@workspace/api-client-react";
import { useAudioPlayer } from "@/store/use-audio-player";
import { useAuth } from "@/hooks/useAuth";
import { getCachedSampleUrl, cacheSampleFromUrl } from "@/lib/voice-sample-cache";
import { VoiceSamplePlayer } from "@/components/VoiceSamplePlayer";
import { VoiceAvatar } from "@/components/VoiceAvatar";
import { CastingRoom } from "@/components/CastingRoom";
import type { CastingRoomResult } from "@/components/CastingRoom";
import { VOICES, FEMALE_VOICES, MALE_VOICES, VALID_MALE_PAIRINGS } from "@/lib/voices";
import { AgeGate, hasConfirmedAge } from "@/components/AgeGate";
import { TermsGate } from "@/components/TermsGate";
import { CountryStrip } from "@/components/TrustBar";

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

const SAMPLE_TEXT = "I've been waiting for you. There's something I need to tell you that I've kept locked away for far too long.";


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
  const [ageConfirmed, setAgeConfirmed] = useState(() => hasConfirmedAge());
  const [step, setStep] = useState<"casting" | "voice" | "preset-prompt" | "form" | "generating" | "result" | "paywall">("casting");
  const [castingResetKey, setCastingResetKey] = useState(0);
  const [voiceSampleUrls, setVoiceSampleUrls] = useState<Record<string, string>>({});
  const [loadingVoiceSamples, setLoadingVoiceSamples] = useState<Set<string>>(new Set());
  
  // Scroll to top whenever step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Load voice samples + restore saved preference when voice step is shown
  useEffect(() => {
    if (step !== "voice") return;

    // Restore saved voice preference, validating against current pairing
    const applyVoicePreference = (voiceId: string) => {
      if (!VOICES.find(v => v.id === voiceId)) return false;
      const isMale = MALE_VOICES.some(v => v.id === voiceId);
      const pairingAllowsMale = VALID_MALE_PAIRINGS.includes(castingPairing ?? "");
      if (isMale && !pairingAllowsMale) return false;
      form.setValue("voiceFeel", voiceId, { shouldDirty: false });
      return true;
    };

    // 1. Try localStorage first (instant, works for guests too)
    let restoredFromLocal = false;
    try {
      const savedVoice = localStorage.getItem("preferred_voice_id");
      if (savedVoice) restoredFromLocal = applyVoicePreference(savedVoice);
    } catch { /* localStorage unavailable */ }

    // 2. For authenticated users: fetch taste profile and apply top voice as fallback
    //    (only if localStorage had no valid preference; uses taste directly, not quick-create-params
    //    which may omit voiceFeel when taste signals are below eligibility threshold)
    if (isAuthenticated && !restoredFromLocal) {
      fetch(`${API_BASE}/api/me/taste`, { credentials: "include" })
        .then(r => r.ok ? r.json() : null)
        .then((data: { preferredVoiceFeel?: Record<string, number> } | null) => {
          if (data?.preferredVoiceFeel) {
            const entries = Object.entries(data.preferredVoiceFeel);
            if (entries.length > 0) {
              const topVoice = entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
              applyVoicePreference(topVoice);
            }
          }
        })
        .catch(() => {});
    }

    // Pre-fetch cached blob URLs so samples load instantly
    const loadVoiceSamples = async () => {
      const urls: Record<string, string> = {};
      for (const voice of VOICES) {
        const apiUrl = `${API_BASE}/api/voice-samples/${voice.id}`;
        const cachedUrl = await getCachedSampleUrl(voice.id, apiUrl);
        urls[voice.id] = cachedUrl;
      }
      setVoiceSampleUrls(urls);
    };

    loadVoiceSamples();
  }, [step]);
  
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
  const [usageData, setUsageData] = useState<{ plan: string; used: number; limit: number; storiesRemaining: number; addonStoriesRemaining: number; renewDate: string | null } | null>(null);
  const [paywallCapture, setPaywallCapture] = useState<{ storyMode: string; mood: string; intensity: string; voiceId: string; setting: string; pairing?: string; heritage?: string } | null>(null);
  const [continueAfterDark, setContinueAfterDark] = useState(false);
  const [paywallLoadingPlan, setPaywallLoadingPlan] = useState<"monthly" | "annual" | "immersive" | null>(null);
  const [paywallCoverUrl, setPaywallCoverUrl] = useState<string | null>(null);

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
      voiceFeel: "RILOU7YmBhvwJGDGjNmP",
      storyLength: "10 min",
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

  useEffect(() => {
    const handler = (e: PageTransitionEvent) => {
      if (e.persisted) setPaywallLoadingPlan(null);
    };
    window.addEventListener("pageshow", handler);
    return () => window.removeEventListener("pageshow", handler);
  }, []);

  useEffect(() => {
    if (step !== "paywall" || !paywallCapture) {
      setPaywallCoverUrl(null);
      return;
    }
    fetch(`${API_BASE}/api/generate/preview-cover`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mood: paywallCapture.mood,
        intensity: paywallCapture.intensity,
        pairing: paywallCapture.pairing,
        heritage: paywallCapture.heritage,
      }),
    })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.url) setPaywallCoverUrl(d.url); })
      .catch(() => {});
  }, [step, paywallCapture]);

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
        const isSubscriptionLimit = status === 402 || status === 401;
        setGenerationError({ message, isSubscriptionLimit });
        if (isSubscriptionLimit) {
          const vals = form.getValues();
          setPaywallCapture({
            storyMode: vals.storyMode ?? "romance",
            mood: vals.mood ?? "Emotional",
            intensity: vals.intensity ?? "Heated",
            voiceId: vals.voiceFeel ?? "",
            setting: vals.setting ?? "",
            pairing: castingPairing,
            heritage: castingHeritage,
          });
          setContinueAfterDark(false);
          setStep("paywall");
        } else {
          setStep("casting");
        }
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
        setStep("casting");
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
    // Always clear tags — users choose these fresh each session
    form.setValue("experienceTags", []);
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
      // Refresh usage after successful variation generation
      if (isAuthenticated) {
        fetch(`${API_BASE}/api/me/usage`, { credentials: "include" })
          .then((r) => r.ok ? r.json() : null)
          .then((d) => { if (d) setUsageData(d); })
          .catch(() => {});
      }
    } catch {
      stopLoadingPhase();
      setStep("result");
    } finally {
      setIsGeneratingVariation(false);
    }
  }, [result, isGeneratingVariation, selectedVariation, startLoadingPhase, stopLoadingPhase, applyResultToPlayer]);

  // Triggers generation immediately using data straight from CastingRoomResult,
  // bypassing stale React state for casting fields (they are set via setState above
  // but aren't available in closures until next render).
  const handleAutoGenerate = useCallback(async (casting: CastingRoomResult) => {
    setStep("generating");
    startLoadingPhase();
    const apiPerspective =
      casting.perspective === "your" ? "you"
      : casting.perspective === "their" ? "they"
      : casting.perspective ?? "you";
    try {
      await generateMutation.mutateAsync({
        data: {
          mood: casting.mood || form.getValues("mood"),
          intensity: casting.intensity || form.getValues("intensity"),
          voiceFeel: casting.voiceId || form.getValues("voiceFeel"),
          storyLength: form.getValues("storyLength"),
          scenarioCard: form.getValues("scenarioCard") || undefined,
          timeOfDay: undefined,
          season: undefined,
          perspective: apiPerspective,
          cinematicVisuals: true,
          emotionalFocus: (casting.mood || form.getValues("mood")) === "Emotional",
          whoIsHe: casting.archetype || undefined,
          dynamic: casting.dynamic || undefined,
          setting: casting.setting || undefined,
          storyMode: casting.storyMode || undefined,
          experienceTags: [],
          pairing: casting.pairing,
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
      });
    } finally {
      stopLoadingPhase();
    }
  }, [form, generateMutation, startLoadingPhase, stopLoadingPhase]);

  const handleCastingComplete = useCallback((casting: CastingRoomResult) => {

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
    // Always start with empty tags — users choose these fresh each session
    form.setValue("experienceTags", []);

    // Voice was chosen inside the Casting Room (step 11) — apply it and skip
    // the standalone voice step.  Fall back to the voice step only when no
    // voiceId came through (e.g. AfterDark handoff that bypassed step 11).
    if (casting.voiceId) {
      form.setValue("voiceFeel", casting.voiceId, { shouldDirty: true });
    }

    const suggestedName = [casting.archetype, casting.dynamic].filter(Boolean).join(" · ") || "My Cast";
    setPresetNameDraft(suggestedName);

    // Skip the form step entirely — go straight to generating.
    // If voiceId is missing, show the voice selection step first.
    if (casting.voiceId) {
      void handleAutoGenerate(casting);
    } else {
      setStep("voice");
    }
  }, [form, handleAutoGenerate]);

  const handleVoiceSelect = useCallback((voiceId: string) => {
    form.setValue("voiceFeel", voiceId, { shouldDirty: true });
    // Persist for next session
    try {
      localStorage.setItem("preferred_voice_id", voiceId);
    } catch { /* ignore */ }
    // For authenticated users, increment this voice's taste weight
    if (isAuthenticated) {
      fetch(`${API_BASE}/api/update-taste`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ preferredVoiceFeel: { [voiceId]: 1 } }),
      }).catch(() => {});
    }
  }, [form, isAuthenticated]);

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
    // Clear CastingRoom localStorage so it starts completely fresh
    localStorage.removeItem("casting-room-session");
    
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
    setPendingCastingData(null);
    setPresetNameDraft("");
    setGenerationError(null);
    form.reset({
      mood: "Emotional",
      intensity: "Tender",
      voiceFeel: "RILOU7YmBhvwJGDGjNmP",
      storyLength: "10 min",
      scenarioCard: "",
      cinematicVisuals: true,
      emotionalFocus: false,
      whoIsHe: "",
      dynamic: "",
      ending: "",
      setting: "",
      storyMode: "romance",
      experienceTags: [],
    });
    // Force CastingRoom component to remount by changing the key
    setCastingResetKey(prev => prev + 1);
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
    const voiceOption = VOICES.find(v => v.id === watchedVoice);
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
    const voiceLine = voiceOption ? ` · ${voiceOption.name} (${voiceOption.label})` : "";
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
    return <AgeGate onConfirmed={() => setAgeConfirmed(true)} />;
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
    <>
      <TermsGate />
      <div className="w-full">
      <AnimatePresence mode="wait">

        {step === "casting" && (
          <motion.div
            key="casting"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <CastingRoom
              key={castingResetKey}
              onComplete={handleCastingComplete}
              onAfterDark={() => {
                window.location.href = `${import.meta.env.BASE_URL}after-dark`;
              }}
            />
          </motion.div>
        )}

        {step === "voice" && (
          <motion.div
            key="voice"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto px-4 py-12"
          >
            <div className="mb-10 text-center">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Voice</h2>
              <p className="text-muted-foreground mb-1">Choose the voice you want to hear your story in.</p>
              <p className="text-xs text-muted-foreground/50">Most people start with Eleanor for their first story.</p>
            </div>

            {(() => {
              const selectedVoiceId = form.watch("voiceFeel");
              const showMaleVoices = VALID_MALE_PAIRINGS.includes(castingPairing ?? "");

              const renderVoiceCard = (voice: typeof VOICES[0]) => {
                const isSelected = selectedVoiceId === voice.id;
                const displayTitle = voice.displayName
                  ? `${voice.displayName} — ${voice.label}`
                  : voice.label;
                return (
                  <button
                    key={voice.id}
                    type="button"
                    onClick={() => handleVoiceSelect(voice.id)}
                    className={`w-full p-4 rounded-2xl transition-all text-left ${
                      isSelected
                        ? "border-2 border-primary bg-gradient-to-b from-primary/20 to-primary/5 shadow-[0_0_32px_rgba(201,162,39,0.25),inset_0_1px_0_rgba(201,162,39,0.15)]"
                        : "border-2 border-border/30 bg-card/40 hover:border-primary/50 hover:bg-card/60"
                    }`}
                    style={isSelected ? { transitionDuration: "150ms", transitionTimingFunction: "ease" } : {}}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground leading-tight">{displayTitle}</span>
                            {voice.recommended && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold tracking-wide uppercase">
                                Recommended
                              </span>
                            )}
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />}
                        </div>
                        <span className="text-[11px] text-muted-foreground/60 font-medium tracking-wide">{voice.accentLabel || voice.accent}</span>
                        {voice.presence && (
                          <p className="text-xs text-muted-foreground/65 mt-1 leading-snug">{voice.presence}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <VoiceAvatar voiceId={voice.id} size="md" />
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{voice.desc}</p>

                    {voice.bestFor && (
                      <div className="mb-4 pt-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-primary/60 mb-1.5">Best for this mood</p>
                        <p className="text-[11px] text-primary/75 font-medium leading-relaxed">{voice.bestFor}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-black/30 border border-white/5 flex items-center justify-center">
                        <VoiceAvatar voiceId={voice.id} size="md" />
                      </div>
                      <div className="flex-1">
                        <VoiceSamplePlayer
                          src={voiceSampleUrls[voice.id] || `${API_BASE}/api/voice-samples/${voice.id}`}
                          onPlayStart={async () => {
                            if (!loadingVoiceSamples.has(voice.id)) {
                              setLoadingVoiceSamples(prev => new Set([...prev, voice.id]));
                              const apiUrl = `${API_BASE}/api/voice-samples/${voice.id}`;
                              try {
                                await cacheSampleFromUrl(voice.id, apiUrl);
                                const cachedUrl = await getCachedSampleUrl(voice.id, apiUrl);
                                setVoiceSampleUrls(prev => ({ ...prev, [voice.id]: cachedUrl }));
                              } catch (err) {
                                console.warn(`Failed to cache sample ${voice.id}:`, err);
                              } finally {
                                setLoadingVoiceSamples(prev => {
                                  const next = new Set(prev);
                                  next.delete(voice.id);
                                  return next;
                                });
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </button>
                );
              };

              return (
                <div className="space-y-4">
                  {FEMALE_VOICES.map(renderVoiceCard)}

                  {showMaleVoices && (
                    <>
                      <p className="pt-4 pb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                        Male Voices
                      </p>
                      {MALE_VOICES.map(renderVoiceCard)}
                    </>
                  )}
                </div>
              );
            })()}

            <div className="mt-10 flex gap-3">
              <button
                type="button"
                onClick={() => setStep("casting")}
                className="flex-1 px-6 py-3 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all text-sm font-medium"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  // Silently re-validate: if saved voice is male but pairing no longer allows it, reset to Jane
                  const currentVoice = form.getValues("voiceFeel");
                  const isMaleVoice = MALE_VOICES.some(v => v.id === currentVoice);
                  if (isMaleVoice && !VALID_MALE_PAIRINGS.includes(castingPairing ?? "")) {
                    form.setValue("voiceFeel", "RILOU7YmBhvwJGDGjNmP", { shouldDirty: false });
                  }

                  void handleStartGenerating(false, "");
                }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-glow text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Continue
              </button>
            </div>
          </motion.div>
        )}


        {step === "paywall" && paywallCapture && (() => {
          const MOOD_TEASERS: Record<string, string> = {
            romance: "The distance between your hands felt deliberate — like he was choosing, slowly, not to touch you yet. His gaze moved across your face with the calm of someone with time. Something in the room had shifted before a single word was spoken. This is the beginning.",
            slow_burn: "He'd been watching. Not obviously — just in the way that meant he already knew you were aware of him. The silence between you had weight. This story is about what happens when that weight finally gives.",
            passionate: "The moment felt suspended, like the air had decided to hold its breath. He hadn't moved closer — but somehow he was closer. Everything was still your choice. And you were choosing.",
            playful: "There was a point where the game stopped being a game. Where the smile meant something more precise and both of you knew it. The banter had run out of anything to hide behind. Now it was just the two of you.",
            nostalgic: "You hadn't expected to see him again. Or for it to matter this much when you did. Some feelings don't disappear — they just wait, quietly, for the right moment to surface. This one had been waiting.",
            forbidden: "You knew it was the wrong thing. You'd known it for weeks — in every careful distance, every professionally maintained eye contact. This story begins where that certainty starts to unravel. It was always going to get here.",
            unrestrained: "There were no more negotiations. No careful pacing, no restraint. Only the specific satisfaction of finally having exactly what you'd been thinking about. This story holds nothing back.",
          };

          const MOOD_TITLES: Record<string, string> = {
            romance: "A story built on feeling",
            slow_burn: "Everything that was held back",
            passionate: "Where feeling and desire meet",
            playful: "A smile that meant more",
            nostalgic: "Something that was waiting",
            forbidden: "The moment certainty gives way",
            unrestrained: "Nothing held back",
          };

          const excerpt = MOOD_TEASERS[paywallCapture.storyMode] ?? MOOD_TEASERS.romance;
          const titleLine = MOOD_TITLES[paywallCapture.storyMode] ?? "Your private story";

          const MOOD_COVER_IMAGES: Record<string, string> = {
            romance: `${API_BASE}/cover-romance.png`,
            slow_burn: `${API_BASE}/cover-slow-burn.png`,
            passionate: `${API_BASE}/cover-passionate.png`,
            playful: `${API_BASE}/cover-playful.png`,
            nostalgic: `${API_BASE}/cover-nostalgic.png`,
            forbidden: `${API_BASE}/cover-forbidden.png`,
            unrestrained: `${API_BASE}/cover-forbidden.png`,
          };
          const doorImage = MOOD_COVER_IMAGES[paywallCapture.storyMode] ?? `${API_BASE}/cover-romance.png`;
          const heroImage = paywallCoverUrl || doorImage;
          const voice = VOICES.find(v => v.id === paywallCapture.voiceId);
          const voiceName = voice?.displayName ?? voice?.label ?? "Clara";
          const voiceAccent = voice?.accentLabel ?? voice?.accent ?? "British · Warm";

          const startCheckoutFromPaywall = async (plan: "monthly" | "annual" | "immersive") => {
            try { sessionStorage.setItem("quickCreateParams", JSON.stringify(form.getValues())); } catch { /* ignore */ }
            if (continueAfterDark) {
              try { sessionStorage.setItem("after_dark_intent", "1"); } catch { /* ignore */ }
            }
            setPaywallLoadingPlan(plan);
            try {
              const res = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan, returnPath: window.location.pathname }),
              });
              const data = await res.json();
              if (res.ok && data.url) {
                window.location.href = data.url;
                return;
              }
            } catch { /* silent */ }
            setPaywallLoadingPlan(null);
          };

          return (
            <motion.div
              key="paywall"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden"
            >
              {/* Cinematic background */}
              <div
                className="absolute inset-0"
                style={{
                  background: "radial-gradient(ellipse at 60% 20%, #2a1a0a 0%, #0d0a08 55%, #000 100%)",
                }}
              />
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(201,162,39,0.04) 80px, rgba(201,162,39,0.04) 81px)",
              }} />

              {/* Content */}
              <div className="relative z-10 w-full max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-5 overflow-y-auto max-h-screen">
                {/* Badge */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest">
                  <Lock className="w-3 h-3" />
                  Story preview
                </div>

                {/* Cover / Title area */}
                <div className="w-full rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-br from-[#1e1208] to-[#0d0905] shadow-2xl">

                  {/* Title block */}
                  <div className="px-5 pt-5 pb-4">
                    <p className="text-primary/60 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                      {paywallCapture.mood} · {paywallCapture.intensity}
                    </p>
                    <h2 className="font-display text-2xl font-bold text-foreground leading-tight">
                      {titleLine}
                    </h2>
                  </div>

                  {/* Door / mood image */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={heroImage}
                      alt=""
                      className="w-full h-full object-cover object-center"
                      onError={(e) => { (e.target as HTMLImageElement).src = `${API_BASE}/cover-romance.png`; }}
                    />
                    {/* top fade — blends into card bg above */}
                    <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#1e1208] to-transparent pointer-events-none" />
                    {/* bottom fade — bleeds into excerpt below */}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0d0905] to-transparent pointer-events-none" />
                    {/* subtle warmth glow */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                      background: "radial-gradient(ellipse at 50% 35%, rgba(201,162,39,0.45) 0%, transparent 65%)",
                    }} />
                  </div>

                  {/* Excerpt */}
                  <div className="px-5 py-4 border-t border-white/5">
                    <p className="text-sm text-muted-foreground leading-relaxed italic line-clamp-4">
                      "{excerpt}"
                    </p>
                    <div className="mt-3 h-6 bg-gradient-to-b from-transparent to-[#0d0905]/80 -mx-5 -mb-4" />
                  </div>
                </div>

                {/* Voice & Tone metadata */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-xs text-muted-foreground">
                    <Volume2 className="w-3 h-3 text-primary/60" />
                    Narrated by {voiceName} · {voiceAccent}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-xs text-muted-foreground">
                    <Headphones className="w-3 h-3 text-primary/60" />
                    Audio ready to play
                  </div>
                </div>

                {/* Continue after dark toggle */}
                <button
                  type="button"
                  onClick={() => setContinueAfterDark(v => !v)}
                  className="flex items-start gap-3 w-full px-4 py-3.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 transition-all text-left group"
                >
                  <div className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-all ${continueAfterDark ? "bg-primary border-primary" : "border-white/20 group-hover:border-primary/40"}`}>
                    {continueAfterDark && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Moon className="w-3.5 h-3.5 text-primary/70" />
                      Continue after dark
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      This story can go further. Take it there.
                    </p>
                  </div>
                </button>

                {/* Personalised bridge copy */}
                <p className="text-center text-xs text-muted-foreground/60 leading-relaxed">
                  Your casting is saved. Begin your story now — written, narrated, and ready to play in minutes.
                </p>

                {/* Primary subscription CTAs */}
                <div className="w-full flex flex-col gap-2">
                  {/* Annual — primary hero button */}
                  <button
                    type="button"
                    disabled={!!paywallLoadingPlan}
                    onClick={() => startCheckoutFromPaywall("annual")}
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 transition-all shadow-glow disabled:opacity-60 flex items-center justify-between px-5"
                  >
                    <span className="flex items-center gap-2">
                      {paywallLoadingPlan === "annual" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      <span>Annual — £14.99/month</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-primary-foreground/80 text-[9px] font-bold uppercase tracking-wider">Best value</span>
                    </span>
                    <span className="text-xs text-primary-foreground/50">billed annually</span>
                  </button>
                  {/* Monthly — secondary */}
                  <button
                    type="button"
                    disabled={!!paywallLoadingPlan}
                    onClick={() => startCheckoutFromPaywall("monthly")}
                    className="w-full py-3 rounded-xl border border-primary/30 bg-primary/5 text-foreground font-semibold text-sm hover:bg-primary/10 hover:border-primary/50 transition-all disabled:opacity-60 flex items-center justify-center gap-2 px-4"
                  >
                    {paywallLoadingPlan === "monthly" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Monthly — £29/month
                  </button>
                </div>

                {/* Benefits micro-list */}
                <div className="w-full flex flex-col gap-1.5">
                  {[
                    "Stories written to your cast, your mood, your world",
                    "Every voice — choose your narrator each time",
                    "Completely private — seen and heard only by you",
                  ].map(benefit => (
                    <div key={benefit} className="flex items-center gap-2 text-xs text-primary/70">
                      <Check className="w-3 h-3 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Country trust signal */}
                <CountryStrip className="w-full" />

                {/* Divider */}
                <div className="w-full flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/8" />
                  <p className="text-[10px] text-muted-foreground/25 uppercase tracking-widest whitespace-nowrap">or try just one story</p>
                  <div className="flex-1 h-px bg-white/8" />
                </div>

                {/* Single story escape hatch */}
                <button
                  type="button"
                  disabled={!!paywallLoadingPlan}
                  onClick={() => startCheckoutFromPaywall("immersive")}
                  className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors underline underline-offset-2 disabled:opacity-40 flex items-center gap-1.5"
                >
                  {paywallLoadingPlan === "immersive" ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Not ready to commit? Get just this story — £7.99
                </button>

                {/* Privacy + start over */}
                <div className="flex flex-col items-center gap-2">
                  <p className="text-[11px] text-muted-foreground/30 text-center">
                    Billed discreetly · Cancel instantly, any time · No story history shared
                  </p>
                  <button
                    type="button"
                    onClick={() => { setCastingResetKey(k => k + 1); setStep("casting"); setGenerationError(null); }}
                    className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors underline underline-offset-2"
                  >
                    Start over
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })()}
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
    </>
  );
}
