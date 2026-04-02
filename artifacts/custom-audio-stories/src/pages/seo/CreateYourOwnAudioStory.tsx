import SEOPage, { SEOPageConfig } from "@/components/SEOPage";
import { getPageSsrData } from "@workspace/seo-data";

const _d = getPageSsrData("create-your-own-audio-story")!;

const config: SEOPageConfig = {
  meta: { title: _d.title, description: _d.description },
  hero: { badge: _d.badge, h1: _d.h1, tagline: _d.tagline },
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
  faqs: _d.faqs,
};

export default function CreateYourOwnAudioStory() {
  return <SEOPage config={config} />;
}
