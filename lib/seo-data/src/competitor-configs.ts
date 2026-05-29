// Competitor "alternative" landing pages.
// Editorial principle: POSITIVES ONLY. Each page celebrates what the named
// platform does well, then shows what The Private Story offers alongside —
// without saying one is better than the other. Two listening practices that
// can complement each other. No comparison tables on these pages.

import type { SEOPageConfig } from "./types.js";

const sharedTpsBenefits: SEOPageConfig["benefits"] = {
  h2: "What The Private Story Brings to the Same Listener",
  items: [
    {
      heading: "Generated for you, not retrieved",
      body: "Your story does not already exist in a catalogue. It is written from scratch around the dynamic, register, and intensity you describe — for this session.",
    },
    {
      heading: "Three doors for tonal control",
      body: "Romance, After Dark, and Drift are three distinct registers. You choose the one that fits the night. The story is written and narrated to the door you pick.",
    },
    {
      heading: "Premium narration, end to end",
      body: "Six professional narrators — three female, three male, including British voices. Voice is matched to the story's register, then narrated end to end.",
    },
    {
      heading: "Private by architecture",
      body: "No social features, no public history, no recommendation feeds. Your library is yours. The platform does not treat your listening as something to share.",
    },
    {
      heading: "Ready in minutes",
      body: "From the moment you finish your choices, the story is written and narrated within a few minutes. A growing private library that reflects your actual taste.",
    },
  ],
};

const sharedFinalCTA = (otherName: string): SEOPageConfig["finalCTA"] => ({
  h2: "Two Listening Practices, Side by Side",
  paragraphs: [
    `Listeners who love ${otherName} often find that a generative platform sits well alongside it — for the nights when the catalogue does not have the exact story you are reaching for. The Private Story creates that story from your brief.`,
    "Free 30-second narrated samples below. No sign-up required to listen.",
  ],
  primary: { label: "Create your private story", href: "/create" },
  links: [
    { label: "Hear a 30-second sample first", href: "/samples" },
    { label: "See pricing", href: "/pricing" },
    { label: "How it works", href: "/how-it-works" },
  ],
});

const sharedHowItWorks: SEOPageConfig["howItWorks"] = [
  { heading: "Choose a door", body: "Romance for warm and considered, After Dark for charged and adult, Drift for slow and calming." },
  { heading: "Make seven structured choices", body: "Mood, tone, dynamic, setting, intensity, character type, and direction. Around two minutes." },
  { heading: "Story is written and narrated", body: "Your brief becomes a literary script, then a professional narrator records it end to end. A few minutes." },
  { heading: "Listen privately", body: "Saved only to your account. No public history, no social feed. Yours to revisit or rebuild whenever you want." },
];

// ─────────────────────────────────────────────────────────────────────────────
// /dipsea-alternative
// ─────────────────────────────────────────────────────────────────────────────
export const dipseaAlternativeConfig: SEOPageConfig = {
  meta: {
    title: "A Personalised Alternative Alongside Dipsea — Free 30-Second Sample | The Private Story",
    description: "Love Dipsea and want a personalised, generative option alongside it? The Private Story writes and narrates a private audio story around your brief. Free sample below — no sign-up.",
  },
  hero: {
    badge: "Personalised · Generative · Private",
    h1: "A Personalised Audio Story Platform Alongside Dipsea",
    tagline: "Two listening practices that work well together. Hear a free 30-second sample, then create one of your own.",
  },
  heroCTALabel: "Hear a sample, then create one",
  heroImage: "images/seo-hero-dipsea-alternative.webp",
  bodyImages: [
    "images/seo-body-listening-in-silk.webp",
    "images/seo-body-whisper-close.webp",
    "images/seo-body-lovers-embrace.webp",
    "images/seo-body-bedroom-glow.webp",
    "images/seo-body-candlelit-bath.webp",
  ],
  sections: [
    {
      h2: "Why Dipsea Earned Its Place in Audio Erotica",
      paragraphs: [
        "Dipsea is one of the platforms that defined modern audio erotica for women. Long before the category became crowded, Dipsea showed that there was a real audience for literary, well-produced, female-forward audio storytelling — and built a brand around treating that audience seriously.",
        "What stands out about Dipsea is the editorial care. Stories are written and produced as proper short fiction. Narrators are cast for craft, not just voice. Series build characters across episodes. And the wellness and sleep content sits alongside the spicier work in a way that signals an honest understanding of how women actually use audio in their day.",
      ],
      bullets: [
        "Trailblazer in audio erotica written for women — defined the category",
        "Polished production values and professional narration throughout",
        "Series-style storytelling that develops characters across episodes",
        "Sleep and wellness content alongside the spicier library",
        "Inclusive, diverse cast of writers and performers",
        "Clean, easy-to-navigate app experience",
      ],
    },
    {
      h2: "What The Private Story Adds for the Same Listener",
      paragraphs: [
        "The Private Story is built on a different model — generative rather than catalogue. You describe the story you want for tonight, and it is written and narrated around your specific brief. The character, the dynamic, the register, the intensity, the setting — all chosen by you, not selected from existing options.",
        "For listeners who already love Dipsea, the value is not replacement; it is complement. Dipsea is excellent for the nights when you want something polished and curated. The Private Story is for the nights when you want something specific that does not yet exist — written tonight, around exactly what you are reaching for.",
      ],
    },
  ],
  howItWorks: sharedHowItWorks,
  scenarios: {
    h2: "When a Generative Story Fits Well Alongside a Curated Library",
    intro: "Both have their nights. Some examples of when a generative session feels right.",
    items: [
      { heading: "When you have a very specific scenario in mind", body: "A particular dynamic, setting, or intensity that you cannot quite find in a curated library. Describe it; hear it written for you." },
      { heading: "When you want a UK voice", body: "British narrators are part of the standard cast. The story is written and narrated in the register you want." },
      { heading: "When you want privacy by design", body: "No public listening history, no social feed, no recommendations to other users. Just your account, your library." },
      { heading: "When you want to build a library that reflects you", body: "Every story you create is saved privately. Over time, the library is genuinely a record of your taste." },
    ],
    interstitial: "Hear a 30-second sample of the narration, then create your first story.",
  },
  benefits: sharedTpsBenefits,
  fullPicture: {
    h2: "Two Models, One Listener",
    paragraphs: [
      "The catalogue model and the generative model are not in competition. They serve different moments. A curated library like Dipsea offers immediate access to professionally produced stories that someone else thought you might enjoy. A generative platform like The Private Story offers a story written tonight around what you actually want, this session.",
      "Most committed listeners eventually find that both have a place. The catalogue is the pour-yourself-a-glass-and-press-play option. The generative platform is the I-want-something-very-specific option. The two together cover almost every kind of night.",
      "If you have come to Dipsea and loved what you found there, you already understand what audio storytelling can do when it is taken seriously. The Private Story is built by people who share that conviction — and who think the next step is letting the story be written around you.",
    ],
  },
  finalCTA: sharedFinalCTA("Dipsea"),
  faqs: [
    { q: "Is The Private Story a replacement for Dipsea?", a: "No — they serve different needs. Dipsea is a curated library of pre-produced audio. The Private Story generates a story from your brief at the moment you ask for it. Many listeners use both: one for browsing and discovery, one for sessions when they want something written specifically for tonight." },
    { q: "How do the voices compare?", a: "Both platforms use professional narrators. The Private Story includes six narrators — three female, three male — with British and American options. The voice is matched to the story's register and door choice." },
    { q: "How long are stories on The Private Story?", a: "Stories are approximately 10 minutes of narrated audio. Drift stories are paced slower for bedtime; Romance and After Dark are paced for active listening — but the length is consistent across all three doors." },
    { q: "Can I keep my Dipsea subscription and try The Private Story?", a: "Of course. The two are independent services. The Private Story does not require you to cancel anything else; it is simply a different kind of audio practice you can use alongside whatever you already enjoy." },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// /quinn-alternative
// ─────────────────────────────────────────────────────────────────────────────
export const quinnAlternativeConfig: SEOPageConfig = {
  meta: {
    title: "A Personalised Alternative Alongside Quinn — Free 30-Second Sample | The Private Story",
    description: "Love Quinn and want a generative, written-for-you option alongside it? The Private Story creates a private audio story from your brief. Free sample below — no sign-up.",
  },
  hero: {
    badge: "Personalised · Generative · Private",
    h1: "A Personalised Audio Story Platform Alongside Quinn",
    tagline: "Two listening practices that work well together. Hear a free 30-second sample, then create one of your own.",
  },
  heroCTALabel: "Hear a sample, then create one",
  heroImage: "images/seo-hero-quinn-alternative.webp",
  bodyImages: [
    "images/seo-body-listening-in-silk.webp",
    "images/seo-body-whisper-close.webp",
    "images/seo-body-lovers-embrace.webp",
    "images/seo-body-bedroom-glow.webp",
    "images/seo-body-candlelit-bath.webp",
  ],
  sections: [
    {
      h2: "Why Quinn Has Become a Touchstone for the Community",
      paragraphs: [
        "Quinn built one of the most genuinely community-driven audio erotica experiences online. Its model — open creator submissions, free access for listeners, a vast library that grows daily — is a real achievement. It is one of the few platforms where the breadth of voices, accents, styles, and orientations actually matches the breadth of its audience.",
        "There is also something honest about Quinn's mobile-first design. The app is built for how people actually listen: on a phone, in private, late at night. The free tier means the platform is genuinely accessible — not gated behind a subscription before you know whether you like the format.",
      ],
      bullets: [
        "Free for listeners — genuinely accessible to anyone curious about the format",
        "Vast, community-driven library with new audio added constantly",
        "Wide range of voices, accents, styles, and orientations",
        "Open submission model — creator-driven and democratic",
        "Mobile-first experience designed around how people actually listen",
        "Strong inclusive representation across orientations and identities",
      ],
    },
    {
      h2: "What The Private Story Adds for the Same Listener",
      paragraphs: [
        "The Private Story works to a different model. Rather than choosing from a library, you describe the story you want and it is written and narrated around your brief — the character, the dynamic, the register, the intensity, the setting. Each story is generated for this session, not selected from existing recordings.",
        "If Quinn is the platform you go to when you want range and discovery, The Private Story is the platform you go to when you have something very specific in mind that you cannot quite find. The two are complementary: one for browsing the breadth, one for commissioning the specific.",
      ],
    },
  ],
  howItWorks: sharedHowItWorks,
  scenarios: {
    h2: "When a Generative Story Fits Well Alongside a Community Library",
    intro: "Both serve real listening needs. Some moments where a generative session feels right.",
    items: [
      { heading: "When the exact dynamic does not yet exist in the library", body: "Describe it — the chemistry, the setting, the register — and the story is written around your brief." },
      { heading: "When you want consistent literary craft across sessions", body: "Every story is written to the same editorial standard. The voice is professional and the structure intentional." },
      { heading: "When you want a saved private library that reflects you", body: "Every story you create stays in your account. Over time, the library is a record of your actual taste." },
      { heading: "When you want the story narrated within minutes", body: "From your final selection to a finished narrated story is a few minutes — not waiting for a creator to upload." },
    ],
    interstitial: "Hear a 30-second sample of the narration, then create your first story.",
  },
  benefits: sharedTpsBenefits,
  fullPicture: {
    h2: "Two Models, One Listener",
    paragraphs: [
      "The community model and the generative model serve different parts of the same appetite. A community library like Quinn gives you immediate access to enormous range — a kind of restless variety that is its own pleasure. A generative platform like The Private Story offers a single story written tonight, around exactly what you are reaching for.",
      "It is not unusual for committed listeners to use both. The community library is the rabbit-hole option, the discovery option, the surprise-me option. The generative platform is the I-know-what-I-want option, the precision option, the build-me-this option.",
      "If you have spent time on Quinn and understand the pleasure of audio that takes the listener seriously, you already understand the form. The Private Story is built for the same listener — and is the option for the nights when the story you want has not been recorded yet.",
    ],
  },
  finalCTA: sharedFinalCTA("Quinn"),
  faqs: [
    { q: "Is The Private Story a replacement for Quinn?", a: "No — they are different in kind. Quinn is a community-driven library of pre-recorded audio. The Private Story generates a written and narrated story from your specific brief. Many listeners use both — one for browsing, one for commissioning." },
    { q: "Does The Private Story have a free tier like Quinn?", a: "There is no recurring free tier, but every visitor can hear free 30-second narrated samples on the samples page without signing up — to hear the voices and the door tones before deciding whether to subscribe." },
    { q: "What kinds of voices are available?", a: "Six professional narrators — three female, three male, with British and American options. Voice is matched to the door (Romance, After Dark, or Drift) and to the story's register." },
    { q: "Can I keep using Quinn and try The Private Story?", a: "Yes. They are independent services and many listeners use both. The Private Story does not require you to cancel anything else." },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// /ferly-alternative
// ─────────────────────────────────────────────────────────────────────────────
export const ferlyAlternativeConfig: SEOPageConfig = {
  meta: {
    title: "A Personalised Alternative Alongside Ferly — Free 30-Second Sample | The Private Story",
    description: "Love Ferly's mindful approach to intimacy and want a generative, written-for-you option alongside it? The Private Story creates a private audio story from your brief. Free sample below.",
  },
  hero: {
    badge: "Personalised · Generative · Private",
    h1: "A Personalised Audio Story Platform Alongside Ferly",
    tagline: "Two listening practices that work well together. Hear a free 30-second sample, then create one of your own.",
  },
  heroCTALabel: "Hear a sample, then create one",
  heroImage: "images/seo-hero-intimate.webp",
  sections: [
    {
      h2: "Why Ferly's Approach Resonates with So Many Women",
      paragraphs: [
        "Ferly built something that the audio category genuinely needed: a mindful, female-led platform that treats intimacy as part of a larger relationship with self-knowledge and wellbeing. The framing is not coy or apologetic. It treats the listener as an adult engaged in something legitimate and worth doing well.",
        "What also stands out is the editorial care. Ferly's content is curated rather than crowdsourced — every piece chosen by people who understand the brief. The result is a library that feels coherent, considered, and safe to spend time in. For listeners who want intimacy paired with genuine self-understanding, this matters enormously.",
      ],
      bullets: [
        "Mindful, wellness-first framing of intimacy and pleasure",
        "Female-founded and female-led — built by people who understand the audience",
        "Curated, high-editorial-standard content library",
        "Strong emphasis on sex education alongside audio",
        "Safe, non-judgemental space for personal exploration",
        "Pairs intimacy with mindfulness and self-knowledge",
      ],
    },
    {
      h2: "What The Private Story Adds for the Same Listener",
      paragraphs: [
        "The Private Story is generative rather than curated. You describe the story you want for tonight — the dynamic, the setting, the register, the intensity — and it is written and narrated around that brief. The story is created for this session, not selected from a library.",
        "For Ferly listeners who appreciate the wellness framing, the Drift door in particular shares a similar register: slow, considered, low-stimulation, designed for unwinding rather than arousal. Romance and After Dark are available for nights with a different intention. The doors give you tonal control over the kind of story being written.",
      ],
    },
  ],
  howItWorks: sharedHowItWorks,
  scenarios: {
    h2: "When a Generative Story Fits Well Alongside a Mindful Library",
    intro: "Both have their place. Some moments where a generative session feels right.",
    items: [
      { heading: "When you want a story specifically for unwinding", body: "Choose the Drift door — slow-paced, low-stimulation, written for the end of the day rather than for arousal." },
      { heading: "When you want a specific emotional register", body: "Describe the chemistry and tone you want. The story is written to that register, not selected from existing options." },
      { heading: "When you want the same considered care, made specific", body: "The same editorial seriousness Ferly brings to its library is what we bring to writing your story — only the story is built around you." },
      { heading: "When you want a private library that grows with you", body: "Every story stays in your account. Over time, the library reflects what genuinely works for you." },
    ],
    interstitial: "Hear a 30-second sample of the narration, then create your first story.",
  },
  benefits: sharedTpsBenefits,
  fullPicture: {
    h2: "Two Models, One Listener",
    paragraphs: [
      "Ferly's curated, mindful library and a generative platform like The Private Story serve different parts of the same disposition — the disposition that treats audio intimacy as something worth doing carefully. The curated library offers stories selected with care for a thoughtful audience. The generative platform offers stories written for this session, around what you specifically want tonight.",
      "Many listeners find that both belong in the rotation. Ferly for the nights when you want to spend time inside a curated experience that someone else has shaped with care. The Private Story for the nights when you want the same kind of care brought to a story written around your specific brief.",
      "If you have come to Ferly and felt the relief of a platform that treats you seriously, The Private Story is built by people with the same conviction. The next step is letting the story itself be written around you.",
    ],
  },
  finalCTA: sharedFinalCTA("Ferly"),
  faqs: [
    { q: "Is The Private Story a replacement for Ferly?", a: "No — they serve different needs. Ferly is a curated library with a strong mindfulness and education frame. The Private Story generates a private story from your brief at the moment you ask. Many listeners use both, depending on the night." },
    { q: "Does The Private Story have a wellness or sleep angle?", a: "Yes — the Drift door is designed for exactly this. Slow-paced, low-stimulation, written for unwinding and bedtime rather than arousal. Romance and After Dark are available when the night calls for a different register." },
    { q: "How private is The Private Story?", a: "Private by architecture. No public listening history, no social features, no recommendation feed visible to other users. Your library is yours alone." },
    { q: "Can I keep my Ferly subscription and try The Private Story?", a: "Absolutely. The two are independent services and many listeners enjoy both. The Private Story does not require you to cancel anything else." },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// /gonewildaudio-alternative
// ─────────────────────────────────────────────────────────────────────────────
export const gonewildaudioAlternativeConfig: SEOPageConfig = {
  meta: {
    title: "A Personalised Alternative Alongside GoneWildAudio — Free 30-Second Sample | The Private Story",
    description: "Love GoneWildAudio's community-driven creativity and want a generative, written-for-you option alongside it? The Private Story creates a private audio story from your brief. Free sample below.",
  },
  hero: {
    badge: "Personalised · Generative · Private",
    h1: "A Personalised Audio Story Platform Alongside GoneWildAudio",
    tagline: "Two listening practices that work well together. Hear a free 30-second sample, then create one of your own.",
  },
  heroCTALabel: "Hear a sample, then create one",
  heroImage: "images/seo-hero-gonewildaudio-alternative.webp",
  bodyImages: [
    "images/seo-body-listening-in-silk.webp",
    "images/seo-body-whisper-close.webp",
    "images/seo-body-lovers-embrace.webp",
    "images/seo-body-bedroom-glow.webp",
    "images/seo-body-candlelit-bath.webp",
  ],
  sections: [
    {
      h2: "Why GoneWildAudio Has Such a Devoted Community",
      paragraphs: [
        "GoneWildAudio is one of the most creatively unrestrained corners of audio. Its strength is that it is genuinely community-built — the performers are the listeners, and the listeners shape the work through requests, feedback, and conversation. The result is a vast, varied, free library where almost any kind of voice, scenario, and style eventually finds an audience.",
        "There is also something honest about the directness of the model. No subscription, no editorial gatekeeping, no production polish standing between performer and listener. The performers' voices arrive raw and immediate, and the custom request culture means listeners often get audio made specifically for them by performers they have built a connection with.",
      ],
      bullets: [
        "Free, community-driven, no subscription or paywall",
        "Vast variety of voices, accents, styles, and scenarios",
        "Direct interaction between performers and listeners",
        "Custom audio request culture — performers often record bespoke pieces",
        "Authentic, performer-driven creativity unmediated by editorial layers",
        "Strong sense of community across orientations and interests",
      ],
    },
    {
      h2: "What The Private Story Adds for the Same Listener",
      paragraphs: [
        "The Private Story is a different kind of generative experience. Rather than waiting for a performer to record a custom piece, you describe the story you want and it is written and narrated around your brief — by a literary engine and professional narrators — within minutes. The story is private to you, saved only to your account, and built around the specific dynamic and register you describe.",
        "If GoneWildAudio is where you go for the breadth and immediacy of community audio, The Private Story is what sits alongside it for sessions when you want a fully written, professionally narrated story built around a specific brief — without waiting and without a public posting.",
      ],
    },
  ],
  howItWorks: sharedHowItWorks,
  scenarios: {
    h2: "When a Generative Story Fits Well Alongside a Community Audio Library",
    intro: "Both serve real listening practices. Some moments where a generative session feels right.",
    items: [
      { heading: "When you want a written, narrated story rather than a performed monologue", body: "Each story has a script, scenes, and structure — written before it is narrated. A different shape from community audio." },
      { heading: "When you want the story built around your exact brief in minutes", body: "Describe what you want and the story is written and narrated within a few minutes — no waiting for a custom request to be picked up." },
      { heading: "When you want the listening fully private", body: "No public posting, no shared archive. Stories are saved only to your account." },
      { heading: "When you want consistent professional production", body: "Six professional narrators, consistent recording quality, every story produced to the same standard." },
    ],
    interstitial: "Hear a 30-second sample of the narration, then create your first story.",
  },
  benefits: sharedTpsBenefits,
  fullPicture: {
    h2: "Two Models, One Listener",
    paragraphs: [
      "Community audio platforms and generative platforms scratch different itches. The community model offers raw, varied, immediate human performance — a kind of intimacy that comes from hearing real performers find their own voice. The generative model offers a story written tonight, narrated to professional standard, around your specific brief and saved privately.",
      "Both have a place in a serious listening practice. The community library is the surprise-and-discovery option, the human-and-direct option. The generative platform is the precision-and-privacy option, the literary-and-narrated option.",
      "If you have spent time on GoneWildAudio and understand what audio can do at its most personal, The Private Story is the option for the sessions when you want that personal quality applied to a story written specifically for you — by professional writers and narrators, in private.",
    ],
  },
  finalCTA: sharedFinalCTA("GoneWildAudio"),
  faqs: [
    { q: "Is The Private Story a replacement for GoneWildAudio?", a: "No — they serve different needs. GoneWildAudio is a free community audio platform with performer-driven content. The Private Story is a generative platform that writes and narrates a private story from your brief. Many listeners use both." },
    { q: "Can I describe a very specific scenario?", a: "Yes — that is the point of the format. The seven structured choices let you describe the dynamic, register, intensity, setting, and direction. The story is written to that brief." },
    { q: "Is the audio public or shared anywhere?", a: "No. Stories are saved only to your account. There is no public archive, no social feed, no shared library. Private by architecture." },
    { q: "Can I keep using GoneWildAudio and try The Private Story?", a: "Of course. They are independent and many listeners use both — one for community audio, one for generative narrated stories." },
  ],
};
