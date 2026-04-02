import SEOPage, { SEOPageConfig } from "@/components/SEOPage";
import { getPageSsrData } from "@workspace/seo-data";

const _d = getPageSsrData("audio-stories-vs-audiobooks")!;

const config: SEOPageConfig = {
  meta: { title: _d.title, description: _d.description },
  hero: { badge: _d.badge, h1: _d.h1, tagline: _d.tagline },
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
  faqs: _d.faqs,
};

export default function AudioStoriesVsAudiobooks() {
  return <SEOPage config={config} />;
}
