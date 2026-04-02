import SEOPage, { SEOPageConfig } from "@/components/SEOPage";
import { getPageSsrData } from "@workspace/seo-data";

const _d = getPageSsrData("relaxing-audio-stories")!;

const config: SEOPageConfig = {
  meta: { title: _d.title, description: _d.description },
  hero: { badge: _d.badge, h1: _d.h1, tagline: _d.tagline },
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
  faqs: _d.faqs,
};

export default function RelaxingAudioStories() {
  return <SEOPage config={config} />;
}
