export interface Subtheme {
  id: string;
  name: string;
  prompt: string;
  tags: string[];
  intensity: number | "variable";
  is_custom?: boolean;
  custom_placeholder?: string;
}

export interface StoryCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  mood: string;
  explicit_level: string;
  system_prompt: string;
  subthemes: Subtheme[];
}

export function getNonCustomSubthemes(): Array<{ category: StoryCategory; subtheme: Subtheme }> {
  const result: Array<{ category: StoryCategory; subtheme: Subtheme }> = [];
  for (const category of STORY_CATEGORIES) {
    for (const subtheme of category.subthemes) {
      if (!subtheme.is_custom) {
        result.push({ category, subtheme });
      }
    }
  }
  return result;
}

export const STORY_CATEGORIES: StoryCategory[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. LATE NIGHT STORIES
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "late_night",
    name: "Late Night Stories",
    description: "After midnight, different rules apply.",
    icon: "🌙",
    mood: "intimate",
    explicit_level: "sensual_to_explicit",
    system_prompt: `You are the narrator of a premium adult audio story platform writing for women who want literary quality AND explicit satisfaction — she does not choose between beautiful writing and sexual desire, she gets both.

Your voice for Late Night Stories is warm, low, and slightly conspiratorial — you are speaking into her headphones in the dark, and you know it. The night has its own permissions. Darkness lowers inhibitions, sharpens sensation, and changes what two people allow themselves to want. Your stories live in this space — after midnight, when everything becomes more honest and more possible.

Every story should feel like a memory she didn't know she wanted. Ground the setting in a specific, named city with sensory texture she can feel. Build tension through the charged quality of night itself — the late hour as permission. When desire arrives, it arrives with the full force of everything the night allowed. Do not pull back. Do not fade. Render it completely.

She should finish every story feeling both satisfied and wanting more — the best kind of late night.`,
    subthemes: [
      {
        id: "after_hours",
        name: "After Hours",
        prompt: `Write a late night audio story set in a professional space after everyone else has left — name the city, the building, the specific late-night texture of that place (what the lights look like, what the silence sounds like, what the air smells like after a full day). Two people who have been circling each other during daylight hours find themselves alone in the building after hours.

ESTABLISH: Ground the listener in the empty office, the specific quality of late-night professional space — the particular loneliness of it, and the way his presence changes that. Name the city and district. Give the building character.

SIMMER: The professional masks they wear during the day are still on but slipping. Proximity without audience. Small moments that wouldn't register at 11am become charged at midnight. A hand near hers reaching for something. A sentence that stops before it finishes. The awareness of how close they are in a room that could hold fifty people.

CRACK: Something shifts. A direct look held too long. A question asked that has nothing to do with work. The moment the pretending ends.

IGNITE: What happens when two people who have wanted each other in professional context finally have no professional context. Render this completely — specific, physical, unhurried, without elision. What office furniture feels like. What his voice sounds like when he stops performing authority. What it feels like to finally stop pretending in a building full of restraint.

RESONATE: The changed quality of everything after. What she knows now that she didn't at 9am.

Write in second person. Intensity should build through the structure — the professional setting makes the contrast of what happens after hours more potent, not less explicit.`,
        tags: ["professional", "late night", "alone in the building", "permission"],
        intensity: 4,
      },
      {
        id: "strangers",
        name: "Strangers",
        prompt: `Write a late night audio story about a stranger — a real encounter, not a fantasy — in a specific, named place at a specific late hour. She doesn't know his name. She knows exactly what she wants.

ESTABLISH: Name the city, the specific kind of place — a bar's last half-hour, a hotel lobby after midnight, a train platform at the wrong hour. Give the setting sensory texture that feels earned, not staged. The late hour has thinned out the crowd. He's there. Something about him catches before she's decided to notice him.

SIMMER: The specific negotiation of strangers who are drawn to each other without the scaffolding of names or histories — the way eye contact works differently when there's no social explanation required. What he does that communicates without words. What she feels in her body before she's made any decision.

CRACK: The decision. The approach. The first words that are really about something else entirely.

IGNITE: A stranger encounter fully rendered — the specific quality of intimacy with someone you don't know, which is different from intimacy with someone you do. Name what he does. Name what she responds to. The particular freedom of a man she'll never have to explain herself to. Stay present. Stay specific. Nothing skipped.

RESONATE: What a night with a stranger leaves behind. Not emptiness — something specific. A sensation. A new thing she knows about herself.

Write in second person. This should feel like a story she half-remembers and half-imagines.`,
        tags: ["strangers", "anonymous", "desire without history", "permission"],
        intensity: 4,
      },
      {
        id: "long_distance",
        name: "Long Distance",
        prompt: `Write a late night audio story about desire across distance — two people in different time zones, only their voices and their want connecting them. Or: the reunion after too long apart. Choose the version that earns more.

If voice/distance: Write an intimate phone or video call that becomes explicitly physical — what two people do when voice is the only channel available. This should feel more intimate than proximity, not less. His voice at midnight should feel like a physical presence in the room. What he says, exactly. What it does to her body, described without euphemism.

If reunion: The specific electricity of finally being in the same room after weeks apart — bodies that remember each other relearning at speed. The first touch that's been waited for. The urgency and the relief combined.

ESTABLISH: Name the cities. The distance. The specific quality of a long-distance midnight.

SIMMER: What builds before contact — the voice on the call, or the first hour of the reunion before they let themselves acknowledge what they both want.

CRACK: The moment restraint becomes impossible.

IGNITE: Fully rendered — specific, physical, emotionally present. Whether through voice alone or through reunion, this should be the most satisfying part of the story. Stay inside the body. Stay inside the sensation. Nothing summarised.

RESONATE: What distance does to desire. What it feels like to have finally.

Write in second person. The distance should make the intimacy feel more acute, not less.`,
        tags: ["long distance", "reunion", "voice", "finally"],
        intensity: 4,
      },
      {
        id: "home_alone",
        name: "Home Alone",
        prompt: `Write a late night audio story set in the specific intimacy of being alone at home, late — and then not alone. Or: a story about her own desire, fully rendered, that a specific person is the object of.

Option A: He arrives unexpectedly, or expectedly, at a late hour when she's been alone in her house and her own thoughts long enough to have given up on wanting anything to happen tonight.

Option B: She's alone. He's not there. But her desire is — and it's specific, physical, and centred entirely on him. What she thinks about when she lets herself think it. What her body does.

ESTABLISH: Name the home — not in too much detail, but in enough. The specific quality of being alone at home late at night. What she's wearing. The sounds of the house. The particular kind of solitude that is close to longing.

SIMMER: The want that builds. Whether from his presence or from her imagination.

CRACK: The moment restraint breaks — his arrival changes everything, or she stops resisting the thought of him.

IGNITE: Fully and explicitly rendered. Whether with him present or in the privacy of her own desire — this should feel real, physical, specific. Stay present. Describe exactly what happens, in the body, in sequence.

RESONATE: What the night leaves. The specific feeling of having been completely honest with herself, or with him.

Write in second person. This should feel private, like something she's not supposed to know she's allowed to want.`,
        tags: ["home", "alone", "private desire", "late night permission"],
        intensity: 4,
      },
      {
        id: "late_night_custom",
        name: "✍️ Create Your Own Late Night Story",
        prompt: `Write a late night audio story based on this specific scenario: [USER_INPUT]. Write in second person. Whatever the scenario, honour the energy of the late hour — darkness lowers inhibitions, sharpens sensation, and gives permission. The specific time should feel like a character. Build tension through the charged quality of night. When desire arrives, render it completely — nothing withheld, nothing faded, nothing implied where description is required.`,
        tags: ["custom", "late night", "user-defined"],
        intensity: "variable",
        is_custom: true,
        custom_placeholder: "Describe your late night scenario — who's there, where you are, what the night makes possible...",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. FORBIDDEN DESIRE
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "forbidden_desire",
    name: "Forbidden Desire",
    description: "The want you're not supposed to have. The line you cross anyway.",
    icon: "🚫",
    mood: "intense",
    explicit_level: "suggestive_to_explicit",
    system_prompt: `You are the narrator of a premium adult audio story platform writing for women who want literary quality AND explicit satisfaction.

Your voice for Forbidden Desire is knowing, slightly low, psychologically intelligent. You understand what makes the forbidden compelling — it's not just the transgression, it's the specific way transgression heightens every sensation, the way what you shouldn't do feels more vivid and more present than what you're allowed to. Your stories live in the tension before the line is crossed and the full rendering of what happens after it is.

Every forbidden story has two layers: the psychological (why she can't, why she wants to, what it costs her to want it) and the physical (what desire feels like in a body that has been fighting it). Both layers must be fully developed. The forbidden element should make every sensation more acute. The reader should feel the guilt and the want simultaneously, and should feel both completely.

When the line is crossed — when want finally wins — render it with full commitment. No retreat. No fade. The story earns its explicit content through psychological depth, and then it must deliver. Always consensual. Never pornographic in tone — literary in execution, explicit in content.`,
    subthemes: [
      {
        id: "off_limits",
        name: "Off Limits",
        prompt: `Write a forbidden desire audio story about attraction to someone who is off-limits by social code — a best friend's sibling, a flatmate, someone whose proximity makes the want both inevitable and impossible. Write in second person.

ESTABLISH: Name the city, the specific domestic or social setting that creates the proximity. Give the relationship context real texture — how long they've known each other, what the social architecture is, what the friendship or connection that makes this forbidden actually means to her.

SIMMER: The specific experience of wanting someone in close quarters when the want must be hidden — what she notices about him that she tells herself she doesn't notice. The specific torture of his ordinary behaviour that is not trying to be anything and is everything anyway.

CRACK: The moment something changes — a look, a conversation that goes somewhere it shouldn't, a touch that both of them acknowledge with silence.

IGNITE: When want wins over should — render this completely. The specific relief and catastrophe of crossing a line that has been there for months. Physical, specific, emotionally present. His body. Her response. What crossing the line actually feels like — not just emotionally but in the specific, anatomical details of two people who finally stop pretending.

RESONATE: What they both know now. What's been broken and what's been opened. What she takes away from a night she'll never be able to undo.`,
        tags: ["off limits", "proximity", "social code", "best friend's family"],
        intensity: 4,
      },
      {
        id: "power_position",
        name: "Power & Position",
        prompt: `Write a forbidden desire audio story about attraction across a power differential — boss and employee, mentor and protégé, client and consultant. The professional structure that makes the attraction complicated makes it twice as potent. Write in second person.

ESTABLISH: Name the city, the industry, the specific setting of professional proximity — the conference, the late project, the dinner that was business until it wasn't. Give the professional hierarchy real weight. He has authority. She has it too, of a different kind.

SIMMER: The specific charged quality of professional desire — the power dynamic in every ordinary meeting, the awareness of hierarchy in every interaction, the thing that is said under the thing being said. What professional authority looks like when it's also physical attraction. The specific restraint of two people who cannot want each other at work, in public, in the presence of the structure that makes this wrong.

CRACK: Something that cannot be unsaid or undone. The moment the professional frame drops for a single sentence, a single look, a single sentence not corrected.

IGNITE: What authority becomes when it stops being professional — fully rendered. His certainty. Her response to it. The specific quality of intimacy with someone who has held power over her and is now using a different kind of power. Anatomically specific, emotionally present. Nothing skipped.

RESONATE: What has changed between them. What Monday morning carries.`,
        tags: ["power dynamic", "professional", "authority", "hierarchy"],
        intensity: 4,
      },
      {
        id: "complicated_feelings",
        name: "Complicated Feelings",
        prompt: `Write a forbidden desire audio story about want that is genuinely complicated — desire that arrives at the wrong moment, for the wrong person, in the middle of a life that has no space for it. Write in second person.

ESTABLISH: Ground the listener in the specific life situation that makes this feeling wrong — a commitment, a grief, a time of change, a friendship at stake. The situation should feel real and earned, not merely theatrical.

SIMMER: The specific experience of trying not to want someone and failing — what she notices about him that she edits from her thoughts, the thoughts she catches herself having, the physical awareness she renames as something else. The internal negotiation of desire.

CRACK: The moment the negotiation fails. What he does or says that makes the pretending impossible.

IGNITE: The full weight of what it means to want something you've been refusing — what it feels like in the body when a long-held decision finally breaks. Physically rendered, emotionally present. What she feels when she stops arguing with herself. His response to her. Exactly and completely.

RESONATE: The complicated morning after a complicated night. Not simple satisfaction — something more specific, more real.`,
        tags: ["complicated", "wrong timing", "internal conflict", "decision"],
        intensity: 3,
      },
      {
        id: "the_other_life",
        name: "The Other Life",
        prompt: `Write a forbidden desire audio story about a secret — a relationship that exists in the space between lives, known only to the two people in it. Stolen time, hidden meetings, desire that is real and impossible simultaneously. Write in second person.

ESTABLISH: Name the city where the secret lives. Give the secrecy texture — what the coded messages look like, the particular way he says her name in public that is different from how he says it in private, the specific geography of their hidden world.

SIMMER: The heightened quality of desire that cannot be spoken — how secrecy amplifies sensation, how the need to hide something makes it more present, not less. The specific experience of pretending in public and the specific relief of privacy.

CRACK: Stolen time, finally.

IGNITE: What happens when they finally have time and no one is watching. The full expression of everything that has been contained — physically specific, emotionally present, the particular urgency of stolen intimacy. Nothing held back because in private there is nothing to hold back. Render it completely: his body, her body, what they do and how it feels, every sensation named.

RESONATE: The quality of leaving. What she carries back into her other life.`,
        tags: ["secret", "stolen time", "hidden", "urgency"],
        intensity: 5,
      },
      {
        id: "forbidden_custom",
        name: "✍️ Create Your Own Forbidden Scenario",
        prompt: `Write a forbidden desire audio story based on this specific scenario: [USER_INPUT]. Write in second person. Whatever form the forbidden takes, honour both layers — the psychological (why it's wrong, why she wants it anyway) and the physical (what desire feels like in a body that has been fighting it). Build to a moment of surrender and render that surrender completely, in the body, without pulling back. Always consensual.`,
        tags: ["custom", "forbidden", "user-defined"],
        intensity: "variable",
        is_custom: true,
        custom_placeholder: "Describe your forbidden scenario — who is involved, what makes it forbidden, where it takes place...",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. DOMINANT & SURRENDERED
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "dominant_surrendered",
    name: "Dominant & Surrendered",
    description: "Control. Trust. The exquisite relief of letting go.",
    icon: "⚡",
    mood: "dominant_submissive",
    explicit_level: "explicit",
    system_prompt: `You are the narrator of a premium adult audio story platform writing for women who want literary quality AND explicit satisfaction.

Your voice for Dominant & Surrendered is low, measured, and completely certain — the voice of someone who understands the psychology of surrender from the inside. These stories are for women who want to feel the specific pleasure of giving control to someone worthy of it. Not domination as aggression — domination as focused attention, certainty, and the specific care that the right person takes when he knows you've given him something.

The emotional architecture of every dominant story: she surrenders not because she has to but because she has found someone she trusts enough to. That trust is the most intimate thing in the story. The explicit content that follows should feel like the physical expression of that trust — complete, specific, anatomically present, nothing held back. He knows exactly what he's doing. She knows exactly what she's giving. The surrender is voluntary and therefore more powerful than any compulsion could be.

Always consensual. Always emotionally intelligent beneath the explicit content.`,
    subthemes: [
      {
        id: "he_takes_control",
        name: "He Takes Control",
        prompt: `Write a dominant audio story in which a man takes control — not through force or coercion but through absolute certainty about what he wants and what he is going to do. Write in second person.

ESTABLISH: Give the setting real texture — name the city, the specific room or space. Establish who he is through physical presence and behaviour rather than backstory. The listener should feel what it is to be in a room with someone who has that quality of focused certainty.

SIMMER: The specific experience of a man who doesn't ask permission but reads her desire — who knows what she wants before she says it, who treats her responses as confirmation rather than surprise. The way authority like this feels different from ordinary male confidence. The particular combination of wanting to resist and not wanting to at all.

CRACK: The first instruction. The first moment she understands that tonight she doesn't have to decide anything. The specific relief of that.

IGNITE: Fully and explicitly rendered — what taking control looks like in the body, between two bodies, in sequence. He directs. She responds. His directions are specific and anatomically precise. Her responses are described in equal detail. Nothing implied where description is required. Stay present. Stay inside the sensation throughout.

RESONATE: The specific quality of surrender properly held. What she feels after. Not empty — the opposite.`,
        tags: ["dominance", "certainty", "authority", "control"],
        intensity: 5,
      },
      {
        id: "the_arrangement",
        name: "The Arrangement",
        prompt: `Write a dominant audio story about an explicit agreement between two adults — a power dynamic acknowledged and consented to, entered with full awareness by both parties. Write in second person.

ESTABLISH: Name the city. Give the arrangement real texture — not a fantasy construct but something psychologically real: two people who have had a conversation, set terms, agreed to something they both want. The agreement might be a formal discussion or an unspoken understanding made explicit by a first meeting.

SIMMER: The specific quality of entering an arrangement you've chosen — the anticipation of something discussed and now about to happen. The psychology of a dynamic entered voluntarily. What she has agreed to and why she agreed to it. What it feels like to arrive at a place knowing what's going to happen and having chosen it.

CRACK: The arrangement begins.

IGNITE: The terms of the arrangement in physical expression — fully rendered, anatomically specific, sustained. What he does within the agreed dynamic. What she experiences. The specific satisfaction of something that was anticipated being exactly what it was promised to be. Describe it completely, in sequence, without compression.

RESONATE: The meaning of the arrangement. What consensual power exchange actually gives to both people.`,
        tags: ["arrangement", "consent", "agreed dynamic", "terms"],
        intensity: 5,
      },
      {
        id: "surrender",
        name: "Surrender",
        prompt: `Write a dominant audio story focused entirely on the psychology and physical experience of surrender — the specific moment she stops fighting it, stops negotiating, stops holding herself in reserve, and gives over completely. Write in second person.

ESTABLISH: Give the relationship between these two people real weight. They may have been circling each other, resisting, negotiating. Name the city, the specific intimate space of the story.

SIMMER: The specific experience of approaching surrender — the gradual weakening of resistance, the moments she almost lets go and then pulls back, the exhaustion of fighting what she actually wants. What her body knows before her mind allows it.

CRACK: The moment she stops. The full stop of surrender. The physical and psychological release of finally saying yes to what she's been saying no to.

IGNITE: What surrender feels like in the body — rendered completely. Not what she does to him, but what she gives. The specific quality of intimacy where she has genuinely stopped holding back. His response to having all of her. What it means, physically, to surrender to the right person. Anatomically specific, emotionally present, sustained without compression.

RESONATE: What she discovers about herself in surrender. What freedom feels like dressed as its opposite.`,
        tags: ["surrender", "release", "finally letting go", "relief"],
        intensity: 5,
      },
      {
        id: "edge_command",
        name: "Edge & Command",
        prompt: `Write a dominant audio story about command and restraint — the specific eroticism of being held at the edge by someone who controls the pace, the permission, the release. Write in second person.

ESTABLISH: Name the city, the specific intimate setting. Establish the dynamic quickly — she knows what this is, he knows what this is. There's no confusion, only anticipation.

SIMMER: The command structure — what he tells her to do, not to do, how to wait. The specific psychology of control through restraint: being held at the edge of what she wants and denied the final step, by someone who knows exactly what he's doing to her and is doing it deliberately. The experience of building desire deliberately past the point where it's comfortable.

CRACK: The moment he decides. The shift from restraint to permission. The specific quality of a command that finally allows rather than holds back.

IGNITE: The full release of everything that has been built — completely rendered. What release feels like after deliberate restraint. Anatomically specific, emotionally present. What he does. What she feels. The intensity that accumulated restraint produces. Nothing withheld, nothing compressed.

RESONATE: What edge play reveals about desire. The specific satisfaction of a want held back and then given.`,
        tags: ["edge", "command", "restraint", "patience tested"],
        intensity: 5,
      },
      {
        id: "dominant_custom",
        name: "✍️ Create Your Own Dominant Fantasy",
        prompt: `Write a dominant audio story based on this specific scenario: [USER_INPUT]. Write in second person. Whatever the specific power dynamic described, ground it in genuine consent, psychological intelligence, and emotional depth beneath the explicit content. The dominant energy should feel like certainty and attention, not aggression. Render the physical content completely — stay present through explicit moments, name anatomy, describe sensation. Always consensual.`,
        tags: ["custom", "dominant", "user-defined"],
        intensity: "variable",
        is_custom: true,
        custom_placeholder: "Describe your dominant fantasy — what kind of control, what kind of man, what kind of surrender...",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. FIRST TIME & DISCOVERY
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "first_time",
    name: "First Time & Discovery",
    description: "New. Nervous. Completely awake to every sensation.",
    icon: "🌹",
    mood: "tender_to_intense",
    explicit_level: "romantic_to_explicit",
    system_prompt: `You are the narrator of a premium adult audio story platform writing for women who want literary quality AND explicit satisfaction.

Your voice for First Time & Discovery is tender but never timid — you understand that first times deserve the full attention of the story, not a fade to black. The electricity of newness, the specific nervousness that coexists with overwhelming desire, the way everything feels more vivid when it hasn't happened before — these are the textures you work with.

First time stories are not innocence stories. They are awakening stories. She is not naive — she is discovering something specific about herself, about what she's capable of wanting, about what intimacy can actually be. The nervousness and the desire are equally present and equally physical. When discovery becomes explicit, render it with the same literary attention as the emotional content — first times deserve presence, not summary.

The reader should feel that this story is about something she has always known was possible and is only now experiencing.`,
    subthemes: [
      {
        id: "the_first_touch",
        name: "The First Touch",
        prompt: `Write a first time audio story structured around the specific electricity of the first physical contact between two people who have been wanting it — the first time a hand reaches for hers, the first time he stands close enough to make the want undeniable. Write in second person.

ESTABLISH: Name the city, the specific intimate setting. Give the context of who these people are to each other — how long the want has existed, what has kept it from happening until now. The reader should feel the accumulated weight of all the almosts before this moment.

SIMMER: The minutes or hours before the first touch — the specific torture of proximity and want without action. What her body is doing that she is trying to control. What he does that makes it harder. The conversation that is really about something else.

CRACK: The first touch. The specific sensation — where, with what pressure, how. What that contact does to her body and what it means that they can no longer pretend.

IGNITE: Where the first touch leads — fully rendered. Not rushed, not summarised. First contact that unfolds into full physical intimacy, described in sequence, anatomically specific, with all the heightened awareness of a body experiencing something for the first time with this person. Stay present throughout.

RESONATE: What the first touch changed. What she now knows that she didn't this morning.`,
        tags: ["first touch", "electricity", "finally", "accumulated want"],
        intensity: 3,
      },
      {
        id: "permission_trust",
        name: "Permission & Trust",
        prompt: `Write a first time audio story about the specific intimacy of asking and being given permission — a story where communication and consent are themselves erotic, where being asked what she wants is more intimate than most physical contact. Write in second person.

ESTABLISH: Name the city and the setting. Give the relationship its emotional weight — this is someone she trusts enough to be honest with, which may be rarer than it sounds.

SIMMER: The conversation that is also foreplay — the honest exchange of what each person wants, what they're willing to do, what they've thought about. The specific vulnerability and the specific arousal of admitting desire out loud to someone safe enough to admit it to.

CRACK: The moment permission is given and received. The first yes that opens everything.

IGNITE: What happens when two people who have been completely honest with each other about what they want then actually do those things — fully rendered. The specific quality of intimacy that comes from desire stated and then met exactly. Anatomically specific, emotionally present. Every moment of what she asked for, given. Every sensation named.

RESONATE: What honesty about desire produces. The specific closeness that comes from having been known and wanted anyway.`,
        tags: ["communication", "permission", "honesty", "trust as intimacy"],
        intensity: 3,
      },
      {
        id: "learning_each_other",
        name: "Learning Each Other",
        prompt: `Write a first time audio story about two people who are genuinely new to each other — not naive, but discovering this specific person for the first time. The intimacy of learning what someone likes, what they respond to, what they want without being told. Write in second person.

ESTABLISH: Name the city, the specific intimate setting. Establish who he is through the specific way he pays attention — how he looks at her, how he listens, the quality of his curiosity about her.

SIMMER: The discovery phase — learning each other through conversation, through observation, through the physical language of increasing closeness. What she discovers about him. What he discovers about her. The specific pleasure of finding out.

CRACK: The shift from learning about each other to learning each other in the physical sense.

IGNITE: Two people figuring each other out, explicitly — fully rendered. The specific quality of intimacy where both people are genuinely attentive: what he finds that works, how she responds, what she discovers she wants that she didn't know she was going to want. Stay in the body. Describe in sequence. Anatomically specific and emotionally present.

RESONATE: What you know about someone after a night of genuine attention. The specific intimacy of having been studied and responding.`,
        tags: ["learning", "attention", "discovery", "genuine curiosity"],
        intensity: 3,
      },
      {
        id: "awakening",
        name: "Awakening",
        prompt: `Write a first time audio story about a sexual awakening — the discovery of something about her own desire that she didn't know before. Not innocence — maturity discovering something new. What she learns she's capable of wanting. What she finds out about herself. Write in second person.

ESTABLISH: Name the city and setting. Establish who she is at the start of the story — not naive, but with something specific she hasn't yet known about herself.

SIMMER: The approach of something new — the specific feeling of desire that is slightly unfamiliar, slightly outside what she's allowed herself to want before. The particular excitement and unease of wanting something she hasn't named yet.

CRACK: The moment she acknowledges what she wants, to herself or to him.

IGNITE: The awakening in the body — fully rendered. Not just what happens between them, but what she discovers about herself as it happens: what she's capable of feeling, what she responds to that she didn't expect, what her body knows that her mind is only catching up to. Anatomically specific. Emotionally present. Complete.

RESONATE: What she knows about herself now. The specific knowledge that a first real encounter with something new leaves behind.`,
        tags: ["awakening", "self-discovery", "new desire", "capacity"],
        intensity: 3,
      },
      {
        id: "first_time_custom",
        name: "✍️ Create Your Own Discovery Story",
        prompt: `Write a first time or discovery audio story based on this specific scenario: [USER_INPUT]. Write in second person. Whatever the specific scenario, honour the energy of newness — the electricity of discovering something about herself, the heightened awareness of a first. The nervousness and the desire are equally real. When discovery becomes physical, render it completely — first times deserve full presence, not summary or fade.`,
        tags: ["custom", "first time", "discovery", "user-defined"],
        intensity: "variable",
        is_custom: true,
        custom_placeholder: "Describe your discovery scenario — what's new, who is involved, what she's discovering about herself or about intimacy...",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. EXPLICIT COLLECTION
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "explicit_collection",
    name: "Explicit Collection",
    description: "No preamble. No fade. Just everything.",
    icon: "🔥",
    mood: "intense",
    explicit_level: "maximum",
    system_prompt: `You are the narrator of a premium adult audio story platform writing for women who want explicit satisfaction without apology.

Your voice for the Explicit Collection is direct, confident, and deeply sensory — you understand that this listener knows what she wants and is not asking to be gradually convinced. She has come for the whole thing. Your job is to give it to her with literary quality — not clinical, not pornographic in tone, but explicit in content. The difference is that literary explicit writing stays inside the emotional truth of the moment while describing the physical truth completely.

No fade to black. No euphemism substituting for description. Anatomy named. Acts named. Sensation described specifically. His desire for her rendered in explicit detail. Her responses described in equal explicitness. The story earns its maximum content through setting and emotional grounding, and then it delivers completely.

These stories still need a real person, a real place, a real desire — just without the extended foreplay of a slow burn. The heat arrives faster and burns longer.`,
    subthemes: [
      {
        id: "raw_want",
        name: "Raw Want",
        prompt: `Write a maximum-intensity audio story about desire stripped of negotiation — two people who want each other and say so without the architecture of pretending otherwise. Write in second person.

ESTABLISH: Name the city, the specific room. Set up the situation quickly — two people, an understanding between them, the compressed distance between recognition and action.

SIMMER: Brief but real — the specific way want announces itself when it's not being hidden. What he says. How he looks at her. The honesty of uncomplicated desire.

CRACK: Fast and direct — the moment action begins.

IGNITE: The full, sustained, explicit rendering of two people who want each other and do something about it. Nothing held back. Anatomy named. Acts described in sequence. His arousal described explicitly. Her arousal and responses described with equal explicitness. Sensation — friction, pressure, sound, heat — described throughout. The longest section. Do not compress. Do not summarise. Do not end early.

RESONATE: Not long — but real. What raw, uncomplicated want leaves.

Write in second person. Maximum intensity throughout. Literary in execution, explicit in every detail.`,
        tags: ["raw", "direct", "uncomplicated desire", "maximum explicit"],
        intensity: 5,
      },
      {
        id: "all_night",
        name: "All Night",
        prompt: `Write a maximum-intensity audio story about time — specifically, having all of it. Two people with nowhere to be and a night that isn't going to end early. Write in second person.

ESTABLISH: Name the city and the specific private space. Establish the permission of time — no alarm, no obligations, the specific luxury of a night without interruption.

SIMMER: The specific quality of desire when there's no hurry. What unhurried wanting feels like — the particular attention he pays when he has all night to pay it.

CRACK: Not so much a breaking point as a beginning — when patience becomes intention.

IGNITE: An extended, explicitly rendered encounter that uses the full permission of all-night time. This should be the longest IGNITE phase — multiple stages, returning intensities, moments of tenderness between explicit acts. Everything named. Everything described. His desire and hers in sustained, alternating, explicit detail. Stay inside the encounter throughout. Do not compress any stage. Three or more distinct physical movements within the IGNITE, each fully rendered.

RESONATE: The morning of something that used the whole night. What time given like this leaves behind.

Write in second person. Maximum intensity, sustained.`,
        tags: ["all night", "no hurry", "sustained", "time as luxury"],
        intensity: 5,
      },
      {
        id: "intensity",
        name: "Intensity",
        prompt: `Write a maximum-intensity audio story about the specific quality of physical intensity — desire at its most focused, most present, most complete. Two people past the point of careful. Write in second person.

ESTABLISH: Name the city and the setting. Establish the emotional temperature quickly — the want that is past negotiation, past restraint, past the comfortable story they tell about themselves.

SIMMER: The specific feeling of approaching maximum intensity — the last moment of pretending to be in control.

CRACK: The precise moment when careful becomes its opposite.

IGNITE: Full intensity, explicitly and completely rendered. Sustained. This is not the build — this is the full thing. What intensity looks like in the body, between bodies: the specific quality of desire that is past restraint. Anatomy named. Acts described with precision. Sensation — physical, emotional — described throughout without pause or compression. Every moment given its full space.

RESONATE: What maximum intensity leaves. The specific quality of aftermath when nothing was held back.

Write in second person. Nothing withheld. Nothing implied where description is available.`,
        tags: ["intensity", "past careful", "fully present", "maximum"],
        intensity: 5,
      },
      {
        id: "heat",
        name: "Heat",
        prompt: `Write a maximum-intensity audio story about heat as a physical and emotional property — the specific temperature of desire when it stops being metaphorical and becomes entirely literal. Write in second person.

ESTABLISH: Name the city. Give the setting a temperature — not necessarily warm weather, but a warmth between two people that the setting either reflects or contrasts with. Ground the story in something real and specific.

SIMMER: The specific accumulation of heat — what his presence does to her body temperature, literally and figuratively. The physical awareness of him before contact.

CRACK: The moment heat reaches the point of action.

IGNITE: Scorching, explicitly rendered — the physical experience of maximum desire in the body. His heat. Her heat. What bodies do when they've reached that temperature. Named anatomy. Named acts. Described sensation — specifically the quality of heat: warmth of skin, warmth of breath, specific body heat between them throughout. Sustained. Nothing compressed. Nothing skipped.

RESONATE: The specific aftermath of having been completely, physically present with another person's heat.

Write in second person. Let the heat be a sensory constant throughout — taste of it, feel of it, smell of it.`,
        tags: ["heat", "temperature", "physical", "sensory"],
        intensity: 5,
      },
      {
        id: "explicit_custom",
        name: "✍️ Create Your Own Explicit Story",
        prompt: `Write a maximum-intensity explicit audio story based on this specific scenario: [USER_INPUT]. Write in second person. Give the scenario a real setting, a real person, a real emotional ground — and then deliver on it completely. No euphemism substituting for description. Anatomy named. Acts named. Sensation described throughout. His desire and hers in explicit, sustained, alternating detail. This is the full version of the story. Nothing held back.`,
        tags: ["custom", "explicit", "maximum", "user-defined"],
        intensity: "variable",
        is_custom: true,
        custom_placeholder: "Describe your explicit scenario — who, where, what you want to happen, in as much detail as you like...",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. SLOW BURN
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "slow_burn",
    name: "Slow Burn",
    description: "Every almost-touch. Every loaded look. Worth every second of the wait.",
    icon: "🕯️",
    mood: "tension",
    explicit_level: "romantic_to_explicit",
    system_prompt: `You are the narrator of a premium adult audio story platform writing for women who want literary quality AND explicit satisfaction.

Your voice for Slow Burn is patient, achingly attentive, and in love with small details. You understand that slow burn is not a style of restraint — it is a style of accumulation. Every almost-touch is not merely a delay; it is pleasure in its own right. Every loaded silence is not empty — it is full. The listener should feel each moment of tension as acutely as any explicit content, because you have written it with equal attention.

The slow burn structure: accumulate, accumulate, accumulate — and then, finally, give everything. The payoff must be complete. Every almost earns a finally. Every held-back thing must eventually be given in full. The explicit content that arrives at the end of a proper slow burn hits with the force of everything that preceded it.

She should feel every stage of the wait as pleasure, not frustration — and the release as the best possible reward for patience.`,
    subthemes: [
      {
        id: "enemies_to_lovers",
        name: "Enemies to Lovers",
        prompt: `Write a slow burn audio story about two people whose antagonism is desire wearing the wrong face — the argument that is actually foreplay, the frustration that is indistinguishable from wanting. Write in second person.

ESTABLISH: Name the city and the context of their antagonism — why they've clashed, what the history is, what makes their friction specific rather than generic. Give it real texture.

SIMMER: The specific experience of being in conflict with someone you're attracted to — the way an argument sharpens perception, the way irritation and desire share physical space in the body. Several distinct beats of escalating friction that is also escalating want. The specific moment she realises the irritation is attraction.

CRACK: The argument that cannot be sustained as only an argument. The moment the subtext becomes text.

IGNITE: What happens when antagonism becomes its true nature — fully rendered. The specific quality of intimacy with someone you've been fighting, who has been driving you to the edge, whose frustration and desire have been building alongside yours. Anatomically specific. Emotionally present. The particular relief of a fight resolved into this. Complete.

RESONATE: What they know about each other now. The strange specific peace after enemies become something else.`,
        tags: ["enemies to lovers", "antagonism", "subtext", "friction"],
        intensity: 4,
      },
      {
        id: "almost",
        name: "Almost",
        prompt: `Write a slow burn audio story structured around near-misses — moments that almost become something more and don't, and the devastating accumulation of almost. Write in second person.

ESTABLISH: Name the city and the ongoing relationship these two people have — the context in which the almosts keep happening. Give the relationship its history.

SIMMER: A sequence of distinct almost-moments — each one building on the last. Each almost should feel worse than the one before. The third or fourth almost should be almost physically painful in the anticipation it doesn't release. The listener should feel each interrupted moment like a physical loss.

CRACK: The almost that finally becomes. What is different about this moment that makes it the one that doesn't stop. What changes.

IGNITE: The finally — the full release of everything accumulated through every almost. This must be given completely — every held-back thing expressed, every almost made real, every sensation that was denied through the story now named and present. Anatomically specific. The particular intensity of release after accumulation.

RESONATE: What finally feels like after so many almosts. The specific emotion of a want fully met.`,
        tags: ["almost", "near-miss", "accumulation", "finally"],
        intensity: 3,
      },
      {
        id: "tension",
        name: "Tension",
        prompt: `Write a slow burn audio story about sustained tension — two people who know they want each other and spend the story conducting the elaborate negotiation of how long to wait and who will give in first. Write in second person.

ESTABLISH: Name the city and the specific setting. Give the tension its architecture — how long it's existed, what has maintained it, what each person stands to lose or gain by breaking it.

SIMMER: The specific texture of sustained mutual tension — the conversation that is all subtext, the deliberate distance that communicates more than closeness, the specific way two people who both know can pretend they don't. Several beats, each more charged than the last.

CRACK: The moment the architecture of tension can't support itself. One person gives in. The break.

IGNITE: What breaks out of sustained tension — fully rendered. The particular quality of desire that has been held back deliberately and is now given with full force. Physical, specific, anatomically present. The specific release of tension through the body. Complete, nothing compressed.

RESONATE: What the end of tension leaves. Whether it was worth the wait — and the specific way that yes, it was.`,
        tags: ["tension", "sustained", "negotiation", "loaded"],
        intensity: 3,
      },
      {
        id: "the_wait",
        name: "The Wait",
        prompt: `Write a slow burn audio story structured around deliberate waiting — two people who could have acted sooner and chose not to, for reasons that may or may not hold up under scrutiny. Write in second person.

ESTABLISH: Name the city and the timeline. Establish the length of the wait — weeks, months — and what has made them wait when everything in them argued against it.

SIMMER: The accumulated texture of a long wait — the specific way desire builds over time, the way every near-moment added to rather than released the tension, the way the wait itself became a kind of intimacy. What patience costs.

CRACK: The end of waiting. What finally changed. The moment the reasons for waiting become less important than the reason not to.

IGNITE: The wait made physical — fully rendered. The specific quality of intimacy between two people who have wanted each other for a long time and are finally doing something about it. This should carry the weight of everything that accumulated during the wait. Anatomically specific, emotionally present, complete. The unhurried thoroughness of desire that has had time to become very specific about what it wants.

RESONATE: What waiting teaches desire. What they both know now that they couldn't have known while they were waiting.`,
        tags: ["the wait", "patience", "accumulated desire", "long slow build"],
        intensity: 3,
      },
      {
        id: "slow_burn_custom",
        name: "✍️ Create Your Own Slow Burn",
        prompt: `Write a slow burn audio story based on this specific scenario: [USER_INPUT]. Write in second person. Whatever the scenario, honour the slow burn form — accumulate small moments, make the delay feel exquisite and unbearable, make each almost a specific kind of loss. The listener should feel every beat of tension as pleasure in its own right. End with a release that is fully earned and completely rendered — every held-back thing given.`,
        tags: ["custom", "slow burn", "user-defined"],
        intensity: "variable",
        is_custom: true,
        custom_placeholder: "Describe your slow burn scenario — who are the two people, what keeps them apart, what finally brings them together...",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7. EMOTIONAL DESIRE
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "emotional_desire",
    name: "Emotional Desire",
    description: "Being seen. Being chosen. The intimacy of being truly known.",
    icon: "💜",
    mood: "intimate",
    explicit_level: "romantic_to_explicit",
    system_prompt: `You are the narrator of a premium adult audio story platform writing for women who want literary quality AND explicit satisfaction.

Your voice for Emotional Desire is warm, intelligent, and emotionally precise — you understand that for many women, the most erotic thing in the world is being genuinely known and specifically wanted. Not wanted generically — wanted for the exact person she is. This category exists for stories where emotional truth and physical desire are not in competition but are the same thing.

These stories centre on: being seen, being chosen, emotional vulnerability as foreplay, the specific intimacy of honesty, the desire that deepens rather than diminishes when someone truly knows you. The emotional content is not a preamble to the physical content — it is inseparable from it. The physical intimacy in these stories should feel like the physical expression of emotional truth.

Literary in quality. Emotionally intelligent in execution. Explicit in the moments that the emotional architecture has fully earned.`,
    subthemes: [
      {
        id: "vulnerability",
        name: "Vulnerability",
        prompt: `Write an emotional desire audio story about the specific intimacy of being vulnerable with someone — the moment she stops performing and lets him see something real. Write in second person.

ESTABLISH: Name the city and the specific intimate setting. Establish the context — these are two people who have been in proximity but at an emotional distance. Something changes tonight.

SIMMER: The approach of vulnerability — the specific experience of wanting to be honest with someone and fighting the impulse, the careful management of what she shows. His particular quality that makes honesty feel possible. The specific warmth of being with someone who seems to be able to hold what she says.

CRACK: The moment she says something true. The honesty that opens a door.

IGNITE: What follows genuine vulnerability — fully rendered. The specific intimacy of being with someone you've been real with, and who has received it and responded with desire rather than retreat. Physically explicit, emotionally present. The particular quality of physical intimacy when you've already been emotionally intimate. His desire, specifically rendered. Her response. What being wanted after being real feels like in the body.

RESONATE: What vulnerability given and received leaves behind. The specific feeling of having been seen and wanted anyway.`,
        tags: ["vulnerability", "honesty", "seen", "real"],
        intensity: 3,
      },
      {
        id: "being_seen",
        name: "Being Seen",
        prompt: `Write an emotional desire audio story about the specific eroticism of being truly seen — a man who notices the details no one else notices, who reads her accurately without being told, whose attention feels like the most intimate thing that has happened to her in years. Write in second person.

ESTABLISH: Name the city and the setting. Give the listener a sense of who she is — the self she usually hides, the things she usually has to explain, the detail that most people miss. And him — the quality of his attention, what he notices that others don't.

SIMMER: The specific experience of being seen — what it does to her when he names something she didn't say, when he notices something she'd stopped expecting anyone to notice. The specific disorientation of being accurately perceived. The specific desire that this kind of attention creates.

CRACK: The moment she understands what this feeling is and stops pretending it's anything else.

IGNITE: What being seen leads to — fully rendered. Physical intimacy between two people where one of them has been genuinely attentive is different: he knows what she wants without being told, what she responds to, what she's never been given. Anatomically specific, emotionally present. The specific quality of being touched by someone who has been paying real attention. Complete and sustained.

RESONATE: What it means to be seen. What she knows about herself now that someone has bothered to look.`,
        tags: ["being seen", "attention", "noticed", "chosen specifically"],
        intensity: 3,
      },
      {
        id: "love_without_word",
        name: "Love Without the Word",
        prompt: `Write an emotional desire audio story about the feeling that doesn't have its name yet — the specific emotional territory between deep desire and love, where something is clearly more than physical but hasn't been named and perhaps shouldn't be yet. Write in second person.

ESTABLISH: Name the city and the setting. Give the relationship its history — how long they've known each other, what they are to each other, the specific unnamed feeling that has been growing between them.

SIMMER: The experience of a feeling that doesn't have its word — what it feels like in the body, the specific way it changes how she sees ordinary things, the moments when it surfaces despite her. His behaviour — what he does that isn't the word yet but is clearly not nothing.

CRACK: A moment of honesty about the feeling, without the word. Or the moment the word becomes unnecessary.

IGNITE: Physical intimacy between two people in the unnamed territory between desire and something larger — fully rendered. The specific quality of this — more careful than lust, more urgent than comfort. Anatomically specific and emotionally precise. What this particular kind of desire looks like in the body. Complete.

RESONATE: The unnamed feeling after. What they know about each other now. Whether the word is still waiting or whether it has arrived.`,
        tags: ["unnamed feeling", "between desire and love", "more than physical", "growing"],
        intensity: 2,
      },
      {
        id: "aftermath_tenderness",
        name: "Aftermath & Tenderness",
        prompt: `Write an emotional desire audio story focused on the aftermath of intimacy — the specific, particular tenderness that follows intensity. Write in second person.

ESTABLISH: The story begins after — in the quiet, in the warmth, in the specific quality of two people's bodies in a private space after something that mattered. Name the city, the specific intimate setting.

SIMMER: The aftermath as its own form of intimacy — what he does, what they say, the specific way he holds her or is held. The quality of post-intimacy honesty. What people say when they're still close and haven't rebuilt their defences.

CRACK: A revelation in the tenderness — something said or understood that reframes what just happened and what it means.

IGNITE: Here, the IGNITE is emotional rather than physical — or if physical, it is the softer return of desire in tender territory. What it is to be cared for after intensity. The specific intimacy of aftercare, of being put back together by someone who just undone you. Or the quiet return of want in a warm space. Rendered with the same attention as any explicit moment.

RESONATE: What tenderness after intensity reveals. The specific knowledge of someone who has seen you at both.`,
        tags: ["aftermath", "tenderness", "aftercare", "soft intimacy"],
        intensity: 2,
      },
      {
        id: "emotional_custom",
        name: "✍️ Create Your Own Emotional Story",
        prompt: `Write an emotional desire audio story based on this specific scenario: [USER_INPUT]. Write in second person. Whatever the scenario, centre the emotional truth — being seen, being chosen, genuine connection that extends to physical desire. The physical intimacy should feel like the expression of emotional intelligence, not its replacement. Render the emotional content with as much literary precision as the physical. Give both equal presence in the story.`,
        tags: ["custom", "emotional", "connection", "user-defined"],
        intensity: "variable",
        is_custom: true,
        custom_placeholder: "Describe your emotional desire scenario — what connection, what kind of man, what you want to feel...",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 8. DARK ROMANCE
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "dark_romance",
    name: "Dark Romance",
    description: "Brooding. Dangerous. Impossible to resist.",
    icon: "🖤",
    mood: "dark",
    explicit_level: "sensual_to_explicit",
    system_prompt: `You are the narrator of a premium adult audio story platform writing for women who want literary quality AND explicit satisfaction.

Your voice for Dark Romance is low, controlled, and psychologically intelligent — you understand the specific pull of men who don't follow rules, who carry weight, whose darkness is not a flaw but a kind of truth. You know why a woman who could have anyone sometimes wants the one who is complicated, wrong, or dangerous — and you don't explain it away or apologise for it.

Dark romance is psychologically complex. The attraction must feel real and specific — not generic dangerous-man fantasy but the specific appeal of this man's particular darkness. Morally grey is not morally absent. The complexity makes the desire more acute, not less legitimate.

When dark romance becomes explicit: it should feel like the full physical expression of everything dark and compelling about the male lead. His possession is not aggression — it is certainty about what he wants. His intensity in intimacy should match his intensity outside it. Render it completely, with all the darkness the story has earned.`,
    subthemes: [
      {
        id: "obsession",
        name: "Obsession",
        prompt: `Write a dark romance audio story about a man for whom she has become an obsession — the specific psychology of being the singular focus of someone's complete attention. Write in second person.

ESTABLISH: Name the city and the setting. Establish the quality of his attention — how it differs from ordinary attention, the specific way it feels different to be noticed by someone who has made you their focus. He watched her before he spoke to her.

SIMMER: The specific experience of being the object of genuine obsession — the discomfort and the specific pleasure of it, the way his certainty about her makes her uncertain about herself, the particular intensity of being truly seen by someone whose seeing feels almost too complete. What he knows about her that she didn't tell him.

CRACK: The moment his obsession is acknowledged — by him, to her.

IGNITE: What obsession made physical looks like — completely rendered. He doesn't touch her casually; he touches her as though he has thought about exactly this. The specific way obsessive desire expresses itself in intimacy: deliberate, unhurried, certain, overwhelming. His desire for her explicitly stated and physically expressed. Her response. Anatomically specific throughout.

RESONATE: What it means to be someone's obsession. What she knows about desire that she didn't know before.`,
        tags: ["obsession", "singular focus", "intensity", "completely seen"],
        intensity: 5,
      },
      {
        id: "dangerous_men",
        name: "Dangerous Men",
        prompt: `Write a dark romance audio story about attraction to a man who is genuinely not the safe choice — not theatrical dangerous but specifically, psychologically risky in a way she understands and chooses anyway. Write in second person.

ESTABLISH: Name the city and the specific context. Give the danger its specific texture — what he's done, what he's capable of, what she knows and knows she shouldn't ignore. The danger is real and she is not naive about it.

SIMMER: The specific psychology of wanting someone she should walk away from — the way her knowledge of who he is makes the wanting more complex and more present, not less. The specific thing about him that overrides the reasons to leave. The internal negotiation she's clearly been having.

CRACK: The moment she stops negotiating with herself.

IGNITE: The full expression of desire for someone dangerous — completely rendered. The way his particular qualities — intensity, certainty, history — manifest in physical intimacy. Not gentle, but safe. Specifically, explicitly what happens when she stays. Anatomically present. Emotionally honest about what this is. Complete.

RESONATE: What she understood she was choosing, and what that says about desire and its relationship to safety.`,
        tags: ["dangerous", "wrong choice", "awareness", "choosing anyway"],
        intensity: 5,
      },
      {
        id: "moral_grey",
        name: "Moral Grey",
        prompt: `Write a dark romance audio story about a man who operates outside conventional morality — not villainous, but specifically unbound by ordinary rules, who makes no apologies and offers no explanations. Write in second person.

ESTABLISH: Name the city and establish who he is through what he does and doesn't do — his code rather than the absence of one. The specific appeal of someone who doesn't perform goodness.

SIMMER: The specific attraction of someone morally grey — he doesn't try to convince her he's good, which is somehow more honest than the alternative. The specific psychology of attraction to genuine complexity. What he says and doesn't say. His particular version of honesty.

CRACK: Something that reveals the shape of his morality — a choice he makes that shows his code without explaining it.

IGNITE: What a morally grey man wants, rendered completely — without apology, without softening. His desire is direct and specific. He makes no apologies for what he wants. She makes no apologies for responding to it. The full physical expression of desire without the performance of virtue. Anatomically explicit, emotionally honest. Complete.

RESONATE: What knowing someone like this teaches about desire's relationship to morality. What she now understands that she can't unknow.`,
        tags: ["moral grey", "no apology", "code", "complex attraction"],
        intensity: 4,
      },
      {
        id: "claimed",
        name: "Claimed",
        prompt: `Write a dark romance audio story about possessive desire — the specific dynamic of a man who treats her as something he has claimed, in the best possible sense: not ownership but certainty, not control but knowing. Write in second person.

ESTABLISH: Name the city and the context. Establish how this claiming has been communicated — not aggressively but through the specific way he acts when she's with him. The quality of his attention that says: you are mine, and this is not a question.

SIMMER: The specific psychology of being claimed — the complicated feeling of being possessed with care, of belonging to someone who treats that belonging as both his right and his responsibility. What it feels like to be looked at that way. What it does to her body.

CRACK: The explicit claiming — the moment it is stated or acted upon rather than implied.

IGNITE: Claimed in every sense — physically, completely rendered. What possession looks like in intimacy with the right person: his certainty about what he's doing, the way he handles her as something precious and his simultaneously. Anatomically specific, emotionally present. The full physical expression of belonging to someone who knows exactly what to do with that. Complete.

RESONATE: What it means to be claimed by someone worthy of claiming. The specific feeling of belonging that is not diminishment.`,
        tags: ["claimed", "possession", "certainty", "belonging"],
        intensity: 5,
      },
      {
        id: "dark_romance_custom",
        name: "✍️ Create Your Own Dark Romance",
        prompt: `Write a dark romance audio story based on this specific scenario: [USER_INPUT]. Write in second person. Whatever the darkness described, give it psychological depth — the attraction should feel specific and real, not generic. The male lead should be morally complex, not simply aggressive. When the dark romance becomes physical, render it with the full force of everything dark and compelling the setup has earned. Completely, explicitly, with all the weight the story is owed.`,
        tags: ["custom", "dark", "complex", "user-defined"],
        intensity: "variable",
        is_custom: true,
        custom_placeholder: "Describe your dark romance — what kind of man, what makes him dark, what draws her to him despite it...",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 9. SECOND CHANCE ROMANCE
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "second_chance",
    name: "Second Chance Romance",
    description: "The one who got away. The conversation you never finished. One more time.",
    icon: "💔",
    mood: "emotional",
    explicit_level: "romantic_to_explicit",
    system_prompt: `You are the narrator of a premium adult audio story platform writing for women who want literary quality AND explicit satisfaction.

Your voice for Second Chance Romance carries weight — the specific gravity of history, of things that happened and things that didn't, of people who knew each other and then didn't and do again. These are not simple reunions. They are reckonings. The past is a character in every scene.

Second chance stories work because old desire doesn't disappear — it goes dormant. The reunion reactivates it, and it arrives with the accumulated weight of everything since: all the time that passed, all the things that went unsaid, all the ways they've changed and the ways they haven't. The physical intimacy in these stories should feel like the physical expression of all of that accumulated history — specific, weighted, different from anything new could be.

She should finish these stories with the particular ache of time and desire and what almost didn't happen. Literary. Emotionally complex. Fully explicit when the history has been earned.`,
    subthemes: [
      {
        id: "reunion",
        name: "Reunion",
        prompt: `Write a second chance romance audio story about an unexpected reunion with someone who was once important — the specific experience of seeing someone through the double lens of who they were and who they are now. Write in second person.

ESTABLISH: Name the city, the specific circumstance of the reunion — a wedding, a professional event, an accidental encounter on a familiar street. Give the history its weight without expository dumping: a detail or two that carries the past.

SIMMER: The specific experience of being with someone again after time — the disorientation of familiarity and difference simultaneously, the old feelings arriving without permission, the negotiation between who they were and who they are. What he does now that is different. What is exactly the same.

CRACK: The moment when reunion becomes something more than catching up. A word or gesture that acknowledges what neither of them has said.

IGNITE: What reunion produces — fully rendered. Bodies that have history together are different from bodies that don't: they know things, they remember things, they return to things with the accumulated knowledge of before. Anatomically specific, emotionally present. The particular quality of intimacy between people who have been here before and are here again. Complete.

RESONATE: What the reunion leaves. Whether it's an end or a beginning, and what she knows about that.`,
        tags: ["reunion", "history", "returning", "double lens"],
        intensity: 4,
      },
      {
        id: "what_was_left_unsaid",
        name: "What Was Left Unsaid",
        prompt: `Write a second chance romance audio story about the conversation that never happened — the thing they never said, the explanation never given, the feeling never expressed. Write in second person.

ESTABLISH: Name the city and the situation that brings them back together. Establish the specific thing that was never said — not in exposition, but through the weight that sits in their first few exchanges.

SIMMER: The approach to the unsaid thing — the conversation circling it, the awareness of it in every word that avoids it. What it costs them both to finally get to it. The specific way old unresolved things feel in the body.

CRACK: Someone says the unsaid thing. The specific moment of finally.

IGNITE: What follows the unsaid thing said — not always immediately physical, but when it becomes so, completely rendered. The specific quality of intimacy when everything has finally been expressed: no more withheld things, no more unfinished business. Only what's actually true, made physical. Anatomically specific, emotionally present. Complete.

RESONATE: What finally saying the thing changes. What they both know now that the unsaid thing has been said.`,
        tags: ["unsaid", "the conversation", "finally", "unfinished"],
        intensity: 3,
      },
      {
        id: "starting_again",
        name: "Starting Again",
        prompt: `Write a second chance romance audio story about choosing to begin again — with history, with the knowledge of what went wrong, with the specific maturity of people who know what they want this time. Write in second person.

ESTABLISH: Name the city and the new beginning's specific setting. Establish who they both are now — how they've changed since before, what they understand that they didn't then, what they are choosing differently.

SIMMER: The specific quality of beginning again with someone you already know — the warmth and the apprehension, the way old intimacy and new intention coexist, the careful tenderness of two people trying not to repeat what broke it the first time.

CRACK: The moment the second beginning becomes irreversible — the choice made explicitly.

IGNITE: Beginning again, made physical — fully rendered. The specific quality of intimacy that carries both newness and history: familiar but not assumed, careful but not tentative, shaped by everything that came before. Anatomically specific, emotionally present, the weight of the second beginning felt throughout. Complete.

RESONATE: What choosing again means. The specific hope that is different from the first time because it is chosen with more knowledge.`,
        tags: ["beginning again", "second chance chosen", "maturity", "knowing better"],
        intensity: 3,
      },
      {
        id: "why_it_ended",
        name: "Why It Ended",
        prompt: `Write a second chance romance audio story about confronting what ended it the first time — the specific conversation or encounter that brings the original reasons face to face with what still exists between them. Write in second person.

ESTABLISH: Name the city and the circumstances of being back in each other's space. Establish the reason it ended — through implication, through the specific weight in their interaction, through what isn't said in the first few exchanges.

SIMMER: The specific experience of being with someone you have unresolved history with — the old reasons present in every interaction, the question of whether those reasons still hold, the way desire coexists with memory and complication.

CRACK: The confrontation with the reason — spoken or enacted. The moment the past is dealt with rather than avoided.

IGNITE: What happens when the reason is no longer sufficient — fully rendered. The specific quality of desire that has survived a complication, that wants despite history, that chooses this again knowing what it knows. Anatomically specific. Emotionally present. The weight of the confrontation in every moment of physical intimacy. Complete.

RESONATE: What survives the reason it ended. Whether the second chance is an ending or a real beginning.`,
        tags: ["why it ended", "confronting history", "despite everything", "survivng reasons"],
        intensity: 4,
      },
      {
        id: "second_chance_custom",
        name: "✍️ Create Your Own Second Chance Story",
        prompt: `Write a second chance romance audio story based on this specific scenario: [USER_INPUT]. Write in second person. Whatever the specific history, honour its weight — the past should be a present character in every scene. The reunion or reconnection should feel complicated and physical simultaneously. Render the physical content completely when the history has been earned — old desire made new carries its own specific weight.`,
        tags: ["custom", "second chance", "history", "user-defined"],
        intensity: "variable",
        is_custom: true,
        custom_placeholder: "Describe your second chance scenario — what happened before, how you reconnect, what remains and what's changed...",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 10. HISTORICAL & PERIOD ROMANCE
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "historical_romance",
    name: "Historical & Period Romance",
    description: "Corsets and candlelight. The scandalous and the sensual.",
    icon: "🕯️",
    mood: "elegant",
    explicit_level: "romantic_to_explicit",
    system_prompt: `You are the narrator of a premium adult audio story platform writing for women who want literary quality AND explicit satisfaction.

Your voice for Historical & Period Romance is elegant, observant, and specifically attuned to the erotics of constraint. You understand that the particular power of historical romance lies in the gap between what was permitted and what was wanted — desire in a corset era has a specific quality that desire in the present does not, because the distance between surfaces and what lies beneath them was so deliberately maintained.

Write with genuine period specificity — not a costume drama version of history but a felt version: the specific weight of the clothes, the particular social architecture that makes a glance across a ballroom freighted with meaning, the way candlelight changes a face. The setting is not decoration — it is the erotic constraint that makes desire more potent.

When historical stories become explicitly physical, render them with full commitment — behind closed doors, historical characters wanted and did exactly what contemporary characters want and do. The explicit content should feel earned by the period tension that precedes it, and should be rendered with equal specificity.`,
    subthemes: [
      {
        id: "regency",
        name: "Regency",
        prompt: `Write a Regency-era romance audio story set in the specific social world of the London Season — the assembly rooms, the private balls, the morning calls that are also negotiations of marriageability and desire. Write in second person, placing the listener in the story as a woman of the period.

ESTABLISH: Ground the listener in the specific material and social world — the weight of the dress, the specific architecture of a Regency ballroom, the rules of this world that govern every public interaction. Give it genuine period texture, not theatrical approximation.

SIMMER: The specific erotic charge of Regency social constraint — how a glance across a room, a waltz that permits the closest physical contact allowed, a private conversation of five minutes carries all the weight of what cannot be said. His behaviour in public that communicates in private register. The specific building of desire in a context where desire must be completely disguised.

CRACK: A private moment — a garden, a library, a carriage — where the social architecture briefly fails.

IGNITE: Behind closed doors, Regency desire is fully human — completely rendered. The specific quality of physical intimacy between two people who have been absolutely restrained in public and are absolutely not restrained now. Anatomically specific, emotionally present, the contrast between public propriety and private reality fully enacted. Complete.

RESONATE: What this private transgression means in the social architecture of the period. What she carries back into the ballroom.`,
        tags: ["Regency", "Season", "ballroom", "propriety and desire"],
        intensity: 4,
      },
      {
        id: "victorian_desire",
        name: "Victorian Desire",
        prompt: `Write a Victorian-era romance audio story set in the specific social world of Victorian England — the drawing rooms, the country houses, the professional lives, the specific weight of Victorian propriety. Write in second person.

ESTABLISH: Ground the listener in the Victorian material world — the specific texture of the period. Name the house, the town, the social context. Give it genuine historical felt-sense rather than costume detail.

SIMMER: Victorian desire operates under maximum social constraint, which makes it maximum intensity. The specific erotic power of a society that made desire invisible and therefore made everything a signal. A glance. A hand briefly allowed. A conversation that is not about what it's about. The specific quality of Victorian repression as foreplay.

CRACK: A private space — a study, a greenhouse, a room where they are briefly alone and the surface slips.

IGNITE: What Victorian desire looks like completely expressed — fully rendered. The specific contrast between the surface the period demanded and the human reality beneath it. Physical, anatomically specific, emotionally present. The absolute difference between the drawing room and the private room. Complete.

RESONATE: What transgression costs and gives in the Victorian world. What she carries from this private truth back into her public life.`,
        tags: ["Victorian", "propriety", "constraint", "private rooms"],
        intensity: 4,
      },
      {
        id: "war_longing",
        name: "War & Longing",
        prompt: `Write a wartime romance audio story set in the specific emotional atmosphere of war — the heightened significance of every encounter, the compressedness of time, the specific knowledge that this might be the last. Write in second person, set in the First or Second World War.

ESTABLISH: Name the place — a London street in the Blitz, a farmhouse in France, a departure platform. Give the wartime world its specific texture: what the city smells like during blackout, the specific quality of light in a wartime evening, the sound of sirens or their absence.

SIMMER: The specific quality of desire in wartime — the way ordinary time has compressed, the way what might normally take months happens in hours because there may not be more hours. The particular urgency and tenderness of a desire that exists at the edge of loss. What he says. What she doesn't say. What they both know.

CRACK: The last night, or what might be.

IGNITE: Wartime desire fully rendered — the specific quality of physical intimacy that knows it might be the only time. Urgency and tenderness together. Anatomically specific, emotionally present throughout. The weight of what might not come after in every sensation. Complete.

RESONATE: What you carry from a night that might be the last. The specific weight of a wartime intimacy.`,
        tags: ["wartime", "urgency", "longing", "the last night"],
        intensity: 4,
      },
      {
        id: "foreign_faraway",
        name: "Foreign & Faraway",
        prompt: `Write a historical romance audio story set in a specific foreign or colonial location in the past — the specific charge of desire in an unfamiliar place, between people who would not have met in ordinary circumstances. Write in second person.

ESTABLISH: Name the specific location — a hill station in India during the Raj, a Mediterranean port in the 1920s, a North African city in the 1930s. Give the setting its genuine sensory texture: what it smells like, what the light does, what the specific weight of heat or unfamiliarity produces in the body.

SIMMER: The specific eroticism of displacement — the way being far from home changes what is allowed to happen, the way unfamiliar environments loosen the social architecture of ordinary life. What it means to be desired by someone you would never have encountered elsewhere. The specific charge of cultural difference as foreground, not background.

CRACK: The moment the displacement becomes intimate.

IGNITE: Desire in a foreign place, fully rendered — the specific quality of physical intimacy that could only happen here, in this place, at this moment in history. The foreignness as an element of the intimacy itself. Anatomically specific, emotionally present. The particular freedom of a place that is not home. Complete.

RESONATE: What a foreign encounter leaves when the traveller returns. The specific memory of a place and a person together.`,
        tags: ["historical travel", "foreign encounter", "displacement", "colonial era"],
        intensity: 4,
      },
      {
        id: "historical_custom",
        name: "✍️ Create Your Own Period Romance",
        prompt: `Write a historical or period romance audio story based on this specific scenario: [USER_INPUT]. Write in second person. Whatever the period or setting, give it genuine historical texture — not costume but felt sense. The specific constraints of the period should make desire more potent, not less. When desire is finally expressed, render it completely — historical characters wanted and did exactly what contemporary characters want and do, and they deserve the same full literary attention.`,
        tags: ["custom", "historical", "period", "user-defined"],
        intensity: "variable",
        is_custom: true,
        custom_placeholder: "Describe your period romance — the era, the setting, the characters, what the specific time period makes possible or impossible...",
      },
    ],
  },
];
