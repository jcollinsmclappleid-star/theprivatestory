export interface EpisodeArcStage {
  number: number;
  name: string;
  function: string;
  emotional_job: string;
  explicit_level: string;
  explicit_guidance: string;
  word_count: string;
  intensity: number;
  what_to_plant: string[];
  what_to_avoid: string[];
  cliffhanger_formula: string;
  listener_feeling_at_end: string;
  mandatory: string[];
}

export const EPISODE_ARC_STAGES: EpisodeArcStage[] = [
  {
    number: 1,
    name: "The Collision",
    function:
      "Establish the world, the characters, and the central tension in a single episode that ends before anything happens — and makes that feel unbearable.",
    emotional_job:
      "Curiosity shading into immediate, undeniable pull. She should finish this episode wanting to know everything about him and already slightly annoyed that she does.",
    explicit_level: "2 out of 5",
    explicit_guidance:
      "No physical contact. Pure psychological and sensory arousal. The desire lives entirely in language, attention, and the specific charge of two people recognising something in each other. The tension IS the explicit content.",
    word_count: "1,800 — 1,900 words",
    intensity: 2,
    what_to_plant: [
      "One physical detail about him that will pay off in episode three",
      "One thing he knows about her that he shouldn't yet — show it, don't explain it",
      "One unresolved question she has about him that demands an answer",
      "One moment where his composure does something unexpected — even if only for a second",
    ],
    what_to_avoid: [
      "Any physical contact — not even accidental",
      "Either character admitting or acknowledging attraction",
      "Resolving any tension — only create it",
      "Explaining the dynamic — show it entirely through action and subtext",
    ],
    cliffhanger_formula:
      "She is alone. She is replaying one specific moment — a word, a look, a detail she noticed. She tells herself it means nothing. The telling herself is the problem.",
    listener_feeling_at_end:
      "Restless. Slightly irritated at herself. Already planning to listen to episode two.",
    mandatory: [
      "He must be present or imminent within the first three sentences",
      "One line of dialogue from him that could mean two things — she knows which meaning she heard",
      "End mid-thought — cut before she finishes it; the unfinished thought is the cliffhanger",
    ],
  },
  {
    number: 2,
    name: "The Crack",
    function:
      "Something shifts. A wall develops its first fracture. The first real breach of the space between them — not full contact, but the unmistakable approach of it.",
    emotional_job:
      "Want admitted to herself for the first time. Something crosses — not a line, but a threshold. She should finish this episode knowing, for the first time, that this is going somewhere.",
    explicit_level: "3 out of 5",
    explicit_guidance:
      "First physical contact — but not what she wants yet. A hand, proximity, an accidental or deliberate touch that is fully, completely rendered in sensory detail. Minimum 100 words on the first real touch. The contact should feel more significant than anything explicit in most other content.",
    word_count: "1,900 — 2,000 words",
    intensity: 3,
    what_to_plant: [
      "The first touch — make it matter enough to replay",
      "One honest thing he says that surprises her with its accuracy about her",
      "One moment she almost says something real and doesn't",
      "One detail about his life outside this dynamic that makes him more dimensional",
    ],
    what_to_avoid: [
      "Any kiss or explicitly sexual contact — that comes later and it must be earned",
      "Either character fully acknowledging the dynamic",
      "Resolving the tension with humour or deflection",
      "Moving too fast — episode two's restraint is what makes episode four devastating",
    ],
    cliffhanger_formula:
      "She is alone. She can still feel exactly where he touched her — the precise location, the precise pressure. She is thinking about one thing he said. She knows what it meant. She is not ready for what her response to that meaning is.",
    listener_feeling_at_end:
      "Warm. Slightly breathless. Aware that she has been moved and not entirely sure when it happened.",
    mandatory: [
      "Callback to the specific unfinished thought from episode one's cliffhanger",
      "Minimum 100 words on the physical sensation of the first touch alone",
      "End on the physical memory of the touch — her body remembers what her mind is still negotiating",
    ],
  },
  {
    number: 3,
    name: "The Negotiation",
    function:
      "The dynamic becomes explicit in language before it becomes explicit in action. Power is tested, terms are set, and something irrevocable is said or done that cannot be taken back.",
    emotional_job:
      "Psychological peak. She should feel the specific vertigo of being at the edge of a decision — the desire pulling forward, the mind still calculating. She should finish this episode knowing that episode four is inevitable.",
    explicit_level: "4 out of 5",
    explicit_guidance:
      "First real kiss or equivalent first significant physical moment — fully rendered in complete sensory detail. Minimum 300 words on this moment. Then a stop. The stopping should feel as erotic as the starting. His reason for stopping must increase rather than decrease desire.",
    word_count: "2,000 — 2,100 words",
    intensity: 4,
    what_to_plant: [
      "The central physical moment — minimum 300 words, fully sensory",
      "His specific reason for stopping — it must make her want him more",
      "One moment of vulnerability from him that reframes everything before it",
      "Her internal decision — she knows what she's going to do in episode four",
    ],
    what_to_avoid: [
      "Going further than a first significant physical moment — episode four earns the full payoff",
      "A stop that feels like rejection — it must feel like power and anticipation",
      "Any ambiguity about where this is going — episode three ends in certainty",
      "Rushing — this episode should feel long and charged, not efficient",
    ],
    cliffhanger_formula:
      "She is alone with the physical memory of what just happened. He stopped. She knows why. She knows what comes next. The worst part is that the stopping made it worse. She has already made the decision. She just hasn't told him yet.",
    listener_feeling_at_end:
      "Frustrated in the most exquisite way. Completely certain of what episode four contains. Unable to wait for it.",
    mandatory: [
      "Open at a pressure point — this episode should feel slightly more urgent from the first line",
      "One line of dialogue that the listener will remember as THE line from the entire series",
      "The stop must come from him — his reason must feel like power, not rejection",
    ],
  },
  {
    number: 4,
    name: "The Breaking",
    function:
      "Everything held back across three episodes releases. This is the full payoff — explicit, immersive, emotionally present, completely earned. The episode every listener has been building toward.",
    emotional_job:
      "Physical and emotional peak simultaneously. She should feel both the explicit satisfaction and the emotional significance of what this means. This should change something. She should be different at the end of this episode than she was at the start.",
    explicit_level: "5 out of 5",
    explicit_guidance:
      "Full explicit content. No fade to black. No euphemism. Literary, precise, emotionally present throughout. His desire for her specifically — not a woman, her — must be stated and demonstrated. Her experience must be fully rendered. The emotional truth must run beneath every physical moment. This is not just sex. This is the most honest either of them has been.",
    word_count: "2,100 — 2,200 words",
    intensity: 5,
    what_to_plant: [
      "His desire for her specifically — make it feel personal and overwhelming",
      "One moment of unexpected vulnerability or softness from him in the after",
      "Her internal shift — she is not the same person who walked in",
      "One unresolved question that episode five must answer",
    ],
    what_to_avoid: [
      "Fading to black or summarising the explicit content — stay present throughout",
      "Physical content without emotional subtext — they must run together",
      "A completely resolved emotional arc — episode four satisfies physically, episode five resolves emotionally",
      "Generic desire — his want must be specifically for her, detailed and overwhelming",
    ],
    cliffhanger_formula:
      "She is still with him — or just left. She is carrying what just happened. Not just physically. Something has changed that cannot be unchanged. She doesn't know yet what it costs. She will find out in episode five. She thinks: this changes things. She doesn't finish the thought. She doesn't need to.",
    listener_feeling_at_end:
      "Satisfied, changed, and immediately aware that episode five exists and contains something she still needs.",
    mandatory: [
      "Open at the moment of crossing — no second-guessing; she decided in episode three",
      "Minimum 900 words on the peak moment — his desire for HER specifically must be stated",
      "End on something unresolved — not the physical, but the emotional",
    ],
  },
  {
    number: 5,
    name: "The Aftermath",
    function:
      "Resolution that opens a new question. The emotional truth of everything that happened across four episodes named, claimed, and complicated by what comes next. This episode closes the series and opens the door to a second one.",
    emotional_job:
      "Satisfied but wanting more. The physical arc is complete. The emotional arc reaches its peak here — more complex, more honest, more real than anything in the previous four episodes. She should feel the series end as both complete and the beginning of something.",
    explicit_level: "4 out of 5",
    explicit_guidance:
      "Explicit but intimate — different in quality from episode four. Less urgency, more knowing. Both people fully aware of each other. The power dynamic should feel equalised or transformed. This is intimacy, not just desire. Emotionally the most complex explicit scene of the series.",
    word_count: "1,900 — 2,000 words",
    intensity: 4,
    what_to_plant: [
      "His real answer — the first fully unmanaged thing he's said",
      "One gesture that replaces a word neither of them is ready to say",
      "The open door — a complication, question, or situation that a second series inherits",
      "Her final internal thought — settled, but curious about what comes next",
    ],
    what_to_avoid: [
      "Fully resolving everything — one thread must remain open",
      "A generic happy ending — the resolution should feel specific and earned",
      "Losing the complexity of the characters in the warmth of resolution",
      "A final line that closes rather than opens — end on a beginning",
    ],
    cliffhanger_formula:
      "Something is decided without being said. She knows what it is. He knows what it is. The series ends on her certainty — about him, about this, about what comes next. She doesn't know exactly what comes next. That is the only good kind of not-knowing.",
    listener_feeling_at_end:
      "Complete. Warm. Immediately aware that a second series exists and she needs it. The characters should feel like people she knows and will miss. That missing is the product.",
    mandatory: [
      "Open in the aftermath of episode four — something has changed; neither has named it",
      "Someone forces the question — his real answer must cost him visibly",
      "Final line must make the listener immediately want a second series",
    ],
  },
];

export function getArcStage(episodeNumber: number): EpisodeArcStage | undefined {
  return EPISODE_ARC_STAGES.find((s) => s.number === episodeNumber);
}

export const SERIES_POV_RULE = `
POV — SERIES EPISODES:
These episodes use THIRD-PERSON CLOSE perspective throughout.
Refer to the female protagonist by her name (given below) — never as "you."
Use "she / her" pronouns. Stay tightly inside her perspective and internal experience.
His desire must be directed at HER specifically — use her name, her specific qualities, her particular reactions.
Internal monologue is as important as action — her psychology is half the story.
This is third-person with the intimacy and immediacy of first-person — close, sensory, present.
`;
