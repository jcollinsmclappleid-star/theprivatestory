import SEOPage, { SEOPageConfig } from "@/components/SEOPage";

const config: SEOPageConfig = {
  meta: {
    title: "Personalised Adult Audio Stories | The Private Story",
    description: "Personalised adult audio stories created around your mood, tone, and preferences. Private, narrated, and built entirely for you. Not a library — your story, tonight.",
  },
  hero: {
    badge: "Personalised · Narrated · Private",
    h1: "Adult Audio Stories — Personalised, Private, Made for You",
    tagline: "Not a library of stories that might be for someone like you. A story created for you, tonight, around exactly what you want to feel.",
  },
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
    {
      q: "What kind of adult audio stories are available?",
      a: "The full range: slow burn and emotionally charged, romantic and tender, confidently direct, dark romance, forbidden romance, enemies to lovers, and everything between. The intensity level is a genuine choice in the creation flow — from tender and emotionally rich to fully unrestricted. The character types, dynamics, settings, and emotional registers available are designed to cover the genuine breadth of what listeners actually want, rather than a narrowly defined niche.",
    },
    {
      q: "How is this different from other platforms?",
      a: "The key distinction is generation versus retrieval. Other platforms offer a catalogue of pre-produced content — you browse, filter, and select from what already exists. The Private Story generates your story around your specific choices. Your story does not exist before you ask for it. This produces a significantly higher level of match between the story and your specific preferences than even the most carefully curated catalogue can achieve. The second distinction is privacy: the platform is architecturally private — no social features, no visible listening history, no recommendation feeds.",
    },
    {
      q: "Can I choose the intensity level of my story?",
      a: "Yes. The intensity level is a genuine choice in the creation flow, not a fixed platform setting. Stories run from tender and emotionally charged to fully unrestricted, and different moods and sessions call for different registers. You set the intensity for each story you create. The story is then generated to that register — built specifically to the level you chose, not to a platform default.",
    },
    {
      q: "How long are the stories?",
      a: "Stories run to approximately 1,500–3,000 words in written form, which typically produces a narrated listening experience of around 10–20 minutes at a comfortable pace. This is designed to be a complete experience in a session — long enough to build properly, develop character and dynamic, and arrive at a satisfying resolution, without requiring a significant time investment. Subscribers can create new stories at any time within their monthly allowance.",
    },
    {
      q: "What does a subscription include?",
      a: "The standard monthly plan includes five stories per month at £29/month, with an annual plan available at £179/year (equivalent to fifty stories). Additional stories can be created at £3.99 each beyond the plan allowance. All stories are narrated, include a generated cover image, and are stored in your private library indefinitely.",
    },
    {
      q: "Are adult audio stories completely private?",
      a: "Completely. Your account, your stories, and your listening history are private and visible only to you. The Private Story has no social features — no public profiles, no shared listening history, no recommendation feeds that expose what you listen to. Privacy is architectural to the platform: it was designed from the beginning with the requirement that adult listening should be genuinely private.",
    },
    {
      q: "Who is The Private Story designed for?",
      a: "Adults who want adult audio fiction that is actually personalised — created around their specific preferences rather than retrieved from a catalogue — and who want the listening experience to be genuinely private. The platform is particularly focused on women, built around the recognition that the adult audio fiction market has historically been designed with assumptions that do not match what women actually want from the genre. The creation flow, the character types available, and the emotional registers the stories work in are all built with female listeners at the centre.",
    },
  ],
};

export default function AdultAudioStories() {
  return <SEOPage config={config} />;
}
