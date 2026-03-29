/**
 * The Situation — 220 story situations across 11 categories.
 * Each situation has a display label and a mandatory internalInject
 * that is fed directly into the planStory system prompt as the
 * structural DNA of the generated story.
 */

export interface Situation {
  id: string;
  label: string;
  category: string;
  internalInject: string;
}

export const SITUATIONS: Situation[] = [

  // ── STRANGER ENCOUNTERS ────────────────────────────────────────────────────
  {
    id: "se_hotel_bar",
    label: "The Hotel Bar",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — two strangers share the last seat at a hotel bar on the final night of a trip. MANDATORY: open cold in the bar space before a single word is exchanged; build through fractured attempts to leave; the compression of one night only must charge every exchange with urgency and desire.",
  },
  {
    id: "se_delayed_flight",
    label: "Delayed Flight",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — a flight delay traps two strangers in an airport terminal. MANDATORY: the forced idleness becomes intimacy; their conversation moves in unexpected directions; the story must honour the transience — connection is possible precisely because it cannot become anything permanent.",
  },
  {
    id: "se_wrong_room",
    label: "Wrong Room",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — she opens a door expecting someone else; he is not who she expected. MANDATORY: the mistake must be played out fully before either acknowledges the real tension; the wrongness of the situation becomes an excuse to stay rather than a reason to leave.",
  },
  {
    id: "se_bookshop",
    label: "The Bookshop",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — two strangers reach for the same book at the same moment and neither releases it. MANDATORY: the charged standoff over the book must function as a metaphor for everything that follows; their exchange over its contents reveals something unexpected about both of them.",
  },
  {
    id: "se_art_exhibition",
    label: "Art Exhibition",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — a private art opening, champagne, and a stranger whose gaze keeps returning. MANDATORY: the art they discuss is a proxy for what they are really saying; the conversation must feel sophisticated and layered before the physical tension breaks through.",
  },
  {
    id: "se_conference_pool",
    label: "Conference Hotel Pool",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — she swims alone at midnight; he was supposed to be asleep. MANDATORY: the setting is intimate before either of them intends it to be; the water and the hour strip away the professional armour they were both wearing all day.",
  },
  {
    id: "se_the_rain",
    label: "Caught in the Rain",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — a sudden downpour, one narrow awning, two strangers with nowhere else to stand. MANDATORY: physical proximity is unavoidable and plays out in charged small adjustments; the rain forces patience neither of them expected to enjoy.",
  },
  {
    id: "se_dinner_for_one",
    label: "Dinner For One",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — a full restaurant; a stranger asks if the seat across from her is taken. MANDATORY: what begins as a courtesy becomes a deliberate choice; the story must chart the exact moment the dinner shifts from accidental to intentional.",
  },
  {
    id: "se_the_train",
    label: "The Overnight Train",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — a long overnight train journey and the only empty seat is next to her. MANDATORY: the sealed world of the train compartment compresses time; their conversation spans things strangers would never normally share.",
  },
  {
    id: "se_photography",
    label: "In the Frame",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — he photographs architecture; she happens to be standing in the frame. MANDATORY: the act of being seen — really seen — drives the story; the camera becomes a vehicle for a kind of attention she wasn't prepared for.",
  },
  {
    id: "se_foreign_market",
    label: "Lost in the Market",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — a foreign market, a language barrier, and a hand on hers that stays too long. MANDATORY: the disorientation of unfamiliar surroundings amplifies everything; neither of them has the usual social scripts to fall back on.",
  },
  {
    id: "se_wrong_directions",
    label: "Wrong Directions",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — she gives him directions; he asks her to show him instead. MANDATORY: the invitation must feel both presumptuous and irresistible; the walk that follows takes twice as long as it needed to.",
  },
  {
    id: "se_gallery_secret",
    label: "The Gallery Secret",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — he is studying the painting she created; she doesn't tell him. MANDATORY: her anonymity gives her power and vulnerability in equal measure; the moment of recognition or non-recognition must be the emotional hinge.",
  },
  {
    id: "se_emergency_exit",
    label: "Early Departure",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — they both leave the party early and find themselves at the same spot outside. MANDATORY: the relief of escape bonds them before anything else does; their shared desire to be elsewhere becomes a shared desire for something else entirely.",
  },
  {
    id: "se_the_spa",
    label: "The Thermal Pool",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — she is the only guest at the morning thermal pool; he arrives shortly after. MANDATORY: the therapeutic setting creates a false permission for honesty; the warmth and steam do half the work of lowering guards.",
  },
  {
    id: "se_late_cafe",
    label: "Last Orders",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — a café stays open past closing for two strangers who keep ordering more to extend the night. MANDATORY: the repeated small ritual of ordering becomes a ritual of postponement; the story should feel like one long exhale.",
  },
  {
    id: "se_neighbours_party",
    label: "The Neighbour's Party",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — she knows no one at the party; neither does he. MANDATORY: their mutual displacement becomes their bond; they build a private island of two inside the crowded room.",
  },
  {
    id: "se_empty_museum",
    label: "The Empty Museum",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — a rainy Tuesday, an almost-empty museum, and a man who seems to know every room. MANDATORY: culture and quiet create an unusual container for desire; what they discuss about art mirrors what neither is saying directly.",
  },
  {
    id: "se_concierge",
    label: "Off the Record",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — she asks the hotel concierge for a recommendation; he says he finishes at eight. MANDATORY: the casual line that changes everything must land with weight; the shift from professional to personal is the story's first act.",
  },
  {
    id: "se_the_storm",
    label: "Storm Shelter",
    category: "Stranger Encounters",
    internalInject: "SITUATION ANCHOR — a coastal storm traps two strangers in an isolated cottage. MANDATORY: the external storm externalises the internal one; they must make choices about proximity, warmth, and honesty that the storm makes feel urgent.",
  },

  // ── FORBIDDEN DESIRE ───────────────────────────────────────────────────────
  {
    id: "fd_best_friends_partner",
    label: "The Best Friend's Partner",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — she has always belonged to a friend; tonight, the friend is absent. MANDATORY: the weight of betrayal must be present as a named tension, not erased; desire wins, but the story must honour what it costs.",
  },
  {
    id: "fd_off_limits_colleague",
    label: "The Office Rule",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — the rule exists for exactly this reason and they both know it. MANDATORY: the rule must be invoked explicitly — acknowledging it is part of the game; breaking it should feel like a decision, not a slip.",
  },
  {
    id: "fd_the_client",
    label: "Biggest Account",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — she is his most important client; she has been watching him for weeks. MANDATORY: the professional power inversion is central — she has formal authority but he holds the personal one; the negotiation of those two powers is the story.",
  },
  {
    id: "fd_almost_ex",
    label: "The Almost Ex",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — they never quite ended things; one late message reopens the question. MANDATORY: the ambiguity of their history is the story's engine; neither commitment nor clean break gives the usual permission — they must create their own.",
  },
  {
    id: "fd_sisters_invitation",
    label: "In Her Sister's Place",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — her sister couldn't come; she arrived to explain and he pulled her inside. MANDATORY: the substitution that began as innocent must become something neither of them can blame on circumstance; the sister's absence is the permission neither asked for.",
  },
  {
    id: "fd_the_married_one",
    label: "The Unavailable One",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — he told her from the start he wasn't available; she told herself she didn't care. MANDATORY: the story does not resolve the moral weight — it lives inside it; the desire is real and so is the problem.",
  },
  {
    id: "fd_professor",
    label: "Office Hours",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — office hours end; the question she has been building to is not about the course. MANDATORY: the power differential is present but she must be the one who moves first; her agency is non-negotiable.",
  },
  {
    id: "fd_mentor",
    label: "The Mentor",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — three years of guidance; tonight it is not career advice. MANDATORY: the story must honour both the depth of the professional relationship and what is now overriding it; the shift should feel like a long time coming.",
  },
  {
    id: "fd_the_rival",
    label: "The Rival",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — they compete for everything; the trophy sits between them on his desk. MANDATORY: competition and desire are the same impulse in different clothes; winning and losing must become indistinguishable by the end.",
  },
  {
    id: "fd_the_employee",
    label: "Signed Her Offer Letter",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — she has been with the company longer than he has; he still signed her offer letter. MANDATORY: the formal hierarchy inverts their personal power; the story plays in the space between professional respect and what they actually want.",
  },
  {
    id: "fd_the_in_law",
    label: "Since the Wedding",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — the wedding was six months ago; they have been avoiding each other since. MANDATORY: the avoidance must be given full weight — it is the story's opening movement; the eventual proximity should feel both reckless and inevitable.",
  },
  {
    id: "fd_exs_friend",
    label: "Something to Return",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — he came to return something she left; she didn't invite him to stay, and yet he did. MANDATORY: the object that was returned is less important than what it represents; his staying is a decision they both made without saying so.",
  },
  {
    id: "fd_the_contract",
    label: "The Non-Disclosure",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — the NDA exists for a reason; she signed it and so did he and that is the problem. MANDATORY: the legal architecture of their situation creates a perverse intimacy; what they are not allowed to say drives everything.",
  },
  {
    id: "fd_power_lunch",
    label: "The Interview That Became Dinner",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — he is her interviewer; the lunch becomes dinner and the job is no longer the point. MANDATORY: the formal power of the interview context must invert as the evening progresses; by the end she is the one with leverage.",
  },
  {
    id: "fd_neighbours_husband",
    label: "Three Years Careful",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — she has known him for years and been very careful; tonight she is not careful. MANDATORY: the accumulated weight of restraint should be palpable; this is not impulse but the end of a long, deliberate patience.",
  },
  {
    id: "fd_sworn_enemies",
    label: "Sworn Enemies",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — they have been rivals since they met; she didn't expect him to be so convincing up close. MANDATORY: the hostility and the attraction must be inseparable; the story should not resolve their rivalry — it should complicate it beyond recovery.",
  },
  {
    id: "fd_teachers_return",
    label: "Not a Classroom",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — he taught her at seventeen; she is twenty-nine now and this is not a classroom. MANDATORY: the transformation of roles must be fully acknowledged; she must be clearly, unambiguously the one with agency in the adult encounter.",
  },
  {
    id: "fd_arranged_match",
    label: "What the Families Want",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — their families want them to meet; what the families want and what they want are entirely different things. MANDATORY: the external expectation becomes a container they must break or subvert; what they want must be discovered inside the formal meeting, not despite it.",
  },
  {
    id: "fd_therapist_colleague",
    label: "Not Her Patient",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — she doesn't see him professionally; that makes it worse, not better. MANDATORY: the ethical adjacency — not quite off-limits but feeling as though it is — creates the specific texture of the desire; the rules are implied, not stated.",
  },
  {
    id: "fd_godfather",
    label: "He Held Her at Her Christening",
    category: "Forbidden Desire",
    internalInject: "SITUATION ANCHOR — he has known her her entire life; the way he is holding her now is entirely new. MANDATORY: the weight of family history and long familiarity must be present throughout; this is not reckless but deeply considered and therefore more charged.",
  },

  // ── SLOW BURN ─────────────────────────────────────────────────────────────
  {
    id: "sb_years_of_letters",
    label: "Years of Letters",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — four years of correspondence; this is the first time they have met in person. MANDATORY: the gap between who they are in words and who they are in a room must be the story's central drama; familiarity and strangeness must coexist.",
  },
  {
    id: "sb_almost_kiss",
    label: "Three Years After the Almost",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — three years ago they almost kissed at a wedding and both of them remember. MANDATORY: the almost must be referenced or felt early; the entire story is the negotiation of whether this becomes the thing they should have done then.",
  },
  {
    id: "sb_colleagues_who_know",
    label: "Everyone Knows",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — every person in their office knows; neither of them has said it aloud yet. MANDATORY: the external knowledge becomes pressure that builds; the story is the crack in the dam, not the flood.",
  },
  {
    id: "sb_long_drive",
    label: "Twelve Hours",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — twelve hours, one car, no way to pretend they don't know what this is. MANDATORY: the forced intimacy of the journey must be structural — scenes correspond to miles; by the end they are not who they were at departure.",
  },
  {
    id: "sb_house_share",
    label: "The House Share",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — six months as housemates; both of them entirely aware of the other's schedule, habits, and presence. MANDATORY: the domestic intimacy without emotional acknowledgment is the story's defining tension; the crossing must feel like a door they both knew was there.",
  },
  {
    id: "sb_growing_up",
    label: "Different Directions",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — childhood friends who grew into different lives; now the same city brings them back. MANDATORY: the layering of who they were and who they are now must be explicit; desire is complicated by history and simplified by it in equal measure.",
  },
  {
    id: "sb_letters_unsent",
    label: "Drafts He Never Sent",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — she found the unsent drafts; every one was about her. MANDATORY: the discovery is the story's inciting event; his written self must be revealed to be more honest than his spoken one, and she must decide what to do with that knowledge.",
  },
  {
    id: "sb_seasons",
    label: "Every Season",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — they meet at the same place each season; something always almost happens. MANDATORY: the story must use the season as structural time-marker; each scene corresponds to a season and each season almost resolves what the last one didn't.",
  },
  {
    id: "sb_tuesday_mornings",
    label: "Same Coffee Shop",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — same café, same time, every Tuesday, for months — and they have never exchanged names. MANDATORY: the ritual must be rendered as both comfort and torment; the day they finally speak must feel both small and enormous.",
  },
  {
    id: "sb_slow_lean",
    label: "Closer Each Time",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — every conversation ends a little closer than the last. MANDATORY: the story is told through the geometry of proximity; the closing of physical distance is the entire emotional arc.",
  },
  {
    id: "sb_playlist",
    label: "The Playlist",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — he made her a playlist three years ago; she has listened to it hundreds of times and now he finds out. MANDATORY: music is the emotional subtext throughout; each song referenced must carry the weight of the thing unsaid.",
  },
  {
    id: "sb_standing_reservation",
    label: "The Same Table",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — they book the same restaurant table on the same night every month, separately, and always end up near each other. MANDATORY: the ritual must be discovered or acknowledged during the story; coincidence must become intention.",
  },
  {
    id: "sb_the_archive",
    label: "The Research Project",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — she is cataloguing his letters for an archive; the letters are all about desire. MANDATORY: the professional framing of reading intimate material must become psychologically overwhelming; the archivist and the object of study must trade positions.",
  },
  {
    id: "sb_almost",
    label: "Six Almost-Moments",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — six almost-moments in seven years; tonight is the seventh. MANDATORY: the pattern of failed resolve must be present as background weight; this time the ending must be different and that difference must be earned.",
  },
  {
    id: "sb_the_graduate",
    label: "The Same Programme",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — same programme, different tracks; five years of circling each other in the library. MANDATORY: academic settings carry their own brand of slow tension; knowledge and desire are cousins in this story.",
  },
  {
    id: "sb_the_studio",
    label: "She Makes Work He Will Photograph",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — he photographs her work; she has started making work she knows he will photograph. MANDATORY: the creative feedback loop is the story's love language; each work she creates is a communication and each photograph is his reply.",
  },
  {
    id: "sb_promise",
    label: "The Promise at Nineteen",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — a promise made at nineteen that neither of them forgot. MANDATORY: the promise must be stated or felt early; the story is the question of whether to honour it, renegotiate it, or finally act on what it was really about.",
  },
  {
    id: "sb_long_game",
    label: "He Had Time",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — he said he had time to wait; he meant it; she is learning what it means to be waited for. MANDATORY: patience as an act of devotion must be the story's emotional texture; the reward must feel proportionate to the wait.",
  },
  {
    id: "sb_third_time",
    label: "Three Different Countries",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — the universe has arranged for them to meet in three different countries and this is the third. MANDATORY: the sense of orchestration — of something larger than coincidence — must be present; they must both feel it, even if they name it differently.",
  },
  {
    id: "sb_patience",
    label: "She Needed Time",
    category: "Slow Burn",
    internalInject: "SITUATION ANCHOR — she told him she needed time; he said he had it and waited without conditions. MANDATORY: the quality of his waiting — without pressure, without resentment — is part of what has changed her; the story explores what it means to be truly ready.",
  },

  // ── WORKPLACE TENSION ─────────────────────────────────────────────────────
  {
    id: "wt_hostile_takeover",
    label: "The New CEO",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — he is the new CEO; she has been here longer than he has been in the industry. MANDATORY: the power struggle must be professional before it is personal; the shift from adversarial to something else should feel like a surprise to both of them.",
  },
  {
    id: "wt_late_deadline",
    label: "One Deadline Left",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — the rest of the team left at eight; it is now midnight and there is one deadline and two people. MANDATORY: the work must be present as a grounding force that keeps being interrupted by what is actually happening between them.",
  },
  {
    id: "wt_performance_review",
    label: "Honest Evaluation",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — she requested an honest evaluation; he gave her one; she requested another meeting. MANDATORY: the review language must function as subtext for everything else; professional assessment becomes personal revelation.",
  },
  {
    id: "wt_business_trip",
    label: "Two Nights Away",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — two nights in an unfamiliar city, one dinner they both know they should not have accepted. MANDATORY: the removal from the office context strips away the professional armour; the story begins at the dinner invitation.",
  },
  {
    id: "wt_boardroom",
    label: "She Was Right",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — she was right in the boardroom and he knows it; that is not why he cannot stop thinking about it. MANDATORY: intellectual attraction is the story's first layer; his respect for her competence becomes something he cannot categorise professionally.",
  },
  {
    id: "wt_conference_room",
    label: "Left Behind",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — everyone else is at the conference; they stayed to prepare the final slides. MANDATORY: the institutional emptiness creates an unofficial permission; the building echoes around them and makes their proximity feel more deliberate.",
  },
  {
    id: "wt_shared_office",
    label: "Budget Cuts",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — budget cuts put two people in one office; five months of professional behaviour is beginning to cost something. MANDATORY: the shared physical space must be a character; its geometry — desks, proximity, windows — drives the story.",
  },
  {
    id: "wt_negotiation",
    label: "She Came to Close",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — she came to close a deal; he is not going to make this easy. MANDATORY: the negotiation itself must be seductive; every professional offer and counter is also something else entirely.",
  },
  {
    id: "wt_the_pitch",
    label: "The War Room",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — the pitch is at noon; it is eleven PM and they are still in the war room. MANDATORY: the high-stakes preparation must create an adrenalin charge that becomes something else; exhaustion and excellence have their own kind of attraction.",
  },
  {
    id: "wt_overtime",
    label: "No Reason to Stay",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — the building has been empty for an hour; neither of them has a reason to stay and neither has left. MANDATORY: the decision to remain must be named, at least internally; staying is the first active choice toward each other.",
  },
  {
    id: "wt_exit_interview",
    label: "The Exit Interview",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — she is leaving on Friday; he scheduled the exit interview himself. MANDATORY: the official framing of the meeting is immediately inadequate; what both of them are trying to say inside the HR framework is the story.",
  },
  {
    id: "wt_retreat",
    label: "The Lakeside Lodge",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — two days at a team-building retreat; work sessions end early and the bar is open. MANDATORY: the collapse of professional routine into leisure time must feel gradual and then sudden; the informal setting reveals what the office had been masking.",
  },
  {
    id: "wt_new_brief",
    label: "Taken Over Her Project",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — he has taken over her project; everything about this is her problem. MANDATORY: the professional intrusion must feel personal immediately; her need to prove herself to him becomes indistinguishable from wanting his attention.",
  },
  {
    id: "wt_the_reference",
    label: "Mutual Need",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — he needs a reference from her; she needs something from him. MANDATORY: the exchange of professional favours masks what is actually being negotiated; the story is about leverage that dissolves into something neither of them planned.",
  },
  {
    id: "wt_corner_office",
    label: "Her New Direct Report",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — the promotion went to her; he is now her direct report; they are both handling this very well. MANDATORY: the inversion of their expected power dynamic must be acknowledged explicitly; her authority and his response to it is the story.",
  },
  {
    id: "wt_trade_show",
    label: "Shared Stand",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — eight hours presenting together at a trade show; then dinner; then whatever comes after dinner. MANDATORY: the professional partnership of the day creates an earned intimacy by evening; the transition from 'colleagues performing' to 'two people at dinner' must be rendered.",
  },
  {
    id: "wt_freelancer",
    label: "The Project Ends This Week",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — she hired him for one project; the project ends this week. MANDATORY: the impending end of the professional relationship is what makes it finally possible to acknowledge what else has been building; the deadline operates as the story's ticking clock.",
  },
  {
    id: "wt_salary",
    label: "She Asked For a Raise",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — she asked for a raise; he countered; neither of them is talking about money now. MANDATORY: the negotiation must quickly reveal itself to be a proxy for something else; her assertiveness in asking is what changed the dynamic.",
  },
  {
    id: "wt_internal_transfer",
    label: "Different Cities",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — assigned to work together across cities; the video calls have been getting longer. MANDATORY: the digital-to-physical build must be structurally present; the anticipation of meeting in person carries the full weight of weeks of increasing intimacy through a screen.",
  },
  {
    id: "wt_presentation",
    label: "One Laptop Between Them",
    category: "Workplace Tension",
    internalInject: "SITUATION ANCHOR — their ideas conflicted in every meeting; one hotel room and one laptop in the city where the presentation is tomorrow. MANDATORY: intellectual conflict must become creative collaboration before it becomes anything else; the best ideas come when they stop fighting each other.",
  },

  // ── POWER & DEVOTION ──────────────────────────────────────────────────────
  {
    id: "pd_the_command",
    label: "He Doesn't Ask",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — he doesn't ask; she doesn't want him to. MANDATORY: the dynamic of command and willing compliance must feel chosen by her, not imposed; her desire for this specific dynamic is the story's emotional truth.",
  },
  {
    id: "pd_she_kneels",
    label: "For No One Else",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — she would never kneel for anyone; she kneels for him. MANDATORY: the specificity of this exception — that it is him and only him — must be the emotional centre; her surrender is an act of extraordinary trust.",
  },
  {
    id: "pd_the_test",
    label: "She Fails It On Purpose",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — he sets a test of patience; she fails it deliberately. MANDATORY: the intentionality of her failure must be clear to the reader and eventually to him; it is a form of communication, not weakness.",
  },
  {
    id: "pd_permission",
    label: "She Asks for Everything",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — she asks for everything; he grants nothing without making her ask again. MANDATORY: the ritual of asking and the extended pause before granting must be rendered as both erotic and tender; his withholding is a form of attention.",
  },
  {
    id: "pd_safe_word",
    label: "Neither Expects to Use It",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — they have established the word; neither of them expects to use it. MANDATORY: the existence of the word should create safety that deepens the intensity; the story operates in the space the word makes possible.",
  },
  {
    id: "pd_surrender",
    label: "Everything She Controls",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — she has been in control of everything for three years; tonight she gives it up. MANDATORY: the relief of surrender must be the emotional revelation; she must discover in the act of letting go something she had not admitted she needed.",
  },
  {
    id: "pd_dominant_guest",
    label: "A Guest in Her Home",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — he is a guest in her home; she invited him; she is not sure she is in control. MANDATORY: the domestic authority she usually holds in her own space must erode deliberately; the inversion of host and guest power is the story's tension.",
  },
  {
    id: "pd_the_challenge",
    label: "She Says He Couldn't",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — she tells him he couldn't make her beg; he says he has time. MANDATORY: the challenge must be taken completely seriously by both parties; the story is the long, deliberate proof.",
  },
  {
    id: "pd_the_collar",
    label: "Only They Knew",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — she wore it to the dinner; only they knew what it meant. MANDATORY: the public secret must be the story's structural device; every interaction at the dinner table carries a private subtext that only they can hear.",
  },
  {
    id: "pd_worship",
    label: "She Makes an Exception",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — she doesn't let anyone worship her; she makes an exception for him. MANDATORY: receiving devotion requires its own kind of courage; the story must honour her learning to accept what he is offering.",
  },
  {
    id: "pd_the_rules",
    label: "She Agreed to Them",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — he has rules; she agreed to them; breaking them was always the point. MANDATORY: the rules must be stated clearly enough that their violation is legible; the breaking is a collaborative act, not a unilateral one.",
  },
  {
    id: "pd_blindfolded",
    label: "She Trusts Him Completely",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — she trusts him completely; that is the whole story. MANDATORY: trust as the erotic foundation must be rendered through specific sensory details; what she cannot see makes everything else more vivid.",
  },
  {
    id: "pd_the_performance",
    label: "He Watches",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — he watches; she performs; they both understand this arrangement. MANDATORY: being watched must be rendered as a form of intimacy that both parties have chosen; the audience of one gives her a specific kind of freedom.",
  },
  {
    id: "pd_claim",
    label: "Something He Wants to Make Clear",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — after everything they have been through, he wants to make something clear. MANDATORY: the clarity he is seeking is physical and emotional simultaneously; the declaration must be shown, not just stated.",
  },
  {
    id: "pd_the_game",
    label: "The Stakes Are Clear",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — they have been playing this game all evening; the stakes are understood; neither backs down. MANDATORY: the game must have rules that the reader comes to understand; the ending of the game is the story's climax.",
  },
  {
    id: "pd_the_restraint",
    label: "Whose Restraint",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — hers or his — they have not decided yet. MANDATORY: the deliberation over who holds and who is held must be explicit and erotic; the decision-making process is as charged as the decision.",
  },
  {
    id: "pd_edge",
    label: "She Asks Him to Keep Going",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — he keeps her at the edge; she asks him to continue. MANDATORY: her agency in asking must be paramount; the story must render the extended experience of being held at a threshold as both demanding and deeply desired.",
  },
  {
    id: "pd_the_wager",
    label: "She Lost on Purpose",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — she bet she could resist; she lost on purpose. MANDATORY: the intentional loss must be her strategic choice; the story explores what it means to want to lose and what losing gives her.",
  },
  {
    id: "pd_devotion",
    label: "The Weight of That",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — he will do anything she asks; she is beginning to understand the weight of that. MANDATORY: the story must render absolute devotion as something that requires courage to accept; her relationship to power is transformed.",
  },
  {
    id: "pd_the_agreement",
    label: "The Terms",
    category: "Power & Devotion",
    internalInject: "SITUATION ANCHOR — they drafted the terms carefully; the terms are not the interesting part. MANDATORY: the formal negotiation of their arrangement must be present as structure; what falls outside the terms is where the story lives.",
  },

  // ── SECOND CHANCES ────────────────────────────────────────────────────────
  {
    id: "sc_the_reunion",
    label: "Ten Years",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — ten years; a hotel bar; she sees him before he sees her. MANDATORY: the moment of recognition must be rendered from her perspective first; the story holds the ten years in both their bodies before a word is spoken.",
  },
  {
    id: "sc_divorce_party",
    label: "The Divorce Party",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — her friend's divorce party; he was the ex-husband's colleague; they have never actually spoken. MANDATORY: the celebratory wreckage of another relationship must provide an ironic container for something new beginning; the timing should feel both wrong and right.",
  },
  {
    id: "sc_the_return",
    label: "He Came Back With One",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — he left without explanation three years ago; he came back with one. MANDATORY: the explanation must be part of the story's action, not just background; she must decide whether the explanation is enough, and that decision must be dramatised.",
  },
  {
    id: "sc_the_wedding",
    label: "Someone Else's Wedding",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — they dated for two years; now they are both at someone else's wedding. MANDATORY: the wedding context — celebration, ceremony, declared love — must heighten the subtext of their own unresolved story; speeches become mirrors.",
  },
  {
    id: "sc_the_inheritance",
    label: "Both Signatures Required",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — they were engaged once; the estate requires both of their signatures. MANDATORY: the legal compulsion to cooperate must be what allows them to be in a room together; the contract is both the problem and the solution.",
  },
  {
    id: "sc_the_apology",
    label: "She Didn't Expect to Forgive",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — she did not expect him to actually apologise; she did not expect to forgive him. MANDATORY: forgiveness must be shown to be active, not passive — she chooses it; what she moves toward is as important as what she is releasing.",
  },
  {
    id: "sc_old_letters",
    label: "His Number in the Last One",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — she found his old letters in her mother's attic; his number was left in the last one. MANDATORY: the letters must be encountered before the call; what she reads before contacting him shapes everything she brings to the reunion.",
  },
  {
    id: "sc_the_city",
    label: "She Moved Back",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — she moved back to the city she left because of him; he never left. MANDATORY: her return must be processed through the city itself — places they knew, places that have changed; the geography is emotional.",
  },
  {
    id: "sc_almost_strangers",
    label: "Almost Strangers",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — they have been apart long enough to be almost strangers; not quite. MANDATORY: the story must track what remains and what has changed; the almost-strangeness creates both freedom and grief.",
  },
  {
    id: "sc_the_callback",
    label: "His Name on the Brief",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — she auditioned for the project without knowing it was his. MANDATORY: the moment of recognition must come before the professional relationship can be established; what was between them reactivates before either of them knows how to handle the professional context.",
  },
  {
    id: "sc_breakfast",
    label: "That Coffee",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — three years ago they had coffee; she has been thinking about it for three years; now he calls again. MANDATORY: the weight she has been carrying for a single unremarkable meeting must be revealed slowly; the call recontextualises everything.",
  },
  {
    id: "sc_the_voicemail",
    label: "She Saved It",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — she saved the voicemail; she plays it in the car sometimes; then one day he calls the actual number. MANDATORY: the voicemail must be evoked or quoted; the call that replaces it must navigate the gap between the recorded version and the real one.",
  },
  {
    id: "sc_delayed",
    label: "He's Asking Again",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — he asked her to wait when she was twenty-two; she is thirty now; he is asking again. MANDATORY: the echo of the original request must be explicit; what she is being asked to decide now is different from what she was asked before, and so is she.",
  },
  {
    id: "sc_the_overlap",
    label: "HR Didn't Flag It",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — they now work at the same company; neither HR department flagged the history. MANDATORY: the professional setting that contains them must create both constraint and opportunity; the history must surface through professional interactions before it surfaces directly.",
  },
  {
    id: "sc_the_name",
    label: "She Reads It Three Times",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — she recognises the name in the email before she reads the content; she reads it three times. MANDATORY: the moment of name-recognition must be rendered in full physiological detail; the email itself may be brief, but her response to it is the story's opening.",
  },
  {
    id: "sc_the_window",
    label: "She Can See His Apartment",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — she can see his apartment from her new one; he has lived there for years. MANDATORY: the architecture of proximity must be felt before a word is exchanged; the window becomes a one-way mirror that she eventually steps through.",
  },
  {
    id: "sc_same_table",
    label: "The Same Table as Always",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — the restaurant seated them at the same table as their third date. MANDATORY: the restaurant must remember them even if they are pretending not to remember themselves; the waiter, the light, the menu all serve as witnesses.",
  },
  {
    id: "sc_the_condition",
    label: "He Agreed to the Condition",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — he is back; she gave him a condition; he agreed to it. MANDATORY: the condition must be revealed during the story and must feel specific and meaningful; his willingness to accept it is the proof she has been waiting for.",
  },
  {
    id: "sc_the_signal",
    label: "She Hadn't Forgotten",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — they had a signal between them; she thought she had forgotten it; she had not. MANDATORY: the signal — whatever it is — must be rendered as a private language that only they speak; its reappearance is the story's hinge.",
  },
  {
    id: "sc_last_time",
    label: "He's at the Door",
    category: "Second Chances",
    internalInject: "SITUATION ANCHOR — they agreed it was the last time; that was eight months ago; he is at the door. MANDATORY: the agreement to end must be remembered and held against the present moment; her decision about the door is the story's entire weight.",
  },

  // ── MIDNIGHT CONFESSIONS ──────────────────────────────────────────────────
  {
    id: "mc_3am_call",
    label: "3am",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — it is 3am; he is calling; she picks up without thinking about why she always picks up. MANDATORY: the hour is a character; the disinhibition of very late night must suffuse the conversation with things that would be impossible in daylight.",
  },
  {
    id: "mc_the_sleepover",
    label: "They Fell Asleep Talking",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — they fell asleep talking; they woke closer than planned. MANDATORY: the accidental intimacy of shared sleep must be handled with specificity — the sounds, the warmth, the moment of waking — before either of them decides what to do with it.",
  },
  {
    id: "mc_truth_or_truth",
    label: "No Dares",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — no dares; only questions neither of them should answer honestly. MANDATORY: each question must genuinely escalate; the game structure is the story's pacing device and each answer reveals something that cannot be taken back.",
  },
  {
    id: "mc_the_balcony",
    label: "One Hour Outside",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — everyone else is inside; they have been on the balcony for an hour; neither has gone back in. MANDATORY: the party behind them must be audible but irrelevant; the private world of the balcony is the only real location.",
  },
  {
    id: "mc_last_bus",
    label: "Missed the Last Bus",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — they have missed the last bus; there is nothing to do but keep talking. MANDATORY: the missed transport must function as a mutual, uncomplained-about accident; the extra time is both gift and permission.",
  },
  {
    id: "mc_insomnia",
    label: "She Replied Immediately",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — she cannot sleep; he texted at 1am; she replied immediately. MANDATORY: the speed of her reply must mean something and must be acknowledged; their both being awake at this hour is its own kind of revelation.",
  },
  {
    id: "mc_night_before",
    label: "The Night Before",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — she has an early flight; he came to say goodbye; they both know this is not goodbye. MANDATORY: the false framing of farewell must be present throughout; everything said under the cover of goodbye carries the weight of a beginning.",
  },
  {
    id: "mc_the_confession",
    label: "He Has Been Carrying It",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — he has been carrying something for two years; he tells her at midnight; she had been waiting. MANDATORY: the revelation must be earned by the story, not stated prematurely; her waiting must be discovered alongside his telling.",
  },
  {
    id: "mc_drunk_honesty",
    label: "Both a Little Drunk",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — both a little drunk; she says the thing she has never said; he says the thing he has held back. MANDATORY: the alcohol must lower precision but not erase it; what they say must be both clearer and more surprising than sober speech.",
  },
  {
    id: "mc_stars",
    label: "Their Hands Found Each Other",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — lying on a blanket, looking at stars; their hands found each other twenty minutes ago and neither has moved. MANDATORY: the physical fact of the joined hands must be the story's emotional throughline; everything said is said with that contact as foundation.",
  },
  {
    id: "mc_the_dark",
    label: "Power Cut",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — the power went out; they are talking in the dark; the dark is making them honest. MANDATORY: visual deprivation must heighten the auditory and tactile; what they say in the dark they could not say in the light.",
  },
  {
    id: "mc_after_the_party",
    label: "The Last Guests Left",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — the last guests have gone; it is just them and the quiet and the mess. MANDATORY: the slow emptying of the party must be felt; the moment the last person leaves changes the air between them.",
  },
  {
    id: "mc_the_playlist_reveal",
    label: "Not Random",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — he said the playlist was random; every song is from a night they spent together. MANDATORY: the playlist must be used as a timeline of their history; each song unlocks a memory and the final song must be from a night she did not know he remembered.",
  },
  {
    id: "mc_overshare",
    label: "Too Much",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — she tells him too much; he doesn't stop her; he tells her more. MANDATORY: the mutual oversharing must escalate naturally; the permission to say too much must feel reciprocal and held.",
  },
  {
    id: "mc_roof",
    label: "Technically Off-Limits",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — the rooftop is technically off-limits; neither of them cares about limits tonight. MANDATORY: the mild transgression of the rooftop must set the tone for the larger transgression of honesty; the city spread below them should be present as witness.",
  },
  {
    id: "mc_hotel_room",
    label: "One Room, Neither Sleeping",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — one hotel room, the conference ends tomorrow, neither of them is sleeping. MANDATORY: the reason they ended up in the same room must be practical enough to be plausible; the impracticality of pretending to ignore each other is the story.",
  },
  {
    id: "mc_rain_stays",
    label: "She Can't Drive in This",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — she cannot drive home in this rain; he says to stay; neither of them pretends that is the reason. MANDATORY: the rain must be real enough to be heard throughout; the excuse must be offered and accepted without either party pretending to believe it.",
  },
  {
    id: "mc_the_secret",
    label: "Never Told Anyone",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — he tells her something he has never told anyone; she tells him why she believes him. MANDATORY: the secret must feel specific rather than generic; her response — the reason she believes him — must reveal something about her that she was not planning to share.",
  },
  {
    id: "mc_too_late",
    label: "Too Late for Just Friends",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — it is too late to pretend they are just friends; it might also be too late for everything else. MANDATORY: the double jeopardy of the 'too late' must be held — they cannot go back and forward may be impossible too; the story lives in that impossible present.",
  },
  {
    id: "mc_candlelight",
    label: "The Restaurant Closed Around Them",
    category: "Midnight Confessions",
    internalInject: "SITUATION ANCHOR — the restaurant closed around them; the waiter brought candles instead of the bill. MANDATORY: the kindness of the candles must be noticed; the quiet and the light change something in the dynamic and must be the scene's turning point.",
  },

  // ── ESCAPE & FANTASY ──────────────────────────────────────────────────────
  {
    id: "ef_tuscany",
    label: "The Villa",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — a rented Tuscan villa, a week alone, and a local guide who was not in the brochure. MANDATORY: the beauty of the setting must not be decorative — it must be transformative; she is a different person in this landscape than she is at home.",
  },
  {
    id: "ef_the_island",
    label: "Two Extra Days",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — a small island, a missed ferry, two days she had not planned. MANDATORY: the accidental extension of the stay must feel like a gift rather than a problem; the island's smallness means there is nowhere to hide from what is happening.",
  },
  {
    id: "ef_tokyo",
    label: "Tokyo Midnight",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — she doesn't speak the language; he speaks everything else. MANDATORY: the disorientation of the city must be used as an emotional amplifier; the specific sensory texture of Tokyo at night is part of the story, not background.",
  },
  {
    id: "ef_vineyard",
    label: "The Cellar After Dark",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — a private wine tour that ends after dark in a cellar with no phone signal. MANDATORY: the wine must be part of the story's sensory language; the loss of signal is the loss of the external world and creates an extraordinary privacy.",
  },
  {
    id: "ef_safari",
    label: "Three Days in the Bush",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — three days without a city, without excuses, nowhere to pretend to be elsewhere. MANDATORY: the rawness of the landscape must strip away social pretension; the proximity to wildness outside mirrors something happening inside.",
  },
  {
    id: "ef_the_cruise",
    label: "Next Door Suite",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — a last-minute solo cruise; she took the suite; he is in the room next door. MANDATORY: the cruise's enforced leisure and floating isolation must create an unusual permission; there is nothing to do and nowhere to go but toward each other.",
  },
  {
    id: "ef_mountain_lodge",
    label: "Lifts Closed, Bar Open",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — a mountain lodge in a whiteout; the ski lifts are closed; the bar is open. MANDATORY: the weather that traps them must be rendered as both frustrating and welcome; the lodge's warmth against the outside cold must be physically present throughout.",
  },
  {
    id: "ef_campervan",
    label: "Three Countries",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — a campervan, three countries, two people who thought they knew what the trip would be. MANDATORY: the intimacy of the van — small space, shared decisions, no privacy — must be the story's setting in both senses; travel changes what people are willing to say.",
  },
  {
    id: "ef_festival",
    label: "Found Her in the Crowd",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — a music festival in a French field; he found her in the crowd. MANDATORY: the festival's music must be atmospherically present; the specific act of being found in a crowd must carry the weight it deserves.",
  },
  {
    id: "ef_the_road",
    label: "She Lets Him Drive",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — she has a destination; he has a car and no plan; she lets him drive. MANDATORY: the surrender of the route must feel deliberate and liberating; not knowing where they are going must become the point, not an accident.",
  },
  {
    id: "ef_riad",
    label: "The Rooftop Riad",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — a riad in Marrakesh; tiles, orange blossom, and a rooftop she was not expecting to share. MANDATORY: the sensory specificity of the setting — the sounds, the scent, the light — must be woven into every scene; Marrakesh is not a backdrop but a third presence.",
  },
  {
    id: "ef_research_station",
    label: "Six Weeks at the Station",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — six weeks in an Antarctic research station; two scientists from the same university. MANDATORY: the extreme environment must create an extraordinary intimacy; the isolation and cold must be felt as both physical reality and emotional pressure.",
  },
  {
    id: "ef_train_europe",
    label: "Seventy-Two Hours",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — seventy-two hours on a train with someone met at the first station. MANDATORY: the train's motion and the landscape changing outside must mark story time; each country crossed should correspond to a new stage of their developing intimacy.",
  },
  {
    id: "ef_diving",
    label: "She Doesn't Dive",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — a diving resort; she doesn't dive; he offers to teach her. MANDATORY: the underwater lesson must be rendered in full sensory detail — the silence, the light, the close physical instruction; learning to breathe in a new environment mirrors something else.",
  },
  {
    id: "ef_the_cabin",
    label: "One Week, No Wifi",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — one cabin, a week, no wifi; everything they have been avoiding came with them. MANDATORY: the avoidance must be named and felt in the early scenes; the cabin's simplicity removes every distraction they have been using.",
  },
  {
    id: "ef_art_residency",
    label: "Iceland, Two Writers",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — a two-week residency in Iceland; two writers, one shared studio. MANDATORY: their work — what they are each writing — must intersect with what is happening between them; the landscape must be elemental and present.",
  },
  {
    id: "ef_sailing",
    label: "Just the Two of Them",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — she booked a sailing holiday without realising it was just the two of them and a skipper. MANDATORY: the water and the open sky must be physical presences; the boat's smallness and the sea's vastness must create a particular kind of vertigo.",
  },
  {
    id: "ef_port_city",
    label: "One Night, Different Flights",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — one night in a port city before different flights; they have never met before; this is enough. MANDATORY: the known limit must be what makes everything possible; the story is defined by the specific brevity of the time they have.",
  },
  {
    id: "ef_expedition",
    label: "Seven Days in the Dolomites",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — a seven-day mountain hike; the guide was not what the brochure suggested. MANDATORY: the physical demands of the landscape must create unexpected forms of trust and dependence; he knows the mountain and she is learning to rely on that knowledge.",
  },
  {
    id: "ef_new_year",
    label: "Solo New Year, Prague",
    category: "Escape & Fantasy",
    internalInject: "SITUATION ANCHOR — she booked a solo New Year in Prague; the bar has one other solo traveller. MANDATORY: the collective celebration happening around them must contrast with their deliberate solitude; midnight is both the story's deadline and its permission.",
  },

  // ── OBSESSION & PURSUIT ───────────────────────────────────────────────────
  {
    id: "op_the_watcher",
    label: "Four Months Watching",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — he has been watching her across the office for four months; she has been watching him watch. MANDATORY: mutual observation must be the story's engine; the story belongs to her perspective — what she has decided to do with the fact that she is seen.",
  },
  {
    id: "op_the_collector",
    label: "She Keeps Leaving Things",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — he collects things she leaves behind; she knows; she keeps leaving things. MANDATORY: the deliberate nature of her leaving must be as interesting as his collecting; the game is mutual and must be acknowledged.",
  },
  {
    id: "op_first_and_last",
    label: "Everything She Has Ever Said",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — he remembers everything she has ever said to him; she is only now realising what that means. MANDATORY: his memory must be demonstrated through specifics — he recalls something small that she had forgotten; the effect on her must be the story's emotional transformation.",
  },
  {
    id: "op_cancelled_plans",
    label: "Three Plans Cancelled For Her",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — he cancelled three plans for her without her knowing; she finds out. MANDATORY: her discovery must be the story's inciting event; her response — the full complexity of it — must be the story's real subject.",
  },
  {
    id: "op_the_orbit",
    label: "The Radius",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — she can feel him in any room he is in; she tests how far the radius extends. MANDATORY: the physical awareness must be rendered as a sensory phenomenon — not metaphorical but somatic; her testing of the limits of this awareness is the story's action.",
  },
  {
    id: "op_claim_word",
    label: "She Is His",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — he told her once, very quietly, that she was his; she is still thinking about it a year later. MANDATORY: the original quiet declaration must be recalled in full sensory detail; the year of thought that followed must have changed her relationship to the words.",
  },
  {
    id: "op_the_mirror",
    label: "Dangerously Similar",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — they are dangerously similar; she is drawn to what she recognises in him; so is he. MANDATORY: the specific mirroring must be articulated — what exactly they share and why it is dangerous; recognition as the basis of desire has its own complications.",
  },
  {
    id: "op_repetition",
    label: "One Space Away, Always",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — same coffee, same route, one parking space away — always. MANDATORY: the pattern must be established through specific examples before it is confronted; the confrontation must be hers to initiate.",
  },
  {
    id: "op_the_gift",
    label: "Things She Wants Before She Knows",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — he leaves her things — not flowers; things he knows she wants before she knows she wants them. MANDATORY: at least one specific gift must be rendered in detail and must be impossibly accurate; her response to being known this precisely is the story.",
  },
  {
    id: "op_the_note",
    label: "Neither Has Acknowledged It",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — he left a note in her book; she left one in his car; neither has acknowledged it. MANDATORY: the notes must be quoted or paraphrased; the long silence around them is the story's tension until it breaks.",
  },
  {
    id: "op_the_interview",
    label: "Five Hours",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — she is interviewing him for an article; he interviews her back; it lasts five hours. MANDATORY: the interview format must be used as the story's structural device — questions and answers that spiral into revelation; the journalist loses control of the interview in the best possible way.",
  },
  {
    id: "op_long_reach",
    label: "He's in the Room",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — he lives in a different city; he still makes her feel like he is in the room. MANDATORY: the specific mechanisms of his remote presence must be rendered — messages, objects he's sent, habits she has adopted because of him; the physical meeting, when it comes, must live up to the impression.",
  },
  {
    id: "op_the_pursuit",
    label: "The Fourth Time",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — she said no three times; the fourth time she did not. MANDATORY: the story of the three no's must be felt even if not dramatised; her fourth response must feel like a change that belongs to her — not capitulation but decision.",
  },
  {
    id: "op_known",
    label: "He Knows Before She Says",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — he knows what she is going to say before she says it; she does not know how to feel about that. MANDATORY: several instances of his anticipation must be rendered; her ambivalence — moved and unnerved in equal measure — must be the story's emotional texture.",
  },
  {
    id: "op_possession",
    label: "Neither Names It",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — he doesn't call it that; she doesn't either; the word hangs between them. MANDATORY: the unspoken word must be palpable; the story must do the work of demonstrating what the word would mean without ever using it.",
  },
  {
    id: "op_the_pattern",
    label: "He Faces Her",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — he noticed she always sits facing the door; he always sits facing her. MANDATORY: the observation must be named — by him, to her — and the naming must be the story's turning point; being seen this specifically changes something.",
  },
  {
    id: "op_found",
    label: "She Was Not Hiding",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — she was not hiding; she is surprised to feel found. MANDATORY: the feeling of being found — distinct from being watched or pursued — must be rendered as its own distinct emotional experience; the surprise must be genuine and the finding earned.",
  },
  {
    id: "op_devotion_received",
    label: "Learning to Receive",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — he is completely devoted to her; she is learning to receive that without running. MANDATORY: her instinct to run must be explored, not dismissed; the story is about what makes it possible to stay when someone loves you completely.",
  },
  {
    id: "op_the_signal_given",
    label: "She Always Does the Same Thing",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — she always does the same thing when she wants him; he always comes. MANDATORY: the signal must be specific and rendered — what she does and how he recognises it; the ritual quality of their exchange must feel like a private language.",
  },
  {
    id: "op_the_bet_refused",
    label: "She Is Not Convincing",
    category: "Obsession & Pursuit",
    internalInject: "SITUATION ANCHOR — she has been trying to prove she doesn't need him; she is failing convincingly. MANDATORY: the proof she is gathering must be examined and found wanting; the failure must be acknowledged to herself before anyone else.",
  },

  // ── CINEMATIC TENSION ─────────────────────────────────────────────────────
  {
    id: "ct_ultimatum",
    label: "The Third Option",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — he gives her an ultimatum: him or the life she is building; she picks neither. MANDATORY: the third option she chooses must feel genuinely surprising and true to her character; the ultimatum must be dramatic enough to justify what follows.",
  },
  {
    id: "ct_last_night",
    label: "She Leaves Tomorrow",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — their last night before she moves to another country. MANDATORY: the impending departure must be present in every scene — in the way objects feel, the way they speak, the way time moves; the night must be both ordinary and extraordinary.",
  },
  {
    id: "ct_photograph",
    label: "The Photograph",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — she found a photograph that changes everything she thought she knew about him. MANDATORY: the photograph and what it reveals must be specific; her process of recontextualising everything she believed must be the story's main movement.",
  },
  {
    id: "ct_unspoken_thing",
    label: "Six Months of Silence",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — something happened six months ago; they have never discussed it; tonight they will. MANDATORY: the event must be suggested before it is named; the conversation that names it must feel both like a relief and like a risk.",
  },
  {
    id: "ct_the_witness",
    label: "She Saw What She Wasn't Meant To",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — she saw something she was not supposed to see; he knows she saw it. MANDATORY: the shared knowledge of the witnessing must be the story's operational tension; what she does with what she knows is the story.",
  },
  {
    id: "ct_the_departure",
    label: "No Plan to Wait",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — he is leaving in the morning for two years; there is no arrangement to wait. MANDATORY: the absence of a promise must be felt as its own weight; the story explores what is said and done in the last hours when there is no future plan to fall back on.",
  },
  {
    id: "ct_the_mistake",
    label: "One of Them Calls It a Mistake",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — something happened that one of them calls a mistake; the other does not. MANDATORY: the asymmetry of interpretation must be the story's conflict; the one who does not call it a mistake must make a compelling case, through action not argument.",
  },
  {
    id: "ct_the_risk",
    label: "She Knows and Says Nothing",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — he is about to do something that could change both their lives; she knows; she says nothing. MANDATORY: her silence must be active, not passive — a decision she is making in real time; what she is allowing to happen and why must be the story's question.",
  },
  {
    id: "ct_other_option",
    label: "Neither Takes It",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — he has another option; she has another option; neither of them takes it. MANDATORY: both options must be present and credible; the choice to remain must feel like something that costs both of them something real.",
  },
  {
    id: "ct_turning_point",
    label: "After Everything",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — this is the scene that comes after everything else; they both know what it means. MANDATORY: the story must feel like a sequel to a long prior narrative; what has already happened between them must be present as weight and texture even if not depicted.",
  },
  {
    id: "ct_one_night",
    label: "The Agreement",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — they agreed: one night, no history, no future; that was an hour ago. MANDATORY: the agreement must be referenced as it increasingly fails; the story is the negotiation of what to do when the terms become impossible to keep.",
  },
  {
    id: "ct_the_demand",
    label: "She Demands to Know",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — she demands to know what he wants; he shows her instead of telling her. MANDATORY: the showing must be rendered in full specificity; his response to her demand must be unexpected enough to override the demand itself.",
  },
  {
    id: "ct_consequence",
    label: "Six Months of Choices",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — every choice they have made in the last six months has led to this moment. MANDATORY: the sense of accumulation must be structurally present — the story should feel like the last act; the weight of what has already happened must be part of its texture.",
  },
  {
    id: "ct_the_match",
    label: "Neither Knows How to Lose",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — they are perfectly matched in everything; neither of them knows how to lose. MANDATORY: the competition between them must be established before it becomes something else; their equality must be what makes the resolution possible.",
  },
  {
    id: "ct_the_delay_ends",
    label: "The Waiting Is Over",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — he made her wait; she made him wait; the waiting is now over. MANDATORY: the symmetry of the mutual delay must be explicit; the end of waiting must have the weight of everything that was held back during it.",
  },
  {
    id: "ct_the_reveal",
    label: "She's Been Someone Else",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — she has not been entirely who she seemed; he has known since Tuesday. MANDATORY: the revelation must be handled with full complexity — who she really is must be more interesting than who she appeared to be; his knowing without saying must have its own explanation.",
  },
  {
    id: "ct_the_line",
    label: "Standing on It",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — there is a line; they have discussed it; they are both standing on it. MANDATORY: the line must be specific enough to feel real; the story must dramatise what it means to stand somewhere and not move and not retreat.",
  },
  {
    id: "ct_the_proof",
    label: "Failing Convincingly",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — she has been trying to prove she doesn't need him; she is failing in a way that proves the opposite. MANDATORY: her proof-gathering must be active — things she has been doing — and must be exposed as self-defeating; the failure must be witnessed.",
  },
  {
    id: "ct_the_bet",
    label: "Neither Planned to Win",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — they bet on how the night would end; neither of them planned to win. MANDATORY: the bet must be articulated and specific; winning must mean something different from what they thought when they made it.",
  },
  {
    id: "ct_the_signal_unspoken",
    label: "She Gave the Signal",
    category: "Cinematic Tension",
    internalInject: "SITUATION ANCHOR — she gives him a signal they have never discussed; he understands it immediately. MANDATORY: the signal must be rendered as a specific act — something she does that could be innocent or could be everything; his immediate comprehension is the story's emotional peak.",
  },

  // ── DRAMA & PSYCHOLOGICAL THRILLER ────────────────────────────────────────
  {
    id: "dpt_double_life",
    label: "She Discovers His Second Life",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — she discovers he has a second life; he knew she would find it; he let her. MANDATORY: the deliberateness of his exposure must be the story's central mystery and its central intimacy; the double life must be something he wanted her to know.",
  },
  {
    id: "dpt_the_alibi",
    label: "She Was With Him That Night",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — she was with him the night in question; providing his alibi means revealing where she was. MANDATORY: the legal and personal stakes must both be present; her decision about what to say — to whom and why — is the story's moral and emotional centre.",
  },
  {
    id: "dpt_inheritance_clause",
    label: "Thirty Days Together",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — they must live together for thirty days to claim the inheritance; one of them is not what they appear. MANDATORY: the thirty-day structure must create scenes at different stages; the revelation of who is not what they seem must arrive when both of them are already too far in to walk away.",
  },
  {
    id: "dpt_the_informant",
    label: "The Wrong Side",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — she has been feeding information to the wrong side; he has known for weeks. MANDATORY: his knowledge must have changed how he behaves with her without her noticing; the moment he reveals he knows must recontextualise everything that came before it.",
  },
  {
    id: "dpt_the_dossier",
    label: "A File That Began Before They Met",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — he has a dossier on her that predates their introduction; she finds it. MANDATORY: what the file contains must be specific enough to be alarming; her response must be complex — not simply betrayed but something harder to name.",
  },
  {
    id: "dpt_last_witness",
    label: "Only Two People Know",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — only two people know what happened that night; they are now alone together. MANDATORY: the shared secret must create an intimacy that is distinct from any other; what they do with that knowledge — and with each other — must be the story.",
  },
  {
    id: "dpt_the_understudy",
    label: "She Took the Identity",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — she has been living under an assumed identity; he knew the original. MANDATORY: his knowledge of who she is supposed to be must complicate every interaction; she must eventually decide whether to continue or to show him who she actually is.",
  },
  {
    id: "dpt_leverage",
    label: "What Each Has on the Other",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — he has something she needs; she has something he is afraid of; they negotiate. MANDATORY: the negotiation must be rendered as both tense and intimate; what they are trading in must matter and the terms must shift as they learn more about each other.",
  },
  {
    id: "dpt_false_confession",
    label: "She Confesses to What She Didn't Do",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — she confesses to something she didn't do; he knows who did. MANDATORY: his knowledge must create an extraordinary tension — he cannot accept her false confession without becoming complicit in the protection of whoever really did it; the story lives in that dilemma.",
  },
  {
    id: "dpt_the_target",
    label: "She Was Supposed to Stay Distant",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — she was hired to get close to him and extract something; she is failing at the professional distance. MANDATORY: the original assignment must remain present as a counterweight to what is actually developing; her failure to remain detached must be evidence of something real.",
  },
  {
    id: "dpt_test_subject",
    label: "His Interest Is Not Scientific",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — she volunteered for a research study; he is the researcher; his interest in her is not scientific. MANDATORY: the research context must remain structurally present — sessions, protocols, data — even as it becomes a vehicle for something else entirely.",
  },
  {
    id: "dpt_cover_story",
    label: "Stopped Being Fake Three Months Ago",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — their relationship is a cover story; it stopped being fake three months ago. MANDATORY: the moment it became real must be identified within the story — a specific scene, a specific thing said; they must now face what it means to be real inside a fiction.",
  },
  {
    id: "dpt_the_protector",
    label: "The Danger Is Him",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — he was hired to keep her safe; the thing she needs protecting from is him. MANDATORY: the irony must be unresolved rather than resolved; she must know or come to know and must make a choice that acknowledges the complexity of what he is to her.",
  },
  {
    id: "dpt_rival_systems",
    label: "Opposing Sides",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — they represent opposing sides of a negotiation; the negotiation ends; they don't. MANDATORY: what they were negotiating must have real stakes that remain present as context; their personal continuation after the professional conclusion must feel earned and dangerous.",
  },
  {
    id: "dpt_the_anomaly",
    label: "He Is the Anomaly",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — she is assigned to investigate a specific anomaly in the data or the system; he is the anomaly. MANDATORY: the investigative framing must be present throughout as her professional purpose; the discovery that the anomaly is human — is him — must restructure everything.",
  },
  {
    id: "dpt_the_debt",
    label: "She Owes Something She Cannot Repay",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — she owes him a debt she cannot repay in kind; he decides what he wants instead. MANDATORY: what he wants must be something that cannot be forced — its value comes from it being freely given; the story is about what freely given means under these conditions.",
  },
  {
    id: "dpt_long_con",
    label: "They're Running the Same Con",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — she has been running a con; so has he; they are running the same con on each other. MANDATORY: the mutual deception must be discovered by both parties at roughly the same time; what remains after the con is exposed is the story's real question.",
  },
  {
    id: "dpt_the_key",
    label: "She Entered the Room",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — he gave her a key to a room she was told not to enter; she entered. MANDATORY: what is in the room must be specific and revelatory; his giving her the key must have been deliberate — he wanted her to enter — and that knowledge must change what she found.",
  },
  {
    id: "dpt_arrangement_gone_wrong",
    label: "Fourteen Months",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — the arrangement was supposed to be simple; it has now been fourteen months. MANDATORY: what the original arrangement was must be established; the fourteen months of deviation from it must have changed both of them in ways they have to reckon with.",
  },
  {
    id: "dpt_secret_admirer",
    label: "He Knows Too Much",
    category: "Drama & Psychological Thriller",
    internalInject: "SITUATION ANCHOR — he knows things about her she has never told anyone; the story is the question of how. MANDATORY: the things he knows must be specific and not publicly available; the process of discovering his source — and what it means about who he is and what she is to him — must be the story's investigation.",
  },
];

/** Flat set of all valid situation labels for allowlist validation. */
export const VALID_SITUATION_LABELS: Set<string> = new Set(
  SITUATIONS.map((s) => s.label),
);

/** All unique category names. */
export const SITUATION_CATEGORIES: string[] = [
  ...new Set(SITUATIONS.map((s) => s.category)),
];

/** Look up a situation by its label (the value sent from the client). */
export function getSituationByLabel(label: string): Situation | undefined {
  return SITUATIONS.find((s) => s.label === label);
}

/** Get all situations in a given category. */
export function getSituationsByCategory(category: string): Situation[] {
  return SITUATIONS.filter((s) => s.category === category);
}
