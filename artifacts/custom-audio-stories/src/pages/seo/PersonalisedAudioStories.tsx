import SEOPage, { SEOPageConfig } from "@/components/SEOPage";
import { getPageSsrData } from "@workspace/seo-data";

const _d = getPageSsrData("personalised-audio-stories")!;

const config: SEOPageConfig = {
  meta: { title: _d.title, description: _d.description },
  hero: { badge: _d.badge, h1: _d.h1, tagline: _d.tagline },
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
  faqs: _d.faqs,
};

export default function PersonalisedAudioStories() {
  return <SEOPage config={config} />;
}
