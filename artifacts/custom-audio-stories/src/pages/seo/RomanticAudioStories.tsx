import SEOPage, { SEOPageConfig } from "@/components/SEOPage";
import { getPageSsrData } from "@workspace/seo-data";

const _d = getPageSsrData("romantic-audio-stories")!;

const config: SEOPageConfig = {
  meta: { title: _d.title, description: _d.description },
  hero: { badge: _d.badge, h1: _d.h1, tagline: _d.tagline },
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
  faqs: _d.faqs,
};

export default function RomanticAudioStories() {
  return <SEOPage config={config} />;
}
