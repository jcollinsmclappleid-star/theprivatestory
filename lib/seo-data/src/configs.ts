// Single source of truth for all SEO page content.
// Both the api-server SSR routes and the React SPA pages import from here.

import type { SEOPageConfig } from "./types.js";

export const adultAudioStoriesConfig: SEOPageConfig = {
  meta: { title: `Personalised Adult Audio Stories | The Private Story`, description: `Personalised adult audio stories created around your mood, tone, and preferences. Private, narrated, and built entirely for you. Not a library — your story, tonight.` },
  hero: { badge: `Personalised · Narrated · Private`, h1: `Adult Audio Stories — Personalised, Private, Made for You`, tagline: `Not a library of stories that might be for someone like you. A story created for you, tonight, around exactly what you want to feel.` },
  sections: [
    {
      h2: "The Problem with Existing Adult Audio Fiction",
      paragraphs: [
        "Adult audio fiction has a library problem. The dominant model — browse a catalogue, select from what exists, hope that someone's preferences align with yours closely enough — is borrowed from the era when content was scarce. When producing a piece of audio fiction was expensive and the distribution was physical, libraries of pre-produced content made sense. The model suited the constraints of the time.",
        "The constraints no longer exist. The technology to create personalised adult audio fiction — to generate an original story around your specific preferences, voice preferences, mood, tone, and dynamic choices, and to narrate it in a high-quality voice — is here. What has not yet widely shifted is the model: most platforms still operate as libraries, with personalisation meaning filters on a fixed catalogue rather than generation of something that is actually yours.",
        "The distinction matters more in adult fiction than in almost any other genre. The quality of the experience depends on specificity — on the story being about the right person, the right dynamic, the right emotional register, the right pacing. A story that is mostly right is substantially less satisfying than a story that is specifically right. The difference between a catalogue that includes something in the right general area and something created precisely around you is the difference between a shared experience and a private one.",
        "The Private Story is built on this distinction. The catalogue model is not what is being offered here. What is being offered is generation — original adult audio fiction created around your choices, your preferences, your mood for this particular session. Every time, for you.",
      ],
    },
    {
      h2: "What Personalised Means, Actually",
      paragraphs: [
        "Personalisation in adult audio fiction means more than selecting from dropdown options. It means that the story genuinely starts from your choices and builds outward — that the narrative voice, the character of the person in the story, the emotional register, the dynamic, and the pacing are all built around what you specified, rather than approximated from a nearest-fit in an existing library.",
        "In practice, this means that when you choose the specific quality of the character — assured rather than aggressive, attentive rather than possessive, confident rather than domineering — the story written around that character actually has those qualities, not a generic version that could be any of the above. The precision of the fiction is proportional to the precision of the choices.",
        "It also means that the story's emotional register — what you want to feel, the specific quality of the connection you want to be inside — shapes the narrative from the first sentence. A story intended to feel quietly electric and slow is different from the first sentence, not just in its plot events but in its prose texture, its pacing, its specific quality of attention. Personalisation at the level of generation produces this kind of specificity. Personalisation at the level of filtering does not.",
        "The voice matters too. Narration that suits the story's register — a voice that has the warmth, depth, and quality to carry the emotional texture of what has been written — is the difference between fiction that lands and fiction that technically exists. At The Private Story, narration via ElevenLabs is selected to complement the specific tone of each story.",
      ],
    },
    {
      h2: "Adult Audio Fiction and Privacy",
      paragraphs: [
        "Adult fiction has specific privacy requirements that general fiction platforms do not share. The preferences involved in adult audio fiction — the specific dynamics, intensities, and emotional registers that make a story work for a particular person — are genuinely private. They are not the same as a preference for crime fiction versus literary fiction. They are personal in a different register, and they deserve a different standard of discretion.",
        "The majority of adult content platforms fail this standard in obvious ways: public recommendation feeds, social sharing features, browsing history that accumulates by default, interfaces that assume the listening experience is something to be shared or discussed. These are features borrowed from general entertainment platforms that do not apply to adult fiction without compromising the privacy that the category requires.",
        "The Private Story is architecturally private. There are no social features. There is no recommendation feed visible to others. Your listening history is not shared, not analysed for social purposes, and not exposed to any surface that another person could access. Your stories are generated around your choices and saved to your account. They are yours.",
        "This is not a feature among others. It is the premise of the platform. Adult audio fiction that requires you to be comfortable with your choices being visible to a social layer is offering something fundamentally different from adult audio fiction that is private by design.",
      ],
    },
    {
      h2: "The Range of Adult Audio Fiction on the Platform",
      paragraphs: [
        "The Private Story covers the full range of adult audio fiction — not a niche specialisation but the genuine breadth of what the genre encompasses for adult listeners. Romantic and slow burn, for those who want the emotional charge of restrained desire and accumulating tension. Confident energy and quiet intensity, for those who want the specific quality of assured, knowing attention. Dark romance and morally complex character dynamics. Forbidden romance. Enemies to lovers.",
        "The intensity level is a genuine choice. The range runs from emotionally charged and tender to fully unrestricted — and neither end of the spectrum is a default. Different moods suit different registers. The creation flow allows you to set exactly where your story sits, as a genuine choice for this session, not a platform constraint.",
        "The cover images — generated with AI specifically for each story — add a visual dimension to the private library you're building. Each story has its own cover, its own title, and lives in your account as a complete and specific thing that belongs to your particular taste and that particular session.",
        "Stories run to approximately 1,500–3,000 words in narrated form — long enough to build properly, short enough to be a complete listening experience in a session. This is adult audio fiction for adults with full lives who want the experience to be what it is rather than a significant time commitment.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Shape your story",
      body: "The mood, the character, the dynamic, the intensity, the setting. Not a filter on a fixed catalogue — actual choices that shape what is generated. The creation flow is designed so that your choices produce something genuinely specific to you, not something in the general direction of your preferences.",
    },
    {
      heading: "An original story is created for you",
      body: "Generated by Mistral Large. Literary, adult, and built from the first sentence around what you chose. Your story has a cover — created specifically for it — and is ready to listen to immediately. Not something that already existed. Something that exists because you asked for it.",
    },
    {
      heading: "Yours privately, permanently",
      body: "Saved to your private account. Narrated and complete. No social features, no visible history, no sharing. Your adult audio stories are yours — heard only by you, accessible whenever you want them, deletable at any time.",
    },
  ],
  scenarios: {
    h2: "Three Kinds of Adult Audio Fiction — Three Registers",
    items: [
      {
        heading: "The slow-built, emotionally-charged story",
        body: "Some of the most powerful stories for adults work entirely through accumulation — the charged exchange, the restraint that makes every small moment significant, the specific quality of attention between two people who are both aware of what is happening. The story's charge is in the emotional register, the quality of wanting it inhabits, the specificity of the connection it builds. The intensity is not in the events but in everything that surrounds them.",
      },
      {
        heading: "The confident, direct, full-intensity story",
        body: "Sometimes what you want is a story that does not circle the subject. The connection is immediate, the dynamic is clear, the story moves directly into the territory of the dynamic you chose without prolonged restraint. The character has a specific quality — assured, experienced, certain of what he wants — and the story reflects this from the first scene. Literary in craft, direct in register, built to the full intensity the dynamic calls for.",
      },
      {
        heading: "The morally complex, dark and compelling story",
        body: "Adult fiction that does not require its characters to be straightforwardly admirable or its situations to be entirely comfortable. The dynamic has edges. The wanting is complicated by the character, the circumstances, or both. Dark romance and forbidden romance territory — stories that take the shadow side of desire seriously, written with the craft to make moral complexity feel true rather than gratuitous. The Private Story creates adult fiction across this full range.",
      },
    ],
    interstitial: "Create an adult audio story built around the specific register and intensity you want tonight.",
  },
  benefits: {
    h2: "What Makes The Private Story Different",
    items: [
      {
        heading: "Generated, not retrieved",
        body: "Your story does not already exist in a catalogue. It is created around your choices — from the first sentence. The specificity this produces is the difference between something that is mostly for you and something that is precisely for you.",
      },
      {
        heading: "The full spectrum of intensity",
        body: "From slow burn and emotionally charged to full unrestricted intensity — the level is your genuine choice, not a fixed platform setting. Different moods require different registers. All are available.",
      },
      {
        heading: "Literary quality",
        body: "Adult audio fiction written with genuine craft — prose that has texture, characters that have presence, pacing that is intentional. The story is not generic content assembled to a template. It is fiction written to the standard the genre deserves.",
      },
      {
        heading: "Private by architecture",
        body: "No social features, no visible history, no recommendation feeds. Your listening is private by design, not as an opt-in setting. The platform does not assume your adult fiction preferences are shareable.",
      },
      {
        heading: "Ready to listen immediately",
        body: "Created and narrated — ElevenLabs voice selected for the specific story's register — within minutes of your choices. Adult audio fiction for when you want it, not after a wait.",
      },
      {
        heading: "A library that is actually yours",
        body: "Every story you create builds your private library — specific to you, your choices, your taste. Each with its own generated cover. A collection that reflects what you actually want rather than what an algorithm guessed you might settle for.",
      },
    ],
  },
  fullPicture: {
    h2: "Personalised Adult Audio Stories — The Full Picture",
    paragraphs: [
      "The category of adult audio fiction has not yet fully reckoned with what personalisation actually means. The dominant model is still the catalogue — a large library of pre-produced content with filtering and recommendation to guide discovery. For general entertainment, this model is functional. For adult audio fiction, where the specificity of the match between story and listener is directly proportional to the quality of the experience, the catalogue model consistently underdelivers.",
      "The Private Story is built around the generation model. Your adult audio story is created around your choices — the character, the dynamic, the emotional register, the intensity, the setting — from scratch, for this session. The story that exists at the end of the creation flow did not exist before you asked for it. It exists because your choices produced it.",
      "This distinction is most significant in adult fiction because the preferences in adult fiction are genuinely specific in ways that general fiction preferences are not. The exact quality of the dynamic, the specific emotional register, the precise intensity — these are not categories that a fixed catalogue can match with the fidelity that generation achieves. The difference is felt in the listening experience.",
      "Privacy at The Private Story is architectural. The platform was not built as a general platform with a private mode added. It was built from the beginning with the understanding that adult audio fiction requires genuine privacy — not a setting, not a feature, but a design premise. Your listening history is yours. Your stories are yours. The platform does not build a social layer on top of them.",
      "Create your adult audio story tonight — around your mood, the specific quality of the dynamic you want, and the intensity that suits this session.",
    ],
  },
  finalCTA: {
    h2: "Create Your Adult Audio Story",
    paragraphs: [
      "Not the library version. Not the nearest match in a catalogue. An original story, created for tonight, around exactly what you want to feel.",
      "Literary, narrated, private. Ready to listen within minutes.",
    ],
    primary: { label: "Create your adult audio story", href: "/create" },
    links: [
      { label: "Personalised audio stories", href: "/personalised-audio-stories" },
      { label: "Private audio stories", href: "/private-audio-stories" },
      { label: "Intimate audio stories", href: "/intimate-audio-stories" },
    ],
  },
  faqs: [
      { q: `What kind of adult audio stories are available?`, a: `The full range: slow burn and emotionally charged, romantic and tender, confidently direct, dark romance, forbidden romance, enemies to lovers, and everything between. The intensity level is a genuine choice in the creation flow — from tender and emotionally rich to fully unrestricted. The character types, dynamics, settings, and emotional registers available are designed to cover the genuine breadth of what listeners actually want, rather than a narrowly defined niche.` },
      { q: `How is this different from other platforms?`, a: `The key distinction is generation versus retrieval. Other platforms offer a catalogue of pre-produced content — you browse, filter, and select from what already exists. The Private Story generates your story around your specific choices. Your story does not exist before you ask for it. This produces a significantly higher level of match between the story and your specific preferences than even the most carefully curated catalogue can achieve. The second distinction is privacy: the platform is architecturally private — no social features, no visible listening history, no recommendation feeds.` },
      { q: `Can I choose the intensity level of my story?`, a: `Yes. The intensity level is a genuine choice in the creation flow, not a fixed platform setting. Stories run from tender and emotionally charged to fully unrestricted, and different moods and sessions call for different registers. You set the intensity for each story you create. The story is then generated to that register — built specifically to the level you chose, not to a platform default.` },
      { q: `How long are the stories?`, a: `Stories run to approximately 1,500–3,000 words in written form, which typically produces a narrated listening experience of around 10–20 minutes at a comfortable pace. This is designed to be a complete experience in a session — long enough to build properly, develop character and dynamic, and arrive at a satisfying resolution, without requiring a significant time investment. Subscribers can create new stories at any time within their monthly allowance.` },
      { q: `What does a subscription include?`, a: `The standard monthly plan includes five stories per month at £29/month, with an annual plan available at £179/year (equivalent to fifty stories). Additional stories can be created at £3.99 each beyond the plan allowance. All stories are narrated, include a generated cover image, and are stored in your private library indefinitely.` },
      { q: `Are adult audio stories completely private?`, a: `Completely. Your account, your stories, and your listening history are private and visible only to you. The Private Story has no social features — no public profiles, no shared listening history, no recommendation feeds that expose what you listen to. Privacy is architectural to the platform: it was designed from the beginning with the requirement that adult listening should be genuinely private.` },
      { q: `Who is The Private Story designed for?`, a: `Adults who want adult audio fiction that is actually personalised — created around their specific preferences rather than retrieved from a catalogue — and who want the listening experience to be genuinely private. The platform is particularly focused on women, built around the recognition that the adult audio fiction market has historically been designed with assumptions that do not match what women actually want from the genre. The creation flow, the character types available, and the emotional registers the stories work in are all built with female listeners at the centre.` },
    ],
};

export const aiAudioStoryGeneratorConfig: SEOPageConfig = {
  meta: { title: `AI Audio Story Generator | The Private Story`, description: `An AI audio story generator that writes personalised stories around your mood and preferences. Private, adult, emotionally intelligent. Not a fixed library.` },
  hero: { badge: `AI-Generated · Emotionally Intelligent · Private`, h1: `AI Audio Story Generator — Stories Written Around Your Mood, Not the Algorithm's`, tagline: `Not a library. Not a playlist. An intelligence that writes your story from scratch.` },
  heroImage: "images/seo-hero-ai.png",
  showCastingPreview: true,
  sections: [
    {
      h2: "What an AI Audio Story Generator Actually Does",
      paragraphs: [
        "Most of what gets called AI-generated content is really AI-selected content. An algorithm assesses your listening history, makes predictions about your preferences, and serves you things from a pre-existing inventory. The intelligence is in the recommendation layer. The content itself was made before you arrived.",
        "An AI audio story generator does something structurally different.",
        "When you use The Private Story, there is no inventory being searched. There is no recommendation layer deciding which pre-written piece is the closest match to what you might want. There is an AI language model — given your specific inputs for this session — that writes a piece of original narrative audio around them.",
        "The story that exists at the end of that process didn't exist five minutes ago. It was not chosen for you. It was not adapted from a template sitting in a catalogue. It was created, from language, by an intelligence that was given your mood, your preferences, and the specific emotional experience you asked for — and told to write toward them.",
        "That is what an AI audio story generator actually does. Not selection. Creation.",
      ],
    },
    {
      h2: "How the AI Understands What You Want",
      paragraphs: [
        "The input stage — the two minutes you spend before your story exists — is where the intelligence begins.",
        "You are not writing a prompt. You are not typing instructions into a text box and hoping the AI interprets them correctly. You are making a series of structured choices that The Private Story's system translates into precise creative direction.",
        "The mood and emotional register you select — slow burn tension, emotional closeness, confident energy, calm and absorbing — are not tags applied to a search. They are creative constraints. The AI is told to write toward them, which means every sentence of the story that follows is generated in service of the emotional experience you described.",
        "The dynamic you choose shapes the relationship between the voices. The setting and atmosphere you select determine the world the AI builds. The pacing determines how the story moves — whether it withholds or reveals, rushes or lingers.",
        "What the AI produces from these inputs is original narrative — structured story, with character, atmosphere, and emotional arc — written around exactly what you specified. Not around what a general audience might want. Around you, for this session, for this version of tonight.",
      ],
    },
    {
      h2: "Why AI Makes Genuine Personalisation Possible",
      paragraphs: [
        "There is a paradox at the centre of personalised AI storytelling that takes a moment to appreciate.",
        "The intuition is that human-written content is more personal. A story written by a human writer carries intention, voice, craft. An AI-generated story is produced by a machine.",
        "But this framing gets the comparison the wrong way around.",
        "A human-written story is written for no one in particular. It is written by a writer who made choices about mood, pacing, tone, setting, and direction — without knowing you exist. When you encounter it, you adapt to those choices. The story cannot change because it is finished. It was finished before you arrived.",
        "An AI-generated story is written for you specifically — because the AI is given your choices as its starting point. The pacing you needed tonight. The tone that works for this particular version of exhaustion or anticipation or wanting. The world that makes the scenario feel true for you.",
        "The AI doesn't write a better story than a great human writer. But it writes your story in a way that no pre-existing human story can. That is the advantage — not quality versus quality, but personalisation versus universality.",
        "The Private Story's AI is not writing generic fiction. It is writing to your emotional brief, in a register calibrated for private adult listening, at a literary quality high enough for the result to feel like a real story rather than machine-generated text.",
      ],
    },
    {
      h2: "How This Is Different From ChatGPT or Other AI Tools",
      paragraphs: [
        "A question that comes up often: why not just use ChatGPT?",
        "ChatGPT is a general-purpose AI writing tool. It will write you a story if you ask it to. It will write you many things — emails, essays, code, poems, arguments, summaries. Its strength is versatility.",
        "That versatility is also its limitation for this specific purpose.",
        "ChatGPT doesn't know what makes a private audio story work. It doesn't understand the specific emotional architecture of slow burn tension — how long to hold the listener at the edge of something before moving, how much to say, how much to imply. It doesn't understand the pacing of calming narrative, or the voice that works for late night listening when your nervous system finally has room to decompress. It isn't calibrated for the listening experience — for the fact that this is audio, heard privately, meant to do something specific to a specific person in a specific state.",
        "The Private Story's AI is built on the same class of language model technology, but its creative intelligence is in the architecture around it: the prompting system, the emotional calibration, the quality controls, the understanding of what private audio storytelling actually requires.",
        "When you use a general AI tool, you are the prompter. When you use The Private Story, the system is the prompter — and it has been built by people who understand exactly what the output needs to do.",
      ],
    },
    {
      h2: "What You Get — Original Audio, Narrated and Private",
      paragraphs: [
        "The AI output is not a text document you read. It is a narrated audio story — voiced, paced for listening, and delivered to your account privately.",
        "The generation produces narrative: the story itself. That story is passed through a voice synthesis system that narrates it — producing audio that is ready to play, that sounds like a story being told rather than text being read, that lands in your ear the way a story is supposed to land.",
        "The result sits in your private account. Not in a shared library. Not on a public feed. In your account, accessible only to you, removable whenever you want.",
        "This is what an AI audio story generator is capable of when it is built specifically for this experience: original narrative, emotionally calibrated to your input, narrated into audio, stored where only you can hear it.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Tell the AI how you want to feel",
      body: "You make a series of choices — mood, tone, dynamic, atmosphere, pacing. The system translates these into precise creative direction for the AI. You don't write a prompt. You describe an experience.",
    },
    {
      heading: "The AI writes your story from scratch",
      body: "Original narrative is generated around your inputs. Not retrieved. Not adapted. Written, from language, for this session. The story that emerges didn't exist before you asked for it.",
    },
    {
      heading: "Receive narrated audio, privately",
      body: "The story is narrated and delivered to your account. It sounds like a story being told — voiced, paced for private listening. It is saved in your account alone, heard only by you.",
    },
  ],
  scenarios: {
    h2: "What the AI Can Create for You",
    intro: "The AI writes toward the emotional experience you ask for. Here is what that looks like in practice:",
    items: [
      {
        heading: "You ask for slow burn tension",
        body: "Every sentence is written to build toward something. The AI understands that the tension is the point — not a delay before the point — and writes accordingly. It holds the listener at the edge of something for exactly as long as the edge is worth inhabiting. The arrival is earned because the AI was told to earn it.",
      },
      {
        heading: "You ask for something calming",
        body: "The AI shifts register entirely. The pacing slows. The setting becomes somewhere atmospheric and unhurried. The voice — as narrated — moves at the pace your mind needs to follow it into quiet. It was not extracted from a library of calming stories. It was written calm, for you, tonight.",
      },
      {
        heading: "You ask for late night atmosphere",
        body: "The AI reads that request as a specific emotional brief — the particular quality of wanting that exists when the world has gone quiet and you finally have space to feel things. It writes toward that atmosphere rather than approximating it from a general romantic category. The result feels like the exact kind of story you were looking for. Because it was built around exactly what you described.",
      },
    ],
  },
  benefits: {
    h2: "Why AI-Generated Stories Work — For This",
    items: [
      {
        heading: "Original every time",
        body: "The story is written for this session, around your choices. It is not retrieved from storage. There is no version of it that existed before you asked for it.",
      },
      {
        heading: "Emotionally calibrated",
        body: "The AI isn't writing generic narrative. It is writing toward a specific emotional experience that you described. Slow burn builds slowly. Calm settles. Tension holds. The register is the brief.",
      },
      {
        heading: "Narrated, not just text",
        body: "The output is audio — voiced, paced for listening. The Private Story produces a story you hear, not a document you read. The AI's writing becomes a listening experience.",
      },
      {
        heading: "Private by design",
        body: "Your story is generated for your account and stored there. No one else's AI generation looks like yours. No shared output, no public feed, no visible history.",
      },
      {
        heading: "Responds to you specifically",
        body: "The AI's inputs are your choices, not population-level data. It doesn't know what most people want on a Tuesday night. It knows what you told it you wanted tonight.",
      },
      {
        heading: "No creative work required",
        body: "You make structured choices, not open-ended decisions. You don't need to know how to prompt an AI or describe a story. You describe a feeling. The AI handles everything else.",
      },
    ],
  },
  fullPicture: {
    h2: "AI Audio Story Generator — The Full Range",
    paragraphs: [
      "The category of AI story generation for adults is genuinely new. Most of what exists is either general-purpose AI tools used for story generation — without the emotional calibration or audio delivery — or fixed library content that calls itself personalised because an algorithm matched it to your account.",
      "The AI story generator for adults at The Private Story sits in neither of those categories. It is purpose-built: for private audio listening, for adult emotional complexity, for the specific experience of hearing something that was made for you.",
      "For those looking for an AI personalised romance story generator — one that understands the difference between a slow burn story and a tender connection story, and writes each distinctly — this is where that level of emotional specificity exists.",
      "The AI audio romance creator experience at The Private Story is not a single mode. You can generate adult audio stories with AI that cover the full emotional spectrum: from calming and atmospheric to slowly charged to emotionally connecting to cinematic and present.",
      "For anyone who has used an artificial intelligence story creator for women and found the output generic, emotionally flat, or lacking the literary quality that makes a story feel real — the difference is in the prompting architecture and the calibration that surrounds the AI. The model is capable of everything. What it produces depends entirely on how precisely it is directed.",
    ],
  },
  finalCTA: {
    h2: "Generate Your Story",
    paragraphs: [
      "You have been listening to content made before you arrived. Fixed narratives. Pre-set tones. Stories written for an imagined average listener who is not you, on a night that wasn't tonight.",
      "The AI audio story generator at The Private Story was built to solve exactly that problem.",
      "Tell it how you want to feel. It will write something around that — original, narrated, private, and ready to play in the time it takes you to get comfortable.",
      "It exists for tonight. For the exact version of you that showed up.",
    ],
    primary: { label: "Generate your story", href: "/create" },
    links: [
      { label: "See pricing", href: "/pricing" },
      { label: "How creation works", href: "/create-your-own-audio-story" },
      { label: "Personalised audio stories", href: "/personalised-audio-stories" },
    ],
  },
  faqs: [
      { q: `What is an AI audio story generator?`, a: `An AI audio story generator creates original narrative audio based on your inputs — mood, tone, dynamic, atmosphere — rather than selecting from a pre-existing library. At The Private Story, the AI writes a story from scratch around your choices, which is then narrated and delivered to your account as audio you can listen to privately.` },
      { q: `How does the AI know what kind of story to create?`, a: `Before your story is generated, you make a series of structured choices: the emotional register you want (slow burn tension, calm and connecting, confident energy), the dynamic between characters, the setting, and the pacing. The system translates these into precise creative direction for the AI. Your choices are the brief. The AI writes toward them.` },
      { q: `Is AI-generated content as good as human-written?`, a: `For this specific purpose — a story written around your mood, for you, right now — AI-generated content offers something human-written content structurally cannot: genuine personalisation. Human-written stories are made before you arrive. They are fixed. AI-generated stories are made around your inputs. The Private Story's generation is calibrated for literary quality and emotional intelligence — the output feels like a real story, not machine-generated text.` },
      { q: `Can I guide the AI with specific details?`, a: `The creation flow gives you structured choices that the system uses to direct the AI precisely. You select mood, tone, dynamic, setting, and pacing. These are not tags — they are creative constraints the AI writes within. The more specifically you describe what you want to feel, the more specifically the story delivers it.` },
      { q: `How is this different from ChatGPT?`, a: `ChatGPT is a general-purpose tool — it will write stories if asked, but it is not calibrated for private audio listening, emotional specificity, or the particular register that makes a story work for this experience. The Private Story uses similar underlying technology but applies it within a system specifically designed for private adult audio storytelling: the prompting architecture, the emotional calibration, the quality controls, and the audio delivery are all built for this purpose.` },
      { q: `Is the AI content safe and moderated?`, a: `Yes. The Private Story operates under a content policy that defines what the AI produces. The system is designed for adult listeners — calibrated for emotional intelligence and adult intimacy, with intensity shaped by your choices in the creation flow, from quietly sensual and atmospheric through to deeply adult in tone. The content policy prevents harmful content; it does not prevent adult fiction. The AI writes toward your chosen brief, not toward a platform default.` },
      { q: `Can I regenerate if I want something different?`, a: `Yes. If your first story isn't quite what you wanted, you can create a new one with adjusted choices. The creation process takes less than two minutes. Each generation starts fresh — there is no fixed inventory to exhaust.` },
    ],
};

export const alternativesToRomanceAudiobooksConfig: SEOPageConfig = {
  meta: { title: `Alternatives to Romance Audiobooks — When You Want a Story Made for Tonight | The Private Story`, description: `Romance audiobooks are someone else's love story. Discover personalised audio stories — romantic experiences created around your mood, dynamic, and pacing tonight.` },
  hero: { badge: `Romance Audio · Personalised Stories · For Adults`, h1: `Alternatives to Romance Audiobooks — When You Want a Story Made for Tonight, Not Everyone`, tagline: `Romance audiobooks are someone else's love story. Somewhere, there is one made entirely around yours.` },
  sections: [
    {
      h2: "You Already Know What You Want. The Problem Is Finding It.",
      paragraphs: [
        "If you are a romance audiobook listener, you already understand something that casual audio consumers don't: the right story, in the right voice, at the right emotional register, does something nothing else does.",
        "It meets you. It gives you exactly the kind of feeling — slow burn tension, overwhelming desire, emotional connection, the specific relief of a love story that goes where you need it to go — that is difficult to find anywhere else and completely reliable when you find it.",
        "The problem is the finding.",
        "Romance audiobook listeners know the scroll. The browsing of a catalogue that is simultaneously enormous and somehow never quite right tonight. The downloading of something that looked promising in the description and turns out to be paced too slowly, or not slowly enough. The narrator whose voice is fine but not quite the voice. The story that is excellent in absolute terms and still misses the specific thing you needed from it.",
        "This is not a complaint about romance audiobooks. It is an accurate description of a structural limitation that no library, however large, can fully overcome: content made for a general audience cannot be made for you specifically.",
        "There is a format that can.",
      ],
    },
    {
      h2: "What Romance Audiobooks Do Brilliantly",
      paragraphs: [
        "Romance audiobooks represent one of the most successful intersections of fiction and audio production in publishing history. The genre lends itself to the format in specific ways that are worth appreciating before discussing their limitations.",
        "A skilled narrator transforms romance fiction. The voice carries heat, tension, emotion, and character in ways that silent reading cannot replicate. The best romance audiobook narrators — and there are extraordinary ones — bring something to the material that makes it more immersive, more felt, more present than the text alone.",
        "Romance audiobooks are ideal for long-form emotional investment — spending twenty or thirty hours with characters you love, following a relationship arc across its full complexity, arriving at the earned resolution of a well-crafted slow burn. For genre exploration — trying authors and subgenres you wouldn't otherwise encounter. For the specific pleasure of a series you're already committed to, where each new installment delivers the continuation of a world you already inhabit.",
        "These are genuine pleasures and significant ones. Romance audiobook listeners spend more on audio content than any other demographic because the format genuinely delivers something they value.",
        "But there is a gap between what romance audiobooks can do and what you sometimes want from romantic audio. That gap is the argument for personalised romance audio as a companion format rather than a replacement.",
      ],
    },
    {
      h2: "The Gap That Romance Audiobooks Cannot Close",
      paragraphs: [
        "The gap is specific and worth naming precisely.",
        "A romance audiobook was written by an author who had a vision — a story they wanted to tell, characters they had conceived, a narrative arc they had decided on before you arrived. The book was edited, produced, and published for a readership of millions. It exists as a fixed object in the world, identical for every listener.",
        "When that vision happens to align with what you need tonight — when the pacing, the dynamic, the emotional register, the kind of heat and the kind of tenderness in the story happen to match your current mood — the experience is close to perfect.",
        "When it doesn't align — when the story you downloaded is slower than you needed, or more intense than you wanted, or centred on a dynamic that isn't quite right for tonight — the experience is a polite disappointment. You listen. You finish. You return to the catalogue and try again.",
        "The catalogue cannot solve this problem. It can only offer more options, which means more scrolling and more polite disappointments alongside the genuine finds.",
        "Romance audio stories created for you solve the problem the catalogue cannot solve. Not by offering more pre-existing options — by creating the specific option you need tonight from scratch, around your current preferences, in the emotional register you specified.",
        "The author's vision is replaced by your preferences. The fixed narrative is replaced by a created one. The story exists not for a general romance readership but for the specific version of you who sat down tonight and said: this is what I need.",
      ],
    },
    {
      h2: "The Specific Things You Can Personalise",
      paragraphs: [
        "For romance audiobook listeners who have experienced the limitation of fixed content, the personalisation available in audio story creation represents a significant shift in what is possible.",
      ],
      bullets: [
        "The dynamic — slow burn, forbidden tension, dominant energy, emotional connection, or your exact combination",
        "The pacing — how long the tension holds, when things shift, the speed that serves tonight",
        "The emotional register — heat and charge, emotional depth and connection, tender warmth, or what tonight requires",
        "The length — a complete romantic experience in thirty minutes, not hours, sized for your evening",
      ],
    },
    {
      h2: "Romance Audio Stories vs Romance Audiobooks — The Practical Difference",
      paragraphs: [
        "When to choose a romance audiobook:",
      ],
      bullets: [
        "You have hours to commit and want to invest them in a long-form story",
        "You have a specific author, series, or book you've been wanting to experience",
        "You want a fully produced, narratively complex romance with developed characters",
        "You're in the mood to follow a story wherever it goes",
        "You want the specific pleasure of a narrator you love in a book you've been anticipating",
        "",
        "When to choose a personalised romance audio story:",
        "You know the dynamic, pacing, and emotional register you need tonight and want it delivered specifically",
        "You have thirty minutes rather than thirty hours",
        "You've scrolled the audiobook catalogue and nothing is quite right",
        "You want to be at the centre of the story rather than observing someone else's romance",
        "You need the specific kind of romantic feeling that this particular evening calls for",
        "You want something private, personal, and made for tonight rather than for everyone",
      ],
    },
    {
      h2: "What Personalised Romance Audio Feels Like",
      paragraphs: [
        "The experience of a personalised romance audio story is different from a romance audiobook in a way that is difficult to describe until you feel it and immediately recognisable when you do.",
        "A romance audiobook is an extraordinary story happening to characters you've come to care about. You are moved by it, invested in it, sometimes devastated or delighted by where it goes. But it is happening to them.",
        "A personalised romance audio story is written in second person — it is happening to you. The dynamic you chose is the one playing out. The pacing is the one you needed. The emotional register matches the mood you described. The story was not waiting on a server for anyone to find — it was created because you needed it tonight.",
        "The intimacy of that specific fit is what romance audiobook listeners feel most immediately when they first experience personalised audio. Not better production, not a larger catalogue, not a more skilled narrator — a story that is unmistakably, specifically yours.",
      ],
    },
    {
      h2: "Alternatives to Romance Audiobooks — The Full Picture",
      paragraphs: [
        "The category of romance audio stories for adults is genuinely new and rapidly developing. The personalised creation model — generating romantic audio content around individual preferences rather than presenting a fixed library — represents a different approach to romantic audio than anything legacy platforms offer.",
        "Alternatives to romance novels audio for listeners who want shorter, more personal experiences have historically been limited. Fanfiction fills some of this need but is inconsistent in quality and not available in audio. Short story anthologies exist but share the same fixed-content limitation as full novels. The personalised audio story sits in a gap that nothing else occupies: premium romantic audio, created around your preferences, in the length that suits your evening.",
        "For listeners asking whether there are romance audio platforms more personal than Audible — the answer is yes, and the difference is not catalogue size or production quality but the fundamental model. Audible presents a library you select from. The Private Story creates a story around you. These are categorically different relationships between a romantic audio platform and its listener.",
        "Audio romance stories created for me — this is the precise description of what personalised audio storytelling delivers. Not audio romance stories created for a general audience that you happened to find. Stories created because of your preferences, shaped around your mood, existing in response to what you needed tonight.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Choose your dynamic and mood",
      body: "Slow burn tension. Forbidden attraction. Emotional connection. Dominant energy. Tender intimacy. The specific romantic feeling you need tonight — it shapes everything.",
    },
    {
      heading: "Your romance story is created",
      body: "Not selected from a catalogue. Generated around your choices, with the dynamic you specified, at the pacing you need, in the emotional register you chose. The story was made for tonight, for you.",
    },
    {
      heading: "Listen privately",
      body: "Saved to your account, heard only by you. No public sharing. No algorithm. No one knows what you listened to or what you wanted. Entirely yours.",
    },
  ],
  scenarios: {
    h2: "What Personalised Romance Audio Feels Like",
    intro: "The distinction between a story that happens to you and a story that happens to someone else:",
    items: [
      {
        heading: "A romance audiobook evening",
        body: "You scroll the catalogue. You find something promising. You download. You listen. It's good, actually, but the pacing is slower than tonight calls for, or the dynamic isn't quite the balance you wanted. It's excellent for someone. Tonight it's a polite disappointment.",
      },
      {
        heading: "A personalised romance story evening",
        body: "You make a few choices about what you need — the dynamic, the tone, how it unfolds. A story is made around those choices. You listen. The dynamic is exactly the one you specified. The pacing is exactly the speed you needed. The emotional register is precisely the mood you described. Something made for you, not broadcast at you.",
      },
      {
        heading: "The difference in how it lands",
        body: "A romance audiobook you didn't have to browse for is still a romance audiobook someone else wrote. A romance story created around your preferences is something that happens to you. The intimacy of that difference is immediately apparent when you listen.",
      },
    ],
    interstitial: "The romance audiobook was someone else's story. Here is where you create your own.",
  },
  benefits: {
    h2: "The Benefits for Romance Audiobook Listeners",
    items: [
      {
        heading: "The dynamic you actually want",
        body: "Not the closest available option in a catalogue. The specific combination of tension, heat, emotion, and character energy that has always been your preference — created around your choices rather than found in someone else's vision.",
      },
      {
        heading: "Complete in thirty minutes",
        body: "The full romantic experience — tension, connection, resolution — in the time available tonight. No chapters. No commitment to a twenty-hour arc. A whole story, sized for the evening.",
      },
      {
        heading: "Private always",
        body: "Your romantic preferences, your story choices, your listening history — none of it visible to anyone. The platform is private by design, not by settings.",
      },
      {
        heading: "No more polite disappointments",
        body: "The experience of downloading a promising romance audiobook and finding it misses what you needed — that experience does not exist here. You specify what you need. It gets made around those specifications.",
      },
      {
        heading: "The emotional register of tonight",
        body: "Not the register the author decided for a book published two years ago. The register that matches your current mood, your current need, this specific evening.",
      },
      {
        heading: "You at the centre",
        body: "A romance audiobook tells someone else's love story. A personalised romance audio story is written in second person — happening to you, shaped around you, created for you.",
      },
    ],
  },
  fullPicture: {
    h2: "Where Romance Audiobooks End and Personalisation Begins",
    paragraphs: [
      "Romance audiobooks are extraordinary for what they are: long-form narrative investment, character development, the pleasure of a well-crafted slow burn with hours to play out.",
      "But romance audiobooks are fixed. They were written before you arrived. The dynamic was chosen by the author. The pacing is the pacing the author decided. The emotional tenor is the tenor they selected. You follow, you adapt, you hope the fit is good.",
      "What personalised romance audio offers is the inverse: a story that follows you. That adapts to what you need. That exists because of your preferences rather than in spite of them.",
      "This is not a replacement for romance audiobooks. For listeners who want both, both exist now. Romance audiobooks remain the gold standard for long-form emotional investment and narrative complexity. Personalised romance audio is the format for the moments when you know exactly what you want and have thirty minutes rather than thirty hours to feel it.",
    ],
  },
  finalCTA: {
    h2: "The Romance Story Made for Tonight",
    paragraphs: [
      "You already know the dynamic that moves you. You know how slow or immediate you need the tension to be. You know whether tonight calls for emotional depth or charged intensity.",
      "The romance audiobook catalogue cannot deliver that precision. No library can.",
      "But a story created around your specifications can.",
    ],
    primary: { label: "Create your romance story", href: "/create" },
    links: [
      { label: "See pricing", href: "/pricing" },
      { label: "Personalised audio stories — what this is", href: "/personalised-audio-stories" },
      { label: "Create your own audio story", href: "/create-your-own-audio-story" },
    ],
  },
  faqs: [
      { q: `How are personalised audio stories different from romance audiobooks?`, a: `Romance audiobooks are fixed content created by an author for a general readership — the same for every listener, regardless of their mood or preferences when they listen. Personalised romance audio stories are created around your specific choices at the moment you request them. The dynamic, pacing, emotional register, and length all reflect what you specified. The story exists because of your preferences tonight rather than waiting in a catalogue for you to find it.` },
      { q: `Can I get romance audio stories personalised to my taste?`, a: `Yes. When you create a romance audio story on The Private Story, you choose the dynamic, tone, and emotional register of your story — slow burn tension, forbidden attraction, emotional connection, dominant energy, tender intimacy, or combinations of these. The story generated reflects your choices specifically rather than a generic romance template.` },
      { q: `Are there romance audio platforms more personal than Audible?`, a: `Yes. Audible operates on a library model — a large catalogue of fixed content you select from. The Private Story operates on a creation model — generating stories around your mood and preferences rather than presenting pre-existing content. The experience of a story created around you is categorically more personal than the experience of selecting from a catalogue, regardless of how large that catalogue is.` },
      { q: `What if I want a romantic story but not a full audiobook?`, a: `This is precisely the gap personalised romance audio stories fill. Stories on The Private Story run between fifteen and thirty minutes — complete romantic experiences in the time available for an evening listening session. They are not excerpts or chapters from longer works. They are complete stories, sized for the specific window when most adults want a romantic audio experience.` },
      { q: `Can I create my own romance audio story?`, a: `Yes. The creation process takes less than two minutes. You choose your mood and the dynamic you want — the kind of romantic tension, the emotional register, the pacing — and a story is generated around those choices. The story is private, saved to your account, and heard only by you.` },
      { q: `What intensity level can personalised romance audio stories reach?`, a: `The intensity depends on the choices you make in the creation flow. The Private Story creates adult content from quietly sensual and atmospheric through to deeply adult in tone — shaped by your preferences, not by a platform default. Across all intensity levels, the focus is on desire, tension, connection, and emotional experience that feels genuinely yours rather than assembled for a general audience.` },
      { q: `How long are romantic personalised audio stories?`, a: `Stories typically run between fifteen and thirty minutes depending on the preferences you choose. This is designed for the specific listening window when romantic audio is most wanted — the wind-down hour, the pre-sleep session, quiet time alone — where a complete experience in thirty minutes is more valuable than the opening chapters of a multi-hour audiobook.` },
    ],
  comparisonTable: {
    caption: "Personalised audio stories vs romance audiobooks",
    otherLabel: "Romance audiobooks",
    rows: [
      { feature: "Content creation", thePrivateStory: "Generated for you at the moment of listening", other: "Written for a general audience before you arrived" },
      { feature: "Personalisation", thePrivateStory: "Built around your mood, tone, and dynamic choices", other: "Same for every reader regardless of mood" },
      { feature: "Length", thePrivateStory: "15–30 minutes — sized for the listening window", other: "6–20+ hours — requires sustained commitment" },
      { feature: "Privacy", thePrivateStory: "Completely private — exists only in your account", other: "On a shared platform with public reviews and ratings" },
      { feature: "Discovery", thePrivateStory: "Choose how you want to feel; story is created to match", other: "Browse catalogue and hope something fits your mood" },
      { feature: "Price", thePrivateStory: "From £29/month for 5 personalised stories", other: "£7.99–£14.99/month; popular titles cost extra credits" },
    ],
  },
};

export const audioStoriesForWomenConfig: SEOPageConfig = {
  meta: { title: `Personalised Audio Stories for Women | The Private Story`, description: `Audio stories for women, created around how you want to feel tonight. Private, personalised, and built with your desires at the centre. Not a library — yours.` },
  hero: { badge: `For Women · Private · Personalised`, h1: `Audio Stories for Women — Your Desires at the Centre`, tagline: `Built around what women actually want from audio fiction. Not what the market assumes. Not a best guess. What you said you wanted.` },
  heroImage: "images/seo-hero-women.png",
  showCastingPreview: true,
  sections: [
    {
      h2: "What the Existing Market Gets Wrong",
      paragraphs: [
        "The majority of adult audio fiction has been built around an assumed listener who does not describe the typical female experience of the genre. The assumptions are visible in the product choices: a focus on visual and adult content over emotional texture, on immediacy over accumulation, on a specific character type — dominant, aggressive, uncomplicated in his certainty — that is one point on a spectrum that the market treats as the whole spectrum.",
        "Women make up the majority of romance fiction readers, the majority of romantic audio fiction listeners, and a dominant and growing share of adult fiction consumers. This is not a recent shift. The data has been consistent for decades. What has been slow to shift is the design of platforms and products in response to it — the translation of market composition into product decisions that actually reflect what that audience wants.",
        "What women want from audio fiction is not a simplified or sanitised version of what adult fiction can be. The preferences are specific and they are not more modest than the male equivalent — they are differently composed. Emotional texture matters as much as or more than directness. The character behind the intensity matters as much as the intensity itself. The accumulation of a dynamic, the quality of the attention in a scene, the specific register of the connection — these are the dimensions that produce a good experience for most female listeners, and they are the dimensions that a male-default design often misses.",
        "The Private Story is built around the recognition that female listeners are the core audience for premium audio fiction, and that building well for them requires actually centering their preferences — not assuming them, not approximating from a generic baseline, but asking and responding.",
      ],
    },
    {
      h2: "The Dimensions That Actually Matter",
      paragraphs: [
        "The research into what female romance and adult fiction readers prioritise points consistently to a set of dimensions that differ from the directness-first model. Emotional authenticity: the feeling that the character is a real person with specific qualities, not a type assembled to produce the expected responses. Agency: the sense that the protagonist — the person you inhabit in a first-person story — is present as a genuine actor in the dynamic, not a passive recipient of what the other person is doing. Quality of attention: the specific texture of being genuinely seen and known by the person in the story.",
        "These dimensions are not in tension with adult intensity. A story can be deeply adult and emotionally authentic, agentive, and characterised by genuine quality of attention. The distinction is not between restrained and unrestrained. It is between stories that are assembled to a formula and stories that are built around what the specific listener actually experiences as compelling.",
        "The Private Story's creation flow is designed around these dimensions. The character choices are not just type-selection but quality-selection: assured rather than aggressive, attentive rather than controlling, complex rather than simply powerful. The dynamic choices allow for the specific configuration that produces emotional charge for you — not the average, but your particular combination. The intensity level is genuine rather than fixed.",
        "Audio adds a dimension that written fiction cannot fully provide: the narrated voice, if it has the right quality, produces an immediacy that changes the experience significantly. The fiction is not text on a page but a voice in your ear — speaking directly to you, in the second person, with the specific tone of the character and the story. This immediacy is why audio works for this kind of fiction in a way that other formats only partially replicate.",
      ],
    },
    {
      h2: "Agency and the Second-Person Voice",
      paragraphs: [
        "One of the most significant design choices at The Private Story is the use of second-person, first-person-adjacent narration — stories in which you are the protagonist. Not a named character whose interiority you observe. Not a third-person protagonist whose choices are made for her. You.",
        "This is not a cosmetic difference. Agency in fiction operates partly through the degree to which the reader or listener identifies with the protagonist's position — her choices, her perspective, her experience. Third-person narration creates some distance; the character whose interiority you are reading is still, technically, a character. Second-person narration with a present, agentic protagonist collapses that distance.",
        "The distinction matters particularly for female listeners because one of the persistent failings of male-default adult fiction is the passivity of the female protagonist. The person things happen to, rather than the person participating. The Private Story creates stories in which your agency is real — the choices you make in the fiction carry weight, the protagonist's perspective is present and active, the dynamic is between two people rather than one person and a recipient.",
        "This connects to the privacy dimension. Agency and privacy are linked: the ability to engage with adult fiction on your own terms, in private, around what you actually want, is itself an expression of agency. The platform is designed to extend that agency through the entire experience.",
      ],
    },
    {
      h2: "Privacy as a Feature, Not an Afterthought",
      paragraphs: [
        "Female listeners of adult audio fiction face a specific privacy problem that male listeners face less acutely: the social cost of the preference being known. The stigma attached to female adult fiction consumption — the difference between how a man's enjoyment of adult content is treated and how a woman's is — is not neutral. It has the practical effect of making women more cautious about using platforms that are not genuinely private.",
        "Platforms that require a social layer — a public profile, a recommendation feed that others can see, a shared listening history — are platforms that ask female users to accept a privacy cost as the price of access. This is a significant friction point that most adult audio platforms have not addressed, partly because they were not designed with female users as the primary audience.",
        "The Private Story's privacy architecture is designed to remove this friction entirely. There is no social layer. There is no public profile. Your listening history is not visible to others and is not used to build a social graph. Your stories are private to your account and audible only to you. The platform does not require you to be comfortable with your preferences being visible in exchange for access to the content.",
        "This is not a secondary benefit. For many women, it is the prerequisite for using the platform at all. The discretion is fundamental to what is being offered.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Tell us what you want to feel",
      body: "The mood tonight. The character quality — how he moves through the world, the specific register of his attention. The dynamic you want to be inside. The intensity. The creation flow is built around the dimensions that matter most for female listeners: emotional texture, character quality, the specific nature of the connection.",
    },
    {
      heading: "An original story is created for you",
      body: "Generated from scratch around your choices, narrated in a voice that fits the story's register. Your story does not exist until you ask for it — it is built specifically around you, for this session, as a complete audio experience with its own generated cover.",
    },
    {
      heading: "Yours — private, for whenever you want it",
      body: "Saved to your private account, audible only to you. No social features, no visible history. Your stories build a private library specific to your taste, accessible whenever you want them, completely on your terms.",
    },
  ],
  scenarios: {
    h2: "Three Stories for Three Different Moods",
    items: [
      {
        heading: "The quietly electric story — slow, precise, deeply attentive",
        body: "The connection that has been building for long enough that everything is charged without anything direct having been said yet. A character who notices things — specific, real things about you — rather than performing attention. The story inhabits the space between what has been said and what is about to be. The dynamic is emotionally adult in its register: the intimacy of being genuinely known by someone whose attention is not general but specific.",
      },
      {
        heading: "The confident, direct encounter — assured and fully present",
        body: "A character who knows what he wants and is not uncertain about it. The story moves directly into its register — built around the specific quality of confident, calibrated attention. The character is assured without being aggressive, certain without being controlling. The dynamic is between equals, both fully present, both knowing. For when slow burn is not the mood and what you want is the story itself.",
      },
      {
        heading: "The morally complex story — darker, heavier, more complicated",
        body: "The character who carries weight. Dark romance or forbidden territory — the dynamic that is not straightforwardly comfortable, the pull that is real and complicated simultaneously. Written for women who want fiction that meets them in the more shadowed parts of their imagination rather than redirecting them to something easier. The Private Story creates across this full register.",
      },
    ],
    interstitial: "Create an audio story built around the specific mood, character, and dynamic you want tonight.",
  },
  benefits: {
    h2: "What the Platform Is Built For",
    items: [
      {
        heading: "Your preferences, not the average",
        body: "Generated around your specific choices — the exact character quality, the specific dynamic, the emotional register you want. Not the catalogue nearest to you. Not the male-default version. Yours.",
      },
      {
        heading: "Agency throughout",
        body: "You shape the story before it begins, and the protagonist in it is you — present, active, making choices that matter. Not a passive recipient of what the story happens to contain.",
      },
      {
        heading: "The emotional dimensions that matter",
        body: "Emotional texture, character quality, quality of attention, the specific register of connection — the dimensions female fiction listeners prioritise are the dimensions the creation flow is built around.",
      },
      {
        heading: "Genuinely private",
        body: "No social features, no visible history, no public profile. Privacy by architecture — the prerequisite removed, so the experience is yours without condition.",
      },
      {
        heading: "The full intensity spectrum",
        body: "From slow burn and emotionally charged to full unrestricted intensity. The level is your genuine choice for each session, not a fixed platform setting. Different moods require different registers.",
      },
      {
        heading: "Literary quality as standard",
        body: "Adult audio fiction written with genuine craft — prose that earns its effect through quality rather than volume. The standard the genre deserves, consistently applied.",
      },
    ],
  },
  fullPicture: {
    h2: "Audio Stories for Women — The Full Picture",
    paragraphs: [
      "The Private Story was built with women as the primary audience — not as a niche, not as one demographic among several, but as the person the product is fundamentally designed for. This shapes everything: the character types available, the emotional registers the stories work in, the specific dimensions foregrounded in the creation flow, the intensity spectrum available, and the privacy architecture of the platform.",
      "Building for female listeners means building around the actual dimensions that determine whether an audio fiction experience is satisfying for them — not the simplified version, not the assumed version, and not the male-default version with the rougher edges removed. It means the full range: the slow burn and emotionally textured story, the confident and direct encounter, the morally complex territory of dark romance and forbidden dynamics.",
      "It also means taking privacy seriously as a design requirement rather than an optional feature. The ability to engage with adult audio fiction privately, without social friction, on your own terms — this is the baseline that any platform for female adult fiction listeners should be meeting, and most currently are not. The Private Story meets it architecturally.",
      "The generation model — original stories created around your choices, rather than retrieved from a catalogue — matters more for female listeners than for any other audience, because the specificity of match between story and listener is what produces a genuinely satisfying experience. The catalogue model consistently undershoots because the preferences involved are too specific for filtering to adequately address.",
      "Create your audio story tonight — built around how you want to feel, by a platform designed with you at the centre.",
    ],
  },
  finalCTA: {
    h2: "Create Your Private Story",
    paragraphs: [
      "Audio fiction built for how you actually feel, around what you actually want. Not the market's version of you. Not the catalogue nearest to your preferences. Yours.",
      "Private, personalised, literary. Created around your choices and your mood for tonight.",
      "The platform was built for this. The story is waiting to be created.",
    ],
    primary: { label: "Create your story", href: "/create" },
    links: [
      { label: "Personalised audio stories", href: "/personalised-audio-stories" },
      { label: "Emotional audio stories", href: "/emotional-audio-stories" },
      { label: "Intimate audio stories", href: "/intimate-audio-stories" },
    ],
  },
  faqs: [
      { q: `Why is The Private Story specifically for women?`, a: `Women are the dominant audience for romance and adult fiction — in written, audio, and digital formats — yet the majority of adult audio platforms have been built around assumptions that don't match what female listeners actually want. The Private Story is built around the recognition that centering female preferences in the design — the emotional dimensions, the character qualities, the intensity spectrum, the privacy requirements — produces a significantly better product for the audience that actually makes up the majority of the market. The platform is not exclusively for women, but it is designed with women as the primary audience.` },
      { q: `What makes the stories feel right for female listeners?`, a: `The creation flow is built around the dimensions that matter most for female fiction listeners: emotional authenticity, the quality of the character (specific, present, genuinely attentive rather than generically powerful), agency for the protagonist, and the full spectrum of intensity rather than a default towards a single register. The stories are generated to the choices you make rather than approximated from a generic template, which means the match between the story and what you actually wanted is significantly higher than a catalogue can achieve.` },
      { q: `Can I choose the kind of story — slow burn versus more direct?`, a: `Yes. The intensity and pacing of your story are genuine choices in the creation flow. The platform covers the full spectrum: slow burn and emotionally textured, confident and direct, deeply adult in tone, and the darker territory of morally complex romance. These are not fixed platform registers — they are choices you make for each story, because different moods require different kinds of fiction.` },
      { q: `Are the stories narrated by a real voice?`, a: `Stories are narrated using ElevenLabs voices — studio-quality voice synthesis selected to complement the specific tone and register of each story. The voice quality is indistinguishable from professional human narration in the ways that matter for the listening experience: warmth, pacing, texture. The narration is part of what is created — not an afterthought — and the voice selected is matched to the story's character and emotional register.` },
      { q: `How private is the platform, genuinely?`, a: `Genuinely private. There are no social features. There is no public profile. Your listening history is not visible to others, not shared with third parties for social purposes, and not used to build any public-facing recommendation or activity feed. Your stories are stored in your private account and are audible only to you. The platform was designed from the beginning with the requirement that adult fiction listening should be genuinely private — not a setting, but the fundamental premise.` },
      { q: `What does a subscription cost?`, a: `The monthly plan is £29/month for five stories. The annual plan is £179/year, which covers fifty stories — equivalent to £3.58 per story. Additional stories beyond your plan allowance are £3.99 each. All plans include full narration, generated cover images, and permanent storage in your private library.` },
      { q: `Is the platform UK-based?`, a: `The Private Story is a UK-based platform. Pricing is in GBP. The platform is available to listeners globally, and the literary register — UK English, a preference for emotional texture and craft over volume — reflects its origin. Women from any country are welcome.` },
    ],
};

export const audioStoriesVsAudiobooksConfig: SEOPageConfig = {
  meta: { title: `Audio Stories vs Audiobooks — Why One Feels Personal | The Private Story`, description: `Audiobooks are made for everyone. A personalised audio story is made for tonight. Discover the real difference between audio stories and audiobooks — and why it matters more than the audio industry has acknowledged.` },
  hero: { badge: `Comparison · Personalised Audio · For Adults`, h1: `Audio Stories vs Audiobooks — Why One Feels Personal and One Doesn't`, tagline: `You have been consuming stories. There is another option: inhabiting one.` },
  sections: [
    {
      h2: "Two Formats. Two Entirely Different Relationships With the Listener.",
      paragraphs: [
        "Audiobooks are one of the great achievements of modern publishing. The ability to carry an entire novel in your pocket, to have a brilliant narrator bring a story to life during a commute or a long drive — this is genuinely valuable and millions of people love it.",
        "This is not a case against audiobooks.",
        "It is a case for understanding what audiobooks cannot do — and why that gap matters more than the audio industry has acknowledged.",
        "An audiobook was written by an author who didn't know you. Edited by a team who had never met you. Narrated by a voice chosen for a general audience. Published for everyone. Purchased by you because it seemed like it might fit.",
        "It might fit. It often does. But it was never made for you.",
        "A personalised audio story begins somewhere completely different. It begins with a question about you — how you want to feel tonight, what kind of experience you need right now, the emotional register that matches the version of yourself that showed up at the end of this specific day.",
        "Then it is made. For you. Around those answers.",
        "The difference between these two experiences is not about quality. Some audiobooks are extraordinary. The difference is about relationship — between the content and the listener — and that relationship determines something important: whether you finish the experience feeling like you consumed something, or feeling like something happened to you.",
      ],
    },
    {
      h2: "What Audiobooks Are Genuinely For",
      paragraphs: [
        "Audiobooks are the perfect format for specific kinds of listening.",
        "They are ideal for narrative immersion in long-form fiction — when you want to spend thirty hours inside someone else's fully realised world. For non-fiction and learning — business books, biographies, history, ideas. For the kind of commute listening where you want to feel productive or entertained across a long period of time.",
        "Audiobooks reward patience and sustained attention. They are designed for the listener who has time, who is willing to follow a story wherever it goes, who came to the experience curious rather than needing.",
        "But notice what audiobooks require: time, patience, the willingness to follow rather than lead, and a degree of cognitive engagement that may or may not be available depending on when you're listening and why.",
        "At 11pm after a difficult day, with a mind that needs to slow down rather than engage, an audiobook makes demands that may be too great. Chapter three expects you to remember what happened in chapter one. The narrative arc assumes your full attention. The emotional destination was chosen by the author, not by you.",
        "These are not flaws in audiobooks. They are characteristics of a format designed for something other than what you need right now.",
      ],
    },
    {
      h2: "What Personalised Audio Stories Are For",
      paragraphs: [
        "A personalised audio story is designed for a completely different set of circumstances.",
        "Not the long commute with hours to fill. The forty-five minutes before sleep when your mind needs to slow. Not the weekend where you have time to commit to a novel. The Tuesday evening when you've given the day everything you had and need something that gives something back.",
        "Personalised audio stories are for the moments when you know how you want to feel but can't find something that creates that feeling. When you need specific emotional experience — tension, warmth, connection, calm — not general entertainment. When you want to be at the centre of the story rather than observing someone else's.",
        "The format difference is fundamental. Where an audiobook presents a fixed experience you adapt to, a personalised audio story adapts to you. The pacing reflects your current mood. The tone matches what you chose. The emotional arc moves toward a destination you directed it toward.",
        "You don't follow this story. In a meaningful sense, you shape it.",
      ],
    },
    {
      h2: "Made for Everyone vs Made for Tonight",
      paragraphs: [
        "Every audiobook in existence was written before you arrived. The author made choices — about tone, pacing, emotional register, where the story goes — without any knowledge of who you are or what you need when you listen.",
        "This is not a criticism. It is simply the nature of published content. A book written for a general audience will resonate with some readers some of the time and will miss others completely.",
        "A personalised audio story is made for the specific mood you are in right now. The tone you chose. The kind of experience you said you needed. It did not exist before you asked for it. It was made in response to you, tonight.",
        "The difference in how this lands — how personal it feels, how specifically it meets you — is immediately apparent when you experience it.",
      ],
    },
    {
      h2: "You Follow vs You Shape",
      paragraphs: [
        "In an audiobook, the story goes where the author decided it goes. You follow. This is fine when you are curious about the destination. It is less fine when you already know what kind of destination you need and the book is heading somewhere else.",
        "When you create a personalised audio story, you make choices that shape the experience. Slow burn or immediate. Warm and connecting or charged and atmospheric. Calm that builds toward sleep or tension that builds toward release. The story moves toward an emotional experience you specified.",
        "You are not a passive receiver. You are, in a meaningful sense, a co-author of your own experience.",
      ],
    },
    {
      h2: "The Immersion Difference — Why Audio Stories Feel More Personal",
      paragraphs: [
        "There is a specific quality of immersion that personalised audio stories produce which audiobooks rarely achieve, and the reason is worth understanding.",
        "Audiobooks create immersion through production quality — skilled narrators, sometimes full casts, occasionally music and sound design. The external craft draws you in.",
        "Personalised audio stories create immersion through relevance. The story feels personal because it is personal. Your imagination doesn't have to do the work of translating a general experience into something that applies to you — because it was already translated before it arrived. The story was shaped around your current emotional state, and your mind recognises this fit immediately.",
        "This is why listeners consistently describe personalised audio stories as feeling closer than audiobooks. More intimate. More present. Less like something happening in the background and more like something happening to them.",
        "The difference between audio stories and audiobooks for relaxation, in particular, is pronounced. Audiobooks require enough engagement to follow a narrative you didn't shape. Personalised audio stories, toned toward calm and created around your current mood, work with the natural process of winding down rather than asking you to maintain engagement while relaxing.",
      ],
    },
    {
      h2: "When to Choose Each Format",
      paragraphs: [
        "Neither format replaces the other. They serve different moments, different moods, different listening needs.",
      ],
      bullets: [
        "Choose an audiobook when you have time and want to commit to a long-form story",
        "Choose an audiobook when you want to learn something from non-fiction",
        "Choose an audiobook when you're in the mood to follow rather than shape",
        "Choose a personalised audio story when you know how you want to feel but can't find something that creates that feeling",
        "Choose a personalised audio story when you need your mind to slow down rather than engage",
        "Choose a personalised audio story when you want to be at the centre of the story, not observing it",
        "Choose a personalised audio story when you are winding down, going to sleep, or decompressing",
        "Choose a personalised audio story when you have thirty minutes rather than thirty hours",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Choose your mood and tone",
      body: "Slow burn tension. Calm and connecting. Confident and cinematic. Emotionally immersive. Your choice shapes everything that follows — the pacing, the voice, the emotional destination. Less than two minutes to tell us what you need.",
    },
    {
      heading: "Your story is created",
      body: "Not retrieved from a library. Generated around your selections, now, for this session. The story that results exists because of what you chose tonight — it did not exist before you asked for it.",
    },
    {
      heading: "Listen privately",
      body: "Saved to your account. Heard only by you. No social feed, no shared library, no visible history. Entirely yours — the specific story for the specific version of you that showed up tonight.",
    },
  ],
  scenarios: {
    h2: "What the Experience Difference Feels Like",
    intro: "Three moments that illustrate why personalised audio stories occupy a different category entirely:",
    items: [
      {
        heading: "When you finish an audiobook",
        body: "You consumed something. A story happened, you followed it, it ended. The experience was the author's — you were a passenger in it. If it was excellent, you feel satisfied. If it missed you, you feel vaguely disappointed without being able to articulate why.",
      },
      {
        heading: "When you finish a personalised audio story",
        body: "Something happened to you. The experience was shaped around you from the start, which means it landed specifically rather than generally. You feel met rather than exposed to. The difference is the difference between reading a letter addressed to everyone and receiving one addressed to you.",
      },
      {
        heading: "When you create a personalised audio story at midnight",
        body: "An audiobook was written two years ago for a general audience. The story playing in your ears right now was made tonight, for the mood you described, for the version of you that is lying in the dark right now. It did not exist before you needed it. This distinction — small in description, enormous in experience — is what makes personalised audio storytelling a genuinely different category.",
      },
    ],
    interstitial: "A story made for tonight. For the version of you that showed up right now.",
  },
  benefits: {
    h2: "Why Personalised Audio Stories Go Further",
    items: [
      {
        heading: "Relevance creates deeper immersion",
        body: "Audiobook immersion comes from production craft. Personalised audio story immersion comes from fit — the story was shaped around you, and your mind recognises that immediately. No translation required.",
      },
      {
        heading: "Better for winding down and sleep",
        body: "Audiobooks require sustained attention — following plot, remembering characters. Personalised audio stories toned for sleep and relaxation work with your natural wind-down process rather than against it.",
      },
      {
        heading: "You are the centre, not the observer",
        body: "An audiobook places you outside the story looking in. A personalised audio story places you at its centre — the pacing, the tone, the emotional arc were all shaped around the specific version of you that is listening tonight.",
      },
      {
        heading: "No browsing, no settling",
        body: "The forty-five minute scroll through a library that doesn't quite have what you need — that experience doesn't exist here. You describe how you want to feel. It gets made. You listen.",
      },
      {
        heading: "Thirty minutes, not thirty hours",
        body: "Audiobooks are designed for sustained commitment. Personalised audio stories fit the specific window when you need them — the hour before sleep, the quiet time you've carved out. Duration matched to purpose.",
      },
      {
        heading: "A different story every time",
        body: "The audiobook you listened to six months ago is identical today. A personalised story created tonight reflects your current state. You can create something different tomorrow because tomorrow you might need something different.",
      },
    ],
  },
  fullPicture: {
    h2: "What The Private Story Offers That Audiobooks Cannot",
    paragraphs: [
      "What The Private Story offers is the format that fills the gap — the one for the moments when a library of someone else's choices isn't what you need.",
      "If you've been looking for something better than audiobooks for winding down or sleep, personalised audio stories represent a meaningfully different option: toned for calm, shaped for your current mood, and designed to carry you toward rest rather than maintain your engagement.",
      "If you've ever started an audiobook and thought: I'm not in the mood for this particular story tonight — this is the alternative. You don't adapt to the content. The content adapts to you.",
      "For adult women in particular, who have consistently been underserved by audio content that was either designed for a younger audience or assumed a one-size-fits-all approach to desire and emotional experience, the personalised model represents something more fundamental: a format that starts by asking what you need instead of offering what it has.",
      "The comparison between audio stories and audiobooks ultimately comes down to a single question: do you want to follow a story made for everyone, or inhabit one made for tonight?",
    ],
  },
  finalCTA: {
    h2: "You've listened to stories made for everyone. Here is one made for you.",
    paragraphs: [
      "The Private Story begins with a question about you — how you want to feel, what you need right now, the emotional register that matches this specific version of yourself tonight.",
      "Then it makes something around your answer.",
      "Not selected from a library. Not adapted from a template. Made for tonight.",
    ],
    primary: { label: "Try a personalised story", href: "/create" },
    links: [
      { label: "See pricing", href: "/pricing" },
      { label: "Explore personalised audio stories", href: "/personalised-audio-stories" },
      { label: "Learn about private audio stories", href: "/private-audio-stories" },
    ],
  },
  faqs: [
      { q: `What is the difference between an audio story and an audiobook?`, a: `An audiobook is a recording of a published book — written for a general audience, fixed in content, the same for every listener. A personalised audio story is created around your specific mood and preferences at the moment you request it. The content adapts to you rather than you adapting to it. The experience is closer, more personal, and specifically suited to emotional and relaxation listening rather than information or long-form narrative consumption.` },
      { q: `Can audio stories replace audiobooks?`, a: `They serve different purposes rather than replacing each other. Audiobooks are ideal for long-form narrative, non-fiction, and sustained attention listening. Personalised audio stories are ideal for emotional experience, winding down, relaxation, and the moments when you need something that meets you specifically rather than a general audience. Most listeners find value in both formats for different occasions.` },
      { q: `Are personalised audio stories shorter than audiobooks?`, a: `Yes. Personalised audio stories typically run between fifteen and thirty minutes — designed for the specific listening windows where they work best. Audiobooks run anywhere from six to twenty-plus hours. The difference in length reflects a difference in purpose: audiobooks are for sustained engagement, personalised audio stories are for specific emotional experiences in the time you have available.` },
      { q: `Why do audio stories feel more immersive than audiobooks?`, a: `The immersion in personalised audio stories comes from relevance rather than production quality. When a story was shaped around your current mood and preferences, your mind recognises the fit immediately — there is no translation work required between a general story and your specific experience. This creates a quality of presence and intimacy that is difficult to achieve with fixed content written for a general audience, regardless of how well that content is produced.` },
      { q: `What are audio stories best used for?`, a: `Personalised audio stories are best used for: winding down after a difficult day, transitioning from work mode to rest, the pre-sleep window when your mind needs somewhere to go, emotional processing, quiet time alone, and any moment when you want to feel something specific rather than consume something general. They are particularly effective as a better alternative to audiobooks for winding down and sleep listening.` },
      { q: `Are audiobooks or audio stories better for sleep?`, a: `Personalised audio stories are significantly more effective for sleep than audiobooks. Audiobooks require sustained narrative engagement — following plot, remembering characters, tracking where you are in the story — which keeps the mind active. Personalised audio stories created with a sleep or relaxation intent are toned and paced to carry you toward rest rather than maintain your attention. The personalisation means the tone matches your current state rather than requiring you to adapt.` },
      { q: `How long does a personalised audio story take to create?`, a: `The creation process — choosing your mood, tone, and preferences — takes less than two minutes. Your story is then generated and ready to listen to shortly after. The story itself runs between fifteen and thirty minutes depending on your selections.` },
    ],
  comparisonTable: {
    caption: "Personalised audio stories vs audiobooks",
    otherLabel: "Audiobooks",
    rows: [
      { feature: "Personalisation", thePrivateStory: "Story created around your mood and choices", other: "Fixed content written for a general audience" },
      { feature: "Length", thePrivateStory: "15–30 minutes per story", other: "6–20+ hours per title" },
      { feature: "Privacy", thePrivateStory: "Private to your account; no public history", other: "Library with public ratings and shared listening data" },
      { feature: "Engagement style", thePrivateStory: "Passive emotional experience — relax and listen", other: "Active narrative engagement — track plot and characters" },
      { feature: "Best for", thePrivateStory: "Winding down, sleep, emotional experience", other: "Sustained narrative, learning, commuting" },
      { feature: "Content register", thePrivateStory: "Adult, emotionally intelligent, tailored to you", other: "Varies widely; adult titles in separate sections" },
    ],
  },
};

export const audioStoriesVsPodcastsConfig: SEOPageConfig = {
  meta: { title: `Audio Stories vs Podcasts — One Is Made for Everyone. One Is Made for You. | The Private Story`, description: `Podcasts are brilliant — but not at 11pm. Discover why personalised audio stories outperform podcasts for winding down, relaxation, and sleep, and when to reach for each format.` },
  hero: { badge: `Comparison · Personalised Audio · For Adults`, h1: `Audio Stories vs Podcasts — One Is Made for Everyone. One Is Made for You.`, tagline: `You reach for your phone at night. You open the podcast app. You scroll. Nothing feels right. This is not a coincidence.` },
  sections: [
    {
      h2: "The Problem With Podcasts at Night",
      paragraphs: [
        "Podcasts are one of the most successful media formats ever created. Billions of hours consumed every year. Loyal audiences. Extraordinary range — true crime, business, comedy, culture, science, storytelling. If you want to be informed, entertained, or intellectually engaged, there is almost certainly a podcast that does it brilliantly.",
        "This is not a case against podcasts.",
        "It is a case for understanding why podcasts — even the ones you love — often fail you in the specific moments you reach for them most. The late evenings. The wind-down hour. The space before sleep when you want to feel something quiet and personal rather than broadcast-at.",
        "Podcasts were built for public consumption. They are designed, produced, and distributed with a general audience in mind. The host does not know you. The episode was recorded weeks ago for whoever happens to press play. The tone is calibrated for engagement — which is exactly the opposite of what you need when you are trying to disengage.",
        "A personalised audio story was built for private consumption. It exists for one listener. It was shaped around your current mood, your preferences tonight, the specific emotional experience you needed when you asked for it.",
        "The difference between these two formats is not about quality. Some podcasts are masterpieces of their form. The difference is about intention — and that intention determines everything about how the experience lands when you are lying in the dark trying to feel something other than what the day left behind.",
      ],
    },
    {
      h2: "What Podcasts Are Genuinely Brilliant At",
      paragraphs: [
        "Before making the case for what podcasts cannot do, it is worth being precise about what they do exceptionally well.",
        "Podcasts are the ideal format for learning while doing — absorbing information during a commute, a run, household tasks. For staying informed on news, culture, and ideas without reading. For the specific pleasure of a regular host relationship — the feeling of tuning into someone you trust weekly. For true crime, comedy, and long-form interviews where sustained attention is rewarded.",
        "The podcast format rewards curiosity, engagement, and the desire to be part of a conversation happening between a host and the wider world. Millions of people structure their weeks around their favourite shows. This is a genuine and valuable relationship with audio content.",
        "But notice what all of this requires: active engagement. The willingness to be addressed as part of a large audience. Cognitive availability. The ability to follow an argument, a narrative, or a conversation that was designed for general consumption rather than your specific state.",
        "These requirements are fine at noon. They become a problem at 11pm.",
      ],
    },
    {
      h2: "Why Podcasts Fail the Evening Listener",
      paragraphs: [
        "There is a specific failure mode that podcast listeners experience regularly and rarely name accurately.",
        "You are tired. The day is done. You reach for your phone and open the podcast app. You scroll through the feed — episodes you've been meaning to get to, new releases, things friends recommended. Nothing feels right. You start something. You listen for eight minutes and realise your mind has gone somewhere else entirely. You restart. You try something else. Twenty minutes later you are still scrolling and now you are also slightly more awake than when you started.",
        "This experience is not about the quality of the podcasts. It is about a structural mismatch between what the format demands and what you can offer at that hour.",
        "Podcasts make cognitive demands. They ask you to follow an argument across forty minutes. To care about the guest's story arc. To hold context from the beginning of the episode when you are in the last ten minutes. To remain the kind of engaged listener the host is speaking to.",
        "At the end of a long day, that cognitive availability may simply not exist. And when a format asks more than you have, the result is the scrolling loop — the search for something that requires less, that meets you where you are rather than where the host assumes you are.",
        "Personalised audio stories make no cognitive demands. They ask only that you listen. The story goes where you directed it before it began. The tone matches your current state. Your mind can follow it without effort — and in following without effort, finally releases the day.",
      ],
    },
    {
      h2: "The Fundamental Difference — Broadcast vs Private",
      paragraphs: [
        "The deepest distinction between podcasts and personalised audio stories is not length, genre, or production style. It is the direction of travel.",
        "A podcast is a broadcast. It moves from one creator outward toward a mass audience. Even the most intimate, confessional, carefully crafted podcast is fundamentally a public act — made to be heard by thousands or millions, optimised for a general listener, existing in a shared cultural space.",
        "A personalised audio story moves in the opposite direction. It begins with you — your preferences, your mood, your needs tonight — and moves inward toward a single listener. It is not optimised for a general audience because there is no general audience. There is only you.",
        "This distinction matters most in the specific moments when you most want to feel that something was made for you rather than broadcast at you.",
        "Private audio content for adults designed around individual preferences creates a qualitatively different listening experience than any public broadcast can produce. Not because it is better produced — because it is specifically yours. Your imagination recognises the fit. Your mind relaxes into content that was shaped around it rather than content it has to shape itself around.",
        "This is the shift from consumer to recipient. From audience member to the only person in the room.",
      ],
    },
    {
      h2: "When to Keep the Podcast — and When to Switch",
      paragraphs: [
        "The choice is not permanent and it is not absolute. Podcasts and personalised audio stories serve different listening occasions.",
      ],
      bullets: [
        "Keep the podcast for morning commutes when your mind is fresh",
        "Keep the podcast for exercise and active listening",
        "Keep the podcast for learning something specific",
        "Keep the podcast for the lunch hour with cognitive availability to spare",
        "Reach for a personalised audio story when it is evening and the day has been a lot",
        "Reach for a personalised audio story when you are winding down and need something that winds down with you",
        "Reach for a personalised audio story when you want to feel something specific rather than consume something general",
        "Reach for a personalised audio story when you are in bed and need your mind to slow rather than engage",
        "Reach for a personalised audio story when you have scrolled the podcast feed for ten minutes and nothing feels right",
      ],
    },
    {
      h2: "Podcasts vs Audio Stories for Relaxation — The Full Picture",
      paragraphs: [
        "The category of podcasts vs audio stories for relaxation reveals an important truth about audio content that the podcast industry rarely acknowledges: engagement and relaxation are in tension with each other.",
        "The qualities that make a podcast excellent — compelling host, interesting ideas, narrative momentum — are the same qualities that keep you awake. The format is optimised for attention, not for release.",
        "Alternatives to podcasts for adults who want to wind down are genuinely limited. Music works for some people some of the time. Meditation apps ask too much of an already tired mind. Audiobooks require the sustained engagement of following someone else's narrative. White noise and ambient sound fill the silence without giving the mind anywhere to go.",
        "Personalised audio stories fill this gap specifically. They are engaging enough to redirect an active mind away from the day. They are calm enough to carry that mind toward rest. They are personal enough to feel like they were made for tonight — because they were.",
        "Audio stories instead of podcasts at night is not a permanent replacement for a format that serves you well at other times. It is the right tool for the specific job of winding down — which podcasts, for all their excellence, were never designed to do.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Choose your mood and tone",
      body: "Tell us how tonight feels and what you need. Calm and warm. Gently atmospheric. Slow burn tension. Emotionally connecting. Your choice determines everything — the pacing, the voice, the world of the story. Less than two minutes.",
    },
    {
      heading: "Your story is created",
      body: "Not retrieved. Not selected from a catalogue. Generated around your selections, now, for this session. The story exists because you needed it tonight — it did not exist before you asked for it.",
    },
    {
      heading: "Listen privately",
      body: "Saved to your account, heard only by you. No public feed. No shared library. No algorithm broadcasting your preferences. Entirely private, entirely personal.",
    },
  ],
  scenarios: {
    h2: "What the Experience Feels Like — The Contrast",
    intro: "Two versions of the same evening:",
    items: [
      {
        heading: "A typical podcast evening",
        body: "You open the app. You scroll. You start an episode — it's good, actually, but your mind keeps slipping. The host is talking about something you'd find interesting tomorrow. Tonight you can't hold the thread. You listen to half of it. You switch to something shorter. You're still awake.",
      },
      {
        heading: "A personalised audio story evening",
        body: "You make three choices that take ninety seconds. A story is made around those choices. You put in your headphones. The voice starts. It is unhurried — paced for exactly the mood you described. Your mind follows it. The day recedes. At some point you realise you're not thinking about anything except the story. Shortly after that you are not thinking at all.",
      },
      {
        heading: "The difference in the morning",
        body: "The podcast app will be there tomorrow. The episode you couldn't follow last night will feel different when your mind is rested and available. Podcasts are morning and midday content for a reason — not because they aren't excellent, but because what they ask of you is better matched to a mind that has something to give. Tonight was for something else.",
      },
    ],
    interstitial: "The podcast scroll at night is a symptom. There is an answer that isn't another podcast.",
  },
  benefits: {
    h2: "The Benefits of Choosing Audio Stories Over Podcasts at Night",
    items: [
      {
        heading: "No cognitive demands",
        body: "Podcasts require sustained engagement. Personalised audio stories require only that you listen. The distinction matters enormously at the end of a long day when cognitive availability is low and the need for genuine rest is high.",
      },
      {
        heading: "Content shaped around your mood",
        body: "Podcasts are shaped around their host's agenda and audience. Your story is shaped around your mood tonight — the pacing, tone, and emotional destination all reflecting what you chose when you asked for it.",
      },
      {
        heading: "Genuinely private",
        body: "Podcasts exist in a public cultural space even when you listen alone. Your personalised audio story exists only in your account, heard only by you, shaped only around your preferences. The privacy is structural, not just a setting.",
      },
      {
        heading: "No more scrolling",
        body: "The podcast feed scroll at night is one of the most counterproductive things you can do before sleep — screen time, decision fatigue, the low-grade frustration of nothing feeling right. Creating a personalised audio story takes ninety seconds and produces something that fits.",
      },
      {
        heading: "Audio content that actually feels personal",
        body: "Podcasts at their best feel like a host who gets you. Personalised audio stories feel like something made specifically for you — because they were. The distinction in how this lands emotionally is immediately apparent.",
      },
      {
        heading: "Designed for the wind-down window",
        body: "Podcasts were designed for engagement. Personalised audio stories were designed for the exact hour when engagement is not what you have to offer — when what you need is something that does the work for you.",
      },
    ],
  },
  fullPicture: {
    h2: "The Podcast App Will Be There Tomorrow Morning",
    paragraphs: [
      "The podcast scroll at night is a symptom. The search for something that matches your current emotional state, that feels private and personal rather than public and general, that asks nothing of you except to receive it — that search has an answer that is not another podcast.",
      "Audio stories instead of podcasts at night is the right tool for a specific job: winding down an active mind, carrying a tired person toward rest, and providing the specific experience of something that was made for you rather than broadcast at you.",
      "For adult listeners in particular, who have spent years reaching for podcast apps at night and experiencing the scrolling loop, the distinction between a format designed for engagement and a format designed for release is not academic. It is the difference between lying awake listening to half an episode and waking up in the morning having slept.",
      "What The Private Story provides is the format for the evening. The podcast app will be there when you need it — in the morning, on the commute, during the run. Tonight, something was made for you.",
    ],
  },
  finalCTA: {
    h2: "Tonight, something was made for you.",
    paragraphs: [
      "The podcast scroll ends here.",
      "Three choices. Ninety seconds. A story shaped around your mood tonight — paced for exactly the version of you that showed up at the end of this day.",
      "Not broadcast at you. Made for you.",
    ],
    primary: { label: "Create your first story", href: "/create" },
    links: [
      { label: "See pricing", href: "/pricing" },
      { label: "Personalised audio stories — how it works", href: "/personalised-audio-stories" },
      { label: "Create your own audio story", href: "/create-your-own-audio-story" },
    ],
  },
  faqs: [
      { q: `What is the difference between a podcast and an audio story?`, a: `A podcast is a public broadcast — produced for a general audience, released on a schedule, the same for every listener regardless of when or why they tune in. A personalised audio story is created around a single listener's mood and preferences at the moment they request it. Podcasts are designed for engagement and information. Personalised audio stories are designed for emotional experience and rest. The direction of travel is opposite: podcasts move from creator to mass audience, personalised audio stories move from your preferences inward toward a single listener.` },
      { q: `Can audio stories replace my evening podcast habit?`, a: `For evening and pre-sleep listening, personalised audio stories are significantly more effective than podcasts at producing the experience most people are actually looking for at that hour — something calming, personal, and requiring nothing of an already tired mind. This does not mean giving up podcasts entirely. Most listeners find podcasts serve them well during active hours and personalised audio stories serve them better during wind-down and sleep hours.` },
      { q: `Why don't podcasts help me wind down?`, a: `Podcasts are optimised for engagement — which is the opposite of what winding down requires. The qualities that make a podcast good (compelling host, interesting content, narrative momentum) are the same qualities that keep your mind active and alert. Personalised audio stories are toned and paced for the specific purpose of helping an active mind slow down, which is why they work in the wind-down window where podcasts consistently fail.` },
      { q: `Are personalised audio stories like a private podcast?`, a: `The comparison is useful but incomplete. Like a podcast, a personalised audio story is audio content delivered to your ears. Unlike a podcast, it was created around your specific mood and preferences rather than produced for a general audience. It is private by design — not available to other listeners, not part of a public feed, not optimised for anyone except you. The experience of listening is fundamentally more personal than any podcast can be, because the content itself was made for you.` },
      { q: `What makes audio stories more relaxing than podcasts?`, a: `Three things. First, no cognitive demands — audio stories ask only that you listen, where podcasts ask you to follow an argument or narrative requiring active engagement. Second, personalisation — a story toned around your current mood works with your natural wind-down process rather than against it. Third, privacy — content that was made for you and exists only for you creates a qualitatively different listening experience than a broadcast designed for millions.` },
      { q: `How are audio stories different from narrative podcasts?`, a: `Narrative podcasts — scripted fiction podcasts, audio dramas — are closer in format to audio stories than interview or discussion podcasts. But they share the same fundamental characteristic: they were made before you arrived, for a general audience, with a fixed narrative that goes where the creator decided it goes. A personalised audio story is created in response to you — your mood, your preferences, your direction. The narrative serves your emotional needs rather than the creator's vision.` },
      { q: `Is there an audio story platform for adults?`, a: `The Private Story is a personalised audio story platform designed specifically for adults. It creates stories around your mood and preferences — private, emotionally intelligent, and calibrated for adult experience. Unlike podcast platforms, there is no public feed, no shared content library, and no social component. Everything is created for and heard by you alone.` },
    ],
  comparisonTable: {
    caption: "Personalised audio stories vs podcasts",
    otherLabel: "Podcasts",
    rows: [
      { feature: "Content personalisation", thePrivateStory: "Created around your mood and choices tonight", other: "Made for a general audience; the same for everyone" },
      { feature: "Cognitive demand", thePrivateStory: "Passive — no narrative tracking required", other: "Active — follow hosts, arguments, story arcs" },
      { feature: "Wind-down effectiveness", thePrivateStory: "Paced and toned for relaxation", other: "Optimised for engagement — keeps the mind active" },
      { feature: "Privacy", thePrivateStory: "Private account; no public listening history", other: "Listening data shared with platform and advertisers" },
      { feature: "Length", thePrivateStory: "15–30 minutes — complete in one session", other: "20–90 minutes; often left partially listened" },
      { feature: "Content register", thePrivateStory: "Adult, intimate, emotionally calibrated", other: "Ranges widely; adult content limited" },
    ],
  },
};

export const bedtimeAudioStoriesConfig: SEOPageConfig = {
  meta: { title: `Bedtime Audio Stories for Adults | The Private Story`, description: `Bedtime audio stories created for adults. Calming, private, and personalised around your mood. Fall asleep to a story made specifically for tonight.` },
  hero: { badge: `Bedtime · Calm · Adults Only`, h1: `Bedtime Audio Stories for Adults — Calm, Private, Made for Your Night`, tagline: `Not a children's story with the language updated. A story made for how you actually arrive at the end of your day.` },
  sections: [
    {
      h2: "The Problem With Trying to Sleep",
      paragraphs: [
        "Most adults don't struggle to sleep because they aren't tired. They struggle because the mind doesn't know it's allowed to stop.",
        "The day accumulates — obligations, conversations, decisions, the things that went wrong and the things left unfinished — and when the lights go out, it continues processing. Silence doesn't help. Darkness doesn't help. The absence of stimulation simply creates space for everything that was already there.",
        "The mind needs somewhere to go before it can let go.",
        "A bedtime audio story gives it somewhere worth going — a voice, a world, a narrative moving at a pace slow enough to follow without effort. Something genuinely different from what's already in your head. By the time the story settles into its world, the day is somewhere else. And sleep, which was never the problem, becomes possible.",
      ],
    },
    {
      h2: "Why These Are Not Children's Bedtime Stories",
      paragraphs: [
        "Adult bedtime stories occupy a category that mainstream audio platforms have mostly ignored. Children's bedtime content is abundant. Content designed to actually work for adults — with adult emotional lives, adult exhaustion, adult sensibilities — is rare.",
        "The distinction matters because the experience of needing to sleep is entirely different as an adult.",
        "Children need distraction and comfort. Adults need decompression and redirection — from a specific kind of cognitive activity toward something the mind can inhabit lightly, without effort, and eventually release into sleep. The pacing of the story needs to accommodate the way adult attention moves when it's tired. The content needs to give the mind something interesting enough to follow and calm enough not to re-engage it.",
        "At The Private Story, bedtime audio stories for adults are created for that specific experience. They are written and paced for grown-up listening. They are calibrated to the way adult minds wind down — which is not at all the same as the way children do.",
      ],
    },
    {
      h2: "What Makes a Bedtime Story Work for Adults",
      paragraphs: [
        "Pacing is the mechanism. Most audio content — podcasts, audiobooks, even ambient narratives — is paced for waking attention. It assumes you are present, that you are tracking, that your mind is engaged enough to hold a thread. Bedtime content requires the opposite: pacing that allows for drift, that doesn't punish a wandering mind, that continues being worth returning to even when you've been half-elsewhere for thirty seconds.",
        "Tone is the atmosphere. The voice of a story — its register, its warmth, its intimacy — sets the emotional weather of the listening experience. A calming bedtime story needs a tone that the body can respond to. Not performatively soothing. Genuinely unhurried. A voice that knows you're tired and doesn't ask you to keep up.",
        "Content is the anchor. The narrative gives your imagination somewhere specific to be rather than cycling through its default material. You don't choose between going to sleep and continuing to think. You choose between your thoughts and the story. The story only needs to be more compelling than the day you're trying to leave behind — which, on most nights, is not a high bar.",
        "The Private Story creates around all three. The pacing, tone, and content of your bedtime story are shaped by the choices you make before generation — so the result is calibrated for the specific version of winding down you need tonight.",
      ],
    },
    {
      h2: "The Gap That Meditation Apps Don't Fill",
      paragraphs: [
        "Sleep and meditation apps address the sleep problem at the level of the body: breathing techniques, body scans, progressive relaxation. For many people, in many situations, these work well.",
        "But they require a kind of active participation. You follow instructions. You direct your attention to specific places. You do something in order to arrive somewhere. When the day has been long and the mind is resistant, this active engagement is precisely what makes them difficult. You are trying to relax by doing relaxation correctly, which turns out to feel a great deal like working.",
        "A bedtime audio story requires nothing of you except to listen. The narrative does the work of redirecting your attention. You follow it passively — because that is what stories are for — and in following it, the mind's grip on the day gradually releases.",
        "For adults whose minds resist direct instruction, whose thoughts return immediately when the guided meditation ends, who find the effort of mindfulness counterproductive when tired: bedtime audio stories offer a different route to the same destination.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Choose how you want tonight to feel",
      body: "Slow and calming. Quietly connecting. A story that resolves warmly. A voice that takes its time because you've finally earned yours. You describe the version of tonight you need, and your story is shaped around it.",
    },
    {
      heading: "Your bedtime story is created for you",
      body: "The pacing, tone, and world of the story are generated around your choices — not retrieved from a library of pre-written content. The story exists for this night, for this version of needing to sleep.",
    },
    {
      heading: "Listen privately and let the day go",
      body: "Your story is saved to your private account and heard only by you. Put it on, close your eyes, and give your mind somewhere worth going. The rest follows.",
    },
  ],
  scenarios: {
    h2: "What Bedtime Stories for Adults Sound Like",
    items: [
      {
        heading: "A slow, calming story — for a mind that won't stop",
        body: "Deliberately paced to give the mind something to follow while the body catches up. The narrative moves without urgency — not plotless, but unhurried. The voice doesn't rush toward resolution because the resolution is not the point. The point is the quality of being somewhere else for long enough to arrive at sleep from there rather than from here.",
      },
      {
        heading: "A quiet connection story — for a night that feels lonely",
        body: "A voice and a presence. The specific kind of relaxation that comes from feeling accompanied — not alone with your thoughts, not alone with the day. The story is warm without being saccharine. Intimate in the way that genuine human presence is intimate, which means unhurried and genuinely interested. You feel heard by something that was made specifically for you, which it was.",
      },
      {
        heading: "A gentle tension story — for when you need something to carry you there",
        body: "Not every bedtime story needs to be purely calming. Sometimes the mind needs a mild narrative current to follow before it can release. A story with gentle tension — something building toward a resolution that arrives warmly, satisfyingly, and then settles — can carry a restless mind into sleep more effectively than something purely atmospheric. You arrive at the ending and find you're already where you needed to be.",
      },
    ],
    interstitial: "Create a bedtime story shaped around how you actually arrive at the end of your day.",
  },
  benefits: {
    h2: "Why Personalised Bedtime Audio Works",
    items: [
      {
        heading: "Made for tonight specifically",
        body: "The story is created around your mood and preferences for this session. Not pre-set for a general audience's idea of calming. Written for the specific version of tired, restless, or ready-to-wind-down that you are right now.",
      },
      {
        heading: "Paced for sleep, not engagement",
        body: "The generation is calibrated for bedtime listening — unhurried, drift-tolerant, designed to remain worth returning to even when attention wanders. It doesn't punish you for going half-elsewhere. It's still there when you drift back.",
      },
      {
        heading: "No effort required",
        body: "You listen. The story does everything else. There are no instructions to follow, no techniques to perform, no anxiety about whether you're doing it correctly. If you're tired enough to need a bedtime story, you're tired enough for this to work.",
      },
      {
        heading: "Entirely private",
        body: "Your bedtime stories are saved to your account and heard only by you. No visible history, no shared feed, no social dimension to a deeply personal experience.",
      },
      {
        heading: "A new story whenever you need one",
        body: "You can create something different every night. Your mood shifts — your story can shift with it. Nothing to exhaust, no favourite worn thin by repetition.",
      },
      {
        heading: "Ready in under two minutes",
        body: "The choices that shape your story take less than two minutes. Then it's yours. No browsing. No settling. No spending the last of your energy trying to find something that will work.",
      },
    ],
  },
  fullPicture: {
    h2: "Bedtime Audio Stories for Adults — The Full Picture",
    paragraphs: [
      "Adult bedtime stories as a category have historically sat in a gap. Too sophisticated for children's bedtime content. Too gentle for the genre fiction and thriller audiobook market. Too personal for general wellness platforms that produce relaxation audio for the broadest possible audience.",
      "The Private Story exists in that gap by design.",
      "Bedtime stories to fall asleep to — created specifically for that purpose, calibrated for the pacing and tone that actually helps adults transition into sleep — require a different kind of content than any adjacent category provides. Not meditation. Not audiobooks. Not ambient sound. Stories.",
      "Relaxing bedtime audio for adults is most effective when it is created around the listener rather than for a statistical average of listeners. Calming bedtime stories for women who have spent the day carrying other people's needs and urgencies — and who arrive at night wanting something that is entirely theirs — work differently from content produced without that understanding.",
      "Sleep stories for grown ups, at their best, understand the emotional complexity of adult nights. The particular texture of needing to rest when the mind is not done processing. The difference between wanting to feel accompanied and wanting to feel calm. The specific satisfaction of a story that resolves gently — that goes somewhere and arrives there with you — before releasing you into sleep.",
    ],
  },
  finalCTA: {
    h2: "Create Tonight's Bedtime Story",
    paragraphs: [
      "You have been lying awake with a mind that doesn't know it's allowed to stop. With content that wasn't made for this. With silence that fills immediately with everything you were trying to leave behind.",
      "A story made for how you actually feel tonight changes that.",
      "Tell it what you need. It creates something around that — paced for sleep, toned for calm, private and entirely yours. Two minutes to make. The rest of the night to work.",
    ],
    primary: { label: "Start your bedtime story", href: "/drift" },
    links: [
      { label: "See pricing", href: "/pricing" },
      { label: "Relaxing audio stories", href: "/relaxing-audio-stories" },
      { label: "Sleep audio stories", href: "/sleep-audio-stories" },
    ],
  },
  faqs: [
      { q: `What are adult bedtime audio stories?`, a: `Adult bedtime audio stories are narrated audio created specifically to help grown-up listeners wind down and transition into sleep. Unlike children's bedtime content, they are paced and toned for adult sensibilities — written for the emotional complexity of adult nights, calibrated to the way grown-up minds decompress, and created around the specific mood and preferences of the individual listener.` },
      { q: `How long are the bedtime stories?`, a: `Stories typically run between fifteen and thirty minutes — long enough for the mind to genuinely settle into the world of the story before you arrive at sleep. Your story is saved to your account, so if you fall asleep before it ends, you can return to it or create a new one the following night.` },
      { q: `Can I choose a calming tone for my story?`, a: `Yes — this is central to how The Private Story works. Before your story is generated, you choose the emotional register you want. A slow, calming pace. A quietly connecting voice. A gentle story that resolves warmly. Your choices shape every element of what the AI creates — the tone, the pacing, the world of the story, the way it moves.` },
      { q: `Will these help me sleep?`, a: `For many adults, yes — particularly those whose sleep difficulty comes from a mind that won't stop rather than from a physical cause. The story provides the mind with somewhere to go rather than continuing to process the day, which reduces the mental activity that delays sleep. Results vary between individuals and nights, and The Private Story is not a medical device, but the mechanism — redirecting a restless mind — is well-established.` },
      { q: `Are these different from sleep meditation apps?`, a: `Significantly. Sleep meditation apps typically ask you to actively participate — follow breathing, direct your attention, perform relaxation techniques. When you're tired and your mind is resistant, this active effort can be counterproductive. A bedtime audio story requires nothing of you except to listen. The narrative redirects your attention passively. For adults who find meditation difficult or ineffective when tired, stories often work considerably better.` },
      { q: `Can I listen offline?`, a: `Stories are saved to your private account and accessible whenever you're logged in. Offline listening is on the roadmap — if this is important to you, it's worth knowing that the experience is designed to be as low-friction as possible at the moment you need it.` },
      { q: `Is there a timer or sleep mode?`, a: `The platform is designed to minimise friction at bedtime. Stories are created at a length suitable for sleep listening, and the audio experience is built around private, quiet, low-stimulation use. Sleep timer features are part of the ongoing development — the platform continues to be built around how adults actually use it.` },
    ],
};

export const bestAudioStoryAppForAdultsConfig: SEOPageConfig = {
  meta: { title: `The Best Audio Story App for Adults — What to Look for and Why Personalisation Wins | The Private Story`, description: `Most audio apps were built for everyone. The best one for you was built around you. Discover the five criteria that separate excellent adult audio platforms from disappointing ones.` },
  hero: { badge: `Best Audio Apps · Personalised Content · For Adults`, h1: `The Best Audio Story App for Adults — What to Look for and Why Personalisation Wins`, tagline: `Most audio apps were built for everyone. The best one for you was built around you.` },
  sections: [
    {
      h2: "Why Most Adults End Up Disappointed by Audio Apps",
      paragraphs: [
        "The audio content market has never been larger. Streaming platforms, podcast networks, audiobook subscriptions, meditation apps, ambient sound generators — the options are genuinely overwhelming.",
        "And yet a specific dissatisfaction persists among adult listeners, particularly in the evening hours. The app library is full. Nothing feels right. You scroll, you sample, you settle. You finish the session feeling like you consumed something rather than experienced something.",
        "This dissatisfaction has a cause. Most audio apps — even excellent ones — were built on the library model. Content created in advance, for a general audience, organised into categories, and made available for browsing. The assumption is that if the library is large enough, most people will find something that fits most of the time.",
        "For casual daytime listening, this works reasonably well. For the specific emotional needs of adult listeners in the evening — the need to wind down, to feel something specific, to access content that meets you where you are rather than where a content team assumed you'd be — the library model consistently falls short.",
        "The best audio story app for adults doesn't just have more content. It has a fundamentally different relationship with the listener. Understanding what that difference looks like — what to actually evaluate when choosing an audio platform — is the purpose of this page.",
      ],
    },
    {
      h2: "Criterion 1 — Personalisation: Does the App Create for You or Present to You?",
      paragraphs: [
        "This is the most important distinction in the entire category and the one most marketing materials obscure.",
        "Presenting is what most apps do. They curate a library of pre-created content, organise it by genre or mood, and present it for your selection. The content was made before you arrived. Your job is to find the closest match.",
        "Creating is what the best apps do. They take information about your current mood, preferences, and needs and generate an experience around those inputs. The content exists because of you, not before you.",
        "The difference in experience is dramatic. A story presented from a library may be excellent in absolute terms and still miss you completely because it was made for a general audience and you are not a general audience member tonight. A story created around your current mood cannot miss you — it was aimed directly at you from the start.",
        "When evaluating a personalised story app for adults, the first question to ask is: does this app select content for me, or does it create content around me? The answer determines everything about how the experience will feel in practice.",
      ],
    },
    {
      h2: "Criterion 2 — Privacy Architecture: Is Privacy a Setting or a Foundation?",
      paragraphs: [
        "Adult audio content — particularly emotional, intimate, or romantic content — requires genuine privacy to work properly.",
        "Most audio platforms offer privacy as a setting. The default is social and shared. You can adjust settings to make your listening history private, opt out of recommendations, turn off the social features. But the platform was built with sharing in mind, and the private mode is an adaptation of a system that was never fundamentally private.",
        "The best private audio story app for adults is private by design, not by configuration. There is no social layer to opt out of because no social layer was ever built. There is no shared library because sharing was never the intention. There is no algorithm broadcasting your preferences because the platform doesn't operate that way.",
        "This architectural difference matters beyond the obvious privacy benefit. When content is genuinely private — not hidden behind settings but structurally inaccessible to anyone except you — the listening experience changes. Something relaxes. The content can do more. Emotional guard comes down in a way that it doesn't when you're navigating a platform built for sharing and hoping your privacy settings are correctly configured.",
        "Ask any audio platform: is privacy a feature or a foundation? The answer tells you a great deal about whether the experience will feel genuinely private or provisionally private.",
      ],
    },
    {
      h2: "Criterion 3 — Adult Emotional Intelligence: Was This Built for Grown Women?",
      paragraphs: [
        "The adult audio content market contains a significant gap between what exists and what adult women actually want.",
        "Most audio platforms treat adults as a demographic segment rather than a distinct audience with specific emotional needs. The content is adult in the sense that it is not for children. It is rarely adult in the sense of being emotionally sophisticated, female-centred, and calibrated for the specific texture of grown female experience.",
        "Audio story apps for women that are genuinely designed with women at the centre — not as an afterthought, not as a genre category, but as the primary intended audience — produce a qualitatively different experience. The emotional register is right. The dynamics within the stories reflect how women experience desire, connection, and intimacy rather than how those things have traditionally been written for a male gaze. The tone understands the specific exhaustion, overstimulation, and emotional complexity of modern female life.",
        "When evaluating an adult audio platform, ask: was this built for women, or was it built for adults and assumed to include women? The content produced by these two approaches is noticeably different in feel.",
      ],
    },
    {
      h2: "Criterion 4 — Tone Calibration: Can You Control the Emotional Experience?",
      paragraphs: [
        "The best audio story apps for relaxation understand that emotional needs are not fixed. The tone required on a difficult Wednesday is different from a peaceful Sunday. The experience needed after a stressful day differs from what serves a quiet evening when everything is fine.",
        "An app that offers only one emotional register — however well executed — cannot serve the full range of adult listening needs. An app that allows you to calibrate the emotional experience to your current state is categorically more useful.",
      ],
      bullets: [
        "Look for platforms that allow meaningful control over pacing — slow and building versus immediate and present",
        "Look for control over tone — warm and connecting versus atmospheric and cinematic",
        "Look for control over intensity — calm and settling versus charged and engaging",
        "Look for control over emotional destination — where the story takes you by the end",
      ],
    },
    {
      h2: "Criterion 5 — Content Quality: Does the Writing Match the Ambition?",
      paragraphs: [
        "Audio story apps for adults succeed or fail on the quality of the writing. This sounds obvious and is consistently under-evaluated.",
        "Generic content at scale — the approach most library-based platforms take — produces acceptable writing across a very wide range. Nothing exceptional. Nothing that stays with you. Content that does its job and is forgotten.",
        "Premium personalised content should produce writing that is emotionally intelligent, stylistically distinctive, and calibrated to the specific experience requested. The difference between adequate and exceptional in this category is enormous in terms of how the experience lands — whether you finish a story feeling like something happened to you or merely like you passed the time.",
        "When evaluating any audio storytelling platform, the quality benchmark should be: does this feel like it was written by someone who understood exactly what this experience should feel like? Or does it feel like content produced at volume for a general audience?",
      ],
    },
    {
      h2: "How The Private Story Measures Against These Criteria",
      paragraphs: [
        "Personalisation: The Private Story creates stories around your mood and preferences rather than presenting pre-existing content. The story that plays in your ears was generated for this session, around your choices, tonight. It did not exist before you asked for it.",
        "Privacy: Privacy at The Private Story is architectural. There is no social layer, no sharing function, no public-facing account. Your stories are stored privately in your account and heard only by you. This is not a setting — it is the only way the platform works.",
        "Adult emotional intelligence: The platform was built with women at the centre. The emotional register, the dynamics within stories, the tonal range available — all reflect a genuine understanding of female adult experience rather than a general adult audience assumption.",
        "Tone calibration: You choose your mood and tone before your story is created. The selection shapes the pacing, emotional register, voice quality, and destination of what follows. The experience is calibrated to where you are tonight, not to a fixed category.",
        "Content quality: Stories are generated with literary precision and emotional intelligence — calibrated to be premium rather than adequate, specific rather than general.",
      ],
    },
    {
      h2: "The Full Picture — Adult Audio Story Apps in Context",
      paragraphs: [
        "The category of adult audio story platforms is genuinely new. The personalised creation model — generating content around individual preferences rather than presenting a fixed library — is a recent development that most legacy audio platforms have not adopted.",
        "This means the comparison between personalised story apps for adults and library-based alternatives is largely a comparison between a new approach and an old one. Library platforms have scale, catalogue depth, and established audiences. Personalised platforms have fit — the ability to produce an experience specifically suited to the individual listener in a way that catalogue size cannot replicate.",
        "For casual, daytime, or long-form listening, catalogue depth matters more. For the specific listening occasions where adults most need audio content to do something for them — the wind-down hour, the pre-sleep window, the emotionally difficult evening — fit matters considerably more than catalogue size.",
        "The best app for relaxing stories is not the one with the most stories. It is the one whose stories most accurately reflect what you need when you need it. These are different things, and the difference is the entire argument for personalisation as the defining feature of the next generation of audio content platforms.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Evaluate on these five criteria",
      body: "Personalisation, privacy architecture, adult emotional intelligence, tone calibration, and content quality. Most platforms excel at one or two. The best ones succeed across all five.",
    },
    {
      heading: "Compare against what you actually need",
      body: "Not the largest catalogue, not the most features, not the biggest brand. The platform that creates content around your mood rather than presenting pre-made content, keeps everything private by design, and was built for women rather than a general audience.",
    },
    {
      heading: "Experience the difference",
      body: "The difference between content that was made for everyone and content that was made for you is immediately apparent when you listen. Not in marketing promises, but in how the experience lands.",
    },
  ],
  scenarios: {
    h2: "What the Best Adult Audio Story Experience Actually Feels Like",
    intro: "There is a specific feeling that separates genuinely excellent platforms from library-based alternatives:",
    items: [
      {
        heading: "The feeling of being met",
        body: "Not browsed past. Not served content designed for someone vaguely like you. Met — specifically, personally, at exactly the mood and moment you showed up with. This feeling is the product of personalisation done properly.",
      },
      {
        heading: "Immediate recognition of fit",
        body: "When a story was shaped around your current emotional state, your mind recognises the fit immediately. There is no translation work required between a general experience and your specific need. The story lands because it was aimed at you.",
      },
      {
        heading: "The space to release",
        body: "For relaxation and sleep listening in particular, content that was made for you produces the specific psychological safety that allows the mind to release the day. Content that was made for everyone produces the ambient awareness — even in a private listening session — that you are one of many.",
      },
    ],
    interstitial: "You now know what to look for. Here is the platform that delivers it.",
  },
  benefits: {
    h2: "Why Personalisation Wins",
    items: [
      {
        heading: "Content shaped around you, not for everyone",
        body: "The story was generated in response to your mood and preferences, not created before you arrived for a general audience. This fundamentally changes how specifically it can meet you.",
      },
      {
        heading: "Privacy that doesn't require configuration",
        body: "Your content is private by design, not by settings. There is no social layer to opt out of, no sharing function to decline, no algorithm to limit. The platform was built this way from the start.",
      },
      {
        heading: "Emotional intelligence calibrated for women",
        body: "Built with grown women at the centre, not as a demographic segment. The emotional register, dynamics, and tonal range all reflect genuine understanding of female adult experience.",
      },
      {
        heading: "Full control over your experience",
        body: "You don't adapt to fixed content. The content adapts to you — pacing, tone, intensity, and emotional destination all reflecting your choices before creation.",
      },
      {
        heading: "Premium over adequate",
        body: "Stories generated with literary precision and emotional intelligence, calibrated to be exceptional rather than acceptable. The difference in how this lands is immediate.",
      },
      {
        heading: "Fit over catalogue size",
        body: "The best app is not the one with the most stories. It is the one whose stories most accurately reflect what you need when you need it. Personalisation delivers fit.",
      },
    ],
  },
  fullPicture: {
    h2: "You Now Know What to Look For",
    paragraphs: [
      "The five criteria — personalisation, privacy architecture, adult emotional intelligence, tone calibration, and content quality — separate platforms that genuinely serve adult listeners from ones that seem good until the moment you really need them to work.",
      "Most audio apps perform well on one or two of these. The best ones succeed across all five.",
      "The distinction is not academic. It is the difference between content that was made for everyone and content that was made for you. That difference is the entire argument for the next generation of audio platforms.",
    ],
  },
  finalCTA: {
    h2: "The Platform That Delivers All Five",
    paragraphs: [
      "The Private Story was built with these five criteria as the foundation.",
      "It creates rather than presents. It is private by design. It was built for women. It gives you full control. And it is written with premium emotional intelligence.",
      "You know what to look for. Here it is.",
    ],
    primary: { label: "Try The Private Story", href: "/create" },
    links: [
      { label: "See pricing", href: "/pricing" },
      { label: "Explore personalised audio stories", href: "/personalised-audio-stories" },
      { label: "Learn about private audio stories", href: "/private-audio-stories" },
    ],
  },
  faqs: [
      { q: `What should I look for in an audio story app for adults?`, a: `Five criteria matter most: personalisation (does the app create content around you or present pre-existing content), privacy architecture (is privacy a foundation or a setting), adult emotional intelligence (was the content designed for grown women or a general adult audience), tone calibration (can you control the emotional register of your experience), and content quality (does the writing feel premium or adequate). Most audio apps perform well on one or two of these criteria. The best ones succeed across all five.` },
      { q: `Are there audio story apps with personalised content?`, a: `Yes. The Private Story generates personalised audio stories around your mood and preferences rather than presenting a pre-existing library. The story created for your session did not exist before you chose your preferences — it was generated in response to what you needed. This is distinct from apps that personalise their recommendations from a fixed catalogue, which is a different and considerably less personal experience.` },
      { q: `Which audio story apps are private?`, a: `Most audio apps offer privacy as a configurable setting within a platform that was built for social sharing. The Private Story is private by architectural design — there is no social layer, no sharing function, and no public-facing account profile. Your stories exist only in your account and are heard only by you. This is not something you configure — it is how the platform was built.` },
      { q: `Is there an app that creates audio stories for me?`, a: `Yes. The Private Story creates personalised audio stories around your mood and preferences. You make selections about how you want to feel, and a story is generated around those choices. The story is not retrieved from a library or adapted from a template — it is created for your current session. This typically takes less than two minutes from preference selection to story delivery.` },
      { q: `Are there audio story apps designed specifically for women?`, a: `The Private Story was built with women at the centre. The emotional register, the dynamics within stories, the tonal range, and the specific moods and experiences available all reflect a genuine understanding of female adult experience. This is distinct from platforms that include women as a demographic within a general adult audience — the difference in how the content feels is immediately apparent.` },
      { q: `How is The Private Story different from other audio apps?`, a: `Three differences define the platform. First, it creates rather than presents — stories are generated around your preferences rather than selected from a pre-existing library. Second, it is private by design rather than by setting — there is no social layer, no sharing, no public component of any kind. Third, it was built specifically for adult women rather than a general audience — the emotional intelligence, tonal range, and content calibration reflect this from the first interaction.` },
    ],
};

export const confidentEnergyStoriesConfig: SEOPageConfig = {
  meta: { title: `Confident Energy Audio Stories | The Private Story`, description: `Audio stories built around confident, charged energy. You at the centre. Desired specifically. Private, personalised, and created for how you want to feel tonight.` },
  hero: { badge: `Confident · Charged · Private`, h1: `Confident Energy Audio Stories — At the Centre of Something Cinematic`, tagline: `You as the protagonist — not waiting to be noticed. Already the reason the room changed.` },
  sections: [
    {
      h2: "What Confident Energy Actually Feels Like in a Story",
      paragraphs: [
        "Most stories ask you to inhabit the experience of wanting. The protagonist desires something — connection, recognition, a person. She moves through the world in pursuit of it. The emotional experience of being the reader is one of longing and anticipation.",
        "Confident energy stories invert this entirely.",
        "In a confident energy story, you are not in pursuit. You are the thing being moved toward. The room responds to your presence rather than being unaware of it. The desire in the story flows toward you — specific, considered, unmistakeable — rather than being something you are waiting to receive. The other presence in the story is not someone who might notice you. He notices you. The story begins from that position and inhabits it.",
        "This is a fundamentally different emotional experience to inhabit. Not passivity — the protagonist has full agency, the desire is on her terms. But the specific pleasure of being someone's focus. Of being wanted specifically, not generally. Of existing, in the world of the story, as someone whose presence changes things.",
      ],
    },
    {
      h2: "Why This Is Different From Empowerment Content",
      paragraphs: [
        "Empowerment content typically works by telling you that you are capable, valued, and worthy. It addresses you at the level of self-belief — the suggestion that if you internalise certain ideas about yourself, you will come to feel more confident.",
        "Confident energy audio stories do not tell you anything. They place you inside an experience of confident energy — a narrative in which you are already that person, in which the world of the story has already organised itself around that version of you.",
        "The distinction matters because being told you are confident and inhabiting confident energy are entirely different experiences. The first is cognitive. The second is felt. A story that places you at the centre of a charged, cinematic encounter — in which you are the protagonist in full command of the situation, desired on your terms — produces the felt experience of that energy rather than the idea of it.",
        "This is not self-help audio with a narrative wrapper. It is an original story designed to produce a specific emotional experience — the particular feeling of being someone whose confidence is self-evident, whose desirability is the premise rather than the aspiration.",
      ],
    },
    {
      h2: "Desired on Your Terms — What That Means",
      paragraphs: [
        "Desire in fiction is often described from outside the protagonist — observed, received, sometimes overwhelming. The protagonist is the object of desire in a way that can feel passive, as though desire is something that happens to her rather than something she engages with from a position of agency.",
        "Confident energy stories handle this differently. The desire in the story flows toward you and is met by you — from a position of full awareness, full agency, full choice. You are not overwhelmed by being wanted. You move toward it with the ease of someone who knows her own value.",
        "This is the specific experience that confident energy audio stories create: being desired specifically — not generically, not abstractly, but with the particular quality of attention that implies you have been genuinely seen — while remaining entirely in command of what happens next. The encounter is on your terms. The dynamic puts you at the centre, and the centre holds.",
      ],
    },
    {
      h2: "The Scenarios That Make It Cinematic",
      paragraphs: [
        "Confident energy has specific settings in which it reaches its fullest expression. Scenarios in which the protagonist's presence is felt before anything is said. In which there is an audience to the encounter, even if only implicitly. In which the dynamic is legible — both parties aware of what is happening, aware that the other is aware.",
        "The room that rearranges itself around you is one such scenario: a space entered, a shift in the atmosphere, the specific awareness of someone across the room who has noticed, whose noticing means something. The story inhabits the internal experience of this — the specific pleasure of it — rather than simply describing it from outside.",
        "The charged professional encounter is another: a context in which confidence is already the baseline, in which competence and desire occupy the same space, in which you are in command by virtue of what you have already demonstrated — and the desire that exists alongside that is desire for who you actually are, not a softened or simplified version.",
        "Both share the quality that makes confident energy stories work: they are cinematic in the sense of having scope, atmosphere, and weight. The world of the story is vivid enough that you inhabit it rather than observe it. And inside that world, you are the protagonist around whom everything else is arranged.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Choose the energy you want to inhabit tonight",
      body: "The room notices you. A charged encounter on your terms. Being someone's entire focus, specifically and deliberately. You choose the scenario and the dynamic — and the story is built around you as the protagonist at the centre of it.",
    },
    {
      heading: "Your story is created around that position",
      body: "Original narrative, generated for this session, in which you are the confident protagonist from the first sentence. The dynamic, the setting, the quality of the desire — all shaped around the experience you described, not approximated from a general category.",
    },
    {
      heading: "Listen privately — feel it fully",
      body: "Narrated and saved to your private account. First person, close, and entirely yours. The felt experience of confident energy — the specific pleasure of being at the centre of something cinematic — is yours to inhabit in a space that belongs only to you.",
    },
  ],
  scenarios: {
    h2: "Three Confident Energy Stories — Three Ways to Be at the Centre",
    items: [
      {
        heading: "The room rearranges itself around you",
        body: "You enter. Something shifts. The story inhabits the internal experience of this — the awareness of being noticed by the specific person whose noticing matters, the pleasure of that noticing being unmistakeable rather than ambiguous. You are not watching to see whether you will be seen. You are already seen. The story begins from there and goes further.",
      },
      {
        heading: "A charged professional encounter",
        body: "You in command. Desire on your terms. The story inhabits a context in which your confidence is the premise — established, legible, already there — and in which desire for who you are arises alongside that and is met on equal terms. No softening. No performance of vulnerability to make the desire feel safer. You, fully yourself, in an encounter that reflects that back.",
      },
      {
        heading: "Being someone's entire focus",
        body: "The specific feeling of being the subject of someone's complete and considered attention — not incidental, not circumstantial, but deliberate. The story creates this experience from the inside: the quality of being genuinely seen, of having your presence registered as something specific and significant, of being desired not in general but exactly. Cinematic in the best sense. You at the centre, which is where the story knows you belong.",
      },
    ],
    interstitial: "Create a story built around the version of you that exists when you feel entirely yourself.",
  },
  benefits: {
    h2: "Why Confident Energy Audio Stories Work",
    items: [
      {
        heading: "You are the protagonist",
        body: "First person narration places you inside the confident energy rather than outside it. Not reading about a confident woman. Being her — which is a fundamentally different experience.",
      },
      {
        heading: "Felt, not told",
        body: "The story produces the experience of confident energy rather than describing it. You inhabit the dynamic rather than being instructed toward it. The feeling is real because the experience is real — not a metaphor for how you should feel.",
      },
      {
        heading: "Desire on your terms",
        body: "The desire in the story flows toward you and is met by you from a position of full agency. Being wanted specifically, not generally — and meeting that from somewhere entirely in command.",
      },
      {
        heading: "Cinematic quality",
        body: "The stories have scope, atmosphere, and weight. The world of the story is vivid enough to inhabit rather than just observe. You are at the centre of something that feels like it matters.",
      },
      {
        heading: "Created around you",
        body: "The scenario, the dynamic, the specific quality of the energy — chosen by you and built into the generation. Not a general empowerment story. Your version of confident, made for tonight.",
      },
      {
        heading: "Entirely private",
        body: "Your stories are held in your private account and heard only by you. The experience of confident energy, inhabited privately, belonging entirely to you.",
      },
    ],
  },
  fullPicture: {
    h2: "Confident Energy Audio Stories — The Full Picture",
    paragraphs: [
      "Empowering audio stories for women have typically occupied one of two registers: inspirational content that addresses self-belief, or romance content in which the protagonist is ultimately passive in the face of desire. Confident energy audio stories sit in neither of these categories.",
      "Confident romantic audio stories, at their best, understand that confidence and desire are not in tension. The most compelling romantic scenarios are ones in which both people are fully present, fully capable, fully themselves — and the desire between them is exactly that complex. The Private Story creates for this dynamic.",
      "Stories where you feel desired — specifically, on your terms, from a position of agency rather than vulnerability — are rare in existing content because they require a different understanding of the protagonist's position. Not the woman who discovers her worth through being chosen. The woman who already knows it, and is choosing.",
      "Audio stories for self-confidence work best when they produce the experience rather than describe the aspiration. Charged energy romance audio that places you inside the feeling — rather than coaching you toward it — does something that empowerment content cannot. It gives you the felt sense of what it is like to be that woman, right now, tonight.",
      "Whatever version of confident energy you are looking for — the room that notices you, the encounter on your terms, the specific pleasure of being someone's deliberate focus — that is what the story is built to create.",
    ],
  },
  finalCTA: {
    h2: "Create Your Private Story",
    paragraphs: [
      "There is a version of you that exists when you feel entirely yourself. Confident, present, at the centre of something that has weight.",
      "A story built around that version of you is not a story about someone else. It is your story — in which you are the protagonist, the desire flows toward you, and the encounter is entirely on your terms.",
      "Private, narrated, original. Created around the specific energy you want to inhabit tonight.",
    ],
    primary: { label: "Create your story", href: "/create" },
    links: [
      { label: "See pricing", href: "/pricing" },
      { label: "Intimate audio stories", href: "/intimate-audio-stories" },
      { label: "Romantic audio stories", href: "/romantic-audio-stories" },
    ],
  },
  faqs: [
      { q: `What are confident energy audio stories?`, a: `Confident energy audio stories are narrated audio pieces in which you are the protagonist — at the centre of the story's dynamic, desired specifically, in command of the encounter. Rather than the protagonist longing for something, the story is built around the experience of already being someone whose presence has weight and whose desirability is the premise. At The Private Story, they are generated around your choices: the scenario, the dynamic, the quality of the energy you want to inhabit.` },
      { q: `Will I feel desired in these stories?`, a: `Yes — this is the specific experience the story is built to create. The desire in a confident energy story flows toward you specifically, deliberately, and unmistakeably. You inhabit it from a position of full agency — being wanted in a way that meets you where you are rather than requiring you to pursue it. The story places you inside that experience from the first sentence.` },
      { q: `Is this different from self-help audio?`, a: `Significantly. Self-help audio tells you that you are capable and worthy — it works at the level of belief and addresses you cognitively. Confident energy audio stories place you inside an experience of confident energy — you inhabit the feeling rather than being instructed toward it. The difference between being told you are confident and genuinely feeling what that is like is the difference between these two formats.` },
      { q: `Can I choose a dynamic where I have the power?`, a: `Yes. The creation flow allows you to choose the dynamic: an encounter on your terms, a professional situation in which you are in command, a scenario in which desire flows toward you and you meet it from a position of full agency. The story is built around the dynamic you described — not positioned at some imagined balance point between power and vulnerability.` },
      { q: `Are confident energy stories romantic or empowering or both?`, a: `Both — and the combination is the point. The most compelling confident energy stories sit at the intersection: the protagonist fully herself, fully capable, and desired for exactly that. The desire is romantic. The dynamic is empowering. The two are not in tension — confident energy stories are built on the understanding that they belong together.` },
      { q: `How personalised is the experience?`, a: `The story is created around your specific choices for this session: the scenario, the dynamic, the tone, the specific quality of the energy you want to inhabit. This is not a general empowerment story matched to your preferences. It is original narrative written in service of the exact experience you described — which is what makes it feel personal rather than generic.` },
      { q: `Are these stories private?`, a: `Completely. Your stories are created for your account and heard only by you. No visible history, no social dimension, nothing shared. The experience of inhabiting confident energy — whatever it produces in you — is held entirely in a space that belongs to you.` },
    ],
};

export const createYourOwnAudioStoryConfig: SEOPageConfig = {
  meta: { title: `Create Your Own Audio Story | The Private Story`, description: `Create your own personalised audio story. Choose your mood, dynamic, and setting. Your story is generated and ready to listen to privately. Adults only.` },
  hero: { badge: `Create · Personalise · Listen Privately`, h1: `Create Your Own Audio Story in Minutes — Shaped Around You`, tagline: `You already know what you need to feel tonight. The Private Story makes it.` },
  heroImage: "images/seo-hero-create.png",
  showCastingPreview: true,
  sections: [
    {
      h2: "What It Means to Create Your Own Audio Story",
      paragraphs: [
        "Most audio content asks you to browse. You scroll through categories, read descriptions, pick something that seems close, and listen to something made for everyone — hoping it happens to work for you tonight.",
        "Creating your own audio story is the opposite of that.",
        "At The Private Story, you don't choose from a catalogue. You don't browse genres or filter by length. You create — by answering a sequence of questions that shape everything about the story you're about to hear. The mood you want to inhabit. The dynamic you want between the voices. The setting. The pacing. The emotional register that feels right for wherever you are at eleven o'clock on whatever kind of day this has been.",
        "The story that comes out of that process belongs to you in a way that selected content never can. Not because you wrote it — you didn't, and you won't have to — but because it was written around you. The difference is considerable.",
      ],
    },
    {
      h2: "What You Create — The Choices That Shape Your Story",
      paragraphs: [
        "Creating your own audio story at The Private Story takes less than two minutes of choices. Those choices determine everything.",
        "The mood and emotional tone: How do you want to feel while listening? Slow burn tension, building across every sentence toward something you've been made to wait for. Emotional closeness — a voice that feels like it was written for exactly how you feel right now. Confident energy — a cinematic scenario with you entirely at the centre of someone's focused, specific attention. Calm and quietly absorbing. The mood you choose is the foundation every other choice rests on.",
        "The dynamic: Who is in your story, and what is the quality of their attention? The energy between them. The history, or the absence of one. The specific texture of what this is.",
        "The setting and atmosphere: Where does this take place? The setting shapes everything — what feels true about the scenario, what the light is like, how sound moves through the space. Your story's world is the canvas everything else is painted on.",
        "The intensity and pacing: Fast and immediate, or slow and deliberate. A story that takes its time earns something a quick one cannot. You decide how long the tension holds before anything resolves.",
        "Each of these choices feeds directly into the story that's created for you. They are not genre tags applied to a pre-existing piece of content. They are instructions. And the story follows them.",
      ],
    },
    {
      h2: "Why Creating Feels Different From Choosing",
      paragraphs: [
        "There is a specific feeling that comes from consuming content made for you, as opposed to content you picked from a library.",
        "Pre-existing content was made before you arrived. It was written for an imagined audience — a best guess at what a reasonable number of people might want. That's not a flaw. It's just how library content works. The trade-off is that you are always adapting to it — finding the parts that work for you, navigating around the parts that don't.",
        "When you create your own story, that dynamic inverts. The story adapts to you. Every choice you made feeds back into what you're hearing. The pacing is what you asked for. The tone is what you needed. The direction the narrative takes is the direction you pointed it.",
        "The result doesn't feel like consumed content. It feels like something that was made for you — because it was.",
        "This is the specific quality that makes audio stories you've created yourself feel more immersive, more present, more real than equivalently produced fixed content. Your imagination isn't filling in gaps left by someone else's vision. It's collaborating with something that started from your vision.",
      ],
    },
    {
      h2: "What You Can't Get From Browsing",
      paragraphs: [
        "A library — however good, however large — cannot give you something it doesn't have. And the thing it doesn't have is the specific combination of your mood, your preferences, and this particular moment.",
        "You might be looking for something tender and slightly charged, set somewhere unhurried, with a dynamic that feels like genuine connection rather than performance. A library either has that or it doesn't. If it doesn't, you settle for the closest thing. If it does, you might spend twenty minutes finding it.",
        "When you create your own story, the story that doesn't exist yet gets made. Not approximated. Not selected from the closest category. Made. For tonight. For the exact emotional register you're trying to inhabit.",
        "There is no 'close enough' when the story is created around what you described. There is only what you asked for.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Choose your mood and dynamic",
      body: "Tell us how you want this to feel. Slow burn — deliberate, building, worth the wait. Emotional connection — warm and present, a voice that sounds like it knows where you are tonight. Confident energy — cinematic, you at the centre of something charged and specific. Calm and absorbing — somewhere beautiful to be while your mind slows. Your mood determines everything that follows.",
    },
    {
      heading: "Your story is written around you",
      body: "Your selections are used to generate a story created specifically for this session. Not retrieved. Not adapted. Written. The pacing reflects what you chose. The dynamic reflects what you described. The setting and atmosphere reflect the world you directed the story toward.",
    },
    {
      heading: "Listen to something you made",
      body: "Your story is ready to play and saved privately to your account. Press play. This is the story you asked for — not a story that's been waiting for someone to choose it, but one that exists because you described what you needed tonight.",
    },
  ],
  scenarios: {
    h2: "What Stories You Create Can Sound Like",
    items: [
      {
        heading: "A slow burn story you shaped",
        body: "You chose how long the tension would hold. You asked for deliberate, for building, for a story that earns its ending. Every sentence was written to keep you at the edge of something you asked to approach slowly. The delay is the point. You put it there. The arrival is yours.",
      },
      {
        heading: "A story that sounds like it knows you",
        body: "You chose emotional closeness. You asked for warmth — the specific quality of feeling genuinely accompanied rather than entertained. The voice that arrived sounds like it was written knowing exactly how you feel tonight. Because the choices that produced it were yours, and they described exactly that.",
      },
      {
        heading: "A story where you're entirely at the centre",
        body: "You chose confident energy. You set up the dynamic — you, at the centre of focused and specific attention. The scenario built around that choice placed you exactly where you asked to be. Not as a character in someone else's story. As the axis around which everything else organises.",
      },
    ],
    interstitial: "Create your story now",
  },
  benefits: {
    h2: "The Benefits of Creating Your Own Story",
    items: [
      {
        heading: "Your choices, not the algorithm's",
        body: "The mood, tone, dynamic, and setting you describe are the only inputs. No listening history. No demographic assumptions. No algorithm predicting what you probably want. What you asked for.",
      },
      {
        heading: "Written fresh every time",
        body: "Your story is generated at the moment you create it. Not retrieved from storage. Not adapted from a template. Written for this session, for this version of you.",
      },
      {
        heading: "Private by design",
        body: "Your story is saved to your account and heard only by you. No social layer. No visible history. No one else can access what you create.",
      },
      {
        heading: "A different story whenever you need one",
        body: "Your mood changes. Your story can change with it. There is no fixed library to exhaust, no favourite you'll wear out. Every creation starts fresh.",
      },
      {
        heading: "No writing required",
        body: "You don't write anything. You make choices — about mood, tone, dynamic, setting — and the story is written around them. Creation takes less than two minutes. Everything else is listening.",
      },
      {
        heading: "Built for adults who know what they want",
        body: "The Private Story doesn't simplify. The emotional register, the themes, the intelligence of every story are calibrated for adults — for people who know what they want and want it done properly.",
      },
    ],
  },
  fullPicture: {
    h2: "Create Your Own Audio Story — The Full Range",
    paragraphs: [
      "The category of audio stories you can create yourself is broader than any single tone or experience.",
      "If you're looking to create your own romantic audio story — tender, slow, emotionally connecting — the creation flow accommodates everything from the warmth of quiet reunion to the tension of something that hasn't been said yet.",
      "For those who want to make their own audio story for adults that doesn't condescend — content that meets adult emotional complexity with equivalent sophistication — this is the platform built for that.",
      "The custom audio story generator at The Private Story is not a template filler. It is not a story picked by an algorithm that then claims to be personalised. It is a generation system that takes your specific choices as its inputs and produces original narrative audio around them.",
      "For anyone who has thought about wanting to write your own audio story but doesn't want to write — the creation experience at The Private Story gives you authorship without the craft. You direct. The story follows.",
      "And for those looking to build a personalised audio story across multiple sessions — different moods, different dynamics, different scenarios — there is no limit. Each story is a new creation. Each one stays in your private account. Each one is exactly what you described.",
    ],
  },
  finalCTA: {
    h2: "Create Something That Couldn't Have Existed Without You",
    paragraphs: [
      "There is content made for everyone. There is content selected by an algorithm that believes it knows you. And then there is something you created yourself — shaped around how you want to feel, built for the specific version of you that showed up tonight.",
      "The Private Story makes the third thing possible. Not by asking you to write, or to choose from a shelf. By turning your choices into something that didn't exist until you described it.",
      "Create yours in under two minutes.",
    ],
    primary: { label: "Create your story now", href: "/create" },
    links: [
      { label: "See pricing", href: "/pricing" },
      { label: "Explore personalised audio stories", href: "/personalised-audio-stories" },
      { label: "Discover the AI story generator", href: "/ai-audio-story-generator" },
    ],
  },
  faqs: [
      { q: `How do I create my own audio story?`, a: `The creation process takes under two minutes. You choose your mood and emotional register, the dynamic between the characters, the setting and atmosphere, and the pacing you want. Your selections are used to generate a story created specifically around them. Press play when it's ready.` },
      { q: `What choices do I make when creating a story?`, a: `You choose the mood and tone (the emotional register you want to inhabit), the dynamic (the relationship and energy between voices), the setting and atmosphere (where your story takes place), and the intensity and pacing. Each choice directly shapes the story that's generated.` },
      { q: `Can I create multiple stories?`, a: `Yes. You can create a new story whenever you want one. Your mood varies — your story can vary with it. Previous stories are saved privately to your account and remain there until you choose to remove them.` },
      { q: `How long is a created story?`, a: `Stories are typically between fifteen and thirty minutes, depending on the choices you make. Pacing affects length — a slower, more deliberate story will often be longer than a more immediate one.` },
      { q: `Can I edit my story after it's created?`, a: `Stories are not editable after creation — they are generated pieces of audio, not documents. If the result isn't quite what you wanted, you can create a new one with adjusted choices. Creation takes less than two minutes.` },
      { q: `Is creation free or paid?`, a: `Creating personalised audio stories requires a subscription. Plans start at £29 per month for five creations, with an annual option at £179 per year for fifty creations. Individual stories can also be purchased for £3.99 each.` },
      { q: `How is this different from writing my own story?`, a: `Writing requires craft. Creating here requires only choices. You describe how you want to feel — the mood, the dynamic, the atmosphere. The story is written around those choices. You don't produce text, edit it, or solve the problems of storytelling. You direct. The story follows.` },
    ],
};

export const darkRomanceAudioStoriesConfig: SEOPageConfig = {
  meta: { title: `Dark Romance Audio Stories | The Private Story`, description: `Dark romance audio stories created for adults. Private, personalised, and written around morally complex desire — the shadow side of wanting. Create yours.` },
  hero: { badge: `Dark Romance · Private · Adults Only`, h1: `Dark Romance Audio Stories — Where Danger and Desire Are the Same Thing`, tagline: `The stories that don't look away. The characters who make you feel things you're not supposed to admit to.` },
  heroImage: "images/seo-hero-dark-romance.png",
  showCastingPreview: true,
  sections: [
    {
      h2: "What Dark Romance Actually Is",
      paragraphs: [
        "Dark romance is not romance with the lights turned off. It is a specific genre defined by its willingness to inhabit moral complexity — stories in which the pull towards someone is real and genuine, but the situation, the person, or the desire itself carries weight that more straightforward romance deliberately avoids.",
        "The appeal is precise. Dark romance readers and listeners are not looking for uncomplicated heroes or clean emotional arcs. They are looking for stories that take the shadow side of desire seriously — the wanting that feels dangerous, the attraction to someone who perhaps should not be attractive, the specific electricity of a situation where the feelings are real but the context is complicated.",
        "What separates dark romance from simply dark fiction is that the emotional core remains romantic. The pull between the characters is genuine, the connection is real, and the story is invested in what happens between them — not using the darkness as shock value but as the terrain through which the emotional story moves. The shadow is the setting, not the point. The connection is still the point.",
        "Dark romance audio stories work particularly well in first person because the immersive quality of audio places you inside that moral complexity rather than watching it from outside. The ambivalence is yours to inhabit. The pull — even when complicated — is yours to feel.",
      ],
    },
    {
      h2: "The Specific Appeal of Morally Complex Characters",
      paragraphs: [
        "The defining feature of dark romance is a character — usually the romantic lead — who does not conform to conventional heroism. He may have done things that are difficult to justify. He may want in ways that are possessive, controlling, or driven by motivations the story does not entirely excuse. He may occupy a world where the usual rules do not apply or where he makes them.",
        "The appeal is not that these qualities are desirable in real life. The appeal is that fiction is the space where we are permitted to feel things we do not act on — where the pull towards dangerous certainty, the attraction to someone who knows exactly what they want and takes it, or the specific fantasy of being chosen by someone whose standards are high and whose attention is not easily given can be inhabited safely.",
        "Dark romance surfaces something that more sanitised romance encodes without acknowledging. The want in the reader or listener is real. The genre respects that want enough to write to it directly rather than wrapping it in reassurance. This is why the connection between dark romance and its audience tends to be particularly intense — the genre meets its reader with honesty about what she is actually feeling, rather than redirecting her to something more comfortable.",
        "The stories at The Private Story are created around this premise — not graphic darkness for its own sake, but the authentic emotional texture of complicated wanting. You choose the specific character, the dynamic, the moral weight. The story is built around what you actually want to feel.",
      ],
    },
    {
      h2: "Dark Romance Versus the Rest of the Romance Spectrum",
      paragraphs: [
        "Understanding where dark romance sits in relation to the broader romance landscape helps clarify what it is and isn't. Standard romance assumes a fundamentally good romantic lead whose flaws are surface-level — impatience, emotional unavailability, a difficult past — but whose basic goodness is never in question. The tension is whether the characters will find each other, not whether finding each other is complicated.",
        "Dark romance keeps the romantic core — the real connection, the genuine pull, the investment in what happens between these two people — but allows the terrain to be morally messier. The romantic lead may have genuine flaws that are not resolved by the end. The desire itself may feel transgressive. The situation may have edges that don't smooth away cleanly.",
        "Forbidden romance and dark romance overlap but are not the same thing. Forbidden romance is about external constraint — rules, circumstances, other people's expectations. Dark romance is about internal complexity — the character of the person you want, the nature of the wanting itself. A forbidden romance can be entirely light in tone. Dark romance is defined by its tonal register, not its situation.",
        "Slow burn and dark romance make a particularly powerful combination. The accumulation of tension in a slow burn story — the charged exchanges, the almost-touches, the weight of restraint — becomes something different when the romantic lead is morally complex. The restraint has different stakes. What he's holding back has more charge. The resolution, when it comes, carries everything that was built.",
      ],
    },
    {
      h2: "What Dark Romance Sounds Like in Audio",
      paragraphs: [
        "Dark romance audio has qualities that set it apart from other formats. The narration is first person and close — you are not observing the dynamic from outside but inhabiting it from within. The voice is aware of the complexity, carrying the ambivalence and the pull in the same breath, because both are real and present simultaneously.",
        "The writing in dark romance audio does not simplify the emotional texture to make it more comfortable. It stays with the complication — the attraction that should not be as strong as it is, the awareness that what you feel is difficult to justify, the specific charge of a situation where the wanting is genuine and the situation is not clean. The story holds all of this because the listener can hold it.",
        "Pacing matters enormously in dark romance. The best dark romance audio takes time with the atmosphere, the specific quality of the character's presence, the texture of the world he inhabits. The darkness is in the details as much as the events — the way he moves through a room, the specific register of his attention, the weight of what is not said. This is why audio, with its capacity for close, unhurried narration, suits dark romance particularly well.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Choose your dark romance dynamic",
      body: "The morally complex character. The specific nature of the darkness — possessive pull, dangerous world, moral ambiguity, forbidden power. The chemistry that makes the connection real despite everything else. You define the emotional terrain. The story is built to inhabit it.",
    },
    {
      heading: "Your story is created around the complexity",
      body: "Original dark romance narrative, generated for this session, written with the specific moral texture you chose from the first sentence. Not sanitised, not redirected — the story the actual genre is. Literary, adult, and honest about what dark romance is for.",
    },
    {
      heading: "Listen privately — yours alone",
      body: "Narrated and saved to your private account. No one else can access your stories — not a social feed, not a recommendation algorithm, not anyone. The intimacy of dark romance requires privacy. This is built for that.",
    },
  ],
  scenarios: {
    h2: "Three Dark Romance Stories — Three Different Shadows",
    items: [
      {
        heading: "The powerful man with no interest in being redeemed",
        body: "He controls things. The world around him has learned not to push back, and he has never been required to explain himself. The story begins when you enter his orbit — not by accident, because nothing in his world happens by accident. The attraction is immediate and inconvenient. He notices it before you've acknowledged it. The darkness here is not in what he does but in what he is — certain, controlled, interested in you in a way that carries its own kind of weight. The question is not whether you want him. The question is what wanting him costs.",
      },
      {
        heading: "The morally compromised man who is also real",
        body: "He's done things. Not the kind that resolve by the final chapter through a convenient revelation — the kind that are simply part of who he is, and who he is happens to be someone you cannot stop being aware of. The pull is complicated by the knowledge. The story lives in that complication — not excusing, not condemning, but inhabiting the genuine emotional experience of being drawn to someone whose moral complexity is part of what makes them feel real. The genre that refuses to look away.",
      },
      {
        heading: "The dangerous world that becomes yours too",
        body: "Sometimes the darkness is environmental — a world that operates by different rules, where the usual safety assumptions don't hold. He is at home in it. You are entering it through him. The story is about that transition: the specific texture of a world with different stakes, the way proximity to genuine danger changes the quality of attention, the specific intimacy of being protected by someone whose protection comes with its own kind of weight.",
      },
    ],
    interstitial: "Create a dark romance story built around the specific moral complexity you want to inhabit.",
  },
  benefits: {
    h2: "Why Dark Romance Audio Works",
    items: [
      {
        heading: "The complexity is the point",
        body: "Not darkness as shock value or edginess. Darkness as the authentic terrain of a specific kind of desire — the wanting that doesn't resolve cleanly, that the story respects enough to inhabit honestly.",
      },
      {
        heading: "You're inside it, not watching it",
        body: "First person narration places you inside the emotional complexity — the pull, the ambivalence, the awareness of all the reasons this is complicated. You feel what the character feels because you are the character.",
      },
      {
        heading: "Literary, not gratuitous",
        body: "Dark romance written with craft is not shock content. It is fiction that takes the shadow side of desire seriously, written with the same care and attention to emotional truth that the best romance of any register brings.",
      },
      {
        heading: "Specific to what you want",
        body: "The exact character. The specific moral weight. The dynamic you chose — possessive, dangerous, morally ambiguous. Created for this session, around what you actually want to feel.",
      },
      {
        heading: "The tension has real stakes",
        body: "Dark romance works because the complications are genuine — not contrived obstacles that resolve with a conversation, but moral and situational complexity that is part of the story's world. The stakes are what give the connection its charge.",
      },
      {
        heading: "Private by design",
        body: "Dark romance requires a platform that doesn't judge what you're looking for. Your stories are private to your account, heard only by you, and visible to no one else. The discretion is architectural.",
      },
    ],
  },
  fullPicture: {
    h2: "Dark Romance Audio Stories — The Full Picture",
    paragraphs: [
      "Dark romance has emerged as one of the most significant genres in adult fiction precisely because it does what other romance often doesn't — it treats the complicated nature of desire as something to be explored rather than resolved. The readers and listeners who love dark romance are not confused about what they want. They want stories that meet them where their imagination actually goes, rather than redirecting them to something more comfortable.",
      "Dark romance audio stories at The Private Story are created around this principle. The creation flow allows you to choose the specific character — the moral weight he carries, the world he inhabits, the nature of his attention to you — and builds a story around what you actually want to feel rather than what the genre is supposed to want you to feel.",
      "The audio format suits dark romance particularly well. The close, first-person narration of audio fiction means you inhabit the emotional complexity rather than observing it. The morally complicated pull is yours to feel, not a character's to experience in front of you. This makes dark romance audio more immersive than written dark romance in specific ways — the distance between reader and story collapses.",
      "What distinguishes well-written dark romance from its less accomplished versions is that it never loses sight of the emotional core. The darkness is the terrain; the connection is still the story. The pull between the characters is real, the feeling is genuine, and the story is invested in what that means — even when, especially when, what it means is complicated.",
      "Create your dark romance story around the specific dynamic, character, and moral weight that makes the genre feel true to you.",
    ],
  },
  finalCTA: {
    h2: "Create Your Dark Romance Story",
    paragraphs: [
      "The story that doesn't look away. The character who is exactly what he is, without apology or easy resolution. The pull that is real even when — especially when — it's complicated.",
      "Dark romance works because it respects the reader enough to write to what she actually feels, rather than what she's supposed to feel. The Private Story creates your dark romance story around the specific moral terrain you want to inhabit.",
      "Private, narrated, yours. Created in under two minutes.",
    ],
    primary: { label: "Create your dark romance story", href: "/create" },
    links: [
      { label: "Forbidden romance audio stories", href: "/forbidden-romance-audio-stories" },
      { label: "Slow burn audio stories", href: "/slow-burn-audio-stories" },
      { label: "Personalised audio stories", href: "/personalised-audio-stories" },
    ],
  },
  faqs: [
      { q: `What is dark romance?`, a: `Dark romance is a genre defined by moral complexity — stories in which the romantic lead may be morally ambiguous, possess genuine flaws that aren't resolved by the ending, or inhabit a world that operates by different rules. The key distinction from standard romance is that the darkness is not a surface-level obstacle but a genuine part of the character or situation. The romantic core remains — the pull is real, the connection is genuine — but the terrain is more complicated. Dark romance treats this complexity as the point rather than a problem to be solved.` },
      { q: `Is dark romance the same as erotica?`, a: `No. Dark romance is a tonal and thematic register, not a content intensity level. A dark romance story can work entirely through implication and still be unmistakably dark romance — the darkness is in the character, the dynamic, and the moral texture of the story. At The Private Story, you set the intensity of your story separately from the dark romance dynamic you choose. A dark romance story can be slow burn and emotionally charged, or more direct in its physical register — both are available. The moral complexity and the intensity are independent choices.` },
      { q: `Are dark romance stories morally troubling?`, a: `Dark romance is fiction that inhabits moral complexity — it does not endorse it. The same way that crime fiction is not an endorsement of crime, dark romance is not an endorsement of the behaviour or dynamics it explores. The genre exists because fiction is the space where humans have always explored the parts of themselves that do not fit cleanly into their conscious values — the complicated wants, the attractions that resist easy justification, the parts of desire that feel real even when they're inconvenient. Reading or listening to dark romance is not a moral statement. It is engaging with one of fiction's oldest purposes.` },
      { q: `What makes dark romance audio different from written dark romance?`, a: `Audio dark romance is more immersive because the first-person narration collapses the distance between listener and story. In written dark romance, you read about a character who is feeling the complicated pull. In audio dark romance, the voice is yours — the ambivalence, the awareness of the complexity, the pull itself is experienced in the second person. This makes the emotional texture of dark romance feel more direct and more inhabitable. The Private Story's dark romance audio is written in first person and narrated by a voice that carries the full emotional register of the story.` },
      { q: `Can I choose how dark the story is?`, a: `Yes. The creation flow lets you define the specific character and dynamic — the moral weight he carries, the nature of the world he inhabits, the intensity of the pull. You also set the story's intensity level separately. Dark romance is a tonal register, not a fixed content level — the story can be brooding and charged and restrained, or it can be deeply adult in its register. You shape both dimensions separately.` },
      { q: `Is there overlap between dark romance and other genres on the platform?`, a: `Significant overlap, deliberately. Dark romance and slow burn make a particularly powerful combination — the accumulation of tension in a slow burn story has different stakes when the character is morally complex. Dark romance and forbidden romance share terrain — many dark romance stories involve forbidden dynamics. Dark romance and confident energy overlap in the character register — the assured, magnetic character who knows what he wants is a feature of both. The Casting Room allows you to combine these dynamics into a story that is specific to exactly what you want.` },
      { q: `Are the dark romance stories private?`, a: `Completely. Your stories are saved to your private account and visible only to you. There are no social features, no shared library, no recommendation feed that reveals what you listen to. The Private Story is built architecturally for private listening — your dark romance stories are yours alone, heard only by you, and deletable at any time.` },
    ],
};

export const emotionalAudioStoriesConfig: SEOPageConfig = {
  meta: { title: `Emotional Audio Stories | The Private Story`, description: `Emotional audio stories created around your mood. Private, personalised, and designed to meet you where you are. For adults who want to feel something real.` },
  hero: { badge: `Emotional · Private · Made for Tonight`, h1: `Emotional Audio Stories — Stories That Know How You Feel Before You Do`, tagline: `For the nights when you need to feel something — but haven't quite found the words for what.` },
  sections: [
    {
      h2: "The Particular Need for an Emotional Story",
      paragraphs: [
        "There are evenings when what you need is not distraction. Not information. Not even comfort in the conventional sense. What you need is to feel something — specifically, deliberately, privately.",
        "The tension of a day that hasn't resolved. A feeling you can't quite name but are clearly carrying. A low-level heaviness that has been with you all week and that logic cannot touch. Something that needs to be felt in order to be released rather than analysed in order to be understood.",
        "Emotional audio stories exist for exactly this. Not to fix the feeling. Not to explain it. To meet it — to provide a narrative space where feeling is the point, where the story moves through emotional territory with enough intelligence and care that you can follow it there and find something on the other side.",
        "That is what a well-made emotional story does. Not resolution exactly. Something like it.",
      ],
    },
    {
      h2: "What Makes an Audio Story Emotional",
      paragraphs: [
        "Not sadness. Not drama. Not the simple manipulation of playing sad music under difficult events.",
        "An emotional story is one in which the interior experience of the narrator is rendered with enough precision that you recognise it — not because it matches your situation exactly, but because it captures something true about the texture of feeling that you also carry. The specific quality of grief that is not grief for one thing but for a general awareness of loss. The kind of longing that is not for any particular person but for a version of your life that you can feel but not clearly see.",
        "Emotional precision is the mechanism. The story does not need to share your circumstances. It needs to share your feeling — to arrive at the same internal territory from a different direction and describe it accurately enough that you feel recognised.",
        "Emotional audio stories at The Private Story are generated toward this experience. The AI writes with the emotional register you specify — not just the mood label but the specific texture of the feeling — and the narration carries it. First person, so the feeling is yours to inhabit rather than someone else's to observe. Close enough to matter.",
      ],
    },
    {
      h2: "The Difference Between Feeling and Processing",
      paragraphs: [
        "Therapy, journalling, and talking to someone you trust are all valuable. They are also effortful, directional, and require you to be able to articulate what you are feeling well enough to work with it.",
        "Sometimes you cannot articulate it. Sometimes the feeling is pre-verbal — it exists before language arrives to describe it, and the act of trying to translate it into words loses something essential. Sometimes what you need is not to understand what you are feeling but simply to feel it fully, in a contained space, without it going anywhere or requiring anything from you.",
        "Emotional audio stories provide that containment. The story holds the feeling. You follow it. Nothing is required of you except presence — and even that is a loose requirement. You can drift in and out and the story will be there when you drift back.",
        "This is not therapy and does not pretend to be. It is something more like the function that great literature has always served — not to solve what you are feeling but to make you feel less alone in it.",
      ],
    },
    {
      h2: "The Emotional Register Is Yours to Choose",
      paragraphs: [
        "Emotional is not a single tone. The full emotional range of human experience is wide, and what you need on any given night sits somewhere specific within it.",
        "Some nights you need something quietly devastating — beautiful and heavy, the specific combination of sadness and beauty that feels true to the actual texture of being alive. Some nights you need something that ends with warmth — not resolution exactly, but movement toward it. A story that acknowledges weight and then, gently, finds somewhere to set it down.",
        "Other nights you need something more complex — a feeling that contains both tenderness and difficulty, closeness and uncertainty. The specific emotional situation that doesn't resolve into a simple register because life doesn't resolve into simple registers.",
        "The Private Story creates across this full range. You choose the emotional tone before generation. The AI writes toward it — not as a mood label applied to generic content, but as the precise emotional territory the story inhabits from first sentence to last.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Describe what you need to feel tonight",
      body: "Quietly heavy. Warm but honest. Something that ends with light. A story for a feeling you can't quite name. You choose the emotional register as specifically as you can — and the story is built to meet you there.",
    },
    {
      heading: "Your story is created around that feeling",
      body: "Original narrative, generated in service of the emotional experience you described. The pacing, the interiority, the arc of the story — all shaped toward the feeling. Not a drama with emotion added. A story written from the inside of the experience outward.",
    },
    {
      heading: "Feel it privately — then let it go",
      body: "Your story is narrated and saved to your private account. Heard only by you. What it moves in you is yours — held in a space that belongs entirely to you, leaving no trace beyond what you choose to carry.",
    },
  ],
  scenarios: {
    h2: "Three Emotional Stories — Three Different Needs",
    items: [
      {
        heading: "A story for the nights when you need to process without talking",
        body: "Some feelings are not ready to be spoken. The right response to them is not conversation but the particular quality of being accompanied through them — a story that goes into the same territory you're in, without asking you to explain why you're there. You follow the narrator. The feeling becomes more navigable simply by being moved through rather than analysed.",
      },
      {
        heading: "A quietly devastating story",
        body: "Beautiful and heavy and exactly what you needed. The specific emotional register of something that is sad and also good — that acknowledges loss or longing or difficulty without pretending to resolve it. The devastation is quiet because the story respects it enough not to perform it. You feel it properly. Which turns out to be different from feeling bad.",
      },
      {
        heading: "A story that ends with warmth",
        body: "Not resolution exactly. Not everything tied up or explained away. But movement — the sense that the story has been somewhere difficult and found its way toward something gentler. An ending that doesn't dismiss the weight of what came before but holds it differently. You arrive somewhere warmer than where you started, and that is enough.",
      },
    ],
    interstitial: "Create an emotional story shaped around what you need to feel tonight.",
  },
  benefits: {
    h2: "Why Emotional Audio Stories Work",
    items: [
      {
        heading: "Meets you where you are",
        body: "The story is created around the emotional register you describe — not positioned at a safe distance from difficult feeling. It goes where you need it to go.",
      },
      {
        heading: "Emotional precision, not emotional performance",
        body: "The AI writes toward the specific texture of the feeling rather than its surface expression. The result is recognition rather than manipulation — you feel understood rather than handled.",
      },
      {
        heading: "No articulation required",
        body: "You don't need words for what you're feeling in order to create a story that meets it. The structured choices give you a way to describe an emotional need even when language hasn't quite arrived for it yet.",
      },
      {
        heading: "Private containment",
        body: "The feeling is held in the story, which is held in your private account. What happens in the listening stays in the listening. Nothing is shared, nothing is visible, nothing requires you to account for it afterward.",
      },
      {
        heading: "First person — your experience",
        body: "The narration places you inside the emotional experience rather than at a distance from it. You are not watching someone else feel something. You are the person the story is happening to.",
      },
      {
        heading: "Something real, not managed",
        body: "Emotional audio stories do not aim to make you feel better by making you feel less. They aim to make you feel more accurately — which tends to be the thing that actually helps.",
      },
    ],
  },
  fullPicture: {
    h2: "Emotional Audio Stories — The Full Picture",
    paragraphs: [
      "Emotional stories to listen to have always existed — in literature, in music, in the particular kind of film that you watch alone late at night and that does something to you that you couldn't fully explain afterward. The Private Story brings that experience to audio storytelling that is personalised, private, and made for adult emotional lives.",
      "Audio stories for emotional nights serve a specific function that entertainment and wellness content mostly leaves unaddressed. Entertainment distracts. Wellness manages. Neither quite occupies the territory of simply being with a feeling — accompanying it, moving through it, finding the other side.",
      "Moving audio stories for adults require emotional intelligence in the writing — not just difficult events but the interior experience of difficulty, described with enough precision that the listener finds herself in the story rather than simply watching it from outside. This is what The Private Story's generation is calibrated to produce.",
      "Stories that make you feel something do so through specificity. Generic emotional content generates generic emotional response — a low-grade sensation that passes quickly. Deeply emotional audio stories that actually land do so because they arrived at something true — a texture of feeling that the listener recognises from the inside.",
      "Whatever emotional territory you need to occupy tonight — whatever is being carried that needs to be felt rather than solved — that is what the story is built to meet.",
    ],
  },
  finalCTA: {
    h2: "Create Your Emotional Story",
    paragraphs: [
      "There is a kind of evening where nothing on offer quite reaches you. The podcast is interesting but adjacent. The film requires a version of your attention you don't currently have. You know what you need — something that goes where you are — but you haven't found it.",
      "A story created around your emotional register tonight goes there.",
      "Describe what you need to feel. The story is built around that — written from the inside of the experience, narrated for private listening, held in a space that belongs entirely to you.",
      "Create yours in under two minutes.",
    ],
    primary: { label: "Create your emotional story", href: "/create" },
    links: [
      { label: "See pricing", href: "/pricing" },
      { label: "Romantic audio stories", href: "/romantic-audio-stories" },
      { label: "Slow burn audio stories", href: "/slow-burn-audio-stories" },
    ],
  },
  faqs: [
      { q: `What makes an audio story emotional?`, a: `An emotional audio story renders the interior experience of feeling with enough precision that the listener finds herself recognised rather than simply entertained. It is not about sad events — it is about the accurate description of what difficult, complex, or tender feeling actually feels like from the inside. At The Private Story, the generation is directed toward the specific emotional texture you describe, which means the story goes into the territory you're in rather than remaining at a safe surface distance.` },
      { q: `Can I choose the emotional tone of my story?`, a: `Yes — this is central to how The Private Story works. Before generation, you choose the emotional register: quietly heavy, warm and honest, bittersweet, something that ends with light, something that holds difficulty without resolving it. These choices direct the AI precisely. The story is written toward the specific emotional territory you described, not positioned in a general emotional category.` },
      { q: `Are these stories sad or hopeful or both?`, a: `Both — and everything between. The Private Story creates across the full emotional range. Some nights you need something that goes toward the difficult end and stays there honestly. Some nights you need something that acknowledges weight and finds a way through it. Some nights you need something that ends with warmth without pretending that the difficulty wasn't real. You describe the tone, and the story is built to deliver it.` },
      { q: `How do emotional audio stories differ from therapy podcasts?`, a: `Therapy podcasts explain, advise, and help you understand what you are feeling by giving it frameworks. They are valuable and serve a different purpose. Emotional audio stories don't explain anything — they accompany. The story goes into the emotional territory you're in and moves through it with you, without requiring articulation, analysis, or any particular response from you. For feelings that are pre-verbal or that don't need to be understood but simply felt, stories work differently from any kind of informational or therapeutic content.` },
      { q: `Can I create a story for a specific emotional need?`, a: `Yes. The creation flow allows you to describe the emotional situation and register you need: a story for processing something without talking about it, a quietly devastating story, something that ends with warmth, something for a specific kind of longing or grief or uncertainty. The more specifically you describe the need, the more specifically the story is built to meet it.` },
      { q: `Is there a story for when I just want to feel understood?`, a: `Yes — and this is one of the specific experiences that emotional audio stories do particularly well. The feeling of being understood without having to explain yourself is one of the most restorative experiences available. When a story is created around your emotional register, the result is a narrative that has been shaped to where you are — which is as close as audio can come to that feeling of being genuinely met.` },
      { q: `Are these stories private?`, a: `Completely. Your stories are created for your account and heard only by you. No public feed, no visible history, no social dimension to what is an entirely personal experience. Whatever the story moves in you stays in a space that belongs entirely to you.` },
    ],
};

export const enemiesToLoversAudioStoriesConfig: SEOPageConfig = {
  meta: { title: `Enemies to Lovers Audio Stories | The Private Story`, description: `Enemies to lovers audio stories created for adults. Private, personalised, and built around the specific tension of opposition turning into something else entirely. Create yours.` },
  hero: { badge: `Enemies to Lovers · Rivals · Private`, h1: `Enemies to Lovers Audio Stories — The Best Tension Has History`, tagline: `The chemistry that started as opposition. The story that began somewhere before the wanting.` },
  heroImage: "images/seo-hero-enemies.png",
  showCastingPreview: true,
  sections: [
    {
      h2: "Why Enemies to Lovers Is the Most Structurally Satisfying Trope",
      paragraphs: [
        "Enemies to lovers is not simply a variant of slow burn. It is a distinct narrative structure with its own internal logic, and it produces a specific kind of emotional satisfaction that other romance structures cannot replicate. The reason is rooted in what the initial opposition creates.",
        "When two people begin as enemies — rivals, opponents, people who have reason to push against each other — the early scenes are charged in a way that neutral or friendly opening scenes cannot match. The argument that is really something else. The pointed remark that contains too much awareness of the other person to be simple dislike. The way their presence takes up more space in the narrative than genuine indifference would require. From the first chapter, the dynamic is alive with something, even if neither character has named it yet.",
        "The enemies to lovers structure also provides the most significant arc of any romantic trope. The character who moves from genuine opposition to genuine connection has further to travel than almost any other romance protagonist, and the distance of that journey makes the destination carry proportionally more weight. You know exactly how far they've come because you were there at the beginning.",
        "The other defining feature is intimacy-through-opposition. Enemies study each other. They learn the specific qualities and patterns of the person they're opposed to in a way that neutral acquaintances never need to. By the time the dynamic begins to shift, there is already a wealth of accumulated attention beneath the hostility — an intimacy built from opposition that turns out to have been preparation for something else entirely.",
      ],
    },
    {
      h2: "The Charged Middle — When Dislike Starts to Complicate",
      paragraphs: [
        "The most compelling section of any enemies to lovers story is not the beginning (opposition is established, clear, often amusing in its intensity) or the ending (they get together, the emotional payoff arrives). The most compelling section is the middle — the long, complicated stretch where the dynamic is shifting but neither person has acknowledged it, and possibly neither person has fully admitted it to themselves.",
        "This is the section where the story earns its ending. Every interaction in the middle of an enemies to lovers narrative is doing double work — maintaining the established dynamic while something else is starting to operate beneath it. The biting remark that comes a fraction too quickly. The moment of assistance that is technically voluntary but claimed as obligation. The awareness of the other person's wellbeing that cannot be entirely explained by opposition.",
        "In audio, this middle section is particularly powerful because the first-person narration means you are inside the rationalisation — the voice is trying to maintain its version of events (this is still opposition, this is still dislike, this attentiveness is strategic) while the truth of the situation is becoming increasingly unavailable as a denial. The listener hears both registers simultaneously: the official account and the thing the narrator is trying not to notice.",
        "Well-written enemies to lovers fiction is generous with this section. It does not rush the shift. It understands that the longer the rationalisation has to hold, the more interesting the moment when it breaks becomes. The Private Story creates enemies to lovers stories that invest fully in this middle — the accumulation of evidence that the official account is inadequate, building until the moment it can no longer hold.",
      ],
    },
    {
      h2: "What the History Between Them Adds",
      paragraphs: [
        "Unlike other romance structures, enemies to lovers begins with pre-existing knowledge. The characters do not need to learn each other from scratch — they already know each other, and the knowing is specific. They know exactly how the other person argues, what triggers a reaction, where the consistency is and where the inconsistency lies. This established knowledge changes the quality of attention in the later scenes.",
        "When the dynamic shifts, the history does not disappear. It becomes context. The moment that could only happen between these two people, in exactly this configuration, because of everything that preceded it — this is the particular currency of enemies to lovers that no other trope has access to.",
        "The history also gives enemies to lovers its specific quality of earned connection. They did not fall for a stranger. They fell for someone they already knew in detail — someone they had been paying attention to, adversarially, for long enough to have a genuine picture. This makes the connection feel more founded, more specific, more real than the connection between characters who are meeting for the first time. They chose each other with their eyes open.",
        "The rivals variant of this trope — where the opposition is professional, intellectual, or competitive rather than personal animosity — has its own particular quality. Rivalry is built on a specific kind of mutual recognition: you can only truly be someone's rival if you respect their capacity. The awareness beneath rivalry is different from the awareness beneath pure hostility. It contains acknowledgement, even admiration, folded inside the opposition.",
      ],
    },
    {
      h2: "Enemies to Lovers in Audio — The Voice That Cannot Hide",
      paragraphs: [
        "The first-person narration of enemies to lovers audio fiction is uniquely positioned to render the dynamic in its full complexity. The narrative voice is the character who is rationalising — maintaining the official account while the unofficial account is becoming harder to sustain. In audio, this contradiction is present in every sentence.",
        "The specific pleasure of enemies to lovers audio is listening to the narrator try to explain their own behaviour in terms consistent with the established dynamic, when the behaviour is no longer consistent with it. The attentiveness that cannot be explained by strategy. The specific irritation that is starting to feel suspiciously like its opposite. The moment of noticing something about the other person that has nothing to do with opposition and everything to do with wanting to look.",
        "Pacing in enemies to lovers audio follows the ratchet principle — each scene turns the tension one notch further. The progress is not linear or smooth; there are reversals, re-establishments of the original position, moments where the official account temporarily reasserts itself. The story oscillates, but the overall direction is clear. By the time the dynamic breaks, it has been building long enough that the moment feels genuinely inevitable rather than arbitrarily arrived at.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Choose your specific opposition",
      body: "Pure rivals — professional, intellectual, competitive. Genuine antagonists — history between them, reasons for the friction. Forced proximity — circumstances that require cooperation against the grain of the dynamic. You define the nature and origin of the opposition, and whether it is currently at its height or already beginning to shift.",
    },
    {
      heading: "The story is built around the turn",
      body: "Original enemies to lovers narrative, generated for this session, that invests in the accumulation of the middle — the charged rationalisation, the evidence that builds — before the dynamic breaks. Not rushed to the resolution. The story understands that the turn is only satisfying because of what came before it.",
    },
    {
      heading: "Listen privately — your story, your pace",
      body: "Narrated in first person, saved to your private account. No social features, no sharing. The specific quality of enemies to lovers — the private awareness of what is shifting before anyone else has named it — suits a listening experience that is entirely yours.",
    },
  ],
  scenarios: {
    h2: "Three Enemies to Lovers Stories — Three Different Oppositions",
    items: [
      {
        heading: "The professional rivalry that runs too deep",
        body: "You have been each other's competition for long enough that the rivalry is its own kind of relationship. You know how he thinks. You know his specific strengths and where his certainty occasionally outpaces his evidence. He knows the same things about you. The opposition has always been sharp and energising and genuine — until a project requires you to work on the same side of something, and the efficiency of the mutual understanding becomes, in that context, unexpectedly intimate. Everything you knew about him from opposition turns out to apply differently in proximity.",
      },
      {
        heading: "The history that makes the present more complicated",
        body: "There are reasons for the friction — things that happened, decisions that were made, a version of events that each of you has and that don't match. The hostility is not arbitrary; it has justification. The complication arrives when the accumulation of actual experience — who he is when the stakes are real, the moments where the person behind the history shows up — begins to be difficult to reconcile with the official account. The story is about that reconciliation. Or its beginning.",
      },
      {
        heading: "The forced proximity that undoes everything",
        body: "Circumstances have required cooperation. Whatever the reason — shared objective, unavoidable circumstance, necessity that neither of you chose — you are now required to work in the same direction as someone whose direction you have previously been against. The specific intimacy of collaborating against the grain of an established opposition is the story's terrain. Every moment of functional cooperation is also evidence. The accumulation is not optional.",
      },
    ],
    interstitial: "Create an enemies to lovers story built around the specific opposition and turn that you want to inhabit.",
  },
  benefits: {
    h2: "Why Enemies to Lovers Audio Works",
    items: [
      {
        heading: "History creates depth",
        body: "Unlike romances between strangers, enemies to lovers begins with established knowledge. The connection, when it arrives, is founded on genuine mutual understanding — adversarial in origin, but real. This makes it feel more specific and more earned than first-meeting romance.",
      },
      {
        heading: "The middle is the story",
        body: "The charged, complicated section where the dynamic is shifting but hasn't broken — where the rationalisation is holding but becoming increasingly strained — is the most richly written part of enemies to lovers. The story invests here rather than rushing to the ending.",
      },
      {
        heading: "The turn carries everything",
        body: "Because of the investment in what preceded it, the moment the dynamic breaks carries the accumulated weight of every scene that was building toward it. Enemies to lovers earns its emotional resolutions more completely than almost any other romantic structure.",
      },
      {
        heading: "Specific to your dynamic",
        body: "The rivalry. The history. The forced proximity. The nature of the opposition. You choose the specific version of enemies to lovers that gives it emotional charge, and the story is built around that.",
      },
      {
        heading: "Opposition is its own intimacy",
        body: "Enemies study each other in ways that neutrality never requires. By the time the dynamic shifts, there is already a wealth of accumulated attention beneath the hostility. The connection is built on knowledge, even if the knowledge was adversarial in origin.",
      },
      {
        heading: "Private from the first word",
        body: "Your stories are held in your private account, visible only to you. The specific quality of inhabiting a dynamic that is shifting — before it has been named or acknowledged — is a private experience. The platform is built for that.",
      },
    ],
  },
  fullPicture: {
    h2: "Enemies to Lovers Audio Stories — The Full Picture",
    paragraphs: [
      "Enemies to lovers has sustained its popularity across decades of fiction not because it is a simple fantasy but because it is a structurally sound narrative mechanism. The opposition creates depth, the middle creates investment, the turn creates catharsis, and the history creates a specific quality of founded connection that other romance structures cannot replicate.",
      "Enemies to lovers audio stories at The Private Story are created with the understanding that the trope's success depends on investment in the accumulation — the long stretch of charged exchanges where the dynamic is present in full before it begins to shift. The creation flow allows you to specify the nature and context of the opposition: professional rivalry, genuine history, forced proximity, or the specific variant that gives the dynamic its charge for you.",
      "Audio is particularly well-suited to enemies to lovers because the first-person narration renders the rationalisation visible in a way that third-person fiction partially achieves. You are inside the voice that is maintaining the official account — the attentiveness that is supposedly strategic, the irritation that is supposedly simple, the noticing that is supposedly neutral — and the strain between the account and the reality is present in every sentence.",
      "The Private Story creates enemies to lovers audio fiction that takes the trope seriously: that invests in the history, the accumulation, and the specific quality of a connection that has opposition at its origin. Not rushed, not simplified — the full arc of a dynamic that starts somewhere before the wanting and arrives somewhere that carries everything it began with.",
      "Create your enemies to lovers story around the specific opposition, history, and dynamic that makes the trope feel true to you.",
    ],
  },
  finalCTA: {
    h2: "Create Your Enemies to Lovers Story",
    paragraphs: [
      "The opposition that was always something else. The accumulation of evidence that the official account could not sustain indefinitely. The turn that carries everything that came before it.",
      "Enemies to lovers works because the connection, when it arrives, has been earned — built from genuine knowledge, accumulated attention, and the specific intimacy of opposition that turns out to have been preparation.",
      "Create your enemies to lovers story around the specific dynamic and history that gives it charge. Private, narrated, yours.",
    ],
    primary: { label: "Create your enemies to lovers story", href: "/create" },
    links: [
      { label: "Forbidden romance stories", href: "/forbidden-romance-audio-stories" },
      { label: "Dark romance audio stories", href: "/dark-romance-audio-stories" },
      { label: "Slow burn audio stories", href: "/slow-burn-audio-stories" },
    ],
  },
  faqs: [
      { q: `What is enemies to lovers?`, a: `Enemies to lovers is a romance trope defined by a specific narrative arc: two characters who begin in opposition — as rivals, antagonists, or people with genuine reasons for friction — and whose dynamic shifts over the course of the story into something else entirely. The defining features are the pre-existing knowledge (they already understand each other in detail, adversarially), the charged middle section (where the shift is happening but has not been acknowledged), and the specific quality of the connection when it arrives (founded on genuine mutual understanding, not the idealisation of strangers meeting). It is one of the most structurally satisfying tropes in romance precisely because it earns its ending through the work of everything that preceded it.` },
      { q: `What makes enemies to lovers different from slow burn?`, a: `Slow burn is about the pace of the emotional arc — the deliberate delay of resolution, the accumulation of charged moments that build toward acknowledgement. Enemies to lovers is about the starting point and trajectory — specifically, beginning in opposition and arriving at connection. The two are not the same, though they pair extraordinarily well: enemies to lovers benefits from slow burn pacing because the accumulation of the charged middle section is precisely where the trope earns its emotional payoff. The Private Story can create stories that combine both — a slow burn enemies to lovers arc that invests fully in the turn before and after it.` },
      { q: `Does enemies to lovers require that the characters actually dislike each other?`, a: `The most satisfying version of the trope usually involves genuine reasons for the opposition — real friction, actual disagreement, history that has substance. Pure misunderstanding that resolves quickly does not generate the same depth because the opposition was never invested in. That said, the spectrum is wide: pure rivals with no animosity, characters with real antagonism, people whose opposition is circumstantial rather than personal. What matters is that the opposition is emotionally credible and that the shift from it carries real weight. You define the specific nature of the opposition in the creation flow.` },
      { q: `Can enemies to lovers audio stories be about professional rivals?`, a: `Yes, and the professional rivals variant is one of the most requested versions of the trope. Professional rivalry has a specific quality — it is built on mutual recognition of capability, which means the awareness beneath the opposition contains a form of respect that makes the eventual shift particularly interesting. The accumulated knowledge from being someone's professional opponent transfers differently into proximity than pure personal animosity does. You can specify a professional rivalry dynamic in the creation flow.` },
      { q: `How long is a typical enemies to lovers story?`, a: `Stories at The Private Story run to approximately 1,500–3,000 words, narrated at a comfortable listening pace. Enemies to lovers stories are built to invest in the accumulation — the charged middle section — before the turn. The length is sufficient to establish the dynamic, build through the middle, and arrive at the shift in a way that feels earned rather than hurried. Subscribers can create new stories for each session.` },
      { q: `Are enemies to lovers stories private?`, a: `Completely. Your stories are saved to your private account and are not visible to anyone else. No social features, no shared recommendations, no history accessible by others. The Private Story is designed architecturally for private listening — your enemies to lovers audio stories are heard only by you.` },
    ],
};

export const forbiddenRomanceAudioStoriesConfig: SEOPageConfig = {
  meta: { title: `Forbidden Romance Audio Stories | The Private Story`, description: `Forbidden romance audio stories created for adults. Private, personalised, and built around the specific charge of wanting what you shouldn't. Create yours.` },
  hero: { badge: `Forbidden · Private · Adults Only`, h1: `Forbidden Romance Audio Stories — The Pull You're Not Supposed to Feel`, tagline: `The most charged stories are always the ones where something is at stake. Where wanting costs something.` },
  sections: [
    {
      h2: "Why Forbidden Romance Works",
      paragraphs: [
        "Forbidden romance is one of the oldest structures in storytelling because it maps directly onto one of the most universal human experiences — wanting something that the rules say you shouldn't have. The structure is not merely a plot device. It is a machine for generating emotional intensity.",
        "The reason is straightforward: constraint creates charge. When two people are free to act on what they feel, the texture of that feeling is uncomplicated — real, but uncomplicated. When external rules, circumstances, or stakes make acting on the feeling costly, every interaction between them becomes loaded with everything that cannot be said or done. The glance across a room carries the weight of a hundred conversations that haven't happened. A brief exchange carries subtext dense enough to sustain the story.",
        "Forbidden romance is not about the specific nature of the prohibition. It works whether the obstacle is professional distance, an existing relationship, a family rule, a power dynamic, a social barrier, or simply the awareness that acting on this would change everything and cannot be undone. What matters is that the constraint is real — emotionally credible, with genuine stakes — and that both people are aware of it.",
        "The appeal is the heightened awareness that constraint produces. In forbidden romance, everything matters more. The proximity, the accidental touch, the sentence that means something else entirely — all of it is felt more acutely because the usual outlets are closed. Forbidden romance audio stories inhabit this heightened state from the first line.",
      ],
    },
    {
      h2: "The Specific Pleasure of What Cannot Be Said",
      paragraphs: [
        "Forbidden romance is, at its core, the literature of subtext. When the direct channel is blocked, everything flows through indirection — through what is not said, what is not done, what can only be implied. The story becomes a reading exercise in what is beneath the surface of every exchange.",
        "This is why forbidden romance pairs so naturally with professional or quasi-professional settings. A meeting that is ostensibly about work becomes something else entirely when both people are aware of what they are not discussing. The formal register, the correct behaviour, the appropriate exchange — all of it becomes backdrop against which the real communication is happening in the space between sentences.",
        "The moment the constraint is finally broken — when what cannot be said is finally said, when the rule is finally set aside — carries all the accumulated weight of the constraint. Forbidden romance stories earn their resolutions because everything has been building towards them. The release is in proportion to the restraint. This is why forbidden romance consistently produces some of the most emotionally satisfying endings in the genre: the resolution arrives carrying everything.",
        "In audio, this subtext becomes inhabitable in a way that written fiction only partially achieves. The first-person voice carries the awareness of everything being communicated beneath the surface — you feel the subtext not as a reader interpreting it but as a participant in it. The forbidden dynamic is yours to inhabit, not observe.",
      ],
    },
    {
      h2: "Forbidden Romance and the Rules That Give It Weight",
      paragraphs: [
        "The specific nature of the prohibition shapes the character of the story significantly. Each type of forbidden dynamic generates its own emotional texture, its own particular quality of tension.",
        "Professional prohibition — the colleague, the superior, the client, the person you work alongside — works because the structure of professional life is so completely defined by rules that govern behaviour. The contrast between what is appropriate and what is felt creates a specific kind of awareness: hyper-professional on the surface, intensely personal beneath it. Every interaction has two registers running simultaneously.",
        "The existing commitment — someone who belongs to someone else, or you who belong to someone else — generates the most morally complex version of forbidden romance. The tension is not just between the people but within the person feeling the pull: the awareness that what they feel is real, the awareness of what acting on it would mean, the specific weight of wanting something that costs this much.",
        "The unexpected dynamic — the person who was supposed to be something else entirely, the story that was supposed to be different — works through surprise and the specific disorientation of feelings arriving where they weren't supposed to. The prohibition is not always rule-based. Sometimes the rule is simply your own expectation of what this was supposed to be.",
      ],
    },
    {
      h2: "What Forbidden Romance Sounds Like in Audio",
      paragraphs: [
        "The distinguishing quality of forbidden romance audio is what the narration holds simultaneously. The voice must carry the awareness of the prohibition — the reasons this is complicated, the stakes of what acting on it would mean — and the genuine pull in the same breath, because both are present and real in every moment.",
        "The pacing of forbidden romance audio follows the accumulation model. Each scene adds to the previous ones. Each interaction where the rule holds adds weight to the moment when it doesn't. The story is not rushing to the moment of resolution — it is investing in every moment before it, understanding that those moments are what makes the resolution carry the weight it needs to carry.",
        "Well-written forbidden romance audio does not shortcut the emotional complexity by making the prohibition obviously wrong — making the competing relationship clearly terrible, the professional rule clearly unreasonable, the social barrier clearly unjust. The stories that work best are the ones where the rule was a reasonable rule, where the situation was genuinely complicated, where the resolution required a real choice with real costs. This is what makes the choice meaningful.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Choose your forbidden dynamic",
      body: "The professional prohibition. The existing commitment. The power differential. The social barrier. The situation that makes the pull real and the acting on it costly. You define what makes this forbidden — and why the forbidden part makes it more charged, not less.",
    },
    {
      heading: "Your story is created around the constraint",
      body: "Original narrative, generated for this session, built around the specific prohibition you chose from the first sentence. Every exchange is loaded with what cannot be said. Every scene earns the next. The story understands that the constraint is not an obstacle to be removed — it is the mechanism that creates everything worth feeling.",
    },
    {
      heading: "Listen privately — the charge is yours to inhabit",
      body: "Narrated in first person, saved to your private account. No social features, no history visible to anyone else. The intimacy of forbidden romance — the awareness of everything that cannot be acknowledged — is a private experience. This is built for that.",
    },
  ],
  scenarios: {
    h2: "Three Forbidden Romance Stories — Three Different Constraints",
    items: [
      {
        heading: "The professional prohibition",
        body: "The person you work alongside every day. The meetings, the projects, the appropriate professional register that contains everything correctly. Weeks of accumulation — awareness before acknowledgement, feeling before articulation. The story inhabits the gap between the surface and what is actually happening beneath it. Every formally correct exchange is a negotiation around what is not being said. At some point, the professional context becomes insufficient to contain what has been building. The story lives in the gap before that moment, and in the moment itself.",
      },
      {
        heading: "The wrong time, the wrong person",
        body: "Neither of you is entirely free. The circumstances are not simple. The pull is real regardless — inconvenient, poorly timed, and genuine. The story is about living with that simultaneous truth: the awareness of what makes this complicated and the awareness that the feeling is not resolving. Forbidden romance in this register does not look away from the moral weight. It stays with the full complexity of wanting something that costs something, and of being wanted by someone for whom the same is true.",
      },
      {
        heading: "The rule that was reasonable until it wasn't",
        body: "Some prohibitions make perfect sense until the specific person arrives who makes them feel like a problem. The story follows the gradual erosion of certainty — the initial correctness, the growing difficulty of maintaining it, the specific moment when the rule and the reality are no longer compatible. Forbidden romance of this kind traces the interior experience of realising that what you thought you wanted from this situation was not, in fact, what you wanted. The pull preceded the reckoning. The reckoning is the story.",
      },
    ],
    interstitial: "Create a forbidden romance story built around the specific constraint you want to inhabit.",
  },
  benefits: {
    h2: "Why Forbidden Romance Audio Works",
    items: [
      {
        heading: "Constraint creates charge",
        body: "The prohibition is not an obstacle to the story. It is the mechanism that makes every interaction more loaded, every exchange more significant, every moment of proximity more electric. The story earns its intensity through the constraint.",
      },
      {
        heading: "You inhabit the subtext",
        body: "First-person audio narration places you inside the awareness of everything being communicated beneath the surface — the loaded exchange, the charged proximity, the sentence that means something other than what it says. You feel the subtext as a participant, not an observer.",
      },
      {
        heading: "The resolution carries everything",
        body: "Because the story invests in every moment of restraint, the moment the constraint breaks carries the accumulated weight of every moment that preceded it. Forbidden romance earns its endings in a way that less structurally invested romance doesn't.",
      },
      {
        heading: "Specific to your prohibition",
        body: "You choose the exact nature of the constraint — professional, personal, circumstantial. The story is built around the specific version of forbidden that gives it emotional weight for you.",
      },
      {
        heading: "The complexity is respected",
        body: "Good forbidden romance does not simplify the prohibition into an obviously wrong rule. It keeps the real moral weight and lets the story live in the genuine difficulty of the situation. The Private Story creates forbidden romance that holds this complexity rather than resolving it cheaply.",
      },
      {
        heading: "Private from the first word",
        body: "Your stories are held in your private account and heard only by you. No social features, no history visible to others. The discretion of forbidden romance extends to the platform it lives on.",
      },
    ],
  },
  fullPicture: {
    h2: "Forbidden Romance Audio Stories — The Full Picture",
    paragraphs: [
      "Forbidden romance persists as one of the most emotionally satisfying genres precisely because the structure works — it reliably produces the heightened emotional intensity that comes from constraint, the satisfying accumulation of loaded exchanges, and the earned resolution that arrives carrying everything that was built.",
      "Forbidden romance stories for adults at The Private Story are created around the principle that the prohibition must be real and emotionally credible to generate genuine charge. A rule that is obviously wrong doesn't create tension — it creates a countdown to the moment the characters realise it's wrong. The forbidden romances created here are built around constraints that had good reasons, situations that are genuinely complicated, prohibitions that cost something to break.",
      "Audio forbidden romance adds a dimension that written fiction partially provides: the immersive quality of a first-person voice that is genuinely carrying the double awareness — the correct surface and the real interior — in every sentence. You inhabit the gap between what can be said and what is actually being felt. This makes the emotional experience of audio forbidden romance more direct than the equivalent written story.",
      "Forbidden romance audio stories work best when they take the constraint seriously all the way through — not as a device to generate tension before the inevitable resolution, but as the genuine emotional terrain of the story. Every moment of correct behaviour is a choice. Every maintained distance is an act. The story that respects this produces a resolution that means something.",
      "Create your forbidden romance story around the specific dynamic — the prohibition, the stakes, the particular weight of what cannot be said — that makes the genre feel true to you.",
    ],
  },
  finalCTA: {
    h2: "Create Your Forbidden Romance Story",
    paragraphs: [
      "The most charged moments in any story are the ones where everything is at stake. Where acting on what you feel costs something real.",
      "Forbidden romance is built from exactly this — the pull that cannot be acknowledged, the exchange that means something else entirely, the restraint that makes every moment of proximity electric.",
      "Create your forbidden romance story around the specific prohibition and stakes that give it charge. Private, narrated, yours.",
    ],
    primary: { label: "Create your forbidden romance story", href: "/create" },
    links: [
      { label: "Dark romance audio stories", href: "/dark-romance-audio-stories" },
      { label: "Slow burn audio stories", href: "/slow-burn-audio-stories" },
      { label: "Confident energy stories", href: "/confident-energy-stories" },
    ],
  },
  faqs: [
      { q: `What counts as forbidden romance?`, a: `Forbidden romance is any romantic dynamic in which an external constraint — professional rules, an existing commitment, a social barrier, a power differential, circumstantial timing — makes acting on the connection costly or prohibited. The specific nature of the constraint is less important than its emotional reality: the prohibition must have genuine stakes to generate genuine tension. Forbidden romance at The Private Story can be built around any of these dynamics — you choose the specific nature of the prohibition and the story is built around the emotional weight that creates.` },
      { q: `Is forbidden romance morally problematic?`, a: `Forbidden romance explores moral complexity — it does not endorse it. Fiction has always been the space where humans process the parts of experience that don't resolve cleanly. The wanting that is inconveniently timed, the pull towards someone who is supposed to be off-limits, the specific experience of feeling something real in a complicated situation — these are human experiences, and fiction that takes them seriously performs a different function than fiction that pretends they don't exist. Engaging with forbidden romance as a genre is not a moral statement. It is using fiction for one of its oldest purposes.` },
      { q: `How does forbidden romance differ from dark romance?`, a: `Forbidden romance is defined by its structure — the external constraint that prohibits or complicates acting on the connection. Dark romance is defined by its tonal register — moral complexity in the character or the desire itself. Forbidden romance can be entirely light in tone while dark romance is always heavier. The two overlap significantly — many dark romance stories involve forbidden dynamics — but they are not synonymous. You can create a story at The Private Story that is purely one or a combination of both.` },
      { q: `Can forbidden romance stories be slow burn?`, a: `Forbidden romance and slow burn are one of the most natural combinations in the genre. Slow burn's mechanism — the accumulation of charged exchanges, the deliberate delay of resolution — is amplified when the delay has a real reason. In forbidden romance slow burn, the tension is not arbitrary: the restraint exists because acting on the feeling has genuine costs. This makes every moment of almost-acknowledgement carry more weight than it would in a slow burn without the forbidden dimension. The Private Story can create stories that combine both dynamics.` },
      { q: `Are there audio stories about professional forbidden romance specifically?`, a: `Yes. Professional forbidden romance — the dynamic between colleagues, between a superior and a subordinate, between a professional and a client — is one of the most requested dynamics on the platform. The structure of professional life, with its clear rules about appropriate behaviour, creates particularly effective forbidden romance because the contrast between the formal surface and the real interior is so well-defined. You can specify a professional dynamic in the creation flow and the story will be built around it.` },
      { q: `Are forbidden romance stories private?`, a: `Completely. Your stories are saved to your private account and are not visible to anyone else. There are no social features, no recommendation feeds, no public library. The Private Story is built architecturally for private listening — your forbidden romance stories are heard only by you and stored only in your account.` },
    ],
};

export const intimateAudioStoriesConfig: SEOPageConfig = {
  meta: { title: `Intimate Audio Stories | The Private Story`, description: `Intimate audio stories created for adults. Private, personalised, and designed around your mood and preferences. Choose your tone — slow burn, charged, tender.` },
  hero: { badge: `Intimate · Private · Adults Only`, h1: `Intimate Audio Stories — Private, Personal, Created Around Your Desire`, tagline: `The story that knows what you need tonight — because you told it.` },
  heroImage: "images/seo-hero-intimate.png",
  showCastingPreview: true,
  sections: [
    {
      h2: "What Intimate Audio Stories Are",
      paragraphs: [
        "Intimate is a word that covers a great deal of emotional and experiential territory. It describes closeness — the specific quality of being known by someone, of being genuinely seen rather than simply noticed. It describes desire — the pull between two people who are aware of each other in the way that changes the texture of a room. It describes warmth — the particular feeling of being wanted, specifically, for who you are.",
        "Intimate audio stories work across this full range. They are not a category of content defined by a single intensity or a single mode. They are stories that place you at the centre of an experience of closeness — however closeness feels for you tonight.",
        "At The Private Story, intimate audio stories are created around your choices for this session. The tone, the dynamic, the pace, the specific quality of the intimacy you want to inhabit — all chosen by you, all built into the generation. What comes back is original narrated audio shaped around what you described.",
        "Not borrowed from a library of adult content. Not matched by an algorithm to your listening history. Written, from language, around the intimate experience you asked for. Private, and entirely yours.",
      ],
    },
    {
      h2: "The Difference Between Intimate Content and Intimate Experience",
      paragraphs: [
        "There is a considerable difference between content that is technically intimate and a story that creates an intimate experience.",
        "Explicit content exists in abundance. It is immediate, direct, and entirely impersonal — made for a general audience, designed to function regardless of who is listening. For some purposes, in some moods, that is the point. But it is not intimate. Intimacy requires specificity. It requires that the experience feel as though it exists for you — not for an imagined average listener, but for this version of you, on this particular evening, in this particular mood.",
        "An intimate audio story created at The Private Story is specific by design. The choices you make before generation — the emotional register, the dynamic between the people in the story, the tone of the voice, the pacing — translate into a story that reflects you rather than approximating you. The result is not bluntly direct. It is intimate in the sense of being genuinely close.",
        "That distinction matters. Intimacy, done well, is more powerful than direct statement because it engages the imagination rather than bypassing it. The story describes what is happening with enough precision that you inhabit it — not from outside it as a viewer, but from inside it as the person it is happening to.",
      ],
    },
    {
      h2: "The Range of Intimate — and Why Yours Is Your Own",
      paragraphs: [
        "Intimate audio stories exist across a wide emotional and experiential spectrum, and where you are on that spectrum on any given night is entirely your own business.",
        "Some nights the need is for slow burn — the extended pleasure of tension that builds deliberately, that withholds in order to arrive somewhere worth arriving. Every sentence increases the charge. The pacing is the story. When something finally gives, it gives in a way that has been entirely earned by everything that came before.",
        "Other nights the need is for something more immediately charged — the electric quality of a specific encounter, two people who have been circling each other finally in the same space. The electricity is different from slow burn. It is present rather than accumulated — the charge is already there, the story is what happens when it's no longer contained.",
        "Other nights the need is for closeness rather than charge — the specific warmth of feeling genuinely wanted, a voice that is unhurried and fully present, the experience of being someone's entire attention without urgency or performance. This is intimate in the way that real intimacy is intimate: the kind that is not about intensity but about the quality of being genuinely there with another person.",
        "All of these are what intimate audio stories can be. You choose the version that is right for tonight. The story is built around that choice.",
      ],
    },
    {
      h2: "Why Privacy Makes Intimate Stories Work",
      paragraphs: [
        "Intimate experience, by definition, requires privacy. What makes something intimate — the specific closeness, the vulnerability, the quality of being genuinely seen — is inseparable from the feeling that this experience belongs to you and is not being shared or observed.",
        "Most platforms that offer adult or intimate content exist in a context that compromises this quality. Recommendations are visible to algorithms, if not to other users. The content itself is made for the widest possible audience, which is the opposite of intimate. The experience of browsing for something private on a public-feeling platform creates its own kind of dissonance — the content may be intimate in subject but the experience of finding it is not.",
        "The Private Story is built around privacy at every level. No social dimension. No public library of what you've listened to. No recommendation layer visible to anyone. The story is created in your session, saved to your private account, and heard only by you. The intimacy of the content and the intimacy of the experience align — because the platform was designed for them to.",
      ],
    },
    {
      h2: "What the Story Sounds Like",
      paragraphs: [
        "First person narration. You are the protagonist — not a reader observing an intimate story from outside, but the person it is happening to. The other presence in the story is written with specificity and intention — not a generic character, but someone shaped by the dynamic you chose.",
        "The voice is performed, not simply read. The narration is paced for hearing — for the specific way audio lands when it is close and private and designed for listening rather than reading aloud. The pacing responds to the emotional register you chose. Slow burn holds its pace deliberately. Charged encounters move with more urgency. Tender closeness is unhurried in a different way — present rather than withheld.",
        "The writing has quality. This matters more in intimate audio than in almost any other genre because the effect of poor writing is most noticeable when the content is supposed to be immersive. A story that takes you out of the experience with a clumsy sentence is the opposite of intimate. The Private Story's generation is calibrated for literary quality — for writing that keeps you inside the experience rather than reminding you you're reading content.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Choose the intimate experience you want tonight",
      body: "Slow burn. Charged encounter. Tender closeness. Something that builds. Something that arrives. You choose the tone, the dynamic, the pacing — and the story is built to deliver that specific experience rather than a general approximation of intimate.",
    },
    {
      heading: "Your story is created around that choice",
      body: "Original narrative, generated for this session. The voice, the world, the dynamic between the characters — all shaped by what you described. Not retrieved. Not matched. Written, from language, for you.",
    },
    {
      heading: "Listen privately — it exists only for you",
      body: "Narrated and saved to your private account. Heard only by you. The story that was made around your choices lives in a space that belongs entirely to you, leaving no trace beyond what you carry from the experience.",
    },
  ],
  scenarios: {
    h2: "Three Versions of Intimate — Three Different Experiences",
    items: [
      {
        heading: "A slow burn story",
        body: "Tension that builds until the listener is entirely inside it. The story understands that the building is the experience — not a delay before something better, but the thing itself. Every sentence increases the charge. The pacing is deliberate because the deliberateness is the point. When the story arrives somewhere, it arrives having fully earned the arrival. The effect is deeper for the distance it covered to get there.",
      },
      {
        heading: "A charged encounter story",
        body: "The specific electricity of two people who have been circling each other — the charge already present before the story begins, the tension in how they occupy the same space. This is different from slow burn. The energy is immediate rather than accumulated, present rather than withheld. The story is what happens when that charge finally finds expression. Direct, specific, atmospheric — the feeling of being inside exactly the moment it is describing.",
      },
      {
        heading: "An intimate closeness story",
        body: "A voice, a presence, the specific warmth of feeling genuinely wanted. Unhurried. Fully attentive. The intimacy here is not in intensity but in quality — the rare experience of someone's complete and genuine attention, without performance or urgency. The story creates the feeling of being with someone who has nowhere else to be and no version of tonight that doesn't include you. That turns out to be its own kind of charged.",
      },
    ],
    interstitial: "Create the intimate audio story that matches what you actually need tonight.",
  },
  benefits: {
    h2: "Why Intimate Audio Stories Work",
    items: [
      {
        heading: "Specific, not generic",
        body: "The story is created around your choices, which means it reflects your version of intimate rather than an average of everyone's. The specificity is what makes it feel genuinely intimate rather than technically adult.",
      },
      {
        heading: "You are the protagonist",
        body: "First person narration places you inside the experience rather than at a distance from it. Not an observer. The person it is happening to. This distinction changes the quality of the experience considerably.",
      },
      {
        heading: "Imagination over statement",
        body: "The story engages your imagination rather than bypassing it — which is more powerful, more immersive, and more genuinely intimate than blunt description. You inhabit the experience rather than consuming it.",
      },
      {
        heading: "Private by design",
        body: "Every element of The Private Story — from the creation flow to the storage of your audio — is built around the understanding that intimate experience requires genuine privacy. Not privacy as a setting. As a foundation.",
      },
      {
        heading: "Literary quality",
        body: "The writing is calibrated to keep you inside the experience rather than pulling you out of it. Intimate audio requires quality prose — the kind that serves the experience without drawing attention to itself.",
      },
      {
        heading: "The full intimate range",
        body: "Slow burn, charged, tender, complex, quietly electric — the full spectrum of what intimate can mean. Not one mode. Your mode, created around what you described for tonight.",
      },
    ],
  },
  fullPicture: {
    h2: "Intimate Audio Stories — The Full Picture",
    paragraphs: [
      "Intimate audio stories for women sit at the intersection of several things that content platforms have historically produced in isolation: adult subject matter, literary quality, genuine personalisation, and private delivery. Most platforms provide one or two of these. The Private Story is built around all four together — because the intimate audio experience only works when all of them are present.",
      "Intimate romantic audio occupies a specific register that is distinct from both general romance content and overtly adult content. It requires the emotional intelligence of good literary fiction and the honesty of writing for adults who know their own desire. It requires pacing that understands what intimacy actually feels like — not just what it looks like from outside.",
      "Private intimate stories are not simply intimate stories with a privacy setting toggled on. Privacy is constitutive of the intimate experience — it is what allows the listener to inhabit the story rather than maintain the slight distance that social visibility always creates. The Private Story's architecture reflects this.",
      "An intimate story generator that produces genuinely intimate content needs to understand the difference between the slow burn listener and the charged-encounter listener and the tender-closeness listener — and write distinctly for each rather than producing a composite that serves none of them fully. The Private Story's creation flow exists to make that distinction precise, and the generation is built to honour it.",
      "Adult intimate audio experiences, at their best, leave the listener feeling something specific — not just aroused, not just entertained, but met. Encountered by something that was shaped around who she is and what she needs tonight. That is the experience The Private Story is built to create.",
    ],
  },
  finalCTA: {
    h2: "Create Your Intimate Story",
    paragraphs: [
      "Most adult content was made for someone else. An imagined average listener, a general mood, a tone that serves nobody's specific desire particularly well.",
      "An intimate audio story made around your choices tonight is different. It is shaped to the version of intimate you're actually looking for — the specific tone, dynamic, and experience you described.",
      "Private, narrated, original. Created in under two minutes. Yours alone.",
    ],
    primary: { label: "Create your intimate story", href: "/create" },
    links: [
      { label: "See pricing", href: "/pricing" },
      { label: "Romantic audio stories", href: "/romantic-audio-stories" },
      { label: "Late night audio stories", href: "/late-night-audio-stories" },
    ],
  },
  faqs: [
      { q: `What are intimate audio stories?`, a: `Intimate audio stories are narrated audio pieces created around an experience of closeness — slow burn tension, charged encounter, tender presence, genuine desire. At The Private Story, they are generated around your specific choices before each session: tone, dynamic, pacing, emotional register. The result is original narrative that delivers the intimate experience you described rather than content retrieved from a library of adult material.` },
      { q: `How intimate do the stories get?`, a: `This is shaped by the choices you make in the creation flow. The Private Story creates across the full range of intimate experience — from quietly close and emotionally present to charged and electric to slow burn tension that builds deliberately. You choose the intensity. The story is built to deliver it.` },
      { q: `What level of intimacy can the stories reach?`, a: `The Private Story creates content that is adult and intimate in register — honest about desire, emotionally sophisticated, written for grown-up listeners who know what they want. The intensity is shaped by your choices in the creation flow, from quietly sensual through to deeply adult in tone. Across all intensity levels, the approach is literary — the writing works through precision, atmosphere, and the specific texture of desire rather than bluntness for its own sake.` },
      { q: `Who are intimate audio stories for?`, a: `Adult women who want a private, personalised, emotionally intelligent intimate listening experience — and who have found that existing content is either too generic to feel genuinely intimate or too impersonal to meet the sophistication of their actual desire. The Private Story is built for listeners who know what they want and want it made for them specifically.` },
      { q: `Can I control the intimacy level?`, a: `Yes. Before your story is created, you choose the emotional register and intensity: slow burn tension, charged and immediate, tender and close, quietly electric. These choices direct the generation precisely. The intimacy level is not a slider applied to fixed content — it is built into the story from the first sentence.` },
      { q: `Are these stories completely private?`, a: `Completely. Your stories are created for your account and heard only by you. No social feed, no visible listening history, no algorithm that surfaces your choices to anyone. The Private Story's entire architecture is built around the understanding that intimate experience requires genuine privacy — not as a feature, but as a foundation.` },
      { q: `How is this different from adult content platforms?`, a: `Adult content platforms produce content for the widest possible audience — which means the content is, by design, impersonal. The Private Story creates original stories around your specific choices, which means the intimacy is genuine rather than approximated. Additionally: The Private Story is literary in approach, private by architecture, and built specifically for the audio listening experience. The result is something meaningfully different from browsing a catalogue of adult content.` },
    ],
};

export const lateNightAudioStoriesConfig: SEOPageConfig = {
  meta: { title: `Late Night Audio Stories | The Private Story`, description: `Late night audio stories created for adults. Private, atmospheric, and shaped around the specific energy of after midnight. Your story, created for tonight.` },
  hero: { badge: `After Dark · Private · Adults Only`, h1: `Late Night Audio Stories — After Midnight, the Rules Change`, tagline: `The particular quality of late night — its honesty, its atmosphere, its specific permission — captured in a story made for it.` },
  sections: [
    {
      h2: "What Late Night Actually Is",
      paragraphs: [
        "Late night is not simply the hours after a certain time. It is a specific quality of experience that those hours create.",
        "The world has gone quiet. The obligations of the day have released their claim on you. The performances — of competence, of composure, of being whichever version of yourself the daytime requires — have been set aside. What remains is something more honest. More willing. More open to the kind of experience that daylight makes self-conscious.",
        "Late night creates a specific permission. Permission to want things you don't examine in daylight. To feel things you set aside during the hours when feeling them would cost you something. To inhabit a different version of yourself — less managed, more alive to whatever is actually happening beneath the surface.",
        "A late night audio story understands this permission and is written entirely within it. The atmosphere, the honesty of the voice, the quality of the encounter — all calibrated for the specific late night emotional frequency. Not a daytime story listened to late. A story that could only exist in these hours.",
      ],
    },
    {
      h2: "The Atmosphere of After Midnight",
      paragraphs: [
        "Late night has a physical reality that good storytelling renders into sound and texture. The city outside — quieter, the street lights doing different work in the absence of other light. The quality of indoor space at this hour — more contained, more private, the world having contracted to the immediate. A voice that sounds different when there is no ambient noise to compete with, no reason to be anything other than exactly what it is.",
        "The best late night stories understand that atmosphere is not background — it is constitutive of the experience. The hotel room works as a setting not because hotels are inherently romantic but because a hotel room at midnight has a specific quality of suspension from ordinary life. The city at night works because the rain on the window and the neon-lit street below create a world that is simultaneously public and entirely private.",
        "The Private Story's generation captures this. When you choose a late night atmospheric register, the story is built into that world — setting, texture, voice, and pacing all shaped around the specific quality of after midnight rather than being general romantic content that happens to be set at night.",
      ],
    },
    {
      h2: "Late Night Honesty — What Only Exists After Midnight",
      paragraphs: [
        "Late night is where honesty lives.",
        "Not all honesty — not the difficult conversation that should have happened months ago, not the reckoning with something that requires daylight and willingness. But a specific kind: the honesty of what you actually want, felt clearly because the day's static has finally quietened. The honesty of a conversation that goes somewhere it wouldn't go at any other hour. The honesty of saying something — or hearing something said — without the protective distance that normal social context provides.",
        "Late night phone calls have their own emotional register. Conversations that start as nothing and become something, because it is late enough that both people have run out of the energy to be careful. Late night encounters carry a particular weight — not recklessness, but willingness. The specific feeling of being awake at this hour with someone else who is also awake at this hour, which implies a kind of selection.",
        "Late night audio stories at The Private Story inhabit this register. The voice in the story is late night honest — present, direct, not performing the version of itself it would perform at noon. The encounter the story describes carries the specific charge of something that happens in these hours and couldn't quite happen the same way in any others.",
      ],
    },
    {
      h2: "Why Late Night Deserves Its Own Stories",
      paragraphs: [
        "Most audio content is produced for general listening — for commutes, for background, for an unspecified moment in the day. It is not calibrated for the particular quality of who you are at midnight, what you are open to, what the hour has made possible.",
        "Late night listeners are not the same as daytime listeners. By midnight, the self-monitoring that governs daytime experience has relaxed. The internal editor has grown quieter. What you want from a story at this hour — the atmosphere, the intensity, the honesty of the voice, the willingness to go somewhere — is different from what the same story would offer at seven in the evening.",
        "Late night audio stories are built for this. The generation is not simply a romantic or intimate story with the clock set to midnight. It is a story that understands why you are listening now — what the hour means, what it has created, what the listener at midnight actually needs from the experience.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Choose the late night story you want",
      body: "A phone call that goes somewhere. A city at night with a stranger who becomes more than that. A suspended space — a hotel room, a quiet bar, anywhere the ordinary rules have been temporarily set aside. You choose the atmosphere and the encounter. The story is built into it.",
    },
    {
      heading: "Your story is created around that world",
      body: "Original narrative, generated for this session, set inside the late night atmosphere you chose. The voice, the setting, the pacing — all calibrated for after midnight rather than lifted from a general romantic category and placed there.",
    },
    {
      heading: "Listen privately — the night is yours",
      body: "Your story is narrated and saved to your private account. Heard only by you, in the specific privacy that late night offers. The story exists in the space the night has created — and stays there.",
    },
  ],
  scenarios: {
    h2: "Three Late Night Stories — Three Different Atmospheres",
    items: [
      {
        heading: "A late night phone call story",
        body: "The honesty that only exists after midnight. A conversation that started as something small and became something else — the specific way that late night dissolves the careful distance people maintain during daylight hours. The voice on the other end is close. Quieter than it would be at any other hour. Saying things it wouldn't quite say if it were still afternoon. The call goes somewhere. You go with it.",
      },
      {
        heading: "A city-at-night story",
        body: "Neon, rain, a stranger who becomes more than that. The specific atmosphere of a city after midnight — the way public space becomes private when it empties, the way a chance encounter at this hour carries a charge that the same encounter at noon wouldn't. The story is cinematic in the best sense: you feel the setting, the quality of the light, the particular electricity of two people in the same place at this specific time of night who would not have been anywhere else.",
      },
      {
        heading: "A hotel room story",
        body: "Neutral space, no consequences, no ordinary rules. A hotel room is already a suspension from ordinary life — temporary, anonymous, outside the usual context. At midnight, that quality intensifies. The story inhabits this: the specific freedom of a space that belongs to no one, the quality of an encounter that exists only within it, the particular intimacy of a world contracted to four walls and whatever is happening inside them.",
      },
    ],
    interstitial: "Create a late night story for the specific version of tonight that only exists right now.",
  },
  benefits: {
    h2: "Why Late Night Audio Stories Work",
    items: [
      {
        heading: "Calibrated for this hour",
        body: "Not a general story listened to late. A story built for after midnight — for the specific quality of who you are at this hour, what you are open to, what the night has made possible.",
      },
      {
        heading: "Atmospheric, not generic",
        body: "Setting is not background in a late night story — it is constitutive of the experience. The generation builds the world you chose into every element of the narrative, not just the scene description.",
      },
      {
        heading: "Late night honest",
        body: "The voice in the story carries the honesty of this hour. Present, direct, less managed than it would be at any other time. It speaks the way things are actually said after midnight.",
      },
      {
        heading: "Private by design",
        body: "Your story is held in your private account and heard only by you. The privacy of the platform aligns with the privacy the night itself creates — what happens here stays here.",
      },
      {
        heading: "Original every time",
        body: "Each late night story is created for this session. The atmosphere, the encounter, the specific quality of the experience — written fresh, around your choices, never retrieved from a fixed catalogue.",
      },
      {
        heading: "Ready before the night ends",
        body: "The creation takes under two minutes. The story is yours before midnight moves further on. No browsing. No settling. The night doesn't need to wait while you look for something that almost works.",
      },
    ],
  },
  fullPicture: {
    h2: "Late Night Audio Stories — The Full Picture",
    paragraphs: [
      "Late night audio stories for adults occupy a specific niche that general romance and intimate content does not fill. The category is defined by atmosphere as much as content — by the understanding that late night is a distinct emotional and experiential register, not simply a time of day.",
      "After midnight audio stories, when made well, understand the particular permission the hour creates. Stories to listen to late at night need to meet the listener where she actually is — in the specific state that midnight creates — rather than offering general content and hoping the hour does the rest.",
      "Night time audio stories exist across a wide range of atmosphere and encounter. The quiet intimacy of a late phone call. The cinematic charge of a city at night. The suspended freedom of temporary space. Late night romantic audio that genuinely captures this register is rare because it requires understanding not just what the story contains but what the hour means to the person listening.",
      "The Private Story builds late night stories from the inside of that understanding — stories shaped around what after midnight actually is, calibrated for the listener who is awake now, in the specific privacy the night offers, wanting something made for exactly this.",
    ],
  },
  finalCTA: {
    h2: "Create Your Late Night Story",
    paragraphs: [
      "The night has its own quality. Its own permission. A version of you that only fully exists in these hours.",
      "Most content wasn't made for this. It was made for general listening, general moods, a general time of day that isn't now.",
      "A late night story created around your choices tonight was made for exactly this — for the hour, for the specific atmospheric world you want to inhabit, for the version of you that showed up at midnight.",
      "Create it in under two minutes. The night can hold it.",
    ],
    primary: { label: "Create your late night story", href: "/create" },
    links: [
      { label: "See pricing", href: "/pricing" },
      { label: "Intimate audio stories", href: "/intimate-audio-stories" },
      { label: "Slow burn audio stories", href: "/slow-burn-audio-stories" },
    ],
  },
  faqs: [
      { q: `What are late night audio stories?`, a: `Late night audio stories are narrated audio pieces created around the specific atmospheric and emotional quality of after midnight — the honesty, the permission, the particular charge that the hour creates. At The Private Story, they are generated around your choices: the setting (a phone call, a city at night, a hotel room), the encounter, the tone. The result is original audio shaped for late night listening, not general content repurposed for the hour.` },
      { q: `What makes late night stories different?`, a: `Late night is a specific emotional register — distinct from daytime experience in its honesty, its openness, and the particular quality of permission it creates. Late night audio stories are built for this register: the atmosphere, the voice, the pacing, and the emotional territory of the story are all calibrated for after midnight rather than lifted from a general romantic category. The hour is not incidental — it is the premise.` },
      { q: `Can I choose a late night atmosphere for my story?`, a: `Yes. The creation flow allows you to choose the world your story inhabits — a late night phone call, a city at night, a hotel room, or another atmospheric setting. The story is built into that world from the beginning, which means the setting shapes the narrative rather than being added as description afterward.` },
      { q: `How intimate are the late night stories?`, a: `The Private Story creates adult content in a literary register — honest about desire and charged with the specific atmosphere of late night. The intensity is shaped by your choices in the creation flow, from atmospheric and suggestive through to deeply adult in tone. The writing works through atmosphere, precision, and the quality of the encounter across all intensity levels.` },
      { q: `How long are late night audio stories?`, a: `Stories typically run between fifteen and thirty minutes — the right length to inhabit the late night atmosphere fully without requiring more of the night than you have to give. Your stories are saved to your private account, so you can return to them or create new ones whenever the hour arrives again.` },
      { q: `Can I listen without headphones?`, a: `Headphones are recommended for the full late night experience — they create the private, close quality that late night audio requires. Listening through headphones at midnight is a specific kind of intimacy with the story that open speakers in a room cannot quite replicate. That said, the story is yours to listen to however works for tonight.` },
      { q: `Are late night stories private?`, a: `Completely. Your stories are created for your account and heard only by you. No visible history, no social dimension, nothing shared. The privacy of The Private Story's architecture aligns with the privacy that late night itself creates — what happens here stays here.` },
    ],
};

export const loveStoriesAudioConfig: SEOPageConfig = {
  meta: { title: `Love Stories Audio | The Private Story`, description: `Audio love stories created for adults. Emotionally intelligent, private, and personalised around your mood and preferences. Not a library — your story.` },
  hero: { badge: `Love · Emotional Depth · Private`, h1: `Love Stories Audio — Emotionally Intelligent Stories Created Around You`, tagline: `Love stories written for the emotional complexity of adult feeling — not simplified, not sanitised, not the same story retold.` },
  sections: [
    {
      h2: "What Audio Love Stories Are For",
      paragraphs: [
        "Love stories have always done something particular for the people who need them. Not escapism, exactly — or not only that. Something closer to recognition. The experience of encountering, in narrative, a version of feeling you already know — and finding it handled with enough care that you feel less alone in having felt it.",
        "Audio love stories do this with the additional dimension of voice. The narration is not incidental to the experience. Hearing a story — following a voice through an emotional landscape — is a different kind of receiving than reading it. It is more immediate. More intimate. The feelings the story describes arrive closer.",
        "At The Private Story, audio love stories are created around you specifically. Not around a general audience's version of what love feels like. Around the emotional register you are inhabiting tonight — the tone, the dynamic, the specific quality of romantic connection you want the story to explore.",
        "That specificity is what makes the difference between a love story that moves you and one that almost does.",
      ],
    },
    {
      h2: "The Emotional Range of Love",
      paragraphs: [
        "Love in narrative is not one experience. It is a collection of distinct emotional situations, each with its own specific texture.",
        "Second chance love — the particular weight of something that almost didn't happen, or that was lost and found its way back — has a different quality from slow realisation love, where friendship gradually becomes something that changes the shape of everything. Both are different from late night love, which has the specific emotional temperature of honesty that only arrives after midnight, when the performances have been set aside and two people speak to each other as they actually are.",
        "Most love story content exists in a narrow band of these experiences. The declaration, the first meeting, the grand gesture — romantic love as a series of moments rather than as a condition that actually changes you from the inside.",
        "The Private Story creates across the full emotional range. Because the story is generated around your choices — and because those choices include not just mood and tone but the specific emotional situation you want to inhabit — the result can be any of these experiences. Not the closest available match from a fixed catalogue. The experience itself.",
      ],
    },
    {
      h2: "Why Emotional Intelligence Matters in a Love Story",
      paragraphs: [
        "A love story without emotional intelligence is a romance plot. Two characters, a series of events, a resolution. Technically a love story. Not particularly moving.",
        "Emotional intelligence in a love story means understanding the interior experience — what it feels like to be the person inside the moment rather than the person observing it from outside. The specific quality of wanting someone's attention and not being sure you have it. The way realisation arrives not all at once but gradually, in increments, each one changing the meaning of what came before. The particular satisfaction of being known.",
        "This is what makes love stories work as experiences rather than just as plots. And it is what The Private Story's generation is calibrated to produce — narrative that understands the difference between describing romantic events and rendering romantic feeling.",
        "The AI writes toward the emotional experience you described. The pacing, the interiority of the narration, the quality of the connection between characters — all shaped by what you asked for. You don't get a love story that contains your preferences as features. You get a love story that feels like what you described.",
      ],
    },
    {
      h2: "Love Stories for Adults — Written for Adult Emotional Lives",
      paragraphs: [
        "Adult love stories occupy different emotional territory from the love stories told to younger audiences. Not primarily because of content — though adult love is more complex — but because of what adult listeners bring to the experience.",
        "Adults carry the weight of previous feeling. Love stories that ignore this feel thin. The best love stories for adults understand that the listener is not encountering love for the first time — that she has an emotional history that shapes how she receives everything a love story offers. Second chance love lands differently when you have actually lost something. Slow realisation carries different freight when you have experienced the cost of not realising in time.",
        "The Private Story's generation does not smooth these complexities away. It creates stories that meet adult emotional lives where they are — with the weight, the awareness, and the intelligence they deserve.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Describe the love story you need tonight",
      body: "Second chance. Slow realisation. Late night honesty. Tender and close. You choose the emotional situation and the register — not from a fixed list of titles but from the specific landscape of what you're looking for. The story is built around that.",
    },
    {
      heading: "Your story is created from scratch",
      body: "Original narrative, generated around your choices. Not retrieved from a library, not adapted from a template. Written by AI in service of the emotional experience you described — paced, voiced, and shaped to deliver it.",
    },
    {
      heading: "Listen privately — the feeling is yours",
      body: "Your love story is narrated and saved to your private account. Heard only by you. The emotional experience it creates — whatever it moves in you — is your own, held in a space that belongs entirely to you.",
    },
  ],
  scenarios: {
    h2: "Three Love Stories — Three Different Emotional Experiences",
    items: [
      {
        heading: "A second chance love story",
        body: "The specific weight of something that almost didn't happen. Two people who know each other's history — who carry the memory of what was lost and the awareness of what it would mean to lose it again. The story understands this weight and writes into it rather than past it. The feeling is not uncomplicated happiness. It is happiness with depth — which is the only kind that actually lands.",
      },
      {
        heading: "A slow realisation story",
        body: "The moment that friendship becomes something that changes the shape of everything. Not a sudden arrival but a gradual one — the story moves through the moments that build toward it, each one adding meaning to the ones before. By the time the realisation comes, you have been carrying it alongside the narrator, which makes it feel true rather than convenient.",
      },
      {
        heading: "A late night love story",
        body: "Honest, close, the kind of conversation that only happens after midnight when the performances have been set aside. The voice is quieter. The emotional register is more direct. Two people speaking to each other as they actually are — which turns out to be the most romantic thing of all. Not grand gestures. Genuine presence. The story understands the difference.",
      },
    ],
    interstitial: "Create a love story shaped around the emotional experience you are actually looking for.",
  },
  benefits: {
    h2: "Why Personalised Audio Love Stories Work",
    items: [
      {
        heading: "Written around your emotional register",
        body: "The specific tone, situation, and feeling of your love story are chosen by you and built into the generation. Not approximated from a category. Shaped to the emotional experience you described.",
      },
      {
        heading: "Emotionally intelligent narration",
        body: "The story understands the interior experience — what it feels like to be inside the moment rather than observing it. The writing goes where the feeling is rather than staying at the level of events.",
      },
      {
        heading: "Heard, not just read",
        body: "Audio narration delivers love stories with a particular intimacy that reading cannot fully replicate. The voice carries the feeling. The pacing makes space for it. The experience arrives closer.",
      },
      {
        heading: "Private by design",
        body: "Your love stories are held in your private account and heard only by you. The emotional experience they create is entirely yours — not shared, not visible, not part of any social or public dimension.",
      },
      {
        heading: "Original every session",
        body: "The story is created for this session. It didn't exist before you described what you were looking for. There is no fixed catalogue — only what you asked for, made fresh.",
      },
      {
        heading: "The full emotional range",
        body: "Second chance, slow realisation, late night closeness, tender and quiet, emotionally complex — the full range of what love in narrative can be. Not a single version of romantic that you adapt to. Your version, created around you.",
      },
    ],
  },
  fullPicture: {
    h2: "Audio Love Stories — The Full Picture",
    paragraphs: [
      "Love story audio for adults sits in a category that publishing and streaming have underserved for a specific reason: adult love stories require emotional complexity, and emotional complexity is harder to produce at scale than plot.",
      "Audio love stories to listen to, when they are made well, do something that genre romance often doesn't attempt — they render the interior experience of love rather than just its events. The feeling of being known. The specific texture of wanting. The weight that comes with history. These are the elements that make a love story land for an adult listener.",
      "Romantic love stories audio on most platforms are made for the broadest possible audience. The emotional register is flattened to serve everyone and no one in particular. Emotional love story audio that actually moves you requires a specificity that general content cannot provide — which is precisely what personalised generation makes possible.",
      "Love stories to fall asleep to have an additional quality requirement: they need to move the listener into a different emotional space from the one she arrived in, and leave her there gently enough to carry into sleep. The pacing, the resolution, the warmth of the voice — all of these are calibrated when the story is created for this purpose specifically.",
      "Whatever the love story looks like for you tonight — the specific emotional situation you want to inhabit, the tone that will actually land — that is what the generation is built to deliver.",
    ],
  },
  finalCTA: {
    h2: "Create Your Love Story",
    paragraphs: [
      "Most love story content was made before you arrived. It carries someone else's choices about what love should feel like, what register it should use, how it should move.",
      "A love story created around you tonight carries your choices. The emotional situation that speaks to where you are. The tone that will actually reach you. The specific quality of connection you are looking for.",
      "Describe what you need. It gets made around that. Private, narrated, and entirely yours.",
    ],
    primary: { label: "Create your love story", href: "/create" },
    links: [
      { label: "See pricing", href: "/pricing" },
      { label: "Romantic audio stories", href: "/romantic-audio-stories" },
      { label: "Emotional audio stories", href: "/emotional-audio-stories" },
    ],
  },
  faqs: [
      { q: `What are audio love stories?`, a: `Audio love stories are narrated narrative pieces built around romantic love as an emotional experience — its weight, its texture, its specific interior quality. At The Private Story, they are generated around your choices for each session: the emotional situation, the tone, the dynamic, the pacing. The result is original narrated audio that delivers the specific love story experience you described, rather than a pre-authored piece matched from a library.` },
      { q: `How are these different from romance novels?`, a: `Romance novels are authored works — finished before you arrive, written by a specific writer for a general readership. They are fixed. You adapt to them. An audio love story at The Private Story is generated around your choices for tonight — the emotional register, the situation, the dynamic between characters — which means the story responds to you rather than requiring you to match yourself to it. The difference in experience is significant.` },
      { q: `Can I choose the emotional tone of my love story?`, a: `Yes — this is the core of how The Private Story works. Before generation, you choose the emotional register: second chance, slow realisation, tender and close, late night honesty, emotionally complex. These choices direct the AI precisely. The tone is not a genre category applied afterward — it is the brief the story is written toward from the beginning.` },
      { q: `Are love stories private?`, a: `Completely. Your stories are created for your account and accessible only to you. No public feed, no social sharing, no visible history. The emotional experience your love stories create is held in a space that belongs entirely to you.` },
      { q: `Can I create a love story for a specific scenario?`, a: `The creation flow allows you to describe the emotional situation you want to inhabit — second chance, slow realisation, late night closeness, and many others. The AI writes into the specific scenario you chose, which means the story feels shaped to a real emotional situation rather than placed in a generic romantic context.` },
      { q: `How long are audio love stories?`, a: `Stories typically run between fifteen and thirty minutes — long enough to develop the emotional arc and deliver the feeling properly, short enough to fit into an evening, a commute, or the space before sleep. Stories are saved to your account, so you can return to them or create new ones whenever you need.` },
      { q: `Can I share a story with someone?`, a: `Stories are created for your private account and designed for private listening. They are yours alone — which is part of what makes the experience work. The Private Story is built around the understanding that some feelings are best held in a space that belongs entirely to you.` },
    ],
};

export const personalisedAudioStoriesConfig: SEOPageConfig = {
  meta: { title: `Personalised Audio Stories | The Private Story`, description: `Personalised audio stories created around how you want to feel tonight. Not selected from a library — generated around your choices and private to you alone.` },
  hero: { badge: `Personalised · Private · For Adults`, h1: `Personalised Audio Stories Created Around How You Want to Feel`, tagline: `Some nights you don't want to browse. You want something that already knows what you need.` },
  heroImage: "images/seo-hero-personalised.png",
  showCastingPreview: true,
  sections: [
    {
      h2: "What Are Personalised Audio Stories?",
      paragraphs: [
        "A personalised audio story is exactly what it sounds like — and nothing like what you've experienced before.",
        "It isn't a podcast. It isn't an audiobook. It isn't a playlist curated by an algorithm that knows your listening history but not your mood at 11pm on a Tuesday when the day has been a lot and you need something that feels like it was made for exactly this moment.",
        "A personalised audio story is a piece of narrative audio created around you — your mood tonight, the tone you need, the kind of emotional experience you're looking for. Not chosen from a library. Not pre-written for a general audience. Created. For you. Right now.",
        "At The Private Story, every story begins with a question: how do you want to feel?",
        "The answer shapes everything.",
      ],
    },
    {
      h2: "Who Are Personalised Audio Stories For?",
      paragraphs: [
        "They're for adults who have outgrown content that wasn't designed with them in mind.",
        "They're for the woman who finishes a long day and wants to feel something — tension, warmth, connection, calm — but doesn't want to spend forty minutes scrolling through options that are close but not quite right.",
        "They're for anyone who has ever started an audiobook and thought: I'm not in the mood for this particular story tonight. Anyone who has paused a podcast mid-episode because the energy is wrong. Anyone who has wished, quietly, that there was something made for precisely the version of yourself you are right now.",
        "Personalised audio stories exist for that person. For that moment.",
        "They work beautifully for:",
      ],
      bullets: [
        "Winding down at night — when you need your thoughts to slow before sleep takes over",
        "Quiet time alone — a bath, a commute, an hour you've carved out for yourself",
        "Emotional decompression — when you need to feel something in a safe, private space",
        "Late night listening — when the rest of the world has gone quiet and you finally have room to breathe",
      ],
    },
    {
      h2: "Why Audio Works — The Psychology Behind the Experience",
      paragraphs: [
        "There is something specific that happens when a story arrives through sound rather than text or image.",
        "Reading requires effort — the eyes scan, the brain decodes, part of your attention is always on the act of reading itself. Visual content gives you everything at once, which means your imagination doesn't need to do any work. But audio is different.",
        "Audio creates a collaboration between the story and the listener.",
        "The voice arrives. The words build a world. And your imagination — freed from the work of decoding text, freed from the passivity of watching — fills in everything else. The room looks the way it should look for you. The voice sounds the way it should sound for you. The feeling lands exactly where it should land because your imagination has placed it there.",
        "This is why audio stories produce such a specific and powerful sense of immersion. It isn't passive consumption. It is active imagination engaged with expert storytelling. The result is an experience that feels, for many listeners, more real than visual content — closer, more personal, more present.",
        "Add personalisation to this — a story shaped around your specific mood, tone, and preferences — and the effect deepens considerably. This isn't a story that happens to work for you. It's a story built to work for you. Your imagination isn't filling in gaps left by someone else's vision. It's collaborating with a story that was designed around how you experience things.",
        "The intimacy of that is difficult to describe and immediately recognisable when you feel it.",
      ],
    },
    {
      h2: "The Problem With Everything Else",
      paragraphs: [
        "Most audio content for adults operates on a library model.",
        "A library is built on a reasonable assumption: if we create enough content across enough categories, most people will find something that roughly fits most of the time.",
        "And most of the time, that works. You find something acceptable. You settle in. You get through it.",
        "But acceptable is a long way from made for you.",
        "Pre-written audio stories have fixed narratives. The tone is set before you arrive. The pacing was decided by someone who didn't know what kind of day you'd had. The emotional arc leads somewhere that may or may not be where you need to go tonight.",
        "You adapt to the content. The content doesn't adapt to you.",
        "This works when you have hours to browse and plenty of patience. It works less well when you're tired, when you know what you need but can't find it, when you're lying in the dark at midnight wanting something that meets you exactly where you are.",
        "Personalised audio stories solve the problem that libraries cannot solve: the specific, individual, moment-to-moment reality of what you actually need right now.",
      ],
    },
    {
      h2: "This Is Not a Library. This Is a Story Made for You.",
      paragraphs: [
        "The Private Story doesn't ask you to browse.",
        "It asks you one question — how do you want to feel? — and builds something around your answer.",
        "You choose your mood. The atmosphere you want to inhabit for the next twenty minutes. The tone — slow and building, warm and connecting, charged and cinematic. The kind of voice you want in your ear tonight. The kind of story that will do something specific for you rather than something general for everyone.",
        "Then your story is created. Not selected. Created.",
        "It exists because you needed it. It is shaped around your preferences. It sounds the way it sounds because of the choices you made. It goes where you directed it to go.",
        "When you listen, you are not hearing something made for an imagined average listener. You are hearing something that was built for the exact version of you sitting in the dark right now.",
        "That specificity is the difference between content and experience.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Choose your mood and tone",
      body: "You tell us how you want to feel. Slow burn tension building toward something inevitable. Calm connection, quiet and warm. Confident energy — you at the centre of something charged and cinematic. Emotional depth, the specific pleasure of feeling genuinely understood. The choice is yours and it shapes everything.",
    },
    {
      heading: "Your story is created",
      body: "The story is generated around your selections — not retrieved from a library, not adapted from a template, but written around you. Your mood determines the pacing. Your tone determines the voice. Your preferences determine where the story goes.",
    },
    {
      heading: "Listen privately",
      body: "Your story is saved to your account and heard only by you. There is no social feed. No sharing. No public profile. What you create and what you listen to stays entirely private — between you and the story you needed tonight.",
    },
  ],
  scenarios: {
    h2: "What Personalised Audio Stories Can Feel Like",
    intro: "Here are three examples of what a personalised story might look like, depending on what you choose:",
    items: [
      {
        heading: "A slow burn tension story",
        body: "Every word chosen for your specific mood tonight. The story builds — slowly, deliberately, exactly as long as the delay needs to be — toward a moment that lands because you were held at the edge of it long enough. The tension isn't incidental. It's the point. And because it was shaped around you, it knows exactly how long to hold you there.",
      },
      {
        heading: "A calming connection story",
        body: "For when you need to feel less alone. A voice that isn't trying to be anything other than present. A story that moves at the pace of your breathing when it finally slows. The specific warmth of feeling genuinely accompanied through the last hour of a day that needed more of you than you had.",
      },
      {
        heading: "A confident energy story",
        body: "You at the centre of something cinematic. The room organised around your presence. A dynamic that places you exactly where you want to be — desired specifically, seen clearly, the focus of an attention that feels like the best kind of recognition. This is the story for the nights when you want to feel like the most interesting person in the room. Tonight, you are.",
      },
    ],
    interstitial: "Create a story shaped around how you want to feel.",
  },
  benefits: {
    h2: "The Benefits of Personalised Audio Storytelling",
    items: [
      {
        heading: "Your mood determines everything",
        body: "Not genre tags. Not category filters. Your actual emotional state tonight determines the pacing, tone, atmosphere, and direction of your story. This is a fundamentally different experience from browsing.",
      },
      {
        heading: "Complete privacy, always",
        body: "Your stories are saved to your account and visible to no one else. There is no social component, no sharing feature, no public profile. What you create stays yours.",
      },
      {
        heading: "Emotional control",
        body: "You decide what kind of experience you're having. Slow and building or immediate and charged. Warm and connecting or cinematic and intense. The emotional register is yours to set.",
      },
      {
        heading: "No browsing, no settling",
        body: "The endless scroll of a library that doesn't quite have what you need — that experience doesn't exist here. You describe what you want. It gets made. You listen.",
      },
      {
        heading: "Created fresh every time",
        body: "Every story is generated for this session, for this version of you. You can create something different tomorrow night because tomorrow night you might need something different.",
      },
      {
        heading: "Designed for adult experience",
        body: "This isn't content that forgot adults exist. The tone, the themes, the emotional intelligence of every story are calibrated for grown women who know what they want and want it done well.",
      },
    ],
  },
  fullPicture: {
    h2: "Personalised Audio Stories — Exploring the Full Range",
    paragraphs: [
      "The category of personalised audio storytelling is broader than any single experience.",
      "If you're looking to create personalised audio stories specifically for relaxation, there are tones and pacing choices designed to slow your nervous system and carry you toward sleep.",
      "If you're drawn to personalised romantic audio stories, the platform offers dynamics across the full emotional range — from tender and emotionally connecting to slow burn tension that builds across the full length of a story designed to make the delay as pleasurable as the arrival.",
      "For those looking for custom audio stories for women that prioritise emotional intelligence over spectacle — stories that understand the specific texture of female experience and desire — this is where that lives.",
      "Audio stories tailored to my mood is perhaps the most accurate description of the core experience. The mood selector isn't a genre filter. It's the first word of a conversation between you and a story that doesn't exist yet.",
      "And for anyone who has looked for personalised bedtime stories for adults and found only content designed for children or content designed for a lowest-common-denominator adult audience — the personalised audio story fills that gap. Premium. Intelligent. Made for tonight.",
    ],
  },
  finalCTA: {
    h2: "Start Your Private Story",
    paragraphs: [
      "You have been settling for content that wasn't made for you.",
      "Not because nothing better existed — but because nothing better had been built yet.",
      "The Private Story is built on a single conviction: the most powerful audio experience is one that knows why you're listening tonight. Not your demographic. Not your listening history. Your mood. Your need. The specific version of yourself that showed up tonight wanting something real.",
      "This isn't a library. You won't browse here.",
      "You'll tell us how you want to feel. And we'll make you something for exactly that.",
    ],
    primary: { label: "Create your personalised story", href: "/create" },
    links: [
      { label: "See pricing", href: "/pricing" },
      { label: "Explore intimate audio stories", href: "/intimate-audio-stories" },
      { label: "Learn about private audio stories", href: "/private-audio-stories" },
    ],
  },
  faqs: [
      { q: `What are personalised audio stories?`, a: `Personalised audio stories are narrative audio experiences created around your specific mood, tone, and preferences — rather than selected from a pre-written library. At The Private Story, you choose how you want to feel, and a story is generated around that choice. The result is an experience shaped specifically for you rather than for a general audience.` },
      { q: `How is a personalised audio story different from a podcast?`, a: `Podcasts are produced content — recorded once, distributed to everyone, experienced the same way regardless of who is listening or what they need. A personalised audio story is created for you at the moment you request it. The tone, pacing, atmosphere, and emotional direction are all determined by your choices. No two listeners receive the same experience.` },
      { q: `Can I choose the mood and tone of my story?`, a: `Yes — this is the foundation of the experience. Before your story is created, you select the mood and tone you want. Slow burn tension. Calm and connecting. Confident and charged. Emotionally immersive. Your selection shapes every element of the story that follows.` },
      { q: `Are my stories saved privately?`, a: `Completely. Your stories are saved to your account and are visible to no one else. There is no social feed, no sharing feature, and no public component to the platform. Everything you create and everything you listen to is entirely private.` },
      { q: `How long does it take to create a personalised audio story?`, a: `The creation process — choosing your mood and preferences — takes less than two minutes. Your story is then generated and ready to listen to shortly after. The stories themselves are typically between fifteen and thirty minutes, depending on your selections.` },
      { q: `Is this for adults only?`, a: `Yes. The Private Story is an adult platform. All content is created for listeners aged eighteen and over. Age verification is required to access the platform.` },
      { q: `Can I create more than one story?`, a: `Yes. You can create a new personalised story whenever you want one. Your mood tonight is different from your mood tomorrow night — your story should be too. Each creation begins fresh, shaped around wherever you are when you start.` },
    ],
};

export const privateAudioStoriesConfig: SEOPageConfig = {
  meta: { title: `Private Audio Stories | The Private Story`, description: `Private audio stories generated around your mood and preferences. No social feed, no sharing, no history visible to anyone. Everything stays in your account.` },
  hero: { badge: `Private by Design · No Social · Yours Alone`, h1: `Private Audio Stories — Created for You, Heard Only by You`, tagline: `What you listen to in private should stay private. Here, it always does.` },
  sections: [
    {
      h2: "The Private Story — What This Is",
      paragraphs: [
        "There is a particular kind of content that people want but rarely discuss.",
        "Not because it's shameful. Because it's personal.",
        "The stories that meet you at the end of a difficult day. The narrative that helps you feel something you've been holding at a distance. The late night listening that exists in the specific space between who you are in public and who you are when no one is watching.",
        "This kind of content deserves privacy. Not as an afterthought — as a design principle.",
        "At The Private Story, privacy is not a feature. It is the foundation. Every story you create is generated for you, saved to your account, and heard only by you. There is no social feed. No sharing function. No public profile. No algorithm broadcasting your preferences to anyone.",
        "What you create here is yours. Completely and permanently yours.",
      ],
    },
    {
      h2: "What Private Audio Stories Actually Are",
      paragraphs: [
        "Private audio stories are personalised narrative audio experiences created around your mood, preferences, and emotional needs — and stored in a way that ensures no one else can access them.",
        "They are not podcasts broadcast to a public audience. They are not audiobooks sold to millions of listeners. They are not content sitting in a shared library that anyone with an account can browse.",
        "They are stories that begin with your choices and end in your ears alone.",
        "The privacy distinction matters for a specific reason: the most emotionally resonant content — the stories that actually do something for you, that meet you where you are, that create the experience of genuine intimacy — requires a private space to land properly.",
        "When you know that what you're listening to is visible to no one, trackable by no one, shareable by no one, something relaxes. The listening becomes different. More present. More honest. More yours.",
        "That is what private audio stories are designed to create.",
      ],
    },
    {
      h2: "Who Needs Private Audio Stories",
      paragraphs: [
        "You don't need to justify wanting privacy around the content you consume.",
        "But if it helps to name it: the listeners who come to The Private Story typically have one thing in common. They are adults who have tried other things — podcasts, audiobooks, streaming platforms — and found that the content was fine, but the experience of consuming it felt oddly public. Even alone, there was the sense of browsing a shared space. Of being one of many. Of content that wasn't really for them.",
        "Private audio stories are for the woman who wants to feel something without explaining it to anyone. For anyone who has ever cleared a listening history not because of guilt but because of a reasonable expectation that private things should stay private. For adults who want the freedom to explore moods, tones, and emotional experiences without a digital footprint that follows them.",
        "They work particularly well for:",
      ],
      bullets: [
        "Late night listening — when the rest of the world has gone quiet and you finally have space to feel things",
        "Emotional processing — stories that help you access and move through feelings you haven't been able to articulate",
        "Intimate relaxation — content with warmth and presence that feels personal rather than broadcast",
        "Winding down — the specific use of narrative to slow thought and ease into rest",
      ],
    },
    {
      h2: "Why Privacy Changes the Experience",
      paragraphs: [
        "This is worth understanding, because it is not obvious until you feel it.",
        "Most audio content exists in a context of implicit publicness. It was made for everyone. Your engagement with it — your saves, your plays, your browsing patterns — is data that flows somewhere. Even in a personal account on a major platform, the content itself was designed for a public audience and your consumption of it is tracked, categorised, and used.",
        "None of that is designed to make the listening experience better for you specifically. It is designed to improve the platform's understanding of you as a data point.",
        "Private audio stories operate on a different model entirely.",
        "The story is created for you — not tracked to build a profile, not used to serve you more targeted content, not visible to a content recommendation engine. It is made, saved, and heard in a context that is genuinely, architecturally private.",
        "The psychological effect of this is measurable. When the listening space feels private — truly private — the content can do more. Emotional guard comes down slightly. Imagination engages more fully. The story can go places that feel uncomfortable or too personal in a public context, and those are often exactly the places worth going.",
        "Privacy is not just a preference. It is what makes certain experiences possible at all.",
      ],
    },
    {
      h2: "The Problem With Platforms That Treat Privacy as Secondary",
      paragraphs: [
        "Most content platforms were built for sharing first and adapted for privacy later.",
        "The social infrastructure — the feed, the recommendations, the visible activity — came first. Privacy controls were added afterward as options within a system that was never fundamentally designed around them.",
        "The result is platforms where privacy requires active management. You have to turn things off, set things to private, opt out of features that were turned on by default. The baseline is visibility. Privacy is the exception you have to work for.",
        "This creates a low-level but persistent discomfort for adults consuming personal content. Even when your settings are correctly configured, there is the awareness that you are navigating a system built for sharing. The content was made for everyone. Your engagement with it is still data. Something is still being watched, even if nothing is currently visible.",
        "The Private Story was built differently. Privacy is not a setting. It is the architecture. There is no social layer to opt out of because no social layer was ever built. There is no sharing function to disable because sharing is not a feature that exists. Your story preferences, your listening history, your account activity — these are yours and they stay yours.",
        "The baseline here is private. Always.",
      ],
    },
    {
      h2: "This Is Not a Library. This Is Yours.",
      paragraphs: [
        "Most audio story platforms operate as libraries.",
        "You arrive. You browse categories. You pick something that seems like it might work. You listen to something made for everyone, hoping it happens to work for you tonight.",
        "The Private Story does not work this way.",
        "You don't browse here. You create.",
        "You tell the platform how you want to feel — the mood, the tone, the kind of emotional experience you're looking for tonight. A story is generated around those choices. It is not retrieved from a library. It is not adapted from a template sitting in a shared catalogue. It is created for this session, for this version of you, right now.",
        "Then it is saved to your account. Visible to no one. Audible to no one.",
        "The story that exists in your account tonight does not exist anywhere else. It was made for you. It belongs to you. And it will stay where you put it — in a private space that no one else can enter.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Create your account",
      body: "Your account is yours alone. No public profile. No visible activity. Just a private space where your stories live.",
    },
    {
      heading: "Choose how you want to feel",
      body: "Select your mood, tone, and preferences. Late night and atmospheric. Intimate and connecting. Slow burn tension building toward something inevitable. Calm and warm. The choices are yours and they stay with you.",
    },
    {
      heading: "Your story is created and saved privately",
      body: "Your story is generated around your selections and saved to your account. It is not visible to other users. It does not appear in any shared space. It is not used to generate recommendations visible to others. It is simply there — in your account, for you, whenever you want to return to it.",
    },
  ],
  scenarios: {
    h2: "Private Story Scenarios — What This Looks Like in Practice",
    items: [
      {
        heading: "A late night story that exists only in your account",
        body: "Created at midnight for the mood you're in at midnight. Saved where only you can find it. Never shared, never visible, never part of anyone else's experience. Exactly what you needed and entirely yours.",
      },
      {
        heading: "An intimate connection story for exactly how you feel tonight",
        body: "A story shaped around your specific emotional state — not a general audience's assumed preferences. The intimacy of it is amplified by the privacy. Because it's only ever been heard by you, it feels like it was made only for you. It was.",
      },
      {
        heading: "A slow burn scenario shaped around your preferences",
        body: "Built around the specific kind of tension you want to inhabit tonight. Saved to your account. Returnable whenever you want it. The kind of story you can come back to because it is yours to come back to — sitting in your account, waiting, private.",
      },
    ],
    interstitial: "Your story is waiting. No one else will ever hear it.",
  },
  benefits: {
    h2: "The Benefits of Private Audio Storytelling",
    items: [
      {
        heading: "Complete account privacy",
        body: "Your account has no public-facing component. No profile visible to other users. No activity feed. No visible listening history. Your account is a private space, not a social space.",
      },
      {
        heading: "No social layer",
        body: "The Private Story has no social features. There is no sharing function because sharing was never built. There is no follow system, no public recommendations, no community feed. The platform exists for your private experience. That is its only purpose.",
      },
      {
        heading: "Your preferences stay yours",
        body: "The mood and tone choices you make when creating a story are stored in your account and used only to create your story. They are not used to build a public profile, not shared with other users, not visible anywhere outside your account.",
      },
      {
        heading: "Stories saved only to your account",
        body: "Every story you create is saved privately to your account. It exists nowhere else. Other users cannot access it. It does not appear in shared libraries or recommendation systems. It is yours.",
      },
      {
        heading: "Delete any time",
        body: "You can delete individual stories or your entire account at any time. Deletion is complete and immediate. Your privacy is protected under GDPR.",
      },
      {
        heading: "Designed for adult privacy expectations",
        body: "Adults consuming personal, emotionally resonant content have reasonable expectations around privacy. The Private Story was built to meet those expectations, not to ask you to manage around a system that wasn't designed for them.",
      },
    ],
  },
  fullPicture: {
    h2: "Private Audio Stories — The Full Picture",
    paragraphs: [
      "The category of private romantic audio stories covers a wide range of emotional experience — from tender and connecting to slow burn tension to late night atmosphere. In every case, the privacy is the same: complete, architectural, not a setting you have to manage.",
      "For anyone looking for audio stories no one else can see — not hidden behind a setting, not visible by default, not requiring active privacy management — this is where that experience lives. Your stories are invisible to other users because the platform was never built to make them visible.",
      "The private personalised story app category is genuinely new. Most personalised content platforms have social layers. Most private platforms have fixed libraries. The Private Story sits at the intersection: personalised content in a genuinely private space. Both, simultaneously.",
      "For women specifically — and this platform is built with women at the centre — the expectation of audio stories for women, private is not simply about discretion. It is about having a space that is entirely yours. Not a space you've opted into, not a corner of a larger social platform, but a dedicated private environment built for the experience of listening to something personal without that experience being visible to anyone.",
      "Confidential adult audio stories describes the experience precisely: adult content, confidential by design, created for and accessible only to the listener. This is what The Private Story delivers as its baseline. Not as a premium feature. Not as a setting. As the only way it works.",
    ],
  },
  finalCTA: {
    h2: "Start Your Private Story",
    paragraphs: [
      "You deserve a space that is genuinely yours.",
      "Not a private corner of a public platform. Not a library with privacy settings applied on top. A dedicated, architecturally private space where the content was made for you and stays with you.",
      "The Private Story is that space.",
      "Create your first story in under two minutes. Choose how you want to feel. Listen to something made for exactly that. Know that no one else will ever hear it.",
    ],
    primary: { label: "Start your private story", href: "/create" },
    links: [
      { label: "See pricing", href: "/pricing" },
      { label: "How personalisation works", href: "/personalised-audio-stories" },
      { label: "How it works", href: "/create" },
    ],
  },
  faqs: [
      { q: `What makes these audio stories private?`, a: `Privacy at The Private Story is architectural, not a setting. There is no social layer, no sharing function, and no public-facing account profile. Stories are generated for your account and stored there alone. No other user can access them. No platform feature makes them visible. The default is private because the platform was built that way from the ground up.` },
      { q: `Will anyone else be able to see my stories?`, a: `No. Your stories are stored in your account and are not visible to any other user. They do not appear in shared libraries, recommendation feeds, or any public-facing part of the platform. There is no scenario in which another user can access or view your stories.` },
      { q: `Are my story preferences stored securely?`, a: `Yes. The preferences you choose when creating a story — mood, tone, scenario type — are stored securely in your account and used only to generate your story. They are not shared with other users, not used to build a publicly visible profile, and not accessible to anyone other than you.` },
      { q: `Can I delete my stories?`, a: `Yes, at any time. You can delete individual stories from your account or delete your account entirely. Deletion is immediate and complete. Your data is handled in compliance with GDPR and UK data protection law.` },
      { q: `Is there a social or sharing feature?`, a: `No. The Private Story has no social features of any kind. There is no sharing function, no public profile, no follow system, no community feed, and no mechanism by which your stories or preferences become visible to other users. This is intentional and permanent — social features were never built because private listening was always the point.` },
      { q: `Who can access my account?`, a: `Only you. Account access requires your credentials. Platform staff do not have routine access to individual accounts or story content. Your account, your stories, and your preferences are yours.` },
      { q: `Is this GDPR compliant?`, a: `Yes. The Private Story operates under UK GDPR and the Data Protection Act 2018. Your data is stored securely, used only for the purposes you'd expect, and deletable at any time on request. Full details are in our privacy policy.` },
    ],
};

export const quietIntensityStoriesConfig: SEOPageConfig = {
  meta: { title: `Quiet Intensity Audio Stories | The Private Story`, description: `Quiet intensity audio stories for adults. Restrained, psychological, and deeply charged. Private and personalised around the specific pleasure of what isn't said.` },
  hero: { badge: `Quiet · Psychological · Private`, h1: `Quiet Intensity Audio Stories — The Loudest Desire Is the Kind That Doesn't Speak`, tagline: `Everything implied. Nothing stated. The specific charge of two people in a room where both of them know.` },
  sections: [
    {
      h2: "What Quiet Intensity Is",
      paragraphs: [
        "Quiet intensity is not the absence of feeling. It is feeling at its most concentrated — held under pressure rather than released, communicated through restraint rather than expression.",
        "It is the specific quality of a room in which something is understood between two people without being said. The charged silence after a sentence that stopped just short of what it was really about. The awareness of someone standing close enough that the awareness itself becomes significant. The look that lasts a beat longer than it needed to, carrying everything that neither person has spoken.",
        "This is a different kind of intimacy from the overtly stated. It is psychological rather than declarative — it lives in the gap between what is said and what is meant, in the space between almost and acknowledgement. And it produces a specific kind of tension that is, for the right listener, more arresting than anything more overtly stated could be.",
        "Quiet intensity audio stories are built entirely inside this register. The story does not announce what it contains. It renders the experience of being inside a moment in which everything is implied and nothing is stated — and trusts the listener to feel the full weight of what is not being said.",
      ],
    },
    {
      h2: "The Psychology of What Isn't Said",
      paragraphs: [
        "Language carries two channels simultaneously: what is stated and what is communicated. In most conversation and most fiction, these channels align — what is said is roughly what is meant, and the story progresses accordingly.",
        "Quiet intensity fiction separates them. What is said is almost never what is meant. The gap between the two becomes the primary content of the story. The listener learns to read that gap — to feel what is being communicated beneath the surface of what is being stated — and the experience of doing so is the experience the story is creating.",
        "This is deeply psychological as a mode of storytelling. It requires a reader — or listener — who is attuned to subtext, who finds the space between words as interesting as the words themselves. Who prefers implication to statement because implication leaves the imagination engaged rather than resolved.",
        "Quiet intensity audio stories are made for exactly this listener. The narration operates in both channels at once — what is happening, and what is really happening — and the story asks the listener to be fully present to both.",
      ],
    },
    {
      h2: "How Quiet Intensity Differs From Slow Burn",
      paragraphs: [
        "Slow burn and quiet intensity share a commitment to restraint, but they are different experiences.",
        "Slow burn is temporal — it is about the accumulation of tension over time, the deliberate withholding of resolution that builds charge across the arc of the story. The reader knows something is coming. The pleasure is in the approach to it. Slow burn ends somewhere it was always moving toward.",
        "Quiet intensity is spatial rather than temporal. It lives inside a moment rather than across a sequence of moments. The charge is not accumulated over time — it is present, concentrated, in the quality of being in this room with this person in this moment. Two people in a quiet space. The awareness between them. Everything communicated by how they occupy the same air.",
        "A quiet intensity story might not have a conventional resolution at all. The intensity is the point — the specific state of charged awareness, held precisely, rendered accurately. Whether the story arrives somewhere or remains suspended in that quality of almost is a choice, not a requirement. For the quiet intensity listener, the sustained state is often more satisfying than its resolution.",
      ],
    },
    {
      h2: "Why Audio Is the Right Format for This",
      paragraphs: [
        "Quiet intensity is particularly well-suited to audio because the voice itself carries subtext in a way that written text cannot fully replicate. The pace of a narration, the quality of a pause, the specific weight given to a word that is doing double duty — these are things a voice communicates naturally that prose can only approximate.",
        "A quiet intensity story heard in your ear, privately, is an experience of unusual closeness. The narrator is right there — aware, attuned, speaking directly to you in a register that is itself quiet. Not performing emotion. Inhabiting it. The restraint in the story is mirrored in the restraint of the narration: what is communicated rather than declared, what is felt rather than stated.",
        "First person narration makes this even more precise. You are inside the quiet intensity rather than outside it. The awareness is yours — the charged recognition of what is implied, the specific quality of being in a moment where everything is present and nothing has been said. The story renders the interior experience with accuracy, which is the only kind of accuracy that matters in this register.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Choose the psychological dynamic you want",
      body: "Subtext. Charged silence. Two people and the specific weight of everything they haven't said. You choose the scenario and the quality of intensity — and the story is built to inhabit it precisely, from the inside.",
    },
    {
      heading: "Your story is created around that register",
      body: "Original narrative, generated for this session, operating entirely within the quiet intensity register. The narration, the pacing, the gap between what is said and what is meant — all shaped by the experience you described.",
    },
    {
      heading: "Listen privately — feel the full weight of it",
      body: "Narrated and saved to your private account. Close, unhurried, attentive to everything the story carries beneath its surface. Heard only by you, in the privacy that makes this register possible.",
    },
  ],
  scenarios: {
    h2: "Three Quiet Intensity Stories — Three Different Silences",
    items: [
      {
        heading: "A story built entirely on subtext",
        body: "Every exchange carries more than it states. The conversation is about one thing; the story is about another. The listener inhabits both channels simultaneously — following the surface while feeling the full weight of what is running beneath it. The story never explains itself. It renders the experience of being inside a dynamic where both people understand more than they are saying, and trusts the listener to be fully present to that.",
      },
      {
        heading: "A quiet room — everything implied",
        body: "Two people. A space that has become charged by what neither of them has done. The specific awareness of proximity — the quality of someone standing close enough that the closeness is itself significant. The story inhabits this without rushing past it. It takes the quiet seriously as its own kind of intensity — holds the moment, renders its full weight, lets the listener feel what it is to be inside a silence that is not empty.",
      },
      {
        heading: "Intensity building in silence more than in words",
        body: "The words in this story are almost incidental. What builds is not said — it is the quality of attention, the way the air in the room changes, the accumulating awareness of someone who has been watching without being obvious about it and is no longer not obvious. The silence carries more than the sentences. The story understands this and structures itself around it.",
      },
    ],
    interstitial: "Create a quiet intensity story built around the specific charge of what remains unspoken.",
  },
  benefits: {
    h2: "Why Quiet Intensity Audio Stories Work",
    items: [
      {
        heading: "Implication over statement",
        body: "The story communicates through what is not said — keeping the imagination engaged rather than resolving it. For the listener who finds subtext more arresting than declaration, this is the register that actually works.",
      },
      {
        heading: "Psychological depth",
        body: "The story operates in two channels simultaneously — surface and subtext — and asks the listener to inhabit both. The result is an experience of unusual complexity and precision.",
      },
      {
        heading: "Voice as meaning",
        body: "Audio captures the subtext in the narration itself — the pace, the pause, the weight of a word doing double duty. Quiet intensity in audio carries more than the same words on a page.",
      },
      {
        heading: "First person — inside the awareness",
        body: "You inhabit the charged awareness rather than observing it. The quality of recognition — what is communicated without being stated — is felt as your own experience.",
      },
      {
        heading: "No resolution required",
        body: "Quiet intensity stories can remain in the suspended state of charged awareness without conventional resolution. For listeners who find the sustained state more satisfying than its conclusion, this is the format that allows for it.",
      },
      {
        heading: "Entirely private",
        body: "Your stories are held in your private account and heard only by you. The register of quiet intensity — its restraint, its psychological precision — is experienced in a space that matches it.",
      },
    ],
  },
  fullPicture: {
    h2: "Quiet Intensity Audio Stories — The Full Picture",
    paragraphs: [
      "Psychological audio romance stories occupy a specific space in the landscape of adult audio content — one that has been largely empty. The dominant modes are overtly adult or warmly romantic. Quiet intensity sits apart from both: restrained where more direct content speaks plainly, psychologically complex where warmly romantic content is emotionally straightforward.",
      "Quiet romantic tension audio requires a different kind of writing than most intimate content. The skill is not in what is described but in what is withheld — and in how precisely the withheld thing is communicated through the gap. This is the craft of literary fiction applied to intimate storytelling, and it produces an experience unlike any other register.",
      "Restrained desire audio stories are for listeners who know that the most powerful version of something is often the version that does not fully state itself. Who find half-finished sentences more charged than completed ones. Who read subtext automatically and find fiction that doesn't offer it strangely flat.",
      "Understated romantic audio, done well, is not mild or gentle. It is intense — the intensity simply operates at a different register than volume. The quiet intensity story contains everything that a louder story contains; it simply holds it differently, communicates it differently, produces its effect through concentration rather than declaration.",
      "Subtle intensity romance stories are for the listener whose nervous system responds to implication. For whom charged silence is a specific pleasure. For whom the story that never quite says the thing is the story that goes deepest.",
    ],
  },
  finalCTA: {
    h2: "Create Your Quiet Intensity Story",
    paragraphs: [
      "The loudest desire is the kind that doesn't speak. The most charged room is the one where nothing has happened yet — where everything is implied, nothing stated, and both people in the story are fully aware of exactly what is in the air.",
      "A quiet intensity story created around your choices tonight inhabits that register from the first sentence to the last. No announcement. No declaration. Only the precise rendering of what it feels like to be inside a moment where everything is present and nothing has been said.",
      "Private, psychological, entirely yours.",
    ],
    primary: { label: "Create your quiet intensity story", href: "/create" },
    links: [
      { label: "See pricing", href: "/pricing" },
      { label: "Slow burn audio stories", href: "/slow-burn-audio-stories" },
      { label: "Emotional audio stories", href: "/emotional-audio-stories" },
    ],
  },
  faqs: [
      { q: `What are quiet intensity audio stories?`, a: `Quiet intensity audio stories are narrated pieces built around restrained, psychological desire — the specific charge of what is communicated without being stated. The story operates through subtext: what is said on the surface and what is really meant are different, and the listener inhabits the gap between them. At The Private Story, they are generated around your chosen dynamic — the specific scenario, the quality of silence, the kind of awareness between the people in the story.` },
      { q: `How is quiet intensity different from slow burn?`, a: `Slow burn is temporal — it accumulates tension across the arc of a story, building toward a resolution the listener knows is coming. Quiet intensity is spatial — it lives inside a moment rather than across a sequence of moments. The charge is present and concentrated rather than built over time. A quiet intensity story may not resolve in the conventional sense; the sustained state of charged awareness can be the point rather than the approach to something beyond it.` },
      { q: `Are these stories restrained or adult in their register?`, a: `Restrained — deliberately and by design. Quiet intensity works through implication rather than statement. The story communicates through what is not said, which engages the imagination rather than resolving it. This is not a limitation — for the right listener, implication is significantly more powerful than direct description. The intensity is real; only the mode of its communication is quiet.` },
      { q: `What kind of listener are quiet intensity stories for?`, a: `Listeners who find subtext more arresting than declaration. Who read the gap between words as readily as the words themselves. Who prefer fiction that trusts them to feel what is happening rather than having it explained. Who find that the most charged moments in any story are often the ones in which nothing is said — and everything is understood. If that is you, this is your register.` },
      { q: `Can I choose a psychological or emotional dynamic?`, a: `Yes. The creation flow allows you to describe the quality of intensity you want: subtext-driven conversation, charged silence, a moment of accumulated awareness, the specific dynamic of two people who understand more than they are saying. The story is built around the psychological dynamic you describe rather than placed in a general intimate category.` },
      { q: `How long are quiet intensity stories?`, a: `Stories typically run between fifteen and thirty minutes. For quiet intensity, this is sufficient to establish the dynamic, build the charge, and inhabit the register fully. Stories are saved to your private account so you can return to them or create new ones — a different scenario, a different quality of silence, a different version of the same restrained awareness.` },
      { q: `Are these stories private?`, a: `Completely. Your stories are created for your account and heard only by you. No visible history, no social dimension. The register of quiet intensity — private, psychological, interior — is experienced in a space that entirely reflects those qualities.` },
    ],
};

export const relaxingAudioStoriesConfig: SEOPageConfig = {
  meta: { title: `Relaxing Audio Stories | The Private Story`, description: `Relaxing audio stories created around your mood. Private, personalised, and designed to help you decompress. For adults who want more than a podcast.` },
  hero: { badge: `Relaxation · Decompression · Adults Only`, h1: `Relaxing Audio Stories for Adults — Wind Down With a Story Written for You`, tagline: `Not a meditation. Not a podcast. A story that understands what tonight requires.` },
  sections: [
    {
      h2: "What Relaxing Audio Stories Actually Do",
      paragraphs: [
        "Relaxation is not a passive state you fall into when stimulation stops. For most adults, it is something that has to be actively arrived at — a destination the mind needs to be guided toward, because left to itself it will simply continue processing the day.",
        "Relaxing audio stories work because they give the mind somewhere better to go.",
        "Not the silence of switched-off screens, which quickly fills with the mental residue of everything unresolved. Not the cognitive activity of a podcast that requires you to follow an argument or absorb information. A story — with voice, atmosphere, and a world to inhabit — that redirects your attention away from the day and toward somewhere unhurried enough to let the body catch up.",
        "At The Private Story, relaxing audio stories are created around your specific version of needing to decompress. Not around a general audience's idea of what calming should sound like. Around how your evening feels tonight, and what kind of story will actually do something for it.",
      ],
    },
    {
      h2: "Who These Stories Are For",
      paragraphs: [
        "They are for adults who have tried everything the wellness industry offers and found most of it asks too much.",
        "Meditation asks you to empty your mind — which is precisely what a mind carrying a full day cannot easily do. Sleep apps play ambient sound over thoughts that continue regardless. Podcasts engage you, which is almost relaxation but not quite, because your brain is still working.",
        "Relaxing audio stories are for the woman who wants to feel something other than what she's been feeling since this morning — without having to try. For anyone who has lain in the bath with a podcast playing and realised they've absorbed nothing for the last ten minutes because their mind has been somewhere else entirely. For adults who decompress not through emptiness but through transport: a voice, a world, somewhere else to be for twenty minutes while the nervous system finally settles.",
        "They work particularly well for:",
      ],
      bullets: [
        "The end of a long day — when you have nothing left to give but still need something to help you transition out of it",
        "A bath or quiet hour alone — time you've carved out and want to fill with something that actually serves you",
        "The commute home — a boundary between work and the rest of the day, set in sound",
        "The space before sleep — when you need your thoughts redirected before the night takes over",
      ],
    },
    {
      h2: "Why a Story Works Better Than Sound",
      paragraphs: [
        "There is a meaningful difference between audio you hear and audio you inhabit.",
        "Ambient sound — rain, waves, white noise — fills the auditory space without giving the mind anything to follow. For some people in some states, that is enough. For others, the mind simply continues its own activity alongside the sound, with the sound doing very little.",
        "A story is different because it requires the mind to follow it. Not in the way a demanding argument requires you to follow it — not cognitively, not analytically. In the way a voice describing somewhere beautiful requires you to simply be present to it. Your imagination engages, lightly. Your attention moves into the story. And in doing so, it moves out of the day.",
        "The specific quality of a relaxing audio story — as opposed to any audio story — is that it is written and paced to carry you rather than hold you. The narrative doesn't demand resolution. The voice moves at the pace of your breathing when it slows. The world of the story is somewhere you'd want to be — unhurried, atmospheric, safe.",
        "The result is not emptiness. It is occupation. Your mind is somewhere pleasant, and that turns out to be exactly what it needed.",
      ],
    },
    {
      h2: "The Problem With Fixed Relaxation Content",
      paragraphs: [
        "Most relaxation audio was made for an imagined listener — a composite of everyone who might need to relax, which means it is calibrated for no one in particular.",
        "The tone is someone else's idea of what calming sounds like. The pacing was chosen without knowing what kind of day you'd had. The setting — a forest, a beach, a quiet room — was selected by a creator who didn't know whether you find forests grounding or whether the beach makes you think of the holiday you haven't booked.",
        "When it works, it works by coincidence. The content happened to match what you needed tonight. Often, it nearly works — close enough to stay on, not quite right enough to fully land.",
        "A relaxing audio story created around your choices tonight does not rely on coincidence. You describe the tone you need. The setting that will actually feel like somewhere worth inhabiting. The kind of voice that will do something for you rather than something generic for everyone. The story is made around those choices — and it works because it was made for this, not borrowed from a library and hoped for the best.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Choose how you need to relax tonight",
      body: "Warm and quietly connecting. Somewhere atmospheric and unhurried. A voice that takes its time because you finally have yours. You describe the version of relaxation you need — not a category, but a feeling — and the story is shaped around it.",
    },
    {
      heading: "Your story is created around that",
      body: "The pacing, the setting, the tone of the voice — all generated around your choices. Not retrieved from a library of calming content. Written for this session, for the specific way you need to decompress tonight.",
    },
    {
      heading: "Listen privately — let everything else go",
      body: "Your story is saved to your account and heard only by you. Put it on. Let the story take your mind somewhere worth going. The day can wait twenty minutes.",
    },
  ],
  scenarios: {
    h2: "What a Relaxing Audio Story Can Sound Like",
    items: [
      {
        heading: "A warm, unhurried story — somewhere slow",
        body: "Set on a coast, or in a quiet room, or somewhere with light that doesn't require anything from you. The narrative moves without urgency — not because nothing is happening, but because the story understands that tonight, the pace is the point. The voice arrives like something you've been waiting for all day without knowing it.",
      },
      {
        heading: "A story with no urgency",
        body: "A voice that takes its time because you finally have yours. No plot demanding resolution. No tension requiring release. Just somewhere worth being for twenty minutes, described with enough care that your imagination can actually rest inside it rather than working to hold it up.",
      },
      {
        heading: "A connection story — the specific relaxation of being heard",
        body: "For when the exhaustion is social rather than just physical. A voice that is unhurried in the way that presence is unhurried — not filling silence, but comfortable in it. The specific quality of feeling genuinely accompanied, which turns out to be its own kind of decompression.",
      },
    ],
    interstitial: "Create a relaxing story shaped around how tonight actually feels.",
  },
  benefits: {
    h2: "The Benefits of Personalised Relaxing Audio Stories",
    items: [
      {
        heading: "Written for tonight, not a general audience",
        body: "The tone, setting, and pacing are chosen by you and shaped by the story around them. Not pre-set. Not approximated. Made for the specific way you need to wind down this evening.",
      },
      {
        heading: "Something for your mind to follow",
        body: "The specific problem of a mind that won't simply switch off is addressed by giving it somewhere to go. The story provides direction. The direction provides calm. The calm arrives without effort.",
      },
      {
        heading: "No cognitive overhead",
        body: "Unlike a podcast or audiobook, a relaxing audio story asks nothing of you. You don't follow an argument. You don't retain information. You simply inhabit a voice for a while. That distinction matters enormously when you have nothing left to give.",
      },
      {
        heading: "Private and yours alone",
        body: "Your stories are saved to your account and heard only by you. No one else can see what you create or what you listen to. The space is entirely yours.",
      },
      {
        heading: "A new story whenever you need one",
        body: "You can create something different every evening. Your mood varies — your story can vary with it. There is no fixed library to exhaust, no favourite you'll eventually wear out.",
      },
      {
        heading: "Created in under two minutes",
        body: "The choices that shape your story take less than two minutes to make. Then you listen. There is no scrolling, no browsing, no settling for the closest option. You describe what you need, and it gets made.",
      },
    ],
  },
  fullPicture: {
    h2: "Relaxing Audio Stories — The Full Picture",
    paragraphs: [
      "The category of relaxing audio stories for adults is genuinely broader than any single experience. Relaxation, for adults, is not one thing.",
      "For some listeners, relaxing audio stories for women means something warm and connecting — a voice that feels like company, a narrative with human presence. For others it means something purely atmospheric — a world described so carefully that the mind can rest inside it without doing any work. For others still, decompression audio stories work best when they carry a hint of emotional engagement — a feeling of something that could be more, held at the distance that makes it restful rather than activating.",
      "The Private Story accommodates all of these. Because the story is created around your choices — rather than pre-made and selected — it can be whatever version of calming story audio you actually need. Warm and connecting. Quiet and atmospheric. Slowly emotional. Gently somewhere-else.",
      "Wind down stories for adults sit in a specific gap that most content platforms have left unfilled. Too sophisticated for children's bedtime content. Too restful for the narrative-driven audio drama category. Too personal for general wellness apps built around a population-level idea of what relaxation should sound like.",
      "Relaxation audio stories at their best are not background. They are foreground — a story your attention moves into willingly, and finds, somewhere inside, the quiet it was looking for.",
    ],
  },
  finalCTA: {
    h2: "Create Your Relaxing Story",
    paragraphs: [
      "You have been trying to relax with tools that weren't built for it.",
      "The podcast that keeps you slightly too engaged. The meditation that asks things of you when you have nothing left. The silence that fills immediately with the day you were trying to leave behind.",
      "A story created around how you need to feel tonight is none of those things. It is somewhere to be for twenty minutes while the rest of you settles. It is a voice that takes its time because tonight, finally, you have yours.",
      "Create yours in under two minutes.",
    ],
    primary: { label: "Create your relaxing story", href: "/create" },
    links: [
      { label: "See pricing", href: "/pricing" },
      { label: "Bedtime audio stories", href: "/bedtime-audio-stories" },
      { label: "Emotional audio stories", href: "/emotional-audio-stories" },
    ],
  },
  faqs: [
      { q: `What makes an audio story relaxing?`, a: `A relaxing audio story is paced and toned to carry the listener rather than engage them in the way a gripping plot or compelling argument would. The narrative moves without urgency. The setting is somewhere worth inhabiting. The voice moves at a pace your mind can follow into quiet rather than being kept awake to follow it. When you create a story with a relaxing intent at The Private Story, the generation reflects that — the entire output is shaped toward decompression.` },
      { q: `How are these different from meditation apps?`, a: `Meditation apps typically ask you to actively participate — following breathing instructions, visualising, focusing on sensations. A relaxing audio story asks nothing of you except to listen. Your mind follows the narrative passively, which allows the body's natural decompression process to happen without the cognitive overhead of trying to meditate correctly. For many adults, especially those whose minds resist direct instruction, stories work considerably better.` },
      { q: `Can I choose a relaxing tone when I create my story?`, a: `Yes — this is central to how The Private Story works. Before your story is generated, you choose the emotional register you want. If you want something warm and calming, you select for that. If you want something atmospheric and unhurried, you select for that. The tone you choose shapes every element of what follows — the pacing, the voice, the setting, the direction the story moves.` },
      { q: `How long are relaxing audio stories?`, a: `Stories are typically between fifteen and thirty minutes. For most adults, this is long enough to fully decompress and, for bedtime listening, to arrive at the edge of sleep. Your story is saved to your account so you can return to it, resume it, or begin a new one whenever you need.` },
      { q: `Can I create a story for specific situations — bath, commute, bed?`, a: `Yes. The Private Story creates around the situation you describe as much as the mood. If you're winding down before sleep, that shapes the pacing and tone. If you're decompressing on a commute and need something that transitions you out of the workday without requiring full presence, that shapes it differently. The creation choices accommodate these distinctions.` },
      { q: `Do I need headphones?`, a: `Headphones are recommended for the full experience — they create the private, immersive quality that makes audio stories work as well as they do. Many listeners find that the combination of headphones and a story made for them produces a depth of relaxation that open speakers and general content simply don't reach.` },
      { q: `Can I save favourites?`, a: `Every story you create is saved privately to your account and remains there until you choose to remove it. You can return to any story, replay it, and build up a private library of the stories that have worked for you. Nothing is automatically removed.` },
    ],
};

export const romanticAudioStoriesConfig: SEOPageConfig = {
  meta: { title: `Romantic Audio Stories | The Private Story`, description: `Romantic audio stories created for you. Choose your tone — slow burn, emotional, tender — and listen privately to a story shaped around how you want to feel.` },
  hero: { badge: `Romantic · Private · Made for You`, h1: `Romantic Audio Stories — Intimate, Private, Made Around Your Mood`, tagline: `Choose how you want to feel tonight. The story is made around that.` },
  heroImage: "images/seo-hero-romantic.png",
  showCastingPreview: true,
  sections: [
    {
      h2: "What Romantic Audio Stories Are — and What They Aren't",
      paragraphs: [
        "A romantic audio story is not a romance audiobook with a different name.",
        "Romance audiobooks are authored works — written by a specific writer, from a fixed perspective, following a plot that exists independently of whoever listens to it. They are finished before you arrive. You adapt to them. Some nights that is exactly what you want, and audiobooks are made for that purpose.",
        "A romantic audio story created at The Private Story is structurally different. The story is generated around your choices — the emotional register you want, the dynamic between the characters, the tone of the voice, the atmosphere of the world. It is written, by AI, in service of the specific romantic experience you described. Not around a general audience's idea of romance. Around you, for tonight, for the version of romantic you are feeling right now.",
        "That distinction changes everything. Not because the writing is necessarily better — a great romance novelist brings craft that AI is not trying to replicate — but because the story responds to you in a way that pre-authored content structurally cannot. It was made for this version of tonight. That is what makes it different. That is what makes it work.",
      ],
    },
    {
      h2: "The Range of Romantic — and Why It Matters",
      paragraphs: [
        "Romantic is not a single register. It is a spectrum that runs from quietly connecting to slowly charged to openly tender — and where you are on that spectrum changes, sometimes night to night.",
        "The slow burn listener — who wants tension that builds across every sentence, a story that holds her at the edge of something until it finally and deliberately gives — needs something entirely different from the listener who wants warmth and emotional closeness, a voice that speaks to her like it genuinely knows what she needs. Both are romantic. Neither is reducible to the other.",
        "Most romantic audio content is made for one point on that spectrum, or for a vague composite somewhere in the middle that is fully satisfying to almost nobody. The Private Story accommodates the full range — because the story is created around your choices rather than positioned in a fixed content category.",
        "Tonight you might want something cinematic. You at the centre of a beautifully charged scenario — atmosphere, presence, the specific feeling of being someone's full attention. Another night you might want something quieter and more emotionally close. The platform creates for both. For all of it.",
      ],
    },
    {
      h2: "What the Story Does That Scrolling Doesn't",
      paragraphs: [
        "There is a particular kind of wanting that arrives in the evening — not always physical, not always purely emotional, but a desire for something that makes you feel like yourself. Appealing to that feeling. Like the world contains possibility.",
        "Scrolling does not address it. Social media processes quickly and leaves you precisely where you were, often slightly worse. Romance content on general platforms sits either too far toward the overtly adult or too far toward the sanitised — rarely in the register that actually speaks to an adult woman with a sophisticated inner life.",
        "A romantic audio story does something different. It gives that wanting somewhere to be. A voice, a world, a presence — the sense that something is happening specifically for you, because it is. You are not a passive consumer of content made for someone else. You described what you needed and something was made around that. The experience of being responded to — of having your preferences matter — is itself part of what makes romantic audio stories work.",
        "You are not adapting to the content. The content was shaped around you. For a form of experience that is as private and individual as romantic feeling, that responsiveness is not a small thing.",
      ],
    },
    {
      h2: "What a Romantic Audio Story Actually Sounds Like",
      paragraphs: [
        "The voice narrates. First person, so you are the protagonist — not an observer of someone else's romantic experience but the person it is happening to. The setting is described with enough atmospheric specificity to feel real. The other presence in the story is written with the emotional texture that makes characters feel like actual people rather than genre placeholders.",
        "The pacing responds to the emotional register you chose. Slow burn moves deliberately — the story knows where it is going and takes its time getting there, because the going is the point. Tender and connecting moves differently — warmer, more present, less interested in withholding and more in arriving. Cinematic has a different quality again — broader scope, more awareness of setting and atmosphere, the feeling of being inside something beautiful and charged.",
        "The narration is performed, not read. The voice has quality — the kind of quality that makes audio listening a genuinely different experience from reading the same words on a page. It is paced for hearing. It is intimate in the way that a voice close to you is intimate, which is entirely unlike the way text on a screen can be intimate.",
        "And then it is finished, and it is saved privately in your account, and it is yours.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Describe the romantic experience you want",
      body: "Slow burn tension. Emotional closeness. Something cinematic. Something tender. You choose the mood, the dynamic, the atmosphere, and the tone. These are not filters applied to a library — they are the brief the AI writes toward.",
    },
    {
      heading: "Your story is created around that",
      body: "Original narrative is generated for this session, in service of the emotional experience you described. The pacing, the voice, the world — all shaped around your choices. Not retrieved. Written.",
    },
    {
      heading: "Listen privately — it was made for you",
      body: "Narrated and saved to your private account. No one else sees what you create or what you listen to. The story is yours alone — to return to, to replay, or to be the starting point for the next one.",
    },
  ],
  scenarios: {
    h2: "What Romantic Looks Like — Three Versions",
    items: [
      {
        heading: "A slow burn story",
        body: "Tension that builds across every sentence until something finally, deliberately gives. The story understands that the tension is not a delay before the point — it is the point. It holds you at the edge of something for precisely as long as the edge is worth inhabiting. The arrival is earned. The earning is what makes it satisfying rather than simply resolved.",
      },
      {
        heading: "A tender closeness story",
        body: "A voice that speaks to you like it knows exactly what you need. Warmth without sentimentality. Presence without urgency. The specific quality of being with someone who is fully, genuinely there — attentive in the way that real attention feels different from performance. The story understands what you described and delivers it without straining toward it.",
      },
      {
        heading: "A cinematic romantic scenario",
        body: "You at the centre of something beautifully charged. A setting with atmosphere — the kind of world that makes a story feel like it matters. A presence with weight and intention. The feeling of being inside a moment that is, by every measure, for you. Not watching a romantic story. Living inside one.",
      },
    ],
    interstitial: "Create a romantic story shaped around the experience you actually want tonight.",
  },
  benefits: {
    h2: "Why Personalised Romantic Audio Works",
    items: [
      {
        heading: "Written around your version of romantic",
        body: "Slow burn, tender, cinematic, emotionally close — the story is created for the specific romantic register you described, not positioned somewhere in the middle to serve the broadest audience.",
      },
      {
        heading: "You are the protagonist",
        body: "First person narration places you at the centre of the story — not as a reader observing a romance but as the person it is happening to. The difference in experience is considerable.",
      },
      {
        heading: "The voice has quality",
        body: "Professional narration turns the writing into audio that is actually pleasurable to listen to. Paced for hearing. Intimate in the particular way that a close voice is intimate. A genuinely different experience from reading the same words.",
      },
      {
        heading: "Entirely private",
        body: "Your romantic stories are saved to your account alone. No visible history, no social dimension, no suggestion that this experience is anything other than entirely your own.",
      },
      {
        heading: "Responds to how you feel tonight",
        body: "What you want romantically varies. The platform creates around your choices for this session — so you can want something different next time and get something different next time. No fixed library to exhaust.",
      },
      {
        heading: "Original every time",
        body: "The story is written for this session. It didn't exist before you asked for it. There is no version of it sitting in a catalogue waiting to be matched to you — it was created, from nothing, around what you described.",
      },
    ],
  },
  fullPicture: {
    h2: "Romantic Audio Stories — The Full Picture",
    paragraphs: [
      "The category of romantic audio stories for adults sits in a gap that most platforms have filled imperfectly, if at all. Romance audiobooks serve one need. Overtly adult audio content serves another. What sits between them — emotionally sophisticated, romantically calibrated, private, personalised, and narrated for listening — has been genuinely underserved.",
      "Romantic audio stories for women, in particular, have tended toward either the sanitised or the overtly adult — rarely in the register that reflects how complex romantic feeling actually is. The Private Story was built for that register.",
      "Romantic stories to listen to, at their best, understand the difference between the slow burn listener and the tender-connection listener. Audio romance stories for adults that treat these as the same experience — and produce a composite that satisfies neither — are missing the point. Personalisation is not a feature. It is the mechanism.",
      "Intimate romantic audio stories require intimacy in the production, not just the content. The voice quality, the pacing, the first-person narration, the sense that this was made for your ears specifically — these qualities produce the experience of intimacy rather than just describing it. The best romantic audio stories feel close. Private. Personal. Like something that exists for you.",
      "Whatever your version of romantic sounds like tonight — the best romantic audio stories are the ones made around the version you're actually experiencing, rather than approximated from a fixed catalogue.",
    ],
  },
  finalCTA: {
    h2: "Create Your Romantic Story",
    paragraphs: [
      "You have been scrolling past content that almost works. Romance built for a composite listener who is not you, in a tone that is adjacent to what you wanted but not quite it.",
      "A romantic audio story created around your choices tonight is none of that.",
      "It is written for this version of romantic you are feeling right now. Slow burn, or tender, or cinematic, or something else entirely — you describe it, and the story is built around that description. Private, narrated, yours.",
      "Create yours in under two minutes.",
    ],
    primary: { label: "Create your romantic story", href: "/create" },
    links: [
      { label: "See pricing", href: "/pricing" },
      { label: "Intimate audio stories", href: "/intimate-audio-stories" },
      { label: "Emotional audio stories", href: "/emotional-audio-stories" },
    ],
  },
  faqs: [
      { q: `What are romantic audio stories?`, a: `Romantic audio stories are narrated audio pieces created around a romantic emotional experience — slow burn tension, tender connection, emotional closeness, cinematic charged scenarios. At The Private Story, they are generated around your specific choices before each session, which means the tone, pacing, dynamic, and world of the story are shaped around what you described wanting, rather than pre-authored and retrieved from a library.` },
      { q: `What intensity level do the romantic stories reach?`, a: `The Private Story creates content that is adult in register — emotionally sophisticated, romantically and sensually calibrated, written for grown-up listeners. The intensity of your story is shaped by the choices you make in the creation flow. The platform is designed for adult women who want content that takes their inner life seriously — not content that either sanitises or reduces.` },
      { q: `Can I choose how romantic or intense my story is?`, a: `Yes. Before your story is generated, you choose the emotional register and intensity. Slow burn tension. Tender and connecting. Quietly atmospheric. Something more charged. Your choices are the brief the AI writes toward — the story reflects what you described, not a default setting.` },
      { q: `Are these the same as romance audiobooks?`, a: `No — the distinction is meaningful. Romance audiobooks are authored works, fixed before you arrive, which you adapt to. Romantic audio stories at The Private Story are generated around your choices for this session — written, by AI, in service of the specific experience you described. You are not matching yourself to existing content. The content is built around you.` },
      { q: `How is a romantic audio story personalised?`, a: `Before your story is created, you make a series of structured choices: emotional register, dynamic between the characters, atmosphere, pacing, and tone. These choices are translated into precise creative direction for the AI, which writes original narrative around them. The personalisation is not a recommendation algorithm — it is generative. Your story didn't exist before you described what you wanted.` },
      { q: `Can I create a specific romantic scenario?`, a: `The creation flow gives you structured choices across mood, dynamic, setting, and atmosphere — which together shape the scenario your story inhabits. The more specifically you describe what you want to feel, the more specifically the story delivers it. The AI writes toward your emotional brief rather than approximating it from a category.` },
      { q: `Are romantic stories available for all preferences?`, a: `The Private Story creates across the full range of romantic experience — from slow burn tension to emotional closeness to warmly tender to quietly charged. The platform is built for adult women and designed around the understanding that what romantic means varies considerably. You describe your version, and the story is shaped around that.` },
    ],
};

export const sleepAudioStoriesConfig: SEOPageConfig = {
  meta: { title: `Sleep Audio Stories for Adults | The Private Story`, description: `Sleep audio stories for adults, created around your mood tonight. Not a fixed library — generated for you privately. Fall asleep to a story made for this evening.` },
  hero: { badge: `Bedtime · Relaxation · Adults Only`, h1: `Sleep Audio Stories for Adults — Fall Asleep to a Story Made for Tonight`, tagline: `Your mind needs somewhere to go before it can let go. Give it somewhere worth going.` },
  sections: [
    {
      h2: "The Space Before Sleep",
      paragraphs: [
        "There is a window between waking and sleep that most adults navigate badly.",
        "The day doesn't stop when you close your eyes. The thoughts don't quiet because you've decided it's time. The mental residue of everything that happened — the things said, the things unsaid, the list that never fully empties — continues moving through your mind long after your body has stopped.",
        "Most sleep solutions address the symptom. White noise fills the silence. Meditation asks you to empty your mind, which is the one thing an active mind cannot easily do on command. Sleeping tablets remove the problem chemically. None of them give your mind what it actually needs in those last waking minutes: somewhere to go.",
        "A story does that.",
        "A good sleep audio story for adults gives your mind a destination — a world, a voice, a narrative thread to follow — that is sufficiently engaging to redirect attention away from the day, and sufficiently calm to carry you gently into sleep rather than keeping you awake to find out what happens next.",
        "At The Private Story, sleep audio stories are created around you — your mood tonight, the tone that will work for this specific version of exhaustion, the kind of story that will do what you need it to do. Not selected from a library. Made for tonight.",
      ],
    },
    {
      h2: "What Sleep Audio Stories for Adults Actually Are",
      paragraphs: [
        "Sleep audio stories for adults are narrative audio experiences specifically designed to accompany the transition from wakefulness to sleep.",
        "They are not children's bedtime stories. They are not sleep meditations asking you to breathe or visualise. They are not podcasts that will keep you cognitively engaged for an hour when you need to be unconscious in twenty minutes.",
        "They are stories — with character, atmosphere, and emotional weight — calibrated for the adult mind at the end of a day. They engage imagination enough to redirect anxious thought. They move at a pace designed to mirror the natural slowing of a mind approaching rest. They end — or continue — in ways that don't demand wakefulness to resolve.",
        "The best sleep audio story for any given night is the one that matches where you are when you lie down. Not where a general audience might be. Where you are. Tonight.",
        "This is why personalised sleep audio stories for adults work better than fixed library content. A story made for your mood tonight will land differently than a story made for everyone and selected hopefully.",
      ],
    },
    {
      h2: "Why Stories Work Better Than Silence — or Sound",
      paragraphs: [
        "The sleep advice landscape offers many options. Most of them share a design flaw: they ask the mind to do something unnatural.",
        "Silence asks a busy mind to find its own quiet — which is precisely what an anxious or overstimulated mind cannot do. In silence, the thoughts that were managed during the day find the space they've been waiting for.",
        "White noise and ambient sound solve the silence problem but don't give the mind anywhere to go. The thoughts continue. The noise simply sits alongside them.",
        "Sleep meditations require active participation — following instructions, visualising, focusing — which works for some minds and for others creates a secondary anxiety about whether they're doing it correctly.",
        "Podcasts and audiobooks engage the mind but don't release it. A compelling podcast keeps you awake. A gripping novel demands you stay conscious for the next chapter.",
        "Sleep audio stories occupy a specific middle ground that none of these reach: they engage imagination enough to redirect thought, they provide a voice and a world to inhabit, and they are paced and toned to carry rather than hold you.",
        "Your mind follows the story. The story slows. Your mind slows with it. Sleep arrives not as a destination you've been trying to reach but as a natural continuation of where you already were.",
      ],
    },
    {
      h2: "The Limitation of Fixed Sleep Story Libraries",
      paragraphs: [
        "There are platforms that offer sleep stories as fixed, pre-recorded content.",
        "They are made with care and they work for many people some of the time. But they share a fundamental limitation: they were made before you arrived.",
        "The tone was set by the creator's vision of what a sleep story should feel like. The pacing was decided without knowing what kind of day you'd had. The narrative goes where it was always going to go, regardless of whether that destination is where you need to arrive tonight.",
        "When you listen to fixed sleep content, you are adapting to it. Hoping it happens to match your current state. Working around the parts that don't quite fit.",
        "Some nights that's fine. Other nights — the nights when sleep feels genuinely far away, when the day was specifically difficult, when your mind needs a very particular kind of settling — it isn't enough.",
        "Adult sleep audio that is personalised around your specific needs tonight solves the problem that fixed libraries cannot solve: the precise mismatch between generic content and the specific human being lying awake right now.",
      ],
    },
    {
      h2: "Your Sleep Story, Made for Tonight",
      paragraphs: [
        "The Private Story creates your sleep audio story around your choices — not a library's inventory.",
        "Before your story is generated, you tell us where you are tonight. The emotional temperature of the day. The kind of settling you need. Whether tonight calls for something warm and quietly connecting, or something atmospheric and gently absorbing, or something so deliberately calm that the story itself becomes the pace you need your mind to find.",
        "Your choices shape everything: the tone of the voice, the setting of the story, the pacing of every sentence, the emotional destination the narrative moves toward.",
        "The result is a sleep story generator for adults that produces something genuinely different from anything you've heard before — because it was made around you, for tonight, with the specific intention of carrying you from where you are to where you need to be.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Choose your mood and tone",
      body: "Tell us how tonight feels and how you want to feel when you close your eyes. Calm and warm. Gently atmospheric. Quietly connecting. Deeply settling. The choice you make here shapes the entire story.",
    },
    {
      heading: "Your sleep story is created",
      body: "Your story is generated around your selections. Not retrieved. Created. The pacing, the tone, the setting, the voice — all shaped by what you chose. Your story exists because you needed it tonight.",
    },
    {
      heading: "Listen privately and sleep",
      body: "Your story is saved privately to your account — heard only by you, visible to no one else. Put in your headphones, close your eyes, and let your mind follow somewhere worth going.",
    },
  ],
  scenarios: {
    h2: "What Sleep Audio Stories Can Sound Like",
    items: [
      {
        heading: "A story that mirrors the slowing of your thoughts",
        body: "Sentence by sentence, it winds down. The world of the story slows. The voice slows. The narrative settles into something unhurried and undemanding. Your mind, following the story, follows it into quiet. By the time the voice has reached the stillest part of the story, you are already most of the way to sleep.",
      },
      {
        heading: "A voice that describes something beautiful and unhurried",
        body: "Made for the space before sleep — not a plot-driven narrative demanding resolution, but a voice describing a world worth inhabiting. A place with atmosphere. A presence with warmth. The kind of story that gives your imagination somewhere beautiful to rest while the rest of you lets go.",
      },
      {
        heading: "A resolution story",
        body: "Everything finds its place. Everything settles. The night is quiet. This is the sleep story for the days when you need the specific psychological comfort of things resolving — not dramatically, but gently, with the particular warmth of an ending that feels earned and calm.",
      },
    ],
    interstitial: "Your sleep story is two minutes away. Close the day and open something made for tonight.",
  },
  benefits: {
    h2: "The Benefits of Personalised Sleep Audio for Adults",
    items: [
      {
        heading: "Matched to your mood tonight",
        body: "Not to an imagined average listener. To you, specifically, as you are right now. The story that works on a difficult Tuesday is different from the one that works on a good Friday. Personalised sleep audio adjusts for that.",
      },
      {
        heading: "Paced for sleep, not engagement",
        body: "Stories created for sleep are toned and paced to carry you toward rest rather than keep you awake. The narrative arc moves toward calm. The voice moves at the pace your mind needs to follow it into quiet.",
      },
      {
        heading: "Private always",
        body: "Your sleep stories are saved to your account and heard only by you. No social feature. No shared library. No visible listening history.",
      },
      {
        heading: "A new story whenever you need one",
        body: "You can create a different sleep story every night. Your mood varies — your sleep story can vary with it. There is no fixed library to exhaust, no favourite you'll eventually wear out.",
      },
      {
        heading: "Something for your mind to follow",
        body: "The specific problem of a busy mind at bedtime — the thoughts that fill silence, the anxiety that resists meditation — is addressed by giving the mind a story to follow. Engaging enough to redirect. Calm enough to release.",
      },
      {
        heading: "Created fresh, never recycled",
        body: "Every sleep story is generated for this session, around your choices for tonight. It is not a recording you'll wear out over time. It is new each time you need it.",
      },
    ],
  },
  fullPicture: {
    h2: "Sleep Audio Stories for Adults — The Full Picture",
    paragraphs: [
      "Sleep stories for adults represent a genuinely different category from children's bedtime content and from meditation apps. They are narrative experiences calibrated for the adult mind — emotionally intelligent, atmospherically rich, and designed to work with the natural process of falling asleep rather than against it.",
      "Adult sleep audio at its best is not ambient noise with a story grafted on. It is genuine storytelling in service of rest — a voice, a world, a rhythm that your mind can follow all the way to the edge of sleep and beyond.",
      "Audio stories to fall asleep to work because they solve the core problem: they give an active mind somewhere to go. The story provides direction. The direction provides calm. The calm provides sleep.",
      "Bedtime audio for grown ups acknowledges something that the sleep wellness industry has been slow to recognise: adults need stories too. Not simplified stories, not children's stories dressed up in adult language, but genuine narrative experiences that meet adult emotional complexity and guide it toward rest.",
      "The sleep story generator for adults at The Private Story creates these experiences on demand — fresh for tonight, made for you, gone into private storage when you wake up. Available again tomorrow night if you need it. Different if you need something different.",
    ],
  },
  finalCTA: {
    h2: "Fall Asleep to a Story Made for Tonight",
    paragraphs: [
      "You have been managing your mind at bedtime with tools that weren't designed for it.",
      "Scrolling until you're tired enough — which works until it doesn't. Podcasts that keep you awake. Meditations that ask things of you when you have nothing left to give. Silence that fills immediately with everything you were trying to leave behind.",
      "A sleep story made for tonight is none of those things.",
      "It is a voice, and a world, and a pace that knows where you need to go. It is something your mind can follow without effort — willingly, gratefully, all the way down into the quiet.",
      "Create yours in under two minutes. Tonight.",
    ],
    primary: { label: "Create your sleep story", href: "/create" },
    links: [
      { label: "See pricing", href: "/pricing" },
      { label: "Explore bedtime audio stories", href: "/bedtime-audio-stories" },
      { label: "Explore relaxing audio stories", href: "/relaxing-audio-stories" },
    ],
  },
  faqs: [
      { q: `Are sleep audio stories different from sleep meditations?`, a: `Yes, significantly. Sleep meditations typically ask you to actively participate — following breathing instructions, visualising, focusing on sensations. Sleep audio stories ask nothing of you except to listen. Your mind follows the narrative passively, which allows the body's natural sleep process to proceed without the cognitive overhead of trying to meditate correctly. For many adults, especially those whose minds resist direct instruction, stories work considerably better.` },
      { q: `How long should a sleep story be?`, a: `Long enough to carry you to sleep — which varies by person and by night. The Private Story generates stories typically between fifteen and thirty minutes. For most adults, this is the window within which sleep arrives when the conditions are right. If you want to continue listening, your story is saved in your account.` },
      { q: `What tone works best for sleep?`, a: `This varies by person and by night. Some listeners find warm and connecting tones most effective — the sense of presence and quiet company. Others prefer purely atmospheric stories — beautiful descriptions of calm places with no emotional complexity. When you create your sleep story, you choose the tone that feels right for tonight. You can choose differently tomorrow.` },
      { q: `Are these stories calming or is there tension?`, a: `Sleep stories are toned for rest. While some stories created on The Private Story carry tension — slow burn, charged atmosphere — stories created with a sleep or calming intent are specifically toned to settle rather than stimulate. When you indicate you want a sleep story, the generation reflects that intention entirely.` },
      { q: `Can I create a new sleep story every night?`, a: `Yes. There is no fixed library to exhaust. Each story is created fresh around your current choices. Your mood varies night to night — your sleep story can vary with it. Creating a new story takes less than two minutes.` },
      { q: `Do I need to sign up to try one?`, a: `Yes, an account is required to create and save your story. Creating an account takes under a minute. Stories are saved privately to your account and available whenever you return.` },
    ],
};

export const slowBurnAudioStoriesConfig: SEOPageConfig = {
  meta: { title: `Slow Burn Audio Stories | The Private Story`, description: `Slow burn audio stories created for adults. Private, personalised, and built around tension, restraint, and the specific pleasure of delay. Create yours.` },
  hero: { badge: `Slow Burn · Tension · Private`, h1: `Slow Burn Audio Stories — Every Almost-Touch. Every Loaded Glance. Worth the Wait.`, tagline: `The pleasure of delay. The specific satisfaction of something that takes its time because it knows exactly where it's going.` },
  sections: [
    {
      h2: "What Slow Burn Actually Is",
      paragraphs: [
        "Slow burn is not a story that takes a long time to get to its point. It is a story in which the getting there is the point.",
        "The distinction matters because it changes everything about how the story works. A story that delays its resolution is simply a story with a late arrival. A slow burn story is one in which every moment of delay is itself pleasurable — in which the tension is not the price you pay to get somewhere but the experience you came for.",
        "What makes slow burn work is accumulation. The charged glance that could mean something or might mean nothing. The conversation that goes right up to the edge of what is really being discussed and then pulls back. The moment of almost — almost touch, almost acknowledgement, almost saying it — that ends just before it resolves. Each of these moments adds to the previous ones. The charge accumulates. By the time something finally gives, the accumulated tension is what makes it land.",
        "Slow burn audio stories are built around this mechanism. Every sentence serves the accumulation. Every piece of restraint is intentional. The story knows where it is going from the first line — and it takes its time getting there, because the time is the experience.",
      ],
    },
    {
      h2: "Why the Wait Is the Pleasure",
      paragraphs: [
        "There is a specific, well-documented pleasure in anticipation — in the state of wanting something that has not yet arrived. Research on desire consistently finds that anticipation activates the same reward pathways as satisfaction, and that the anticipation phase is often experienced as more pleasurable than the resolution itself.",
        "Slow burn stories are an architecture for that anticipation. They create the conditions for sustained wanting — building it deliberately, maintaining it carefully, never releasing it before it has been fully developed. The reader or listener is held in a state of heightened awareness: attuned to every small signal, reading subtext into everything, present in a way that more direct content rarely achieves.",
        "This is what slow burn listeners are actually seeking — not delayed gratification in the pejorative sense but the specific quality of being held inside wanting. The story is doing something particular to the nervous system: creating a state of sustained, pleasurable tension that arrives somewhere entirely worth it because of how much has been built.",
        "A slow burn audio story does this through the particular intimacy of voice — a narration that is close and aware, that speaks to you as someone who is also feeling everything the story is building. You are not watching slow burn happen to characters. You are inside it.",
      ],
    },
    {
      h2: "The Scenarios That Make Slow Burn Work",
      paragraphs: [
        "Slow burn requires a premise with enough inherent tension to sustain the accumulation. The best slow burn scenarios are ones in which there is a reason — a real, emotionally credible reason — why the two people cannot simply act on what is already apparent to both of them.",
        "Friends-to-more carries the specific weight of stakes. The risk of losing what already exists. The terror of being the one who says it first, because saying it first means being the one who cannot unsay it. The electricity of a friendship that has been slowly changing shape without either person formally acknowledging it — until one moment when the acknowledgement becomes unavoidable.",
        "Professional tension works because external structure enforces the restraint. Weeks of working alongside someone, understanding their mind, being aware of them in a room in the way you are only aware of people who matter — without any legitimate channel for what is accumulating. The story that inhabits this is one of subtext: everything communicated in what is not said, every exchange carrying the weight of what the exchange is ostensibly not about.",
        "The almost story — five near-misses, the accumulation of almost — works because repetition is the mechanism. Each almost is different from the last. The circumstances change. What doesn't change is the charge. By the fourth almost, the story has built something the fifth cannot help but resolve. The resolution feels earned because it has been arrived at through everything that preceded it.",
      ],
    },
    {
      h2: "What Slow Burn Sounds Like in Audio",
      paragraphs: [
        "Slow burn has a particular quality in audio that it shares with no other format. The narration is close. First person, so the tension is not observed but inhabited — you are the person for whom every moment of almost is acutely felt. The voice is aware of what is accumulating in a way that a third-person narrator cannot be: present to every small signal, feeling every degree of charge.",
        "The pacing of a slow burn audio story is its own kind of art. The voice does not rush. It does not skip past the loaded moments to get somewhere. It inhabits each moment fully — lingers in the silences, gives the almost-touches space, lets the charged exchange breathe before moving on. The slowness is not timidity. It is confidence: the story knows how this ends, and it is sufficiently certain of the destination to take its time.",
        "The restraint in the writing mirrors the restraint in the story. Slow burn prose does not directly describe what the tension contains. It describes the tension itself — the quality of awareness, the specific weight of proximity, the way a voice sounds when it is carrying something it has not yet said. The imagination of the listener does the rest, which is precisely why slow burn audio is often more immersive than more direct content.",
      ],
    },
  ],
  howItWorks: [
    {
      heading: "Choose your slow burn scenario",
      body: "Friends-to-more. Professional tension. Five near-misses and the one that finally doesn't stop. The specific situation that makes restraint credible — and its eventual release inevitable. You choose the premise. The story is built into it.",
    },
    {
      heading: "Your story is created around the accumulation",
      body: "Original narrative, generated for this session, structured around the slow burn mechanism from the first sentence. Every moment of tension serves the next. Every almost adds to what has come before. The story is written knowing where it is going — and taking exactly as long as it needs to get there.",
    },
    {
      heading: "Listen privately — and feel every beat",
      body: "Narrated and saved to your private account. First person, close, unhurried. The tension is yours to inhabit, not observe. Your story exists only in your account — heard only by you, as private as the experience itself.",
    },
  ],
  scenarios: {
    h2: "Three Slow Burn Stories — Three Different Tensions",
    items: [
      {
        heading: "A friends-to-more story",
        body: "The specific terror and electricity of risking something real. Two people who already know each other — who have the history, the ease, the shorthand — and who are both aware that something has changed, and neither has been the one to say it. The story lives in that awareness: every interaction now carrying double meaning, every moment of ordinary friendship charged with what it could become. The risk of being first. The accumulation of every moment they did not say it. The one that finally does.",
      },
      {
        heading: "A professional tension story",
        body: "Everything that isn't said across weeks of working together. The story inhabits the subtext — the quality of attention in a meeting that has nothing to do with the meeting, the specific awareness of someone on the other side of a room that you are professionally required to ignore. Weeks of accumulation, channelled through work, until the work becomes insufficient to contain it. The slow burn here is sustained by structure — and resolved by the moment the structure no longer applies.",
      },
      {
        heading: "An almost story",
        body: "Five near-misses. The accumulation of almost. Each one different — different circumstances, different proximity, different degree of nearness to the thing that keeps not quite happening. The story moves through each almost with full attention, understanding that every near-miss adds charge to the next. By the fifth, the tension is unbearable in exactly the right way. The moment that finally doesn't stop arrives as both surprise and inevitability — earned by everything the story took its time to build.",
      },
    ],
    interstitial: "Create a slow burn story built around the specific tension you want to inhabit.",
  },
  benefits: {
    h2: "Why Slow Burn Audio Works",
    items: [
      {
        heading: "The delay is the experience",
        body: "Not content that withholds its point. Content whose point is the withholding — in which every moment of restraint is itself pleasurable, and the accumulation is what you came for.",
      },
      {
        heading: "You are inside the tension",
        body: "First person narration places you inside the slow burn rather than at a distance from it. Every almost-touch is felt, not witnessed. The charge accumulates in you, not in characters you're watching.",
      },
      {
        heading: "Pacing as craft",
        body: "The story doesn't rush past the loaded moments. It inhabits them — gives them space, lets them breathe, understands that the slowness is the point and treats it accordingly.",
      },
      {
        heading: "Imagination engaged",
        body: "Slow burn works through implication rather than direct description. The story describes the tension. Your imagination fills in what the tension contains. This makes the experience more immersive, not less.",
      },
      {
        heading: "Original every session",
        body: "Each slow burn story is created fresh, around your chosen scenario. The premise, the specific texture of the tension, the moment it resolves — all generated for this session. No fixed catalogue to exhaust.",
      },
      {
        heading: "Private by design",
        body: "Your story is held in your private account and heard only by you. The intimacy of slow burn — its close, aware narration — is fully supported by a platform built entirely around private listening.",
      },
    ],
  },
  fullPicture: {
    h2: "Slow Burn Audio Stories — The Full Picture",
    paragraphs: [
      "Slow burn romance audio has a devoted following for the reason that the best slow burn always does — it delivers something that faster-paced content cannot. The sustained pleasure of anticipation. The specific satisfaction of a resolution that arrives having been genuinely earned. The feeling of having been held inside wanting for long enough that the arrival means something.",
      "Slow burn tension stories work best when the tension is credible — when there is an emotionally real reason for the restraint that makes each moment of almost feel weighted rather than arbitrary. The Private Story's creation flow builds this specificity into the generation from the beginning.",
      "Audio stories with slow burn have a specific advantage over written slow burn: the narration is close, first person, and paced by a human voice. The tension is not read at a distance — it is heard, in your ear, in a voice that is experiencing exactly what the story describes. The intimacy of audio is particularly well-suited to the intimacy of slow burn.",
      "The best slow burn audio stories understand that restraint is a form of respect for the listener — trust that the accumulation is worth inhabiting, confidence that the destination earns the journey. Slow burn romantic stories to listen to that rush toward resolution have misunderstood the form. The tension is not a delay. The tension is the story.",
      "Create yours around the specific scenario — the premise, the stakes, the particular quality of restraint — that makes your slow burn feel true.",
    ],
  },
  finalCTA: {
    h2: "Create Your Slow Burn Story",
    paragraphs: [
      "The best slow burn is not the story that finally gets there. It is the story that makes getting there feel worth every moment of the journey.",
      "Every loaded exchange. Every almost. Every sentence that knows exactly what it is carrying and refuses to say it yet — because the not-saying is the pleasure, and the story understands this completely.",
      "Create your slow burn story around the specific tension you want to inhabit. Choose the premise. The story builds from there — accumulating, restraining, arriving somewhere that was earned by everything that preceded it.",
      "Private, narrated, yours. Created in under two minutes. Worth the wait.",
    ],
    primary: { label: "Create your slow burn story", href: "/create" },
    links: [
      { label: "See pricing", href: "/pricing" },
      { label: "Intimate audio stories", href: "/intimate-audio-stories" },
      { label: "Personalised audio stories", href: "/personalised-audio-stories" },
    ],
  },
  faqs: [
      { q: `What is a slow burn audio story?`, a: `A slow burn audio story is one in which the tension, anticipation, and accumulation of almost are the point — not a delay before the point. Every moment of restraint serves the next. Every charged exchange adds to what came before. The story is built around the specific pleasure of sustained wanting, and arrives somewhere that is worth it because of how much has been built to get there. At The Private Story, slow burn stories are created from the first sentence with the mechanism in mind — every element of the narrative in service of the accumulation.` },
      { q: `How long does the tension last before the payoff?`, a: `This depends on the scenario and the specific story created for your session. Stories typically run between fifteen and thirty minutes, and the arc of tension within that time is shaped by the premise you chose. The story understands that the tension needs to be genuinely sustained — not resolved prematurely — and is generated to deliver that experience rather than rush toward its conclusion.` },
      { q: `Can I choose how slow the slow burn is?`, a: `Yes. The creation flow allows you to shape the pace and nature of the tension — a slow build over weeks of professional proximity, the accumulated electricity of five near-misses, the specific texture of friends-to-more with its high emotional stakes. The scenario you choose shapes the character of the slow burn. The generation is built to reflect that precisely.` },
      { q: `Are slow burn stories romantic or adult in tone?`, a: `Slow burn stories at The Private Story are adult and intimate in register — charged, close, and honest about desire. The approach is through tension and implication rather than direct statement, which is consistent with how slow burn actually works: it engages the imagination rather than bypassing it. The resolution, when it arrives, reflects the intensity of what was built. The intensity of your story is shaped by your creation choices.` },
      { q: `What scenarios work well for slow burn?`, a: `The best slow burn scenarios are those with genuine emotional stakes — a reason the restraint feels credible rather than arbitrary. Friends-to-more (the risk of what already exists), professional tension (external structure enforcing the delay), and the almost story (accumulated near-misses building to inevitability) are among the most effective. The Private Story's creation flow helps you find the premise that will make your slow burn feel true.` },
      { q: `Is slow burn available in a series format?`, a: `The Private Story creates individual slow burn stories, each complete in itself. The arc of tension is contained within the story — built, sustained, and resolved within a single listening experience. Series formats are part of the platform's development direction for listeners who want their favourite scenarios extended across multiple episodes.` },
      { q: `Can I continue a slow burn story across multiple episodes?`, a: `Currently, each story is a complete, standalone experience. The slow burn arc — from initial tension through accumulation to resolution — is fully contained within each story. If a particular scenario resonates, you can create a new story in the same world with the same dynamic, exploring a different angle or moment within it. Extended series are part of the platform's future development.` },
    ],
};

export const audioEroticaForWomenConfig: SEOPageConfig = {
  meta: { title: `Audio Erotica for Women — Private, Personalised, Made for You | The Private Story`, description: `Audio erotica for women created around your mood, tone, and fantasy tonight. Private, AI-generated, and narrated. Not a library — a story built for you.` },
  hero: { badge: `Adult · For Women · Personalised`, h1: `Audio Erotica for Women — Private and Made for You`, tagline: `Not a catalogue of someone else's fantasy. A story created around yours, tonight, and heard only by you.` },
  sections: [
    {
      h2: "What Audio Erotica for Women Actually Means",
      paragraphs: [
        "The phrase 'audio erotica for women' gets used to describe a wide range of content — some of it genuinely created with a female audience in mind, much of it not. What women consistently report wanting from erotic audio fiction is different from the default assumptions that shaped most early audio erotica: emotional context, character depth, tension before resolution, a specific quality of attention that feels like it understands female desire rather than approximates it.",
        "Audio erotica for women at The Private Story starts from this distinction. The content is generated around your emotional register and the quality of desire you want the story to explore — not from a template calibrated for the broadest possible audience. The difference between content made for a general audience that includes women and content made specifically around what you, tonight, want to feel is the difference between a best guess and an answer.",
        "Personalisation here means that the dynamic you choose — its texture, its power register, its emotional weight — shapes the story from the first sentence. If you want a story that builds slowly through attention and proximity rather than rushing to resolution, that is what is created. If you want something more direct but still grounded in emotional specificity, the creation flow lets you express that. The story responds to your choices rather than presenting you with options from a pre-existing catalogue. Explore what <a href=\"/personalised-audio-stories\">personalised audio stories</a> can cover, or understand how <a href=\"/private-audio-stories\">private audio stories</a> are kept secure from the moment they are created.",
      ],
    },
    {
      h2: "The Privacy Architecture Women Actually Need",
      paragraphs: [
        "Privacy in erotic audio content matters differently for women than the industry has historically assumed. It is not simply a preference for a secure login. It is about the content itself — whether the story you listened to becomes data that describes your desires, whether it is visible in any way to other people in your life, whether you need to worry about what a platform knows about what you find exciting.",
        "The Private Story is built around the position that what you listen to here is not information that should belong to a platform. The story created for you exists in your account and nowhere else. There is no social layer, no public activity, no recommendation engine that broadcasts what you have been exploring. The creation choices you make are used to create the story and are not shared or used to build a permanent behavioural profile.",
        "This is what private actually means in practice — not just a login screen, but a structural absence of the public-facing features that would make your listening history feel exposed. For women who want to explore audio erotica, this architecture removes a significant friction that the library model, with its reviews, recommendations, and social features, consistently creates.",
      ],
    },
    {
      h2: "How Personalised Audio Erotica Differs from a Catalogue",
      paragraphs: [
        "The dominant model for audio erotica platforms is the catalogue: a library of pre-existing content, searchable by keyword, navigable by category. The experience is browsing-based — you filter, select, and hope the resulting content matches what you actually wanted tonight. The content was made before your arrival, for a general audience, at a specific emotional register that you may or may not share.",
        "Personalised audio erotica works differently. The story does not exist until you create it. The creation process — choosing the dynamic, the emotional register, the character quality, the specific texture of the experience you want — happens first. Then the story is written, from the first sentence, around those choices. It is not retrieved from a library. It does not match a nearest-fit in a catalogue. It is genuinely original and genuinely yours.",
        "The practical consequence is that the story fits the specific quality of desire you arrived with tonight, rather than requiring you to find something in a catalogue that fits well enough. Women who have used both describe the difference as analogous to the difference between choosing from a restaurant menu and having a meal prepared around what you actually wanted to eat.",
      ],
    },
  ],
  howItWorks: [
    { heading: "Choose your mood and dynamic", body: "Select the emotional register, character dynamic, and tone of the story you want tonight. The creation flow is designed to capture the specific quality of the experience — not just categories, but the texture of what you want to feel." },
    { heading: "Your story is written from scratch", body: "The story is generated specifically for you based on your choices — not retrieved from a library. It begins with your preferences and builds outward, every element shaped by what you selected." },
    { heading: "Listen in complete privacy", body: "Your narrated story is saved to your account and accessible only to you. No social features, no public history, no visible activity. The story exists in your account and nowhere else." },
  ],
  scenarios: {
    h2: "What This Can Feel Like",
    intro: "Audio erotica for women can take many forms depending on your mood and the experience you want to feel. Here are some of the registers the platform can create.",
    items: [
      { heading: "The slow approach", body: "A story that builds through proximity, attention, and restrained wanting — where the charge between characters is the point, and the resolution arrives because everything before it was worth it." },
      { heading: "Confident, direct, grounded", body: "A story where desire is expressed clearly and responded to with full presence — no games, no ambiguity, just two people who know what they want and move toward it with mutual attention." },
      { heading: "Emotionally close", body: "A story where intimacy is the primary register — physical closeness that is also emotional closeness, a dynamic that understands both elements as inseparable from each other." },
      { heading: "Forbidden attraction", body: "A scenario where the appeal lies in the tension between desire and restraint — professional distance, unlikely connection, the specific charge that comes from wanting someone who is not quite available to want." },
    ],
    interstitial: "These are starting points. The story created for you reflects the specific choices you make in the creation flow.",
  },
  benefits: {
    h2: "Why Women Choose The Private Story",
    items: [
      { heading: "Made for how you actually feel", body: "The story is created around the quality of desire you arrived with tonight, not a general audience's assumed preferences." },
      { heading: "Complete privacy, structurally", body: "No social layer, no public history, no recommendation engine. What you listen to is not information that belongs to a platform." },
      { heading: "Emotional intelligence", body: "The stories understand that female desire has texture, context, and emotional dimension — and are created to reflect that, not bypass it." },
      { heading: "No browsing required", body: "You describe what you want; the story is created. No filtering through a catalogue hoping something fits your specific mood tonight." },
    ],
  },
  fullPicture: {
    h2: "Audio Erotica That Belongs to You",
    paragraphs: [
      "The Private Story was built on a specific premise: that personalised audio erotica for women is not a niche within a general adult content platform, but a category that deserves to be built from the ground up around how women actually experience desire. The content, the privacy model, and the creation flow are all shaped by this premise.",
      "What that means in practice: stories that begin with your emotional register rather than a production decision. A privacy architecture that removes the friction that public-facing library models create. Content that can be as quietly atmospheric or as explicitly adult as your creation choices specify — shaped by your preferences, not by a platform default calibrated for a general audience. If you are curious about the format itself, read our guide to <a href=\"/what-is-audio-erotica\">what audio erotica is</a> and how it differs from visual pornography and erotic audiobooks.",
      "The result is a listening experience that feels closer, more personal, and more specifically yours than any catalogue can produce. Explore the creation flow and see what can be made for you tonight.",
    ],
  },
  finalCTA: {
    h2: "Your Story, Tonight",
    paragraphs: [
      "The story you want to hear tonight is created the moment you make your choices. No browsing required. Under two minutes to create. Completely private.",
    ],
    primary: { label: "Create your story", href: "/create" },
    links: [
      { label: "Audio erotica for women", href: "/audio-erotica-for-women" },
      { label: "Personalised erotica", href: "/personalised-erotica" },
      { label: "Intimate audio stories", href: "/intimate-audio-stories" },
      { label: "Adult audio stories", href: "/adult-audio-stories" },
    ],
  },
  faqs: [
    { q: "What makes audio erotica specifically for women different?", a: "Audio erotica for women at The Private Story is built around how women report experiencing desire: with emotional context, character depth, and tension that builds toward resolution rather than bypassing it. The creation flow asks about the quality of the dynamic you want, not just the category. This produces stories that feel calibrated for female experience rather than approximating it from a general-audience template." },
    { q: "Is this content genuinely adult?", a: "Yes. The Private Story creates adult content for adults 18+. The intensity is shaped by your creation choices — from quietly sensual and atmospheric through to explicitly adult. The platform is designed for adult women who want private, emotionally intelligent erotic audio that reflects their actual preferences rather than a platform default." },
    { q: "How is this different from other audio erotica platforms?", a: "Most audio erotica platforms operate on a catalogue model — you browse and select from fixed content. The Private Story generates an original story for you based on your choices at the moment of creation. The story exists because of your preferences tonight, not because it was produced in advance for a general audience. The privacy model also differs: no social features, no public listening history, no shared data." },
    { q: "How long are the stories?", a: "Stories typically run between fifteen and thirty minutes, depending on your creation choices. This is sized for the specific listening window when audio erotica is most wanted — a complete, satisfying experience without requiring an hour-long commitment." },
    { q: "Is my listening history private?", a: "Yes. Your stories are saved to your account only. There is no social layer, no public listening history, and no recommendation engine that broadcasts what you have been exploring. The structural design of the platform makes your listening genuinely private rather than simply password-protected." },
  ],
};

export const personalisedEroticaConfig: SEOPageConfig = {
  meta: { title: `Personalised Erotica — AI-Generated Audio Stories Built for You | The Private Story`, description: `Personalised erotica created around your mood and choices tonight. AI-written, narrated, and completely private. Not a catalogue — an original story made for you.` },
  hero: { badge: `Personalised · Adult · Private`, h1: `Personalised Erotica — Made Around Your Desires`, tagline: `Erotic fiction generated from your choices tonight. Not retrieved from a library. Written for you, from the first sentence.` },
  sections: [
    {
      h2: "What Personalised Erotica Actually Is",
      paragraphs: [
        "Personalised erotica is erotic fiction created around your specific choices rather than selected from a pre-existing library. The distinction matters more in this genre than in almost any other: the quality of erotic fiction depends on specificity — on the story reflecting the particular emotional register, dynamic, and character quality that you wanted tonight, not something close enough from a catalogue.",
        "At The Private Story, personalised erotica begins with a creation process rather than a browsing interface. You choose the mood, the dynamic, the quality of the characters, the emotional register of the experience you want to feel. Those choices are the starting point for a story that is written from scratch — not retrieved from a library, not approximated from a nearest-fit in a catalogue, but generated specifically in response to what you said you wanted. See how <a href=\"/personalised-audio-stories\">personalised audio stories</a> work across all genres, not just erotica.",
        "The result is erotic fiction that fits your mood tonight in a way that pre-existing content, by definition, cannot. It was not made for a general audience. It was made from your choices.",
      ],
    },
    {
      h2: "The Seven Choices That Shape Your Story",
      paragraphs: [
        "The creation process at The Private Story works through seven structured selections that together define the emotional and dynamic shape of your story. These are not generic categories — they are chosen to capture the specific qualities of erotic experience that matter: the character of the dominant energy (if any), the pacing and intensity, the emotional register, the scenario type, and the quality of the connection between the characters.",
        "What makes this work as personalisation rather than filtering is that the story is generated from these choices rather than selected from a catalogue that happens to match them. There is no pre-existing story that the selections narrow down to. There is only the story that exists because you made those particular choices, tonight, in that particular combination.",
        "This also means that the same set of choices will never produce exactly the same story twice. The generation uses your selections as a starting point and builds a genuinely original narrative — which is why the experience of personalised erotica differs from even the most precisely filtered catalogue in a fundamental way. If you want to understand how the experience compares to a curated library, see our guide to <a href=\"/what-is-a-personalised-audio-story\">what a personalised audio story is</a>.",
      ],
    },
    {
      h2: "Privacy That Makes Exploration Feel Safe",
      paragraphs: [
        "Erotic content requires a different relationship with privacy than most media. What you find exciting is not information you want a platform to hold, broadcast, or use to build a profile of your preferences. The social and public-facing features that make catalogue platforms discoverable also make your exploration of them potentially visible.",
        "The Private Story is built without the features that create this problem. There is no social layer — no public reviews, no shared listening history, no activity feed that others can see. Your stories are private to your account. The creation choices you make shape the story and are not permanently attached to a public profile. This is what <a href=\"/private-audio-stories\">private audio stories</a> means in practice — architecture, not just policy.",
        "This is not incidental. It is a structural choice about what a platform for personalised erotic fiction should look like. The experience of exploring what you want in a space that is genuinely private — not just password-protected, but architecturally private — is different from the same exploration on a platform with social features, even private ones.",
      ],
    },
  ],
  howItWorks: [
    { heading: "Make your seven selections", body: "Choose the mood, dynamic, scenario type, character quality, and emotional register of your story. The creation flow takes under two minutes and captures the specific texture of what you want to feel tonight." },
    { heading: "An original story is written for you", body: "The story is generated from your choices — not retrieved from a library. Every element, from the opening sentence to the pace and character of the resolution, reflects what you specified." },
    { heading: "Narrated and private in your account", body: "Your story is narrated and saved to your account. Only you can access it. No public history, no social sharing, no platform visibility. Yours alone." },
  ],
  scenarios: {
    h2: "Scenarios You Can Choose",
    intro: "Personalised erotica can take many registers depending on your choices. These are examples — the story created for you reflects your specific selections.",
    items: [
      { heading: "Slow burn desire", body: "Tension that builds through proximity and near-misses before arriving somewhere that earns the build. The restraint is the point — every charged moment building the one that follows." },
      { heading: "Confident and direct", body: "A dynamic where desire is clear, stated, and met with full presence. No games, no ambiguity — two people who know what they want and move toward it without ceremony." },
      { heading: "Forbidden and close", body: "The charge that comes from wanting someone you probably shouldn't want. Professional distance, impossible timing, the specific tension of desire that has to be contained before it doesn't." },
      { heading: "Quiet and deeply intimate", body: "Closeness that is emotional and physical simultaneously — a story where intimacy is about presence and attention as much as anything else, where the depth of connection is what makes everything else feel significant." },
    ],
    interstitial: "These are starting points. Your choices shape the exact character of the story that is created for you.",
  },
  benefits: {
    h2: "What Sets This Apart",
    items: [
      { heading: "Genuinely original", body: "Every story is written from scratch in response to your choices — not retrieved from a library, never the same story twice." },
      { heading: "Structurally private", body: "No social layer, no public history. Your listening and your creation choices belong to you, not to a platform." },
      { heading: "Precisely calibrated", body: "Seven structured selections shape a story that fits your mood tonight — the character quality, the pacing, the emotional register." },
      { heading: "Ready in under two minutes", body: "The creation process is fast. Your narrated story is ready to listen to shortly after you complete your selections." },
    ],
  },
  fullPicture: {
    h2: "Erotica That Was Made for You",
    paragraphs: [
      "Personalised erotica is not a niche within a general content platform. It is what erotic fiction becomes when the technology to generate it specifically for you exists and is used that way. The Private Story is built on that premise: that the quality of erotic fiction depends on its specificity, and that specificity requires generation rather than selection.",
      "The privacy architecture follows from the same premise. If the content is genuinely yours — made from your choices, saved to your account — then it should be genuinely private. The structural design reflects this: no social features, no public history, no recommendation engine that uses your listening to build a public profile.",
      "Explore the creation flow to see what can be made around your choices tonight.",
    ],
  },
  finalCTA: {
    h2: "Create Your Story Now",
    paragraphs: ["Seven selections. Under two minutes. A story made for you, privately."],
    primary: { label: "Start creating", href: "/create" },
    links: [
      { label: "Audio erotica for women", href: "/audio-erotica-for-women" },
      { label: "Erotic audio stories", href: "/erotic-audio-stories" },
      { label: "Adult audio stories", href: "/adult-audio-stories" },
      { label: "Private audio stories", href: "/private-audio-stories" },
    ],
  },
  faqs: [
    { q: "How personalised is personalised erotica on this platform?", a: "Very specifically personalised. The story is generated from seven structured selections you make about the mood, dynamic, character quality, scenario type, and emotional register of your story. These are not broad categories that narrow a catalogue — they are the starting point for an original story written specifically in response to your choices tonight." },
    { q: "Is the content explicit?", a: "The intensity is shaped by your creation choices. The Private Story creates adult content from quietly sensual and atmospheric through to explicitly adult, depending on what you select. The platform is for adults 18+ only." },
    { q: "How is this different from searching for erotica on another platform?", a: "On catalogue platforms, the content exists before you arrive and is selected based on your search terms. At The Private Story, the content is created in response to your choices at the moment of creation. Nothing was written in advance for a general audience — the story exists because of your specific preferences tonight." },
    { q: "Is it genuinely private?", a: "Yes. There is no social layer on the platform, no public listening history, and no recommendation engine that uses your content choices to build a visible profile. Your stories are saved to your account and accessible only to you." },
    { q: "Can I request any type of scenario?", a: "The creation flow covers a wide range of dynamics, scenarios, and emotional registers. All content is original fiction, all depicted parties are adults, and all content is legal. The specific parameters of what can be created are described in the platform's content policy." },
  ],
};

export const eroticAudioStoriesConfig: SEOPageConfig = {
  meta: { title: `Erotic Audio Stories — Private, AI-Generated, Made for You | The Private Story`, description: `Erotic audio stories generated from your choices and narrated privately. Adult AI fiction, personalised around your mood tonight. Not a library — your story.` },
  hero: { badge: `Adult · Audio · Personalised`, h1: `Erotic Audio Stories — Generated for You, Heard Only by You`, tagline: `Original adult fiction created from your choices, narrated, and private. A story that exists because of what you wanted tonight.` },
  sections: [
    {
      h2: "The Case for Generated Erotic Audio Stories",
      paragraphs: [
        "Erotic audio fiction has existed in various forms for decades — narrated recordings, dramatic readings, audio drama. What has changed recently is not the format but the method: the ability to generate original erotic fiction in response to specific user choices rather than producing fixed content for a general audience. This shifts what erotic audio stories can be.",
        "A generated erotic audio story is one that did not exist before you requested it. The dynamic you wanted, the character quality you specified, the emotional register you described — these shape a story that is written from scratch in response to them. The result is not a nearest-fit from a catalogue. It is something that began with your preferences and built outward from there.",
        "The Private Story uses this approach to create erotic audio stories that are private, personalised, and narrated in a voice chosen to suit the story's register. The experience of listening to a story that was made for you is categorically different from listening to something made for a general audience, even if the production quality of both is high. Read our definition of <a href=\"/what-is-audio-erotica\">what audio erotica is</a> to understand the format in more depth.",
      ],
    },
    {
      h2: "What Adult Audio Stories Can Explore",
      paragraphs: [
        "Erotic audio stories at The Private Story cover a wide range of dynamics and emotional registers — from quietly sensual and atmospheric to explicitly adult in tone. The intensity is not set by a platform default but by the choices you make in the creation flow. You choose the character of the desire you want the story to explore, and the story is generated to reflect that.",
        "The dynamics available span confident and direct, slow-build and charged, emotionally close and deeply intimate, power-aware and respectful, and the specific tension of forbidden attraction where desire and restraint coexist. Within each dynamic, the story is shaped by the scenario type, the character quality, and the emotional register you specify.",
        "This range means that erotic audio stories are not a single type of experience. They are a format within which many different types of desire can be explored privately and with the kind of specificity that fixed content cannot provide. The full scope of what is available is explored on the <a href=\"/personalised-erotica\">personalised erotica</a> page.",
      ],
    },
    {
      h2: "Privacy in Adult Audio Content",
      paragraphs: [
        "Adult content requires a more serious engagement with privacy than most media categories. The question is not just whether a platform is secure, but whether the content you engage with — the specific dynamics you explore, the scenarios you find compelling — becomes data that the platform holds, uses, or could expose.",
        "The Private Story is designed around the position that what you listen to is not a platform's data to keep. Stories are saved to your private account and not used to build a public-facing profile. There is no social layer, no recommendation engine that broadcasts your preferences, no activity that other users can see. The architecture removes the features that create privacy risk, rather than simply adding security features to a public-facing system. This is the principle behind <a href=\"/audio-erotica-for-women\">audio erotica for women</a> on this platform.",
        "For adult audio content, this matters. The experience of exploring what you want in a space that is genuinely private — not just password-protected, but structurally without the features that would make your exploration visible — is different from the same exploration on a platform where social features exist.",
      ],
    },
  ],
  howItWorks: [
    { heading: "Choose your experience", body: "Select the dynamic, scenario type, and emotional register of your story. The creation flow is built to capture the quality of the experience you want — not just broad categories but the specific character of the desire you want the story to explore." },
    { heading: "An original story is written", body: "Your erotic audio story is generated from your choices — written from scratch, not retrieved from a library. Every element of the narrative reflects what you selected, from the character of the dynamic to the pacing of the resolution." },
    { heading: "Narrated and private", body: "The story is narrated in a voice selected to suit its register and saved privately to your account. No social features, no public listening history. Yours alone." },
  ],
  scenarios: {
    h2: "Registers Your Story Can Take",
    items: [
      { heading: "Atmospheric and slow", body: "A story that builds through attention and proximity, where the desire is present from the start but earned through restraint, tension, and accumulation before resolution." },
      { heading: "Direct and grounded", body: "A story where desire is clear and mutual, expressed honestly and met with full presence. No ambiguity, no games — just two people who know what they want." },
      { heading: "Charged and forbidden", body: "The specific tension of attraction that exists where it probably shouldn't — where the appeal is partly in the restraint and partly in what the restraint cannot ultimately hold back." },
      { heading: "Close and tender", body: "Intimacy that is physical and emotional simultaneously — where the depth of connection is what makes the closeness feel significant, and presence is as erotic as anything else." },
    ],
  },
  benefits: {
    h2: "Why This Is Different",
    items: [
      { heading: "Original, not selected", body: "Every story is generated from your choices — not retrieved from a fixed catalogue. The story exists because of what you wanted tonight." },
      { heading: "Genuinely private", body: "No public history, no social layer, no platform-visible activity. Your stories are in your account and nowhere else." },
      { heading: "Calibrated to your mood", body: "The creation flow captures the specific quality of the experience you want — intensity, character dynamic, pacing, emotional register." },
      { heading: "Adult, intelligent content", body: "The stories are written with literary attention to desire, tension, and character — not formulaic or mechanical in their approach to adult content." },
    ],
  },
  fullPicture: {
    h2: "Adult Audio Fiction That Starts with You",
    paragraphs: [
      "Erotic audio stories are at their best when they are specific — when the story reflects the particular quality of desire you arrived with rather than a general-audience approximation of what most people might want. The Private Story is built on this premise: that generated erotic fiction, created from your choices at the moment of listening, is a categorically different experience from even the best catalogue.",
      "The privacy model follows from the same premise. Erotic audio content that belongs to you should be genuinely private — not just secure, but architecturally without the public features that would make your listening feel visible. The platform is built this way by design.",
    ],
  },
  finalCTA: {
    h2: "Start Creating",
    paragraphs: ["An original erotic audio story created from your choices, narrated, and private. Under two minutes to create."],
    primary: { label: "Create your story", href: "/create" },
    links: [
      { label: "Audio erotica for women", href: "/audio-erotica-for-women" },
      { label: "Personalised erotica", href: "/personalised-erotica" },
      { label: "Intimate audio stories", href: "/intimate-audio-stories" },
      { label: "Adult audio stories", href: "/adult-audio-stories" },
    ],
  },
  faqs: [
    { q: "How adult is adult on this platform?", a: "The intensity of the story is shaped by your creation choices. The Private Story creates content from quietly sensual and romantic through to explicitly adult, depending on what you select. The platform is for adults 18+ only. All depicted parties in all content are adult." },
    { q: "Is the content AI-generated?", a: "Yes. Stories are generated by AI from your creation choices and narrated using high-quality voice synthesis. The result is original fiction — not retrieved from a pre-existing library — with narration that suits the register of the story." },
    { q: "How long are erotic audio stories?", a: "Typically between fifteen and thirty minutes, depending on your selections. This is sized for the specific listening window when adult audio fiction is most wanted — a complete experience without requiring a multi-hour commitment." },
    { q: "Can I choose the character dynamic in the story?", a: "Yes. The creation flow lets you choose the character of the relationship dynamic — the quality of the power register, the emotional tone, the character type. These choices shape the story from the first sentence rather than being filters on a pre-existing catalogue." },
    { q: "Is my listening genuinely private?", a: "Yes. There is no social layer on the platform, no public listening history, and no activity that other users can see. Your stories are saved to your account and accessible only to you." },
  ],
};

export const adultBedtimeStoriesConfig: SEOPageConfig = {
  meta: { title: `Adult Bedtime Stories — Private, Calming, Made for Your Night | The Private Story`, description: `Adult bedtime stories created for grown-up minds. Calming, intimate, and personalised around how you want to feel tonight. Fall asleep to a story made for you.` },
  hero: { badge: `Adults Only · Bedtime · Calming`, h1: `Adult Bedtime Stories — Calming, Private, Made for Tonight`, tagline: `The end of a grown-up day deserves a story that understands how you actually arrive at it.` },
  sections: [
    {
      h2: "What Adult Bedtime Stories Are, and Aren't",
      paragraphs: [
        "Adult bedtime stories are not children's bedtime stories with the language adjusted. They are stories written for the specific experience of being a grown adult at the end of a complex day — with a mind that has been active for sixteen hours, that carries the emotional residue of whatever happened today, and that needs somewhere to go that is not still solving problems or processing obligations.",
        "The things that make a bedtime story work for an adult are different from what works for a child. A child needs narrative and completion. An adult at bedtime needs something that meets them where they are — a register that acknowledges the emotional texture of adult experience, that gives the mind somewhere to settle rather than something to follow, that doesn't require the active engagement of tracking a complex plot.",
        "Adult bedtime stories at The Private Story are created around this understanding. The mood you specify shapes not just the content but the pacing, the emotional register, and the quality of the narrative attention. Whether you want something quietly intimate, gently escapist, or softly romantic as you settle into sleep, the story is created around what you need tonight rather than a generic night-time fiction template. For context on how personalisation works across all types of story, see <a href=\"/personalised-audio-stories\">personalised audio stories</a>.",
      ],
    },
    {
      h2: "The Wind-Down Problem Adult Bedtime Stories Solve",
      paragraphs: [
        "The challenge with the pre-sleep window is cognitive. Your mind is tired but not quiet — it tends to replay the day, anticipate tomorrow, and resist the descent into sleep. The conventional advice (avoid screens, no stimulating content) addresses part of this, but leaves the question of what to do instead unanswered. The mind needs something to engage with, just not something that requires engagement.",
        "Personalised adult bedtime stories work for this window because they are toned for it. A story shaped around a calming or intimate emotional register gives the mind somewhere to go that is interesting without being demanding. The narrative provides gentle forward motion — something to follow loosely — without the cognitive load of tracking an active plot or an argument that requires resolution.",
        "The personalisation matters because the quality of the story's register is what makes this work. A bedtime story that is slightly too exciting — that has the kind of tension that keeps you present — is as counterproductive as anything else. The creation flow lets you specify not just the content type but the emotional quality: how calming, how intimate, how gently resolved you want your story to be tonight. If you want something more intimate rather than calming, <a href=\"/intimate-audio-stories\">intimate audio stories</a> explore that register more fully.",
      ],
    },
    {
      h2: "Privacy at Bedtime",
      paragraphs: [
        "The pre-sleep listening window is one of the most private parts of a person's day. The content you listen to to fall asleep is not something most people want on a social platform, logged against a public profile, or visible in any way outside their own device.",
        "The Private Story's architecture reflects this. There is no social layer, no public listening history, no recommendation engine visible to others. Your adult bedtime stories are saved to your private account and exist nowhere else. The experience of settling into sleep with a story that was made for you — in a space that is genuinely private — is different from doing the same on a platform with any public-facing features. This is what <a href=\"/private-audio-stories\">private audio stories</a> means in practice.",
      ],
    },
  ],
  howItWorks: [
    { heading: "Choose your bedtime mood", body: "Select the emotional register you want your story to have tonight — calming, intimate, gently romantic, or quietly escapist. The creation flow is built to capture not just content type but the specific quality of experience you need to wind down." },
    { heading: "Your story is created for tonight", body: "The story is generated from your choices — written from scratch for this specific night, with pacing and register suited to the pre-sleep listening window. Not retrieved from a library. Made for you, now." },
    { heading: "Listen and let go", body: "Your narrated story is saved to your private account. No social features, no public history. Just the story, your earphones, and the quiet." },
  ],
  scenarios: {
    h2: "What Your Adult Bedtime Story Can Feel Like",
    items: [
      { heading: "Quietly intimate and close", body: "A story with the emotional warmth of closeness — the specific quality of feeling near someone in a way that settles the nervous system and carries you toward rest." },
      { heading: "Gently escapist", body: "A story that takes you somewhere else entirely — a different world, a different dynamic, a scenario that gives your mind somewhere to go that isn't tonight's unfinished business." },
      { heading: "Softly romantic", body: "The kind of low-intensity romantic tension that is interesting enough to hold your attention loosely and resolved enough to leave you feeling settled rather than unresolved." },
      { heading: "Calming and grounded", body: "A story that meets you where you are at the end of the day — acknowledging the emotional texture of adult experience and carrying you gently toward rest rather than demanding your continued engagement." },
    ],
  },
  benefits: {
    h2: "Why Adult Bedtime Stories Work",
    items: [
      { heading: "Toned for the pre-sleep window", body: "Paced and registered for winding down rather than engagement — interesting without being demanding." },
      { heading: "Personalised to tonight", body: "Created from your choices for this specific night — not a generic sleep story that may or may not suit your current state." },
      { heading: "No screen required", body: "Audio-only experience — listen with eyes closed, earphones in, in the dark." },
      { heading: "Genuinely private", body: "No social layer, no public history. Your bedtime stories are in your account and nowhere else." },
    ],
  },
  fullPicture: {
    h2: "Sleep Better with a Story Made for Tonight",
    paragraphs: [
      "Adult bedtime stories work when they are the right kind of story for the right kind of night — when the register, the pacing, and the emotional quality match what you actually need at the moment of listening. The Private Story is built to create this match: not a library of generic sleep stories, but a creation flow that captures the specific quality of the experience you need to wind down tonight.",
      "Whether you want something intimate and close, gently escapist, or quietly romantic as you settle into sleep, the story is created around those preferences and heard only by you. Explore the creation flow and see what can be made for your night.",
    ],
  },
  finalCTA: {
    h2: "Your Story for Tonight",
    paragraphs: ["A private adult bedtime story created around how you want to feel as you settle in. Under two minutes to create."],
    primary: { label: "Create tonight's story", href: "/create" },
    links: [
      { label: "Bedtime audio stories", href: "/bedtime-audio-stories" },
      { label: "Sleep audio stories", href: "/sleep-audio-stories" },
      { label: "Relaxing audio stories", href: "/relaxing-audio-stories" },
      { label: "Intimate audio stories", href: "/intimate-audio-stories" },
    ],
  },
  faqs: [
    { q: "What makes adult bedtime stories different from regular bedtime stories?", a: "Adult bedtime stories are created for grown adult minds — acknowledging the emotional complexity of adult experience, the specific challenge of the pre-sleep window after a full day, and the kind of content register that actually helps an adult settle. They are not children's stories with adjusted language. They are stories specifically created for the experience of being an adult at the end of a real day." },
    { q: "Can adult bedtime stories have romantic or intimate content?", a: "Yes. The intensity and register of the story are shaped by your creation choices. Adult bedtime stories can be quietly intimate, softly romantic, gently sensual, or calming and escapist — depending on what you specify. The Private Story creates content for adults 18+ across a range of emotional registers." },
    { q: "How is an adult bedtime story different from a sleep podcast?", a: "Sleep podcasts are optimised for a general audience and require enough engagement to hold attention — which is the opposite of what winding down requires. A personalised adult bedtime story is created around your specific mood tonight, paced for the pre-sleep window, and requires no active cognitive engagement. Your mind can follow loosely or drift — the story continues either way." },
    { q: "Will the story help me sleep?", a: "Adult bedtime stories created with a calming or intimate register are designed for the wind-down window — paced and toned to carry you toward rest rather than maintain alertness. Many listeners report falling asleep during or shortly after their story. The personalisation means the story's register matches your current state, which is the most important factor in whether audio content helps or hinders sleep." },
    { q: "How long are adult bedtime stories?", a: "Typically between fifteen and thirty minutes, depending on your creation choices. This is sized for the specific pre-sleep window — a complete, satisfying experience that doesn't require staying awake for an hour." },
  ],
};

export const aiRomanceStoriesForWomenConfig: SEOPageConfig = {
  meta: { title: `AI Romance Stories for Women — Personalised, Private, Made for You | The Private Story`, description: `AI-generated romance stories for women, personalised around your mood and choices. Private, narrated audio fiction created for you tonight. Not a library — yours.` },
  hero: { badge: `Romance · AI-Generated · For Women`, h1: `AI Romance Stories for Women — Created Around How You Want to Feel`, tagline: `Romance fiction generated for you from your choices tonight. Private, narrated, and made for the specific quality of connection you want to feel.` },
  sections: [
    {
      h2: "AI Romance Stories and What Makes Them Different",
      paragraphs: [
        "AI-generated romance stories differ from pre-written romance fiction in one fundamental way: they are created in response to your choices rather than written for a general audience before you arrived. This matters more in romance fiction than in almost any other genre because the emotional quality of a romance story — whether it feels real, whether the dynamic feels right, whether the tension builds in a way that satisfies — depends on specificity.",
        "A romance story written for a general audience has to make assumptions about what most readers want from a romantic experience. Those assumptions may align with what you want tonight, or they may not. A story generated from your specific choices about mood, dynamic, pacing, and emotional register does not rely on this alignment — it starts from what you said you wanted and builds from there.",
        "At The Private Story, AI romance stories for women are created through a structured selection process that captures the quality of the romantic experience you want — not just broad categories but the specific texture of the connection, tension, and dynamic you want the story to explore. The result is romance fiction that fits your mood tonight in a way that pre-existing content cannot replicate. For the full framework behind this approach, see <a href=\"/personalised-audio-stories\">personalised audio stories</a>.",
      ],
    },
    {
      h2: "What Women Want from Romance Fiction",
      paragraphs: [
        "Research into women's romance reading and listening consistently finds that the emotional experience — the quality of the dynamic, the character depth, the emotional journey — matters as much or more than the plot events. Women who love romance are often responding to how a story makes them feel rather than to specific narrative outcomes. The tension, the quality of the attraction, the specific character of the connection: these are what sustain engagement.",
        "AI-generated romance for women is effective when it understands this. The creation flow at The Private Story asks about these qualities — the character of the dynamic you want, the emotional register, the pacing of the tension. These selections shape a story that is calibrated for what you are actually looking for rather than a generic romance template.",
        "Whether you want slow-burn tension, enemies who are discovering they are not enemies, deep emotional connection that becomes physical, or confident and direct attraction without games — the story generated reflects your specific preferences rather than what the market assumes most women want from romance. If slow-burn pacing is what you are looking for specifically, <a href=\"/slow-burn-audio-stories\">slow-burn audio stories</a> explores that dynamic in depth.",
      ],
    },
    {
      h2: "The Privacy Advantage of AI Romance Stories",
      paragraphs: [
        "Romance fiction is personal — the dynamics and emotional registers you find compelling are not information most people want to share publicly. Library platforms, with their public ratings, recommendation histories, and social features, make the romance content you engage with at least partially visible. The Private Story's architecture removes this problem.",
        "Your AI romance stories are private to your account. There is no social layer, no public listening history, no activity feed visible to other users. The creation choices you make — the dynamic, the intensity, the specific scenario type — are used to create your story and are not permanently attached to a public profile.",
        "For women exploring the specific kinds of romance fiction that are not widely discussed publicly — power dynamics, forbidden attraction, emotional intensity without social endorsement — this privacy architecture makes the exploration feel genuinely safe rather than just password-protected. The platform's approach to privacy is explained in full on the <a href=\"/private-audio-stories\">private audio stories</a> page.",
      ],
    },
  ],
  howItWorks: [
    { heading: "Choose the romance you want to feel", body: "Select the mood, dynamic, and emotional register of your story. The creation flow asks about the quality of the connection and tension you want — not just categories but the specific character of what you are looking for tonight." },
    { heading: "An original story is written for you", body: "Your AI romance story is generated from your choices — written from the first sentence with your preferences as the starting point. Not retrieved from a library. Original for tonight." },
    { heading: "Listen privately", body: "Your narrated story is saved to your private account. No social layer, no public history. The romance is entirely yours." },
  ],
  scenarios: {
    h2: "Romance Registers You Can Explore",
    items: [
      { heading: "Slow burn and worth the wait", body: "Tension that builds through proximity, restraint, and accumulated almost — where the romance develops through the charge between characters before it is ever expressed, and the expression is worth the build." },
      { heading: "Enemies who are not enemies", body: "The specific dynamic where opposition creates an emotional charge that turns out to be attraction — friction giving way to recognition, resistance becoming closeness." },
      { heading: "Deep connection becoming physical", body: "Emotional intimacy that develops into physical closeness — where the romance grows from genuine understanding and the physical dimension follows naturally from what was already there." },
      { heading: "Confident and direct attraction", body: "The dynamic where both parties know what they feel and move toward it without games or ambiguity — attraction expressed honestly and met with the same directness." },
    ],
    interstitial: "These are examples. The story generated for you reflects the specific choices you make.",
  },
  benefits: {
    h2: "Why AI Romance Stories Work",
    items: [
      { heading: "Calibrated to what you want tonight", body: "Generated from your specific choices — the mood, the dynamic, the emotional register — rather than selected from a catalogue." },
      { heading: "Female experience at the centre", body: "The creation flow is built around the qualities of romance that women report mattering most — character depth, emotional texture, tension that earns its resolution." },
      { heading: "Structurally private", body: "No social layer, no public history. Your romance stories are in your account and nowhere else." },
      { heading: "Narrated audio fiction", body: "A story you listen to, not read — complete, narrated, and ready when you are." },
    ],
  },
  fullPicture: {
    h2: "Romance That Starts with Your Choices",
    paragraphs: [
      "AI romance stories for women are at their best when they understand that female romantic experience is specific — that the quality of the dynamic, the emotional register, and the character of the tension matter as much as the narrative events. The Private Story is built to create this understanding at the point of generation, not filter for it in a catalogue.",
      "The result is romance fiction that was made for you, tonight, in a listening experience that is completely private. Explore the creation flow and see what kind of romance can be made around your choices.",
    ],
  },
  finalCTA: {
    h2: "Your Romance Story, Tonight",
    paragraphs: ["An AI-generated romance story personalised around your mood and choices. Narrated, private, and under two minutes to create."],
    primary: { label: "Create your story", href: "/create" },
    links: [
      { label: "Romantic audio stories", href: "/romantic-audio-stories" },
      { label: "Audio stories for women", href: "/audio-stories-for-women" },
      { label: "Love stories audio", href: "/love-stories-audio" },
      { label: "Slow burn audio stories", href: "/slow-burn-audio-stories" },
    ],
  },
  faqs: [
    { q: "What makes AI romance stories different from regular romance novels?", a: "AI romance stories generated by The Private Story are created from your specific choices at the moment of listening — not written for a general audience before you arrived. The dynamic, emotional register, and character quality are shaped by what you selected tonight, not by what an author assumed a general audience would want. The story exists because of your preferences, which is categorically different from the closest match in a catalogue." },
    { q: "Can I choose what kind of romance I want?", a: "Yes. The creation flow lets you choose the character of the romantic dynamic — slow burn or direct, emotional or physical focus, forbidden or freely available attraction. These selections, combined with mood and scenario choices, produce a story that reflects the specific quality of romance you are looking for tonight." },
    { q: "Are these stories for women specifically?", a: "Yes. The creation flow and the character of the content are built around what women report wanting from romance fiction — emotional depth, character specificity, tension that earns its resolution, and a dynamic that feels calibrated for female experience rather than a general audience's assumed preferences." },
    { q: "How private is the platform?", a: "Completely private, structurally. No social layer, no public listening history, no recommendation engine visible to others. Your stories are in your account and accessible only to you." },
    { q: "How long are AI romance stories?", a: "Typically between fifteen and thirty minutes, depending on your selections. This is sized for the specific listening window when romance fiction is most wanted — the wind-down hour, time alone, the pre-sleep session." },
  ],
};

export const allPageConfigs = new Map<string, SEOPageConfig>([
  ["adult-audio-stories", adultAudioStoriesConfig],
  ["ai-audio-story-generator", aiAudioStoryGeneratorConfig],
  ["alternatives-to-romance-audiobooks", alternativesToRomanceAudiobooksConfig],
  ["audio-stories-for-women", audioStoriesForWomenConfig],
  ["audio-stories-vs-audiobooks", audioStoriesVsAudiobooksConfig],
  ["audio-stories-vs-podcasts", audioStoriesVsPodcastsConfig],
  ["bedtime-audio-stories", bedtimeAudioStoriesConfig],
  ["best-audio-story-app-for-adults", bestAudioStoryAppForAdultsConfig],
  ["confident-energy-stories", confidentEnergyStoriesConfig],
  ["create-your-own-audio-story", createYourOwnAudioStoryConfig],
  ["dark-romance-audio-stories", darkRomanceAudioStoriesConfig],
  ["emotional-audio-stories", emotionalAudioStoriesConfig],
  ["enemies-to-lovers-audio-stories", enemiesToLoversAudioStoriesConfig],
  ["forbidden-romance-audio-stories", forbiddenRomanceAudioStoriesConfig],
  ["intimate-audio-stories", intimateAudioStoriesConfig],
  ["late-night-audio-stories", lateNightAudioStoriesConfig],
  ["love-stories-audio", loveStoriesAudioConfig],
  ["personalised-audio-stories", personalisedAudioStoriesConfig],
  ["private-audio-stories", privateAudioStoriesConfig],
  ["quiet-intensity-stories", quietIntensityStoriesConfig],
  ["relaxing-audio-stories", relaxingAudioStoriesConfig],
  ["romantic-audio-stories", romanticAudioStoriesConfig],
  ["sleep-audio-stories", sleepAudioStoriesConfig],
  ["slow-burn-audio-stories", slowBurnAudioStoriesConfig],
  ["audio-erotica-for-women", audioEroticaForWomenConfig],
  ["personalised-erotica", personalisedEroticaConfig],
  ["erotic-audio-stories", eroticAudioStoriesConfig],
  ["adult-bedtime-stories", adultBedtimeStoriesConfig],
  ["ai-romance-stories-for-women", aiRomanceStoriesForWomenConfig],
]);

export function getPageConfig(slug: string): SEOPageConfig | undefined {
  return allPageConfigs.get(slug);
}
