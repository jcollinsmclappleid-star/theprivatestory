import SEOPage, { SEOPageConfig } from "@/components/SEOPage";
import { getPageSsrData } from "@workspace/seo-data";

const _d = getPageSsrData("sleep-audio-stories")!;

const config: SEOPageConfig = {
  meta: { title: _d.title, description: _d.description },
  hero: { badge: _d.badge, h1: _d.h1, tagline: _d.tagline },
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
  faqs: _d.faqs,
};

export default function SleepAudioStories() {
  return <SEOPage config={config} />;
}
