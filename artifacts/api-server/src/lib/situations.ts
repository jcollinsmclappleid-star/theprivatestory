/**
 * The Situation — 200 story situations across 10 categories.
 * Each situation has a display label and a narrative internalInject
 * that is fed directly into the story prompt as structural DNA.
 */

export interface Situation {
  id: string;
  label: string;
  category: string;
  internalInject: string;
  allowedPairings?: string[];
}

export const SITUATIONS: Situation[] = [

  // ── FORBIDDEN & COMPLICATED ────────────────────────────────────────────────
  {
    id: "fc_01",
    label: "She works for him. The attraction is not in the contract.",
    category: "Forbidden & Complicated",
    internalInject: "She is employed by him — their professional relationship is defined, bounded, and watched. The attraction has been building in small increments: a held glance, an unnecessary proximity, a comment that landed somewhere it shouldn't. Neither has named what is happening. The story lives in the gap between what they owe each other professionally and what they want personally.",
  },
  {
    id: "fc_02",
    label: "He's engaged. The announcement was three weeks ago.",
    category: "Forbidden & Complicated",
    internalInject: "He is engaged to someone else — the announcement is recent, the ring is visible, and the world has been congratulating him. What he feels when he's near her does not belong in this timeline. The story explores the specific cruelty of wanting someone when wanting them is no longer possible.",
  },
  {
    id: "fc_03",
    label: "She's the lawyer. He's the client. The case closes in six weeks.",
    category: "Forbidden & Complicated",
    internalInject: "Their relationship is professional and governed by rules of conduct neither of them has violated — yet. Six weeks remains on the case. The proximity is professional, the feelings are not. The story holds the tension of wanting something that would cost them both something real.",
  },
  {
    id: "fc_04",
    label: "He's her best friend's ex. The rule exists for reasons she keeps forgetting.",
    category: "Forbidden & Complicated",
    internalInject: "He belongs to a category she ruled out before she knew him. Her best friend is healed, moved on, insistent that it doesn't matter anymore. She is less certain. The rule exists. The reasons for it feel less solid every time she sees him. The story explores loyalty, desire, and the rules women make for each other.",
  },
  {
    id: "fc_05",
    label: "They're on opposite sides of a negotiation worth millions.",
    category: "Forbidden & Complicated",
    internalInject: "They are adversaries at the table — professionally bound to work against each other's interests. The negotiation is high-stakes and neither can afford to be the first to blink. What happens between them outside the conference room is a different negotiation entirely, with different stakes.",
  },
  {
    id: "fc_06",
    label: "He's the detective assigned to her case. She is the only witness.",
    category: "Forbidden & Complicated",
    internalInject: "He is assigned to protect her testimony. She is the only person who saw what happened and his career depends on keeping her safe and credible. The professional relationship requires distance. Everything else they feel closes it.",
  },
  {
    id: "fc_07",
    label: "She's the doctor. He's the patient. The treatment ends next month.",
    category: "Forbidden & Complicated",
    internalInject: "She is responsible for his care — the relationship is professional, asymmetric, and governed by ethics she trained herself to honour. One month remains. They are both counting it. The story explores how desire is experienced when a clear, approaching end is the only permission.",
  },
  {
    id: "fc_08",
    label: "He's her professor. The semester ends in eight weeks.",
    category: "Forbidden & Complicated",
    internalInject: "She is a postgraduate student — a doctoral researcher in her late twenties, fully adult, independent, and professionally capable. He is her academic supervisor, a decade older, holding authority over her research future. The power imbalance is structural and real. Eight weeks remain in the semester. Nothing has happened and both of them are aware that nothing happening is becoming harder to maintain. The story holds that specific tension — permission deferred, feeling present.",
  },
  {
    id: "fc_09",
    label: "She was his brother's girlfriend. She isn't anymore.",
    category: "Forbidden & Complicated",
    internalInject: "She and his brother ended badly — months ago, without his instigation. He was there for the aftermath. Now she is something else entirely in his landscape, and the thing that made her off-limits has dissolved, but the awkwardness of wanting her hasn't.",
  },
  {
    id: "fc_10",
    label: "The NDA covers everything they've done. Not everything they want to.",
    category: "Forbidden & Complicated",
    internalInject: "A non-disclosure agreement exists between them — signed, legally binding, covering past interactions. The agreement describes limits. The story explores what it feels like to want something that sits just outside those limits, when the limits were designed to contain exactly this.",
  },
  {
    id: "fc_11",
    label: "He's her boss's boss. The promotion depends on the next six weeks.",
    category: "Forbidden & Complicated",
    internalInject: "He has authority two levels above her. Her promotion is live, being evaluated, and partially subject to his judgment. Everything she feels is professionally dangerous and personally undeniable. The story holds the specific vertigo of wanting someone who holds your future.",
  },
  {
    id: "fc_12",
    label: "She's been hired to find out if he's guilty. She needs to be certain first.",
    category: "Forbidden & Complicated",
    internalInject: "She is conducting an investigation — her job is to determine his guilt. The longer she spends with him, the less certain she is, and the less certain she is, the more complicated it becomes to want what she's beginning to want. The story explores the collision between professional obligation and personal desire.",
  },
  {
    id: "fc_13",
    label: "They grew up in the same house. Different parents. No blood. Twelve years of wanting.",
    category: "Forbidden & Complicated",
    internalInject: "They were raised under the same roof — no biological connection whatsoever, different families brought together by circumstance when they were children. Both are now fully grown adults in their early thirties: independent, established, with their own separate lives for years. They have not lived together since they were teenagers. The social awkwardness is real but the biological prohibition does not exist. Twelve years of suppressed adult desire — desire they have both always known was irrational to suppress. The story honours the specificity of what it means to want someone you were conditioned not to want.",
  },
  {
    id: "fc_14",
    label: "She agreed to marry for business reasons. He introduced her to the groom.",
    category: "Forbidden & Complicated",
    internalInject: "She agreed to a strategic marriage. He was the one who arranged the introduction and made the case for why it made sense. The marriage is not yet finalised. The story explores what happens when the person who assembled an arrangement is the reason the arrangement feels impossible.",
  },
  {
    id: "fc_15",
    label: "He's the security detail. The threat level dropped. The other thing didn't.",
    category: "Forbidden & Complicated",
    internalInject: "He was assigned to protect her during a period of genuine risk. The threat has been downgraded — the professional justification for his proximity is fading. The other thing, the thing neither of them named, has not diminished. The story explores what happens when a professional reason dissolves and the personal reason remains.",
  },
  {
    id: "fc_16",
    label: "They're both actors playing lovers in a film. The attraction wasn't in the script.",
    category: "Forbidden & Complicated",
    internalInject: "They are playing lovers in a production — the role is defined, the script is clear, the professional boundary is firm. Both understand the line between performance and reality. She is experienced at maintaining that distance. She is no longer certain that distance is intact. The story explores the specific confusion of desire that begins as performance.",
  },
  {
    id: "fc_17",
    label: "He's the rival. His company is trying to acquire hers.",
    category: "Forbidden & Complicated",
    internalInject: "He is trying to acquire the company she built. Their relationship is adversarial by structure and competitive by history. Every meeting is a negotiation in which they are on opposite sides. The story explores what happens when the person trying to take something from you is the person you find yourself wanting.",
  },
  {
    id: "fc_18",
    label: "She's his therapist. He terminated last month. She has been waiting to hear from him.",
    category: "Forbidden & Complicated",
    internalInject: "She was his therapist for two years. He terminated the therapeutic relationship last month — a clean, correct ending by every professional standard. She has been waiting to hear from him in a capacity that is no longer governed by those standards. The story holds the careful ethics of what is now allowed and what it costs to admit wanting it.",
  },
  {
    id: "fc_19",
    label: "They're both married to other people. Neither marriage is what it appeared.",
    category: "Forbidden & Complicated",
    internalInject: "Both are married. Neither marriage is functioning in the way it was presented to the world. They are not seeking an affair — they are in the middle of lives that have become hollow, and they have met someone in whom they recognise something real. The story holds the weight of this without resolution.",
  },
  {
    id: "fc_20",
    label: "He was assigned to investigate her. The investigation cleared her completely. He's been waiting for permission to contact her.",
    category: "Forbidden & Complicated",
    internalInject: "He was assigned to investigate her — her activities, her associations, her credibility. The investigation concluded: she is cleared, exonerated, completely without fault. The professional barrier that made contact inappropriate has dissolved by the evidence. He has been waiting for ethical permission to reach out. The story is what happens when the obstruction dissolves.",
  },

  // ── REUNION & RETURN ───────────────────────────────────────────────────────
  {
    id: "rr_01",
    label: "They were together at university. She ended it. He moved across the world. He's back.",
    category: "Reunion & Return",
    internalInject: "They had something real when they were young. She ended it — for reasons that made sense then and feel less certain now. He moved to a different country and built a life. He is back. The story is about what it means to face someone you chose to leave, when leaving was the right choice and the worst one simultaneously.",
  },
  {
    id: "rr_02",
    label: "He was her first. She is fully grown now and he's standing in her office.",
    category: "Reunion & Return",
    internalInject: "He was her first love — a formative, tender, eventually painful chapter she thought was entirely behind her. She is a fully grown adult now, established in her career, in command of her life — a woman in her thirties who has long since left that version of herself behind. He is standing in her office. The story is about encountering someone who knew you before you knew yourself.",
  },
  {
    id: "rr_03",
    label: "They almost were. A missed moment, six years ago.",
    category: "Reunion & Return",
    internalInject: "They were close once — close enough that something almost happened, and then didn't. A timing failure, a misread signal, a fear that arrived at the wrong moment. Six years have passed. They are meeting again and the almost is still there, intact, exactly where they left it.",
  },
  {
    id: "rr_04",
    label: "He disappeared without explanation. The explanation has a name and it's not good enough.",
    category: "Reunion & Return",
    internalInject: "He left without a word — not gradually, suddenly, completely. She spent time being angry, then being fine, then being over it. He is back with an explanation. The explanation exists. The story explores whether an explanation can repair what absence destroyed, and what she decides to do with hers.",
  },
  {
    id: "rr_05",
    label: "She was the one who got away. She's about to find out he knows it.",
    category: "Reunion & Return",
    internalInject: "He let her leave — because he wasn't ready, because he made a wrong calculation, because he was younger and foolish and certain there would be other chances. She has no idea that he has categorised her this way. The story is the moment she finds out.",
  },
  {
    id: "rr_06",
    label: "They haven't spoken in four years. She initiated the silence. He respected it until now.",
    category: "Reunion & Return",
    internalInject: "She asked for silence and he gave it — four years of it. She didn't expect him to maintain it this long. She didn't expect him to break it this way. The story is about what it means to be the one who asked for distance and then have it returned to you.",
  },
  {
    id: "rr_07",
    label: "He left for the right reasons. He's come back for the wrong ones. Both of them know it.",
    category: "Reunion & Return",
    internalInject: "His original departure was correct — honourable even. His return is motivated by something less clean: longing, regret, an inability to fully move on. Both of them are aware that the reasons he's back don't quite hold up to scrutiny. The story holds that mutual awareness.",
  },
  {
    id: "rr_08",
    label: "She moved on. He has been waiting longer than is reasonable.",
    category: "Reunion & Return",
    internalInject: "She rebuilt her life — genuinely, successfully. He has been less successful at moving on than he presents. He has not waited in a dramatic or obvious way: he has simply not found anything else that matched what they had. The story explores what it means to be wanted by someone who has been patient beyond reasonable expectation.",
  },
  {
    id: "rr_09",
    label: "They were childhood neighbours. He's bought the house next door.",
    category: "Reunion & Return",
    internalInject: "They grew up next door to each other — different ages, different phases, memories that belong to summer holidays and a specific period of childhood. He has bought the house next door again. The story is about the particular strangeness of someone from your past choosing proximity.",
  },
  {
    id: "rr_10",
    label: "She moved to a different country to stop thinking about him. He's just arrived.",
    category: "Reunion & Return",
    internalInject: "She relocated — genuinely, deliberately, partly to put geography between herself and the thing she felt for him. She has built a life here. He has just arrived in the same city. The story is about the absurdity and inevitability of distance failing as a strategy.",
  },
  {
    id: "rr_11",
    label: "The letter she sent was never replied to. She finds out now he never received it.",
    category: "Reunion & Return",
    internalInject: "She wrote something honest and sent it years ago and received nothing back. She drew the obvious conclusion. The conclusion was wrong: the letter never arrived. He is explaining this now. The story is about what changes when the silence you interpreted as rejection was actually loss.",
  },
  {
    id: "rr_12",
    label: "She thought he chose someone else. He didn't. It took seven years to explain that.",
    category: "Reunion & Return",
    internalInject: "Everything she believed about why things ended was incorrect — the story she constructed was internally consistent and entirely wrong. It took seven years for the truth to reach her. The story is about what you do with the version of the past you've been carrying when it turns out to be fiction.",
  },
  {
    id: "rr_13",
    label: "A decade passed. Both of them are different people. They are not.",
    category: "Reunion & Return",
    internalInject: "Ten years have passed. Both of them have changed in provable, visible ways — different careers, different cities, different versions of who they were. In the specific space between them, nothing has changed at all. The story holds that paradox.",
  },
  {
    id: "rr_14",
    label: "He wrote about her. Didn't use her name. She recognised herself in every page.",
    category: "Reunion & Return",
    internalInject: "He wrote something — published, available, public — in which she is clearly present: details only she would recognise, moments that belong to her, emotions rendered with a specificity that could only come from someone who had paid very close attention. She is confronting him about it now.",
  },
  {
    id: "rr_15",
    label: "They only had one night. She's counted the years. He appears to have counted the same ones.",
    category: "Reunion & Return",
    internalInject: "They had one night together — complete, significant, unresolved. She has carried it. She assumed she was alone in this. The story begins when she discovers she was not.",
  },
  {
    id: "rr_16",
    label: "She left without saying why. He's found the reason. He's brought it back.",
    category: "Reunion & Return",
    internalInject: "She disappeared from his life without adequate explanation. He spent time confused, then angry, then resigned. He has since discovered the real reason she left. He has come to her with it. The story is about what happens when the reason for a departure turns out to be something other than what was assumed.",
  },
  {
    id: "rr_17",
    label: "He chose silence when she needed something else. He has spent two years articulating why.",
    category: "Reunion & Return",
    internalInject: "There was a moment when she needed him to speak and he didn't. The failure was real and she felt it as abandonment. He has spent two years understanding what happened in himself in that moment. He is here now with the articulation. The story is about whether explanation arrives in time.",
  },
  {
    id: "rr_18",
    label: "She told him goodbye because she thought he wanted her to. He didn't.",
    category: "Reunion & Return",
    internalInject: "She read a signal that wasn't there — concluded he wanted distance and provided it gracefully. He wanted the opposite and didn't know how to correct her without making it worse. Years have passed. He is correcting it now.",
  },
  {
    id: "rr_19",
    label: "They promised to meet in a year. Only one of them showed up. The other is explaining now.",
    category: "Reunion & Return",
    internalInject: "They made a specific promise — a year, a place, a second chance built into an ending. Only one of them arrived. The one who didn't is here now with an explanation that arrives late enough to be both insufficient and necessary.",
  },
  {
    id: "rr_20",
    label: "He built something in the years they were apart. She is the reason it exists.",
    category: "Reunion & Return",
    internalInject: "In the years since she left his life, he built something — a company, a body of work, an achievement — that would not exist without the particular grief of losing her. She does not know this. The story begins when she finds out.",
  },

  // ── FIRST & UNKNOWN ────────────────────────────────────────────────────────
  {
    id: "fu_01",
    label: "They meet on a delayed flight. Six hours. She tells him things she's never told anyone.",
    category: "First & Unknown",
    internalInject: "A flight delay creates a contained, temporary world. Six hours in an airport terminal with a stranger who will never cross her life again — or so she believes. The specific freedom of a person you'll never see again enables honesty she doesn't normally permit herself. The story explores what is possible in a space defined by its own ending.",
  },
  {
    id: "fu_02",
    label: "He sits next to her at a concert for a performer neither of them can stand.",
    category: "First & Unknown",
    internalInject: "They are both present somewhere neither of them wants to be — at the behest of obligation, or friends, or a miscalculation. They discover this about each other within the first minutes. The shared mild suffering becomes the particular intimacy of a mutual joke between strangers.",
  },
  {
    id: "fu_03",
    label: "She asks him for directions. He gives them. Neither of them moves.",
    category: "First & Unknown",
    internalInject: "The transaction is simple: she needs directions, he provides them. The exchange should last thirty seconds. Neither of them moves on. The story lives in what happens in the space after the transaction is complete but before either of them acknowledges that they're still standing there.",
  },
  {
    id: "fu_04",
    label: "They're the only two people at a party who don't want to be there. Last to leave.",
    category: "First & Unknown",
    internalInject: "They arrived separately at a gathering neither wanted to attend. They found each other in the corner early. The party thinned around them while they were talking. They are the last two people in the room and neither of them is looking for the exit.",
  },
  {
    id: "fu_05",
    label: "They get into the same taxi by mistake. The driver won't stop.",
    category: "First & Unknown",
    internalInject: "A shared taxi — accident, miscommunication, the driver already moving. They are strangers in the back of a car headed in a direction at least one of them didn't intend. The constraint is physical and oddly intimate. The story is the duration of the ride and what happens in it.",
  },
  {
    id: "fu_06",
    label: "She's been emailing a stranger for a year about a property dispute. He shows up in person.",
    category: "First & Unknown",
    internalInject: "A year of correspondence — legal, formal, occasionally heated — about a boundary, an easement, something specific and mundane. She knows his arguments, his turns of phrase, the rhythm of how he thinks. She does not know his face. He has arrived in person. The story is about the collision of a known mind with an unknown body.",
  },
  {
    id: "fu_07",
    label: "He's sitting in the library reading the book she needs. He doesn't give it back.",
    category: "First & Unknown",
    internalInject: "She needs a specific book — it is the only copy in the library, it is currently in his hands, and he is mid-chapter. He does not offer to give it back immediately. She stays. The story lives in the territorial negotiation over an object that becomes a reason for proximity.",
  },
  {
    id: "fu_08",
    label: "They're neighbours who have never spoken. A noise complaint brings them face to face.",
    category: "First & Unknown",
    internalInject: "They have lived in close proximity for months without introduction — familiar silhouettes, corridor nods, the sounds of each other's lives through walls. A noise complaint forces a conversation. The story is about the specific awkwardness and electricity of finally meeting someone you've been peripherally aware of for a long time.",
  },
  {
    id: "fu_09",
    label: "He sits at the wrong table. She doesn't point it out for twenty minutes.",
    category: "First & Unknown",
    internalInject: "He has made a mistake — sat at the wrong table in a restaurant, in a waiting area, somewhere defined. She is aware of this almost immediately. She does not correct him. The story is in those twenty minutes: what she does with the accidental intimacy of having him there.",
  },
  {
    id: "fu_10",
    label: "She's the emergency contact the hospital calls. She has no idea who he is.",
    category: "First & Unknown",
    internalInject: "She receives a call from a hospital listing her as someone's emergency contact. She has no memory of agreeing to this — or perhaps a vague memory of a form, a favour, a moment she's forgotten. She goes. He's awake, embarrassed, unable to explain quickly. The story is the explanation.",
  },
  {
    id: "fu_11",
    label: "They've been exchanging glances on the morning commute for eight months. The train breaks down.",
    category: "First & Unknown",
    internalInject: "Eight months of careful, deniable eye contact on the morning commute — enough regularity to have meaning, not enough to require action. The train breaks down. The rhythm that kept them at a safe distance is disrupted. The story is what happens when the structure that made the game possible is removed.",
  },
  {
    id: "fu_12",
    label: "He's the painter hired for the apartment she's moving into. She hasn't moved out.",
    category: "First & Unknown",
    internalInject: "There's been a scheduling confusion — the painter arrives to work on an apartment whose current tenant has not yet left. They must negotiate the space together. The story is the negotiation: physical proximity, domestic intimacy, the specific vulnerability of being present in your own home while a stranger works in it.",
  },
  {
    id: "fu_13",
    label: "She arrives at a property that's been double-booked. He's already there.",
    category: "First & Unknown",
    internalInject: "She has booked a property — a rental, a cottage, somewhere specific — and arrives to find it already occupied. He has the same confirmation. The booking platform failed both of them. The story is about what two strangers do with an accidental and inconvenient shared space.",
  },
  {
    id: "fu_14",
    label: "He's the one person in the bookshop with the same obscure reading taste.",
    category: "First & Unknown",
    internalInject: "She is looking for something specific and unlikely to be understood — an author, a subject, a niche corner of the shelves. He is looking for the same thing. The coincidence is improbable enough to feel like something. The story begins in the moment they discover this about each other.",
  },
  {
    id: "fu_15",
    label: "She ends up in his hospital room by mistake. They make a deal.",
    category: "First & Unknown",
    internalInject: "She has entered the wrong room — a visitor to someone else, navigating corridors confidently in the wrong direction. He is in the bed. He is bored and in minor pain and unexpectedly amused. They make some kind of deal — she'll keep visiting in exchange for something. The story is built on that arrangement.",
  },
  {
    id: "fu_16",
    label: "A mutual friend they've both been separately told about. The introduction is ten years late.",
    category: "First & Unknown",
    internalInject: "Their names have been exchanged between a mutual friend for years — 'you'd like each other,' 'you're so similar,' 'I keep meaning to introduce you.' It has taken ten years for the introduction to happen. The story carries the weight of imagined versions of each other, meeting the real ones.",
  },
  {
    id: "fu_17",
    label: "He's the man her friend hired for her birthday. He's the chef. It becomes something else.",
    category: "First & Unknown",
    internalInject: "Her friend has hired someone to cook dinner for her birthday — private chef, intimate occasion. He arrives to cook. She answers the door. The professional arrangement is clear and appropriate. The story explores how a professional event becomes something else without anyone making a specific decision for it to.",
  },
  {
    id: "fu_18",
    label: "They meet at a crime scene. She's the victim. He's the detective.",
    category: "First & Unknown",
    internalInject: "Their first meeting occurs in the worst context: she is reporting a crime, he is investigating it. The encounter is defined by her vulnerability and his professional responsibility. The story explores what develops when the most raw version of a person is the one someone else first meets.",
  },
  {
    id: "fu_19",
    label: "She's the only other passenger on the boat. They have three days on the water.",
    category: "First & Unknown",
    internalInject: "They are strangers sharing a vessel for three days — a sailing trip, a river cruise, a ferry to somewhere remote. The constraint is physical and complete: there is no elsewhere to go, no way to leave, no other company. The story is what happens in a space from which retreat is impossible.",
  },
  {
    id: "fu_20",
    label: "He's the stranger she asked to lie for her. He did it too convincingly.",
    category: "First & Unknown",
    internalInject: "She needed a cover story and approached a stranger for help — a quick, simple lie that required his cooperation for sixty seconds. He agreed. He did it well. The lie worked. The story is what happens after: why he was so convincing, what it cost him, and what she owes him for it.",
  },

  // ── POWER & TENSION ────────────────────────────────────────────────────────
  {
    id: "pt_01",
    label: "He has information that could ruin her career. She has information that could end his.",
    category: "Power & Tension",
    internalInject: "They are in a state of mutual leverage — each holds something the other cannot afford to have released. The balance of power is exact and precarious. The story explores what desire feels like when it exists inside a structure of mutual threat, and what happens when one of them decides the leverage no longer matters to them.",
  },
  {
    id: "pt_02",
    label: "She works for him and is the only person who isn't intimidated. He finds it unbearable.",
    category: "Power & Tension",
    internalInject: "He is a person who commands rooms — respected, feared, deferred to. She works for him and is the single exception: not dismissive, not hostile, simply unbothered by the authority he radiates. His reaction to her unbotheredness is out of proportion and private. The story is about what happens when someone refuses to be affected by power.",
  },
  {
    id: "pt_03",
    label: "He has always controlled every room he enters. She is the first exception in fifteen years.",
    category: "Power & Tension",
    internalInject: "He has spent fifteen years in environments he controls — through personality, authority, or intelligence. She is the first person in fifteen years who is genuinely unimpressible. The story explores what it feels like to encounter your own limits in another person.",
  },
  {
    id: "pt_04",
    label: "She is the most powerful person in the building. He treats her like a person, not a position.",
    category: "Power & Tension",
    internalInject: "She holds significant authority — everyone around her is aware of it and behaves accordingly. He either doesn't know or doesn't care. He treats her as he would treat anyone: directly, without performance. The relief of being seen this way is almost dangerous.",
  },
  {
    id: "pt_05",
    label: "He told her no. She asked again. He's finding it difficult to remember why he said no.",
    category: "Power & Tension",
    internalInject: "He said no to something — a request, a proposition, a suggestion. She accepted this and then asked again, differently. He is finding the memory of his reasons increasingly difficult to access. The story is about the specific erosion of resolve when someone doesn't accept the first answer.",
  },
  {
    id: "pt_06",
    label: "The power is reversed in this room and neither of them expected it to feel like this.",
    category: "Power & Tension",
    internalInject: "In their usual dynamic, the power sits in one place. In this specific room — this context, this situation — it has reversed. Neither of them anticipated the reversal feeling the way it does. The story explores how desire shifts when the architecture of power between two people changes.",
  },
  {
    id: "pt_07",
    label: "She's interviewing him for a position he doesn't need. He's attending for undisclosed reasons.",
    category: "Power & Tension",
    internalInject: "He is being interviewed for a role he doesn't require — the professional authority belongs to her, but his presence in this room is for reasons other than the job. She doesn't know this yet. The story is structured around what he wants and whether she discovers it before or after she decides something about him.",
  },
  {
    id: "pt_08",
    label: "He knows something that would change everything. He's choosing when to say it.",
    category: "Power & Tension",
    internalInject: "He is in possession of information that would alter the dynamic between them significantly. He has chosen not to disclose it yet — not from malice, from something more complicated. The story explores the specific power of someone who is deciding when to relinquish an advantage.",
  },
  {
    id: "pt_09",
    label: "She said she'd never work for a man like him. She now works for a man like him.",
    category: "Power & Tension",
    internalInject: "She made a statement — privately, publicly, firmly — about the kind of man she would not work for. She now works for him. The situation requires her to hold this contradiction without discussing it. The story explores the specific discomfort of being wrong about yourself in front of the exact person you were wrong about.",
  },
  {
    id: "pt_10",
    label: "He makes the final decision. She's presenting the case. The argument is professional. The eye contact is not.",
    category: "Power & Tension",
    internalInject: "The meeting is formal, the stakes are real, and she is presenting to a room that he controls. The content of the argument is professional. The communication happening between them that is not about the argument is not. The story holds both things simultaneously.",
  },
  {
    id: "pt_11",
    label: "They've been competing for the same position. One of them just won. It's not who expected to.",
    category: "Power & Tension",
    internalInject: "A competition with a clear winner: one of them has been given the position both pursued. The result was not the predicted one. The winner is adjusting to having won; the other is adjusting to something more complicated. The story holds the specific difficulty of desire toward someone you have just beaten.",
  },
  {
    id: "pt_12",
    label: "She's the one who recommended him. The recommendation came with a cost she didn't predict.",
    category: "Power & Tension",
    internalInject: "She put her credibility behind him — recommended him for something significant. He got it. He is now in a position that changes their dynamic in ways she did not fully anticipate when she wrote the recommendation. The story explores what it means to elevate someone and then have to live with who they become.",
  },
  {
    id: "pt_13",
    label: "She's the chair of the board. He's been brought in to challenge it. Both of them are right about different things.",
    category: "Power & Tension",
    internalInject: "They have been placed in structural opposition — she represents the established position, he has been brought in to question it. Both have valid arguments. Neither is entirely wrong. The story explores desire that develops in the specific heat of being genuinely challenged by someone you respect.",
  },
  {
    id: "pt_14",
    label: "He's been given authority over her project. She doesn't accept that. The argument lasts six weeks.",
    category: "Power & Tension",
    internalInject: "A management decision has assigned him authority over something she built. She has not quietly accepted this. The disagreement is principled and ongoing — six weeks of meetings, emails, and escalations. The story explores attraction that develops in the specific context of sustained, intelligent conflict.",
  },
  {
    id: "pt_15",
    label: "She's the interrogator. He's the one being questioned. He keeps answering the wrong questions correctly.",
    category: "Power & Tension",
    internalInject: "She is conducting an interrogation — professional, purposeful, structured to extract specific information. He is answering her questions with precision but not quite the questions she is asking. The story is about what is communicated between them in the gap between what is asked and what is answered.",
  },
  {
    id: "pt_16",
    label: "He's in charge of everything. She's the one person who doesn't care. That is all he thinks about now.",
    category: "Power & Tension",
    internalInject: "His authority is real and significant. She is indifferent to it in a way that is not performative — she simply does not order her responses around it. He has begun thinking about this indifference more than he thinks about anything else. The story explores the desire that develops when someone refuses to be impressed.",
  },
  {
    id: "pt_17",
    label: "She's given him a test. He knows it's a test. He's deciding whether to pass it.",
    category: "Power & Tension",
    internalInject: "She has set a test — implicit, unacknowledged, but clear to him. He has recognised it. He is now deciding whether to perform in the way the test requires or to do something different. The story lives in that decision and what it reveals about what he actually wants.",
  },
  {
    id: "pt_18",
    label: "They're negotiating a settlement that would cost both of them something. Neither of them is talking about money.",
    category: "Power & Tension",
    internalInject: "A negotiation is taking place — formal, involving figures, governed by legal language. Neither of them is primarily focused on the numbers. The real negotiation is happening underneath: about trust, about power, about what each of them is willing to give up. The story holds both negotiations simultaneously.",
  },
  {
    id: "pt_19",
    label: "He determines whether she gets what she wants. She's deciding if what she wants has changed.",
    category: "Power & Tension",
    internalInject: "He is in a position of decision-making over something she wants — a contract, a permission, an outcome. She is midway through wanting it when she begins to question whether the thing she originally wanted is still the thing she wants most. The story is about desire being interrupted by a different desire.",
  },
  {
    id: "pt_20",
    label: "She promoted him. He's now her peer. Everything that wasn't possible before now is.",
    category: "Power & Tension",
    internalInject: "She used her authority to advance his career — moved him from a position below her to one beside her. The professional barrier that made certain things impossible has dissolved. Both of them are aware of this. Neither has moved first. The story is about the specific atmosphere that fills the space where a barrier used to be.",
  },

  // ── PSYCHOLOGICAL & OBSESSIVE ──────────────────────────────────────────────
  {
    id: "po_01",
    label: "She's been watching him for weeks. Professionally. She's no longer sure that distinction holds.",
    category: "Psychological & Obsessive",
    internalInject: "She has legitimate professional reasons to observe him — the watching began as surveillance, documentation, information gathering. At some point, the professional frame stopped containing all of what she feels when she watches him. The story explores the specific unease of a boundary dissolving inside your own mind.",
  },
  {
    id: "po_02",
    label: "He dreams about her before they meet. The dreams don't stop after.",
    category: "Psychological & Obsessive",
    internalInject: "He dreamed about her before they were introduced — a face, a voice, a presence his sleeping mind created and returned to. When they finally meet, the recognition is physical and disorienting. The dreams continue. The story explores desire that preceded the person and what to do with the uncanny intimacy that creates.",
  },
  {
    id: "po_03",
    label: "She keeps running into him. Coincidence, until it isn't.",
    category: "Psychological & Obsessive",
    internalInject: "The encounters have accumulated past the point where coincidence explains them. She is not certain whether he is engineering the meetings or whether there is a simpler explanation she hasn't found yet. The story explores the point at which a pattern becomes meaningful, and what she decides to do when she reaches it.",
  },
  {
    id: "po_04",
    label: "He has memorised things about her that she has never said aloud. She doesn't know how.",
    category: "Psychological & Obsessive",
    internalInject: "He knows things about her — specific, accurate things — that she has never shared with him or in any context he should have access to. He is not hostile; he is simply knowledgeable in a way that should alarm her more than it does. The story explores the thin line between being known and being watched.",
  },
  {
    id: "po_05",
    label: "She wrote down everything about a person she'd never speak to. He finds the notebook.",
    category: "Psychological & Obsessive",
    internalInject: "She has kept a record — detailed, honest, private — of observations about a person she decided she would never approach. He is that person. He has found the notebook. The story is about what happens when someone discovers they have been the object of careful, sustained attention.",
  },
  {
    id: "po_06",
    label: "He is convinced he has seen her before. The certainty is physical and impossible to reason away.",
    category: "Psychological & Obsessive",
    internalInject: "He has an overwhelming, bodily sense of recognition when he sees her — not déjà vu exactly, something more specific. He cannot locate the memory. She has no memory of him. The certainty sits in him regardless. The story explores desire that arrives wearing the clothes of memory.",
  },
  {
    id: "po_07",
    label: "She's been the subject of a fascination she didn't know existed. The person tells her.",
    category: "Psychological & Obsessive",
    internalInject: "Someone she knows — at a distance, a professional acquaintance, a peripheral presence in her life — is confessing to a sustained private fascination with her. He tells her directly, without preamble, without apology. The story is about how she receives this information and what she discovers about herself in how she responds.",
  },
  {
    id: "po_08",
    label: "He lies to keep her close. She knows he's lying. She doesn't correct him.",
    category: "Psychological & Obsessive",
    internalInject: "He tells her something that isn't true — a small lie, a plausible one, designed to sustain their proximity. She has noticed the inconsistency. She has chosen not to name it. The story explores the dynamic between two people who are both pretending: one that the lie is real, one that the lie doesn't matter.",
  },
  {
    id: "po_09",
    label: "She keeps returning to a place she can't explain. He's always there.",
    category: "Psychological & Obsessive",
    internalInject: "She finds herself drawn back to a particular place — a café, a building, a part of the city — without fully understanding why. He is always there when she arrives. The story holds the question of whether this is coincidence, unconscious recognition, or something she is not admitting to herself.",
  },
  {
    id: "po_10",
    label: "He's been paying attention in a way she didn't notice. The evidence is overwhelming.",
    category: "Psychological & Obsessive",
    internalInject: "Evidence accumulates — small things that reveal sustained, specific attention. He has remembered things she said in passing. He has arranged things that suggest knowledge of her preferences. The attention is not sinister; it is devoted. The story is about the moment she registers the scale of it.",
  },
  {
    id: "po_11",
    label: "She started a game to see if he'd take the bait. He did. She's not sure she wants to win.",
    category: "Psychological & Obsessive",
    internalInject: "She initiated something — a test, a provocation, a game — to determine something about him. He has responded exactly as she designed the game to produce. She is now uncertain whether winning the game was ever actually what she wanted. The story explores the specific surprise of desire that defeats its own strategies.",
  },
  {
    id: "po_12",
    label: "He is not what he appears. The gap between appearance and reality is where she lives now.",
    category: "Psychological & Obsessive",
    internalInject: "She has discovered that what he presented publicly is a significant distance from what he is privately. The real version is more interesting than the public one — more complicated, more specific, more hers to know. The story explores the particular intimacy of knowing someone's private version of themselves.",
  },
  {
    id: "po_13",
    label: "She's been analysing him academically. It has become personal in a way that invalidates the methodology.",
    category: "Psychological & Obsessive",
    internalInject: "She is studying him in some professional capacity — psychological, journalistic, sociological. She has been precise and detached. Her detachment has developed a crack. The story explores the moment when intellectual interest fails to contain emotional interest, and what that failure costs.",
  },
  {
    id: "po_14",
    label: "He tells her exactly what he thinks of her, directly, the first time they meet. None of it is critical.",
    category: "Psychological & Obsessive",
    internalInject: "He is the kind of person who does not soften what he observes about people. He tells her, directly and without apology, what he thinks of her from a single meeting. Everything he says is accurate. None of it is unkind. The story explores the specific exposure of being seen clearly by a stranger.",
  },
  {
    id: "po_15",
    label: "She collects something. So does he. They have been unknowingly building the same thing.",
    category: "Psychological & Obsessive",
    internalInject: "She has a private collection — objects, records, editions, something specific and accumulated over time. He has been building the same collection in parallel, separately, without knowledge of her. They discover this about each other. The story is about the uncanny intimacy of converging private obsessions.",
  },
  {
    id: "po_16",
    label: "He has a specific tell she's the first person to notice. That noticing gives her a particular power.",
    category: "Psychological & Obsessive",
    internalInject: "She has identified something about him — a physical or behavioural tell — that no one else seems to have registered. She does not tell him she's noticed. The knowledge gives her a kind of access to him he hasn't consented to and doesn't know she has. The story explores the quiet power of being the one who truly sees.",
  },
  {
    id: "po_17",
    label: "She is writing a profile of him. Every interview makes him harder to contain in the format.",
    category: "Psychological & Obsessive",
    internalInject: "She is writing about him for publication — a profile, a feature, something that requires many hours in his presence. Each interview reveals something that doesn't fit the frame she's writing. The frame keeps needing to expand. The story is about what happens when you spend enough time with someone that the professional task becomes the less interesting thing.",
  },
  {
    id: "po_18",
    label: "He has been avoiding her specifically. When she learns why, it changes everything.",
    category: "Psychological & Obsessive",
    internalInject: "His avoidance of her has been deliberate and, she now realises, specific — he has been managing a proximity that he finds difficult to manage safely. The story is built around her discovering this, and what she does with the knowledge that she is someone a person she wants has been trying not to want.",
  },
  {
    id: "po_19",
    label: "He sends her things that are exactly right. She doesn't know who he is. She's beginning to.",
    category: "Psychological & Obsessive",
    internalInject: "She has been receiving things — gifts, messages, recommendations — from an anonymous source that understands her with an accuracy that should be impossible. She is narrowing the field of who it could be. The story is about what happens when she identifies him, and what his knowing her that well means.",
  },
  {
    id: "po_20",
    label: "She made a decision that affected his life without knowing him. He's been tracking the consequences.",
    category: "Psychological & Obsessive",
    internalInject: "A choice she made — professional, administrative, incidental to her — changed the direction of his life significantly. He knows this. She does not. He has been in her orbit ever since, tracking the effects. The story is the moment she learns that she is the author of something major in someone else's life.",
  },

  // ── CIRCUMSTANCE & PROXIMITY ───────────────────────────────────────────────
  {
    id: "cp_01",
    label: "The power goes out across the city. They are the only two people in the building.",
    category: "Circumstance & Proximity",
    internalInject: "A citywide power outage has emptied the building of everyone except them — they are colleagues, or neighbours, or strangers who happened to be present. The darkness and the sudden quiet have collapsed the ordinary distances. The story lives in what the city's failure creates between two people in a dark building.",
  },
  {
    id: "cp_02",
    label: "They are stranded at an airport. The next flight is fourteen hours away.",
    category: "Circumstance & Proximity",
    internalInject: "A cancelled or delayed flight has given them fourteen hours they did not choose and cannot spend otherwise. The airport is their world. The story lives in what people do with time they haven't chosen to spend together and cannot escape from.",
  },
  {
    id: "cp_03",
    label: "She agreed to be his fake partner for one event. There are now four more.",
    category: "Circumstance & Proximity",
    internalInject: "A favour: she agreed to pose as his partner for a specific, bounded social occasion. The occasion expanded. There are now four more events on the calendar. The performance they agreed to sustain is becoming more complicated to maintain as something else grows alongside it.",
  },
  {
    id: "cp_04",
    label: "He needs a place to stay for two weeks. She's the only person who offered.",
    category: "Circumstance & Proximity",
    internalInject: "A temporary displacement — flooding, renovation, a circumstance that left him without accommodation — has brought him to her spare room. Two weeks. She was the only one who offered without conditions. The story is about what happens to the space between two people when they share physical space they didn't expect to share.",
  },
  {
    id: "cp_05",
    label: "They're locked in together. Not a metaphor. The door is genuinely not opening.",
    category: "Circumstance & Proximity",
    internalInject: "A literal, practical situation: they are in an enclosed space and the exit is not functioning. They are not in danger. They are simply stuck together for an indeterminate period with nowhere else to go. The story is about what the enforced proximity and the absence of exit produces.",
  },
  {
    id: "cp_06",
    label: "She's his emergency contact — they arranged it as a joke. The hospital called.",
    category: "Circumstance & Proximity",
    internalInject: "They made the arrangement casually — an exchange of numbers as a formality or a joke, in the early days of knowing each other. The hospital has called her. He is fine, or mostly fine. The story is about what it means to be called in a capacity of care by someone you weren't fully prepared to care about.",
  },
  {
    id: "cp_07",
    label: "The hotel has one room left. She's too tired to argue.",
    category: "Circumstance & Proximity",
    internalInject: "The accommodation situation has resolved itself into a single room, two people, one bed. She has been travelling for a long time and does not have the energy for the negotiation this might otherwise require. The story is about the specific intimacy created by exhaustion and shared necessity.",
  },
  {
    id: "cp_08",
    label: "They're both snowed in at a property that belongs to neither of them.",
    category: "Circumstance & Proximity",
    internalInject: "Weather has made departure impossible. They are in someone else's house — borrowed, rented, inherited — with no expectation of when this will end. The property is not theirs, the situation was not planned, and they are entirely alone in it. The story is the duration of the snow.",
  },
  {
    id: "cp_09",
    label: "His car broke down. She's the only one who stopped.",
    category: "Circumstance & Proximity",
    internalInject: "Roadside, practical, undramatic: his car has failed and everyone has driven past. She stopped. The story is about the asymmetry of the gesture — he is the one who needed help, she is the one who chose to stop — and what develops when someone sees you in a moment of helplessness and decides to stay.",
  },
  {
    id: "cp_10",
    label: "The flat share was meant to be temporary. Six months later, neither has mentioned moving.",
    category: "Circumstance & Proximity",
    internalInject: "What began as a short-term, practical arrangement — six weeks, two months — has extended to six months without either of them naming the extension. The story is about what grows in a shared domestic space when neither person is motivated to end it, and what they're both not saying about why.",
  },
  {
    id: "cp_11",
    label: "They're both hiding from the same party in the same supply closet.",
    category: "Circumstance & Proximity",
    internalInject: "Both have retreated from the same social event to the same unlikely hiding place. They open the door on each other. The absurdity of the situation is the beginning: two people in a supply closet, having both concluded that this is preferable to the party outside. The story is built on that shared conclusion.",
  },
  {
    id: "cp_12",
    label: "The job requires them to live together for twelve weeks.",
    category: "Circumstance & Proximity",
    internalInject: "A project, an assignment, a research posting — something legitimate and professional — requires them to share living space for twelve weeks. The arrangement is not unusual in the context of the work. What develops in the domestic spaces between professional obligations is the story.",
  },
  {
    id: "cp_13",
    label: "She fainted. He caught her. He has not quite let go.",
    category: "Circumstance & Proximity",
    internalInject: "A medical moment — she lost consciousness briefly, he was nearest and caught her. She is fine. He is still holding her, slightly longer than necessary, with a care that did not fully switch off when the emergency ended. The story begins in the moment after the crisis, in what the catching revealed.",
  },
  {
    id: "cp_14",
    label: "The experiment requires them to be alone together for thirty-six hours.",
    category: "Circumstance & Proximity",
    internalInject: "A study, a project, a research condition — something structured and scientific — requires them to be in continuous proximity for thirty-six hours. The parameters are defined. The story explores what develops inside a defined constraint when the constraint cannot be escaped.",
  },
  {
    id: "cp_15",
    label: "His house flooded. Her spare room is why he's standing in her hallway at 11pm.",
    category: "Circumstance & Proximity",
    internalInject: "A practical crisis — water damage, uninhabitable conditions — has delivered him to her door late at night with an awkward request. She said yes. He is now in her home with an unclear departure date. The story is built on the specific intimacy of sudden, necessity-driven domestic proximity.",
  },
  {
    id: "cp_16",
    label: "They're the only two people still at the office at 2am. The deadline was missed. The evening was not.",
    category: "Circumstance & Proximity",
    internalInject: "A deadline has passed, the office has emptied, and they are the last two people in the building at 2am. The professional crisis has been processed. What remains is the specific intimacy of late nights, empty offices, and two people who have been through something together and are not quite ready to leave.",
  },
  {
    id: "cp_17",
    label: "She's guarding him. He doesn't think he needs guarding. She's been proven right twice.",
    category: "Circumstance & Proximity",
    internalInject: "She has been assigned to protect him — the assignment is professional and she is qualified. He disagrees with the assessment of his risk and makes her job difficult. She has been correct twice about threats he dismissed. The story explores the dynamic between protection and resistance, and what changes when the protected person begins to pay attention.",
  },
  {
    id: "cp_18",
    label: "The retreat is meant to be silent. They find a way.",
    category: "Circumstance & Proximity",
    internalInject: "They are at a silent retreat — structured, facilitated, with explicit rules about verbal communication. The silence is enforced. The story explores how two people who cannot speak to each other develop an entire conversation that doesn't use words.",
  },
  {
    id: "cp_19",
    label: "She's been assigned to him. It's professional. Everything else is not.",
    category: "Circumstance & Proximity",
    internalInject: "An assignment — administrative, clinical, protective, journalistic — has placed her in sustained proximity to him. The assignment is clear and appropriate. The story lives in the territory around the assignment: what grows in the spaces professional requirements don't reach.",
  },
  {
    id: "cp_20",
    label: "She's the only other passenger on the boat. Three days on the water.",
    category: "Circumstance & Proximity",
    internalInject: "A sailing trip, a river crossing, a passage somewhere — three days on a vessel with nowhere else to go. She is the only other passenger. The water is the boundary. The story is built on what three days of forced, inescapable proximity produces between two people who begin as strangers.",
  },

  // ── SECRETS & UNSPOKEN ─────────────────────────────────────────────────────
  {
    id: "su_01",
    label: "He knows how she feels. He has known for a year. He's been waiting for her to say it first.",
    category: "Secrets & Unspoken",
    internalInject: "The asymmetry is specific: he has known for a year, she believes she has hidden it, he has been waiting with a patience that is not passive but deliberate. The story is built on the moment the waiting ends — whether she speaks first or he stops waiting.",
  },
  {
    id: "su_02",
    label: "She's been pretending not to notice. He's been pretending not to notice that she's pretending.",
    category: "Secrets & Unspoken",
    internalInject: "A layered pretence: she is performing unawareness, he is performing acceptance of that performance. Both are aware that the performance exists. The story lives in this double pretence — what it is protecting, what it costs, and when it becomes impossible to maintain.",
  },
  {
    id: "su_03",
    label: "The secret she's keeping would change what he thinks of her. She's not sure she wants him to know her differently.",
    category: "Secrets & Unspoken",
    internalInject: "She holds something back — not from shame but from a more complicated motive: the version of herself he knows is not false, but it is incomplete, and the completion would change the relationship. She has grown attached to being known in this particular, limited way. The story explores the cost of partial revelation.",
  },
  {
    id: "su_04",
    label: "He's never said what he actually does. She's never asked. Both understand this is intentional.",
    category: "Secrets & Unspoken",
    internalInject: "A gap in their knowledge of each other that both have respected without discussion — he has never disclosed his actual occupation or activities, she has never pressed. The mutual silence is not incuriosity; it is a consent they've both given without naming it. The story explores what it means to choose someone while deliberately not knowing everything.",
  },
  {
    id: "su_05",
    label: "She found something. She hasn't said anything. He knows she found it.",
    category: "Secrets & Unspoken",
    internalInject: "She has discovered something — an object, a message, a piece of information — that she was not supposed to see. She has not brought it up. He knows, from a tell she doesn't know she has, that she found it. Both are operating in a space defined by the unspoken knowledge between them.",
  },
  {
    id: "su_06",
    label: "He has a reason for everything he does and none of them are what she thinks.",
    category: "Secrets & Unspoken",
    internalInject: "She has constructed explanations for his behaviour — why he is present when he is, what motivates his choices, what his attention means. Every explanation is plausible and incorrect. The story reveals the real reasons, and what they say about what he actually wants.",
  },
  {
    id: "su_07",
    label: "She wrote something she never intended to send. She sent it. He hasn't mentioned it.",
    category: "Secrets & Unspoken",
    internalInject: "She sent something — a message, a letter, something honest and unguarded — that she wrote for herself and sent by accident or by a moment of recklessness she immediately regretted. He has not mentioned it. The silence is its own kind of answer. The story is about what happens while they wait for someone to speak.",
  },
  {
    id: "su_08",
    label: "He has been the reason for three good things that happened to her this year. She doesn't know his name.",
    category: "Secrets & Unspoken",
    internalInject: "Three separate significant things in her life have been arranged, enabled, or caused by one person — acting at a distance, without acknowledgment. She is unaware of the connection. The story begins when she meets the person responsible and the pattern reveals itself.",
  },
  {
    id: "su_09",
    label: "She knows the end of this story before it begins. She decides to begin it anyway.",
    category: "Secrets & Unspoken",
    internalInject: "She understands the situation clearly — what is likely to happen, how it probably ends, what she is choosing by beginning it. She is not naive. She has decided to begin it anyway, with full knowledge and open eyes. The story honours that choice by exploring what conscious, informed desire feels like.",
  },
  {
    id: "su_10",
    label: "He has a past that intersects with hers in a way she hasn't discovered yet.",
    category: "Secrets & Unspoken",
    internalInject: "Their histories are connected by a fact neither has named — something in the past links them more closely than their present relationship suggests. He may or may not know. She does not. The story holds the tension of the undisclosed connection and the moment it surfaces.",
  },
  {
    id: "su_11",
    label: "She said something once that changed him completely. She doesn't know she said it.",
    category: "Secrets & Unspoken",
    internalInject: "She made a comment — casual, unguarded, perhaps not even directed specifically at him — that altered the direction of his thinking or behaviour in a significant way. She has no memory of saying it. The story is about the weight of an accidental impact and what happens when he tells her.",
  },
  {
    id: "su_12",
    label: "He's kept something for her for years. He's waiting for the right moment. There is none.",
    category: "Secrets & Unspoken",
    internalInject: "He holds something — an object, a letter, a piece of information — that belongs to her in some sense. He has been waiting for the right moment to give it. The right moment keeps not arriving. The story is about the impossibility of the perfect moment and the decision to give something anyway.",
  },
  {
    id: "su_13",
    label: "She overheard something she was not meant to hear. Everything she does next is shaped by it.",
    category: "Secrets & Unspoken",
    internalInject: "An accidental disclosure — a sentence caught in passing, a conversation not meant for her ears — has changed what she knows and what she wants. Every subsequent interaction is shaped by information she shouldn't have. The story explores the specific weight of unasked-for knowledge.",
  },
  {
    id: "su_14",
    label: "He knows who she really is. She's been careful about not being known. He's more careful.",
    category: "Secrets & Unspoken",
    internalInject: "She has maintained a version of herself — public, controlled, managed. He has seen through it or around it to something closer to who she actually is. She doesn't know he's seen it. He hasn't used the knowledge as leverage — he's been more careful with it than she has been with herself. The story explores what it means to be truly known.",
  },
  {
    id: "su_15",
    label: "The truth would make this simple. Neither of them wants it to be simple.",
    category: "Secrets & Unspoken",
    internalInject: "A disclosure exists that would resolve the ambiguity between them — explain everything, clarify everything, make the decision obvious. Neither of them has made it. The story explores what it means to prefer the complexity of uncertainty to the finality of knowing, and what that preference reveals about desire.",
  },
  {
    id: "su_16",
    label: "She's been testing him without telling him the conditions. He has passed every one.",
    category: "Secrets & Unspoken",
    internalInject: "She has had criteria — explicit in her own mind, never disclosed — by which she has been evaluating him. Each encounter has been a test he doesn't know he's taking. He has passed everything she put in front of him, without ever knowing what was being measured. The story begins when she recognises that she has run out of tests.",
  },
  {
    id: "su_17",
    label: "He left her a message she found years later. She's looking for him.",
    category: "Secrets & Unspoken",
    internalInject: "A message — physical or digital, placed where she might eventually find it — was left for her. She found it years after it was left. It changes her understanding of something she thought she understood. She is now looking for the person who left it. The story is the search and what she intends to say.",
  },
  {
    id: "su_18",
    label: "She knows the real version of the story everyone tells about him. It's better than the version he tells himself.",
    category: "Secrets & Unspoken",
    internalInject: "He carries a story about himself — his failures, his choices, the version of his past he has settled into — and it is harder on him than the facts warrant. She has access to the real version: through a source, a document, an account that he doesn't know she's read. The story is about what she does with kinder knowledge than he holds about himself.",
  },
  {
    id: "su_19",
    label: "He has a file on her. Not because he was suspicious. He's always been thorough about her.",
    category: "Secrets & Unspoken",
    internalInject: "He has kept records — of her work, her history, her decisions — not from surveillance but from a specific and long-standing attention to everything she has done. The file is not threatening; it is, in its way, a monument to paying attention. The story is the moment she discovers it.",
  },
  {
    id: "su_20",
    label: "She's about to tell him something that will change everything. She's decided it's time.",
    category: "Secrets & Unspoken",
    internalInject: "She has arrived at a decision — after deliberation, over time, at significant personal cost — to tell him something true. She is about to do it. The story is the disclosure: not the before or after, but the moment itself and what she discovers in him when she makes herself known.",
  },

  // ── DARK & DANGEROUS ───────────────────────────────────────────────────────
  {
    id: "dd_01",
    label: "He's protecting her from a threat she doesn't know exists. The closer he gets, the less impartial he is.",
    category: "Dark & Dangerous",
    internalInject: "He has information about a risk to her that she doesn't know she faces. His protection is real and necessary. The problem is that sustained proximity to her is eroding his professional distance faster than the threat is. The story explores the specific danger of protecting someone you are becoming unable to be impartial about.",
  },
  {
    id: "dd_02",
    label: "She walked into something she doesn't understand. He's the only one who can explain it. He has reasons not to.",
    category: "Dark & Dangerous",
    internalInject: "She has become involved in something — a situation, a world, a conflict — that she entered without adequate information. He understands what she's in. He has specific reasons not to tell her — reasons that are not entirely about her safety and are partly about what her knowing would cost him. The story is his decision.",
  },
  {
    id: "dd_03",
    label: "They're on opposite sides of something that isn't legal. Both chose to be there.",
    category: "Dark & Dangerous",
    internalInject: "The setting is grey — both of them are operating in territory that exists outside legal definition, by choice, with awareness. They are on different sides of the same grey area. The story explores desire between two people who have both decided that certain rules don't apply to them and are now navigating each other.",
  },
  {
    id: "dd_04",
    label: "He's dangerous in a documented, evidenced way. She's the only person who isn't afraid of it.",
    category: "Dark & Dangerous",
    internalInject: "His reputation is real and specific — not rumour, not performance, documented by events and outcomes. Everyone who knows what he is gives him appropriate distance. She does not. Her absence of fear is not ignorance; it is something else, and the story explores what it is and what he does with it.",
  },
  {
    id: "dd_05",
    label: "She's been undercover for six months. The person she's investigating has made it personal.",
    category: "Dark & Dangerous",
    internalInject: "Six months of sustained undercover work — a created identity, a maintained performance, a professional objective. The person she's investigating has developed something for her that she did not design for and cannot cleanly extract herself from. The story holds the weight of six months of pretending and what it means when the pretending stops working.",
  },
  {
    id: "dd_06",
    label: "He works in a field that guarantees a short life. She's decided to stop thinking about that.",
    category: "Dark & Dangerous",
    internalInject: "His occupation carries a specific, actuarial risk — the life expectancy of people in his field is demonstrably shortened. She has spent time thinking about this and has made a decision to stop. The story explores desire that exists under the specific weight of a known, approaching loss, and what it means to choose someone anyway.",
  },
  {
    id: "dd_07",
    label: "The job is to keep him alive. He's not cooperating. She's running out of professional reasons to care this much.",
    category: "Dark & Dangerous",
    internalInject: "She is professionally responsible for his survival. He underestimates or dismisses the risk, makes her job difficult, doesn't take precautions she requires. Her professional motivation should be sufficient. The story is about the moment her professional reasons for caring stop being the only reasons, and what that does to the dynamic.",
  },
  {
    id: "dd_08",
    label: "She knows something that makes her a target. He's the reason she's still safe. She doesn't know that.",
    category: "Dark & Dangerous",
    internalInject: "She possesses information that makes her vulnerable to a threat she is aware of. What she doesn't know is that she has been protected — by someone, for reasons she hasn't been given, at a cost she hasn't been told about. The story is about discovering the protection and the protector.",
  },
  {
    id: "dd_09",
    label: "He was supposed to be the threat. She's the reason that assignment is over.",
    category: "Dark & Dangerous",
    internalInject: "He entered her life as a designed presence — a planted threat, an adversary positioned nearby. Something about her — something specific and irreducible — made it impossible to complete the assignment. He is trying to manage the consequences of that impossibility. The story explores what you do when the person you were sent to harm is the person who made you unable to.",
  },
  {
    id: "dd_10",
    label: "They're both operating in the same grey area for different clients. The conflict of interest is not professional.",
    category: "Dark & Dangerous",
    internalInject: "Both are operating outside conventional structures — mercenaries of a kind, in a world with grey edges. They have intersecting areas of operation. Their professional conflict of interest is manageable. The personal one is not. The story explores desire between two people who know each other's rules because they share the same world.",
  },
  {
    id: "dd_11",
    label: "She's the fixer. He's the problem. She's beginning to understand why nobody's solved it.",
    category: "Dark & Dangerous",
    internalInject: "She has a professional reputation for solving difficult situations. He is the current difficult situation — complex, resistant, and proving unexpectedly difficult to manage. The story explores the specific experience of meeting someone you're supposed to fix who turns out to be someone you can't reduce to a problem.",
  },
  {
    id: "dd_12",
    label: "He's been paid to disappear. She's the reason he can't.",
    category: "Dark & Dangerous",
    internalInject: "He has an arrangement — financial, professional, protective — that requires him to vanish from his current life. He has been unable to execute it. She is the specific reason. The story is about the impossibility of leaving when the thing holding you is the most real thing in an unreal situation.",
  },
  {
    id: "dd_13",
    label: "The information she's looking for would put her in danger. He knows where it is.",
    category: "Dark & Dangerous",
    internalInject: "She is pursuing something — information, evidence, a truth — that would significantly increase her personal risk if she obtained it. He has what she's looking for and knows the cost. His decision about whether to give it to her is the centre of the story.",
  },
  {
    id: "dd_14",
    label: "She found him before the people looking for him did. She hasn't decided what to do with that.",
    category: "Dark & Dangerous",
    internalInject: "Others are searching for him — with purpose, with resources, with intentions that are not benign. She has located him first. She has not turned him in, has not left, has not decided anything. The story is built inside her indecision: what she does with the fact that she found him and what that choice reveals.",
  },
  {
    id: "dd_15",
    label: "He has a specific skill set she's not supposed to need. She needs it.",
    category: "Dark & Dangerous",
    internalInject: "He is capable of something she had categorised as outside the range of things she would ever require. The situation she is in has changed that categorisation. She needs exactly what he can provide and cannot get it elsewhere. The story holds the specific intimacy of needing someone you had ruled out.",
  },
  {
    id: "dd_16",
    label: "The border they've crossed is metaphorical as well as geographic.",
    category: "Dark & Dangerous",
    internalInject: "They have crossed into somewhere — another country, another jurisdiction, another world — where different rules apply. The geographic border crossing is literal. The metaphorical one — into something between them that neither would have permitted at home — has also occurred. The story holds both crossings.",
  },
  {
    id: "dd_17",
    label: "She's the only witness. He's the only protection. The people coming know both of these things.",
    category: "Dark & Dangerous",
    internalInject: "She is the only person who saw what happened. He is the only person positioned to keep her safe. Both of these facts are known by the people trying to reach them. The story holds them in a specific, high-stakes proximity: needed by each other in exactly equal measure.",
  },
  {
    id: "dd_18",
    label: "He chose the right side a long time ago. She's the reason he's reconsidering.",
    category: "Dark & Dangerous",
    internalInject: "He made a principled choice — about allegiance, about values, about which side of something he stands on — and has maintained it. She represents something that is pulling him toward a reconsideration he did not anticipate. The story explores the specific experience of having your convictions complicated by a person.",
  },
  {
    id: "dd_19",
    label: "The threat level has been raised. The two of them in close quarters for an extended period is the solution and the problem.",
    category: "Dark & Dangerous",
    internalInject: "An escalated risk requires a specific response: sustained proximity between them. The proximity is both the safest solution and the most destabilising one. The story holds the double meaning of close quarters — as protection and as the thing that needs to be protected against.",
  },
  {
    id: "dd_20",
    label: "She's been told to trust no one. He's the only person she can't maintain that rule around.",
    category: "Dark & Dangerous",
    internalInject: "She is operating under explicit instructions about trust — given for good reasons, by people who know the situation. He is the single exception she cannot maintain. The story explores the specific experience of being unable to apply a rule you believe in to one specific person.",
  },

  // ── SLOW BURN & PATIENCE ───────────────────────────────────────────────────
  {
    id: "sb_01",
    label: "They have known each other for three years. They have been careful for three years. Tonight something tips.",
    category: "Slow Burn & Patience",
    internalInject: "Three years of managed proximity — of knowing, of wanting, of choosing caution. Neither has been careless. Tonight, something small and specific tips the balance. The story honours all three years by capturing the exact weight of the moment the careful balance finally shifts.",
  },
  {
    id: "sb_02",
    label: "He's been building toward something specific without her knowing. She's been waiting for exactly that without knowing it.",
    category: "Slow Burn & Patience",
    internalInject: "A parallel structure: he has been moving deliberately toward something specific, and she has been waiting for precisely that thing without knowing it was being built. The story is the meeting of these two private directions — the discovery that they have been converging toward the same point from different angles.",
  },
  {
    id: "sb_03",
    label: "She wrote him off. He proved her wrong with patience rather than argument.",
    category: "Slow Burn & Patience",
    internalInject: "She made a judgment — early, confident, partly wrong — and dismissed him from the category of people she was interested in. He did not argue. He simply continued to be himself with enough consistency and patience that her original judgment became impossible to maintain. The story is about the specific experience of being proved wrong by someone who never insisted on it.",
  },
  {
    id: "sb_04",
    label: "Every time they meet, they leave something unsaid. The unsaid things are beginning to accumulate.",
    category: "Slow Burn & Patience",
    internalInject: "Each encounter ends with something left in the room — a sentence not completed, a response withheld, a moment allowed to pass. The accumulation is becoming its own pressure. The story is built on the weight of everything that has been left unsaid and the moment the weight becomes impossible.",
  },
  {
    id: "sb_05",
    label: "He waits. It's not a strategy. It's a specific kind of love.",
    category: "Slow Burn & Patience",
    internalInject: "He is patient with her — not tactically, not as a method, but because the waiting is itself an expression of what he feels. He is not building leverage; he is simply remaining, consistently, in a way that says something specific about how he values her. The story is about what it feels like to be waited for by someone who means it.",
  },
  {
    id: "sb_06",
    label: "She keeps finding reasons to leave. He keeps not giving her real ones.",
    category: "Slow Burn & Patience",
    internalInject: "She generates justifications for distance — reasons that are plausible and largely transparent. He never provides the real reason she is looking for: an actual conflict, an incompatibility, a failure she can point to. His not-failing is the problem. The story explores the specific difficulty of leaving someone who keeps giving you no reason to.",
  },
  {
    id: "sb_07",
    label: "They've been in the same room dozens of times. They've never been alone. Tonight they are.",
    category: "Slow Burn & Patience",
    internalInject: "Dozens of encounters in shared social contexts — always in groups, always with others present as a structural protection against what both of them feel. Tonight, there is no one else. The structure that allowed them to be in proximity without acting on it has been removed. The story is about the first time alone.",
  },
  {
    id: "sb_08",
    label: "He's been consistent for two years. She's been avoiding giving him reason to stop.",
    category: "Slow Burn & Patience",
    internalInject: "Two years of consistent, careful presence from him. She has not discouraged it and has not encouraged it — a middle state that she has maintained with some deliberateness. The story is about what she's been protecting by staying in the middle, and what it costs her to examine that.",
  },
  {
    id: "sb_09",
    label: "She told him it wasn't the right time. He agreed. He's still here, two years later.",
    category: "Slow Burn & Patience",
    internalInject: "She gave him a reason that was honest but also incomplete: the timing. He accepted this. He has remained — not insistently, not obviously, but present. Two years have passed. The timing she offered as a reason has run out. The story is about what happens when the stated reason expires.",
  },
  {
    id: "sb_10",
    label: "They've been communicating in small gestures for so long neither knows how to use words.",
    category: "Slow Burn & Patience",
    internalInject: "A language has developed between them that is entirely physical and gestural — slight adjustments of proximity, objects placed with intention, timing that says something precise. Words were never used and now feel both unnecessary and impossibly large. The story explores what happens when the gesture language needs to become something spoken.",
  },
  {
    id: "sb_11",
    label: "He's the most patient person she's ever encountered. She's testing the limit of it.",
    category: "Slow Burn & Patience",
    internalInject: "His patience is remarkable and she has noticed it with a specific, private attention. She has also been, with some awareness, testing it — presenting difficulties, withdrawals, provocations that are partly genuine and partly investigative. The story is about what happens when she reaches the limit and finds it isn't where she expected.",
  },
  {
    id: "sb_12",
    label: "She keeps telling herself this isn't happening. It's been happening for eighteen months.",
    category: "Slow Burn & Patience",
    internalInject: "She has maintained a private narrative that contradicts the evidence — that this is nothing, that she is managing it, that it will resolve itself. The evidence has been accumulating for eighteen months. The story is the moment the narrative becomes impossible to sustain and what she finds in the silence after.",
  },
  {
    id: "sb_13",
    label: "He made one comment about what he actually wants. She has been thinking about it since.",
    category: "Slow Burn & Patience",
    internalInject: "He said something once — one specific sentence, said without apparent calculation — that revealed something genuine about what he wants. She has carried that sentence. The story is what she does when she is finally in a position to respond to it.",
  },
  {
    id: "sb_14",
    label: "She offered friendship. He accepted. Neither has been behaving like friends.",
    category: "Slow Burn & Patience",
    internalInject: "The category was clearly defined: friendship, with all its appropriate limits. Both accepted the definition. Neither is behaving according to it — in the quality of their attention, the texture of their care, the specific frequency with which they appear to each other. The story is about the gap between the stated category and the actual relationship.",
  },
  {
    id: "sb_15",
    label: "He's been the constant. She's been the variable. Eventually a variable finds its value.",
    category: "Slow Burn & Patience",
    internalInject: "He has remained fixed — in his feelings, his presence, his way of being with her. She has been the one changing: in circumstance, in decision, in what she allows herself to want. The story is the moment the variable resolves. She finds her value and it's been next to a constant all along.",
  },
  {
    id: "sb_16",
    label: "They've been performing professionalism so long it's become a private joke. Tonight nobody's laughing.",
    category: "Slow Burn & Patience",
    internalInject: "The professional distance between them has been performed so consistently and for so long that both are aware of its artificial quality. It has become a shared, unacknowledged joke — the performance of formality between two people who know each other in a different register. Tonight the performance has stopped being funny. The story is what fills the space when the joke ends.",
  },
  {
    id: "sb_17",
    label: "She finally asks the question she's been not asking. His answer takes four words.",
    category: "Slow Burn & Patience",
    internalInject: "She has been carrying an unasked question — something specific, something that would change the shape of what is between them. She asks it. His answer is brief: four words. The story is the asking, the answer, and what the brevity of it contains.",
  },
  {
    id: "sb_18",
    label: "He has never once pushed. She's realising that that is the thing.",
    category: "Slow Burn & Patience",
    internalInject: "He has not pushed for anything — not more access, not acknowledgment, not reciprocation. The absence of pressure is itself the thing she is now responding to. The story explores the specific attractiveness of someone who wants you without requiring that you perform it back.",
  },
  {
    id: "sb_19",
    label: "The patience is not patience. It's certainty. She's learning the difference.",
    category: "Slow Burn & Patience",
    internalInject: "What she read as patience — restraint, waiting — is something else: certainty. He is not waiting to see if she will come around. He already knows she will. The story is about her discovering this distinction and what it does to her to be known that well before she knows herself.",
  },
  {
    id: "sb_20",
    label: "They finally have the conversation they've been having in subtext for a year.",
    category: "Slow Burn & Patience",
    internalInject: "For a year, every conversation between them has been about something else in its surface content and about this in its actual content. The subtext has been conducting an entire relationship while the text maintained plausible deniability. Tonight they have the actual conversation. The story is that conversation.",
  },

  // ── PROFESSIONAL & CROSSING LINES ──────────────────────────────────────────
  {
    id: "pl_01",
    label: "She hired him to do something that has become much more than that.",
    category: "Professional & Crossing Lines",
    internalInject: "She engaged his professional services for a defined purpose. The engagement has expanded past its original scope — not because either of them extended it deliberately, but because the work itself has created an intimacy neither of them designed for. The story holds the transition from professional arrangement to something that doesn't have a category.",
  },
  {
    id: "pl_02",
    label: "He wrote her performance review. The most honest thing anyone has written about her. She read it three times.",
    category: "Professional & Crossing Lines",
    internalInject: "A professional document — structured, formal, intended for administrative purposes — turned out to be the most accurate account of her anyone has produced. He wrote it. She read it three times. The story is about what it means to be seen that clearly by someone in a professional capacity, and what that seeing creates.",
  },
  {
    id: "pl_03",
    label: "They travel for work six times a year. The hotel rooms are separate. The evenings are not.",
    category: "Professional & Crossing Lines",
    internalInject: "Six work trips a year, year after year — professional days in conference rooms and client meetings, and then evenings that have developed their own rules. The hotel rooms are separately booked. The evenings are not separately spent. The story holds the particular world that develops in the time-between-professional-obligations.",
  },
  {
    id: "pl_04",
    label: "She's the client. He's the consultant. The problem keeps not being solved.",
    category: "Professional & Crossing Lines",
    internalInject: "She hired him to solve a specific problem. The engagement has extended because the problem has not been resolved. She has begun to notice that neither of them seems particularly focused on concluding the engagement. The story explores what happens when professional necessity becomes a preferred alibi for continued proximity.",
  },
  {
    id: "pl_05",
    label: "He mentored her for three years. She's not his mentee anymore. He's still adjusting to that.",
    category: "Professional & Crossing Lines",
    internalInject: "Three years in which the relationship was clearly defined: mentor, mentee, the hierarchy clear and the roles appropriate. She has grown into something that no longer fits that framework. He is adjusting to the dissolution of a structure that kept certain feelings properly managed. The story is the adjustment period.",
  },
  {
    id: "pl_06",
    label: "She's the investor. He's the founder. The equity is not the most complicated thing between them.",
    category: "Professional & Crossing Lines",
    internalInject: "A formal, high-stakes financial relationship: she holds equity in what he built. Their professional relationship involves significant money and ongoing obligation. The equity structure is complex and legally documented. The story explores what grows in the space around a professional relationship that carries that much weight.",
  },
  {
    id: "pl_07",
    label: "They share an assistant. The assistant has been running interference for six months. She just quit.",
    category: "Professional & Crossing Lines",
    internalInject: "Their shared assistant has been, for six months, the structural buffer that managed their schedule conflicts, kept their professional relationship orderly, and — not incidentally — prevented the kind of direct contact that both of them have been finding harder to avoid. She has just resigned. The buffer is gone.",
  },
  {
    id: "pl_08",
    label: "She's his editor. The book is the most personal thing he's ever written. She knows things he didn't intend to share.",
    category: "Professional & Crossing Lines",
    internalInject: "She is editing his most private work — intimate, autobiographical, or so specific that its origins are unmistakable. The editorial relationship has given her access to versions of him that no one else sees. She knows things he did not consciously choose to share with her. The story explores the intimacy of that kind of reading.",
  },
  {
    id: "pl_09",
    label: "They present together quarterly to the board. The chemistry in the room is the one thing in neither presentation.",
    category: "Professional & Crossing Lines",
    internalInject: "Four times a year, they present a unified professional front — polished, aligned, effective. Everyone in the room notices something between them that never appears in the slide deck. The presentations are excellent. The dynamic that the board keeps commenting on to each other is the story.",
  },
  {
    id: "pl_10",
    label: "He's the architect. She's living in the house he designed. She wants to change something. He has opinions.",
    category: "Professional & Crossing Lines",
    internalInject: "He designed the space she lives in — with intention, with specificity, with a vision that was complete before she moved in. She has been living in his thinking for months. She wants to change one thing. He has strong opinions. The argument is architectural and about something else entirely.",
  },
  {
    id: "pl_11",
    label: "She's been his assistant for two years. She gave four weeks' notice.",
    category: "Professional & Crossing Lines",
    internalInject: "Two years of close, daily professional proximity. She has given notice — four weeks of remaining time in which the dynamic changes. She is leaving. He is adjusting to the reality of that. The notice period is its own kind of intensity: close enough to see everything, close enough to the end that things that were never said are beginning to be impossible to keep unsaid.",
  },
  {
    id: "pl_12",
    label: "The job description didn't mention him. He's the reason she took the position.",
    category: "Professional & Crossing Lines",
    internalInject: "She accepted the role for stated professional reasons. The actual reason — or a significant part of it — was the knowledge that he would be there. She has not admitted this, even to herself, with much clarity. The story is about what happens when the unstated reason for a major decision has to be reckoned with.",
  },
  {
    id: "pl_13",
    label: "He's the surgeon. She's the anaesthetist. The OR requires absolute professionalism. Everywhere else is not the OR.",
    category: "Professional & Crossing Lines",
    internalInject: "In the operating room they are exactly what they are professionally — precise, aligned, beyond reproach. The OR requires it and they give it without effort. The story is about everywhere that is not the OR: the corridors, the changing rooms, the hospital cafeteria at 7am — the spaces where the professional requirement has less claim on them.",
  },
  {
    id: "pl_14",
    label: "They've been co-writing something for eight months. It's very good. So is everything else.",
    category: "Professional & Crossing Lines",
    internalInject: "Eight months of collaborative creative work — shared documents, long calls, arguments about sentences, a shared investment in something that is genuinely good. The work is the official relationship. Everything happening alongside the work — the rhythm of their communication, the way they understand each other, the difficulty of ending calls — is the story.",
  },
  {
    id: "pl_15",
    label: "He's been recruited to replace her. She's been asked to train him.",
    category: "Professional & Crossing Lines",
    internalInject: "The organisation has hired him to take her role — she is moving on, retiring, or being moved. She has been asked to train her own replacement. The situation is structured to be professional and straightforward. The story is about what happens when the person you're supposed to hand everything to is someone you find unexpectedly difficult to hand anything to.",
  },
  {
    id: "pl_16",
    label: "She's the art director. He's the photographer. The shoot is in three days.",
    category: "Professional & Crossing Lines",
    internalInject: "A creative collaboration with a deadline: three days before the shoot, multiple meetings, creative disagreements, and an accumulating tension that is only partly about the work. The professional dynamic gives both of them legitimate reasons to be in each other's space. The story explores what that legitimate proximity creates.",
  },
  {
    id: "pl_17",
    label: "He's been her therapist for a year. She terminated the relationship last month. He's been waiting to call.",
    category: "Professional & Crossing Lines",
    internalInject: "A year of therapeutic relationship — bounded, ethical, asymmetric. She terminated correctly and formally one month ago. He has been waiting. The professional relationship has ended; the ethical questions about what comes after are precisely calibrated and the story lives in them.",
  },
  {
    id: "pl_18",
    label: "They closed the deal. The biggest negotiation of both their careers. Someone ordered champagne. Nobody went home.",
    category: "Professional & Crossing Lines",
    internalInject: "The negotiation is over — a significant, career-defining agreement reached after sustained difficulty. The release of tension is real. The champagne is real. The professional reason for being in the same room no longer applies. Neither of them has moved toward the exit. The story is everything that happens after the deal is done.",
  },
  {
    id: "pl_19",
    label: "She's the crisis manager. He's the crisis. She's never failed to resolve one before.",
    category: "Professional & Crossing Lines",
    internalInject: "She has a professional reputation built on her ability to manage, contain, and resolve difficult situations. He has been presented to her as a situation requiring her particular skills. The problem is that the usual tools don't work on him — not because he's resistant but because she is finding it difficult to apply them. The story is her first professional failure.",
  },
  {
    id: "pl_20",
    label: "She promoted him. He's now her peer. Everything that wasn't possible before now is.",
    category: "Professional & Crossing Lines",
    internalInject: "She used her authority to advance him to a level beside her own. The hierarchical barrier that made certain feelings manageable has dissolved by her own decision. Both are adjusting to what the dissolution means. The story is the first encounter as equals after the change.",
  },

  // ── HER DESIRE ─────────────────────────────────────────────────────────────
  {
    id: "hd_01",
    label: "He's been watching her all evening. She knows. She hasn't moved closer. She doesn't have to.",
    category: "Her Desire",
    allowedPairings: ["Her & Him", "Her & Her"],
    internalInject: "He has been watching her with the particular attention of someone who has made up his mind but hasn't said so. She is aware of it — she has been aware of it since he looked over the first time. She has not moved toward him, and she hasn't needed to. The whole evening is the tension of her knowing exactly what it means, and being unhurried about it.",
  },
  {
    id: "hd_02",
    label: "He noticed things she didn't know she'd let show. She didn't ask how. She was glad he had.",
    category: "Her Desire",
    allowedPairings: ["Her & Him", "Her & Her"],
    internalInject: "He has observed things about her that she didn't realise she had made visible — small preferences, small tells, the specific way she holds herself when she is trying not to feel what she is feeling. She didn't ask how he knew, because asking would have required explaining she was touched by it. She is glad he noticed. The story lives in the warmth of being seen accurately by someone who didn't broadcast it.",
  },
  {
    id: "hd_03",
    label: "She came home to find everything already done. He didn't mention it. He didn't need to.",
    category: "Her Desire",
    allowedPairings: ["Her & Him", "Her & Her"],
    internalInject: "She came back to find that something difficult had already been taken care of — entirely, correctly, without being asked. He said nothing about it. He didn't wait for credit or acknowledgement. The story lives in what it means to be cared for without being made to feel grateful — it was done because she needed it, full stop.",
  },
  {
    id: "hd_04",
    label: "He asked her what she wanted. He listened the whole way through. Then he went and did it.",
    category: "Her Desire",
    allowedPairings: ["Her & Him", "Her & Her"],
    internalInject: "He asked what she wanted — not as a courtesy, not as a preamble to redirecting the conversation toward what he preferred. He listened completely, without interjecting. Then he did exactly what she said. The story lives in how unusual it is to be asked something and have the person actually mean it — and what it does to her.",
  },
  {
    id: "hd_05",
    label: "She had the worst week of her year. He showed up with the right thing. She didn't know she'd needed it.",
    category: "Her Desire",
    allowedPairings: ["Her & Him", "Her & Her"],
    internalInject: "She has had an exceptionally difficult week and has said almost nothing about it. He appeared — not intrusively, not with questions she didn't want — but with the specific thing that was correct for this particular moment. She didn't know she had needed it until it was in front of her. The story lives in the collision of exhaustion, relief, and the dawning realisation that someone had been paying close attention.",
  },
  {
    id: "hd_06",
    label: "He tells her exactly what she does to him. Not as flattery. As fact. She believes him.",
    category: "Her Desire",
    allowedPairings: ["Her & Him", "Her & Her"],
    internalInject: "He tells her what she does to him with the flatness of stating something true rather than the performance of flattery. There is no embellishment, no hyperbole — only the specific and accurate account of what happens to him when she is near. She believes him. The story lives in being the object of a wanting that is precise, sincere, and not trying to impress her.",
  },
  {
    id: "hd_07",
    label: "She walked into the room and he stopped mid-sentence. He's still looking.",
    category: "Her Desire",
    allowedPairings: ["Her & Him", "Her & Her"],
    internalInject: "She walked in and he lost the thread of what he was saying — not from shyness but from attention. He stopped, he noticed her, and he is still looking. He has not tried to pretend he wasn't. The story lives in the experience of being seen, fully and unambiguously, by someone who is not embarrassed about it.",
  },
  {
    id: "hd_08",
    label: "He waits. Not impatiently. Not performing patience. He simply waits, and she knows what that means.",
    category: "Her Desire",
    allowedPairings: ["Her & Him", "Her & Her"],
    internalInject: "He waits for her with a quality of attention that is not restlessness held in check. He is not demonstrating patience. He is simply there, present, unhurried, with no apparent need for her to speed up or acknowledge him. She understands what that kind of waiting signals. The story lives in the particular wanting that comes from someone who would genuinely keep waiting.",
  },
  {
    id: "hd_09",
    label: "She is the thing he can't stop talking about. She found out from someone else. He doesn't know she knows.",
    category: "Her Desire",
    allowedPairings: ["Her & Him", "Her & Her"],
    internalInject: "She has learned, through a third party, that he talks about her — frequently, specifically, with an intensity that surprised the person he told. He does not know she knows this. She has said nothing. The story lives in the power of knowing she is the subject of a private devotion she was never supposed to be aware of.",
  },
  {
    id: "hd_10",
    label: "He's been rearranging things to make her comfortable. He hopes she hasn't noticed. She has.",
    category: "Her Desire",
    allowedPairings: ["Her & Him", "Her & Her"],
    internalInject: "Without saying anything, he has been adjusting small things to suit her — the temperature, the seating, the arrangement of the evening. He appears to hope she won't notice, as though the act of care matters more than the credit for it. She has noticed everything. The story lives in the tenderness of being tended to by someone who isn't asking for recognition.",
  },
  {
    id: "hd_11",
    label: "She didn't ask for any of it. He gave it anyway. She is trying to work out what to do with someone like this.",
    category: "Her Desire",
    allowedPairings: ["Her & Him", "Her & Her"],
    internalInject: "She made no requests. She asked for nothing, indicated nothing. What she needed appeared anyway, quietly, correctly. She is now trying to understand what to do with someone whose attention is this accurate, this unasked-for, this reliable. The story lives in the particular disorientation of being genuinely cared for — and the pull toward someone who operates that way.",
  },
  {
    id: "hd_12",
    label: "He remembers everything. The small things. The things she said once, briefly, half-meaning it. He remembered.",
    category: "Her Desire",
    allowedPairings: ["Her & Him", "Her & Her"],
    internalInject: "He remembers things she said once, in passing, half as observation, half as preference — things she had no expectation of being retained. He references them now, naturally, as though they were obviously worth keeping. The story lives in the intimacy of being remembered accurately by someone who was listening more carefully than she realised.",
  },
  {
    id: "hd_13",
    label: "She is the version of herself she likes most when she's with him. She's only just realised this.",
    category: "Her Desire",
    allowedPairings: ["Her & Him", "Her & Her"],
    internalInject: "She has noticed — only recently — that when she is with him, she is more herself than she usually is: easier, more honest, less performed. She hadn't been paying attention to it, and then suddenly she was. The story lives in the particular vulnerability of recognising that someone has made it safe to be exactly who you are, and what it does to her.",
  },
  {
    id: "hd_14",
    label: "He cancelled everything else. She found out through someone who saw. He still hasn't mentioned it.",
    category: "Her Desire",
    allowedPairings: ["Her & Him", "Her & Her"],
    internalInject: "He cleared his schedule for her — not as a declaration, not to be acknowledged, apparently not to be discussed. Someone who witnessed it told her. He has said nothing. The story lives in what it means to be made someone's priority by a person who didn't need her to know about it.",
  },
  {
    id: "hd_15",
    label: "She is, according to him, exactly what he was looking for before he knew he was looking.",
    category: "Her Desire",
    allowedPairings: ["Her & Him", "Her & Her"],
    internalInject: "He has said — to her, or to someone who told her — that she is the precise thing he was looking for before he knew he was looking for anything. He is not casting himself as the hero of his own realisation. He is simply naming what is true. The story lives in what it is to be named as someone's specific wanting — not as flattery, but as recognition.",
  },
];

export const SITUATION_CATEGORIES: string[] = [
  "Forbidden & Complicated",
  "Reunion & Return",
  "First & Unknown",
  "Power & Tension",
  "Psychological & Obsessive",
  "Circumstance & Proximity",
  "Secrets & Unspoken",
  "Dark & Dangerous",
  "Slow Burn & Patience",
  "Professional & Crossing Lines",
  "Her Desire",
];

export const VALID_SITUATION_IDS: Set<string> = new Set(
  SITUATIONS.map((s) => s.id)
);

/** @deprecated Use getSituationById — label-based lookup is ambiguous. */
export const VALID_SITUATION_LABELS: Set<string> = new Set(
  SITUATIONS.map((s) => s.label)
);

export function getSituationById(id: string): Situation | undefined {
  return SITUATIONS.find((s) => s.id === id);
}

/** @deprecated Use getSituationById instead. */
export function getSituationByLabel(label: string): Situation | undefined {
  return SITUATIONS.find((s) => s.label === label);
}

export function getSituationsByCategory(category: string): Situation[] {
  return SITUATIONS.filter((s) => s.category === category);
}
