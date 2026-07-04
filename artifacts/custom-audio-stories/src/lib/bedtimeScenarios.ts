export type BedtimeScenario = {
  id: string;
  label: string;
  sub: string;
  room: string;
  gradient: string;
  accent: string;
  tags: string[];
};

export type BedtimeRoom = {
  id: string;
  name: string;
  sub: string;
  accent: string;
};

export const BEDTIME_ROOMS: BedtimeRoom[] = [
  {
    id: "the_late_night",
    name: "The Late Night",
    sub: "It's past midnight. Someone is still there. The city is quiet and there's nowhere either of them needs to be.",
    accent: "#6366f1",
  },
  {
    id: "come_home",
    name: "Come Home",
    sub: "They came back late and you were almost asleep. Almost.",
    accent: "#0891b2",
  },
  {
    id: "the_long_week",
    name: "The Long Week",
    sub: "Five days of too much. Tonight someone knows what you need without being told.",
    accent: "#7c3aed",
  },
  {
    id: "warm_weight",
    name: "Warm Weight",
    sub: "Just the weight of them next to you. The specific comfort of not being alone.",
    accent: "#d97706",
  },
  {
    id: "last_hour",
    name: "Last Hour",
    sub: "The hour before sleep. Slow and certain. The day is almost over and nothing is required.",
    accent: "#059669",
  },
  {
    id: "the_hour_before",
    name: "The Hour Before",
    sub: "Before either of you has to be anything. Just this — warm, unhurried, and entirely private.",
    accent: "#db2777",
  },
];

export const BEDTIME_SCENARIOS: BedtimeScenario[] = [
  {
    id: "two_in_morning",
    label: "Two in the Morning",
    sub: "No plans, no obligations, nowhere to be until the day decides to start again. Just this room and what happens in it.",
    room: "the_late_night",
    gradient: "from-[#04040e] via-[#080814] to-[#020208]",
    accent: "#6366f1",
    tags: ["Warmth with nowhere to go", "The night is private and unhurried"],
  },
  {
    id: "one_who_stayed",
    label: "The One Who Stayed",
    sub: "Everyone else left hours ago. They didn't. Neither did she.",
    room: "the_late_night",
    gradient: "from-[#060612] via-[#0a0a18] to-[#030309]",
    accent: "#818cf8",
    tags: ["Company without performance", "Slow enough to drift"],
  },
  {
    id: "cant_sleep",
    label: "Can't Sleep",
    sub: "She gave up on sleep. They were already awake. Two people who didn't need to explain why.",
    room: "the_late_night",
    gradient: "from-[#04040c] via-[#080810] to-[#020206]",
    accent: "#6366f1",
    tags: ["The quiet kind of wanted", "Warmth with nowhere to go"],
  },
  {
    id: "already_in_bed",
    label: "Already in Bed",
    sub: "She was mostly asleep. They were quiet getting in. They didn't stay quiet for long.",
    room: "come_home",
    gradient: "from-[#001018] via-[#001c26] to-[#000810]",
    accent: "#0891b2",
    tags: ["Warmth interrupted slowly", "Company without performance"],
  },
  {
    id: "sound_of_door",
    label: "The Sound of the Door",
    sub: "She'd been listening for it. They came in and sat on the edge of the bed. Then a little closer.",
    room: "come_home",
    gradient: "from-[#001214] via-[#001e20] to-[#00080c]",
    accent: "#22d3ee",
    tags: ["The quiet kind of wanted", "Slow enough to drift"],
  },
  {
    id: "still_in_clothes",
    label: "Still in Your Clothes",
    sub: "She'd meant to wait up. She had. The rest took care of itself.",
    room: "come_home",
    gradient: "from-[#000e18] via-[#001824] to-[#00070e]",
    accent: "#0891b2",
    tags: ["Company without performance", "Warmth with nowhere to go"],
  },
  {
    id: "he_knew_without_asking",
    label: "He Knew Without Asking",
    sub: "She hadn't said anything. They saw it anyway. They decided tonight was about exactly one thing: her.",
    room: "the_long_week",
    gradient: "from-[#080010] via-[#10001a] to-[#040008]",
    accent: "#7c3aed",
    tags: ["The quiet kind of wanted", "He knows without asking"],
  },
  {
    id: "everything_later",
    label: "Everything Later",
    sub: "She listed the week. They listened. Then they suggested putting it somewhere else for a while.",
    room: "the_long_week",
    gradient: "from-[#0a0012] via-[#12001e] to-[#06000a]",
    accent: "#8b5cf6",
    tags: ["Company without performance", "Warmth with nowhere to go"],
  },
  {
    id: "one_specific_thing",
    label: "One Specific Thing",
    sub: "She knew what she needed. She didn't have to say it. They'd already decided to give her exactly that.",
    room: "the_long_week",
    gradient: "from-[#060010] via-[#0e0018] to-[#030008]",
    accent: "#a78bfa",
    tags: ["He knows without asking", "Slow enough to drift"],
  },
  {
    id: "close",
    label: "Close",
    sub: "No agenda. The specific gravity of another person, warm and real and right there.",
    room: "warm_weight",
    gradient: "from-[#100800] via-[#1c1200] to-[#080500]",
    accent: "#d97706",
    tags: ["Rest that comes from connection", "Warmth, no urgency"],
  },
  {
    id: "this_first",
    label: "This First",
    sub: "Before anything. Just this: the weight of an arm, the sound of breathing, the world reduced to a room.",
    room: "warm_weight",
    gradient: "from-[#0e0800] via-[#1a1000] to-[#060400]",
    accent: "#f59e0b",
    tags: ["Warmth, no urgency", "Slow enough to drift"],
  },
  {
    id: "half_asleep",
    label: "Half Asleep",
    sub: "She was half gone. They didn't need her to be more present than that. They stayed.",
    room: "warm_weight",
    gradient: "from-[#100a00] via-[#1c1400] to-[#080600]",
    accent: "#d97706",
    tags: ["Rest that comes from connection", "The quiet kind of wanted"],
  },
  {
    id: "voice_in_dark",
    label: "A Voice in the Dark",
    sub: "Low, close, just for tonight. The voice as the whole story: pace, warmth, presence.",
    room: "last_hour",
    gradient: "from-[#001008] via-[#001a10] to-[#000806]",
    accent: "#059669",
    tags: ["A voice that takes its time", "The quiet kind of wanted"],
  },
  {
    id: "weight_of_being_held",
    label: "The Weight of Being Held",
    sub: "The specific weight of not floating away. No explanation needed. Just presence.",
    room: "last_hour",
    gradient: "from-[#000e08] via-[#001610] to-[#000804]",
    accent: "#10b981",
    tags: ["Warmth, no urgency", "Rest that comes from connection"],
  },
  {
    id: "nothing_required",
    label: "Nothing Required",
    sub: "Nothing to perform tonight. They made that clear before anyone said a word.",
    room: "last_hour",
    gradient: "from-[#001008] via-[#001c10] to-[#000806]",
    accent: "#34d399",
    tags: ["Company without performance", "Warmth, no urgency"],
  },
  {
    id: "almost_asleep",
    label: "Almost Asleep",
    sub: "The halfway place. Not quite gone, not quite here. Someone stays close through all of it.",
    room: "the_hour_before",
    gradient: "from-[#14000a] via-[#200012] to-[#0c0006]",
    accent: "#db2777",
    tags: ["The quiet kind of wanted", "Rest that comes from connection"],
  },
  {
    id: "morning_before_morning",
    label: "Morning Before It's Morning",
    sub: "Not quite night, not yet day. Warm and quiet and entirely theirs.",
    room: "the_hour_before",
    gradient: "from-[#160008] via-[#220010] to-[#0e0006]",
    accent: "#f472b6",
    tags: ["Warmth with nowhere to go", "Slow enough to drift"],
  },
  {
    id: "dont_go_yet",
    label: "Don't Go Yet",
    sub: "Said quietly. The thing being reached for was put down. They stayed.",
    room: "the_hour_before",
    gradient: "from-[#12000a] via-[#1e0012] to-[#0a0006]",
    accent: "#ec4899",
    tags: ["The quiet kind of wanted", "Company without performance"],
  },
];
