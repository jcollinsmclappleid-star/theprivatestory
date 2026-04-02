import SEOPage, { SEOPageConfig } from "@/components/SEOPage";
import { getPageSsrData } from "@workspace/seo-data";

const _d = getPageSsrData("emotional-audio-stories")!;

const config: SEOPageConfig = {
  meta: { title: _d.title, description: _d.description },
  hero: { badge: _d.badge, h1: _d.h1, tagline: _d.tagline },
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
  faqs: _d.faqs,
};

export default function EmotionalAudioStories() {
  return <SEOPage config={config} />;
}
