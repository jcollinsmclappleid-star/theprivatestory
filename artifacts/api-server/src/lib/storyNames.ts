// Story names are keyed by (category display name, subtheme ID) to match getStoryName()
export const STORY_NAMES = [
  // ─── LATE NIGHT STORIES ───────────────────────────────────────────────────
  { category: "Late Night Stories", subtheme: "after_hours",   story_name: "The Last One in the Office" },
  { category: "Late Night Stories", subtheme: "strangers",     story_name: "I Don't Know Your Name Yet" },
  { category: "Late Night Stories", subtheme: "long_distance", story_name: "Three Time Zones Away" },
  { category: "Late Night Stories", subtheme: "home_alone",    story_name: "While You Were Gone" },

  // ─── FORBIDDEN DESIRE ────────────────────────────────────────────────────
  { category: "Forbidden Desire", subtheme: "off_limits",            story_name: "My Best Friend's Brother" },
  { category: "Forbidden Desire", subtheme: "power_position",        story_name: "My Boss at the Conference" },
  { category: "Forbidden Desire", subtheme: "complicated_feelings",  story_name: "I Tried Not To" },
  { category: "Forbidden Desire", subtheme: "the_other_life",        story_name: "His Name in My Phone" },

  // ─── DOMINANT & SURRENDERED ───────────────────────────────────────────────
  { category: "Dominant & Surrendered", subtheme: "he_takes_control", story_name: "You Don't Have to Think" },
  { category: "Dominant & Surrendered", subtheme: "the_arrangement",  story_name: "Terms We Agreed To" },
  { category: "Dominant & Surrendered", subtheme: "surrender",        story_name: "I Stopped Fighting It" },
  { category: "Dominant & Surrendered", subtheme: "edge_command",     story_name: "Stop Me If You Want" },

  // ─── FIRST TIME & DISCOVERY ───────────────────────────────────────────────
  { category: "First Time & Discovery", subtheme: "the_first_touch",    story_name: "How It Started" },
  { category: "First Time & Discovery", subtheme: "permission_trust",   story_name: "Tell Me What You Want" },
  { category: "First Time & Discovery", subtheme: "learning_each_other",story_name: "What You Like" },
  { category: "First Time & Discovery", subtheme: "awakening",          story_name: "I Didn't Know It Could Feel Like That" },

  // ─── EXPLICIT COLLECTION ─────────────────────────────────────────────────
  { category: "Explicit Collection", subtheme: "raw_want",   story_name: "Don't Make Me Ask Again" },
  { category: "Explicit Collection", subtheme: "all_night",  story_name: "We Have Time" },
  { category: "Explicit Collection", subtheme: "intensity",  story_name: "Past the Point of Careful" },
  { category: "Explicit Collection", subtheme: "heat",       story_name: "Scorching" },

  // ─── SLOW BURN ────────────────────────────────────────────────────────────
  { category: "Slow Burn", subtheme: "enemies_to_lovers", story_name: "The Argument That Changed Everything" },
  { category: "Slow Burn", subtheme: "almost",            story_name: "Three Times We Didn't" },
  { category: "Slow Burn", subtheme: "tension",           story_name: "The Way He Looks Away" },
  { category: "Slow Burn", subtheme: "the_wait",          story_name: "Worth Every Week of It" },

  // ─── EMOTIONAL DESIRE ────────────────────────────────────────────────────
  { category: "Emotional Desire", subtheme: "vulnerability",        story_name: "The Part I Don't Show" },
  { category: "Emotional Desire", subtheme: "being_seen",           story_name: "He Noticed First" },
  { category: "Emotional Desire", subtheme: "love_without_word",    story_name: "Not That Word Yet" },
  { category: "Emotional Desire", subtheme: "aftermath_tenderness", story_name: "After the Storm of It" },

  // ─── DARK ROMANCE ─────────────────────────────────────────────────────────
  { category: "Dark Romance", subtheme: "obsession",       story_name: "He Watched Before He Spoke" },
  { category: "Dark Romance", subtheme: "dangerous_men",   story_name: "Not the Safe Choice" },
  { category: "Dark Romance", subtheme: "moral_grey",      story_name: "The Man I Shouldn't Understand" },
  { category: "Dark Romance", subtheme: "claimed",         story_name: "His to Keep" },

  // ─── SECOND CHANCE ROMANCE ───────────────────────────────────────────────
  { category: "Second Chance Romance", subtheme: "reunion",              story_name: "Still There When I Looked" },
  { category: "Second Chance Romance", subtheme: "what_was_left_unsaid", story_name: "The Conversation We Never Had" },
  { category: "Second Chance Romance", subtheme: "starting_again",       story_name: "Not the Same, Better" },
  { category: "Second Chance Romance", subtheme: "why_it_ended",         story_name: "Timing Was the Villain" },

  // ─── HISTORICAL & PERIOD ROMANCE ─────────────────────────────────────────
  { category: "Historical & Period Romance", subtheme: "regency",          story_name: "The Season's Worst Kept Secret" },
  { category: "Historical & Period Romance", subtheme: "victorian_desire", story_name: "Improper Hours" },
  { category: "Historical & Period Romance", subtheme: "war_longing",      story_name: "The Night Before He Left" },
  { category: "Historical & Period Romance", subtheme: "foreign_faraway",  story_name: "A Summer in Siena" },
];

export function getStoryName(categoryId: string, subthemeId: string, categoryName: string): string {
  const entry = STORY_NAMES.find(
    (s) => s.category === categoryName && s.subtheme === subthemeId
  );
  return entry?.story_name || `${categoryName}: ${subthemeId}`;
}
