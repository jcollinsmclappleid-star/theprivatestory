import CompetitorPage, { type CompetitorPageConfig } from "@/components/CompetitorPage";

const config: CompetitorPageConfig = {
  slug: "quinn-alternative",
  competitorName: "Quinn",
  metaTitle: "Looking for a Quinn Alternative? | The Private Story",
  metaDescription:
    "Exploring audio erotica beyond Quinn? The Private Story writes your story from scratch — private, personalised, built around your imagination. Nothing shared, nothing public.",
  badge: "Compare",
  h1: "Looking for a Quinn Alternative?",
  tagline:
    "Quinn has built a vibrant creative community. The Private Story takes a different path entirely — writing your story, privately, from scratch.",
  intro:
    "This page is written by The Private Story. We have a commercial interest in your choosing our platform — please weigh what we say here accordingly. What we can offer honestly is a clear account of what Quinn does well, and what The Private Story was built to do.",
  sections: [
    {
      h2: "What Quinn does well",
      body: `Quinn has created something meaningful for the audio erotica space: a community of creators and listeners, with real range and real personality. Independent writers, voice actors, and storytellers post content, and listeners can discover new voices, follow creators, and engage with a genuinely diverse range of audio. The community dimension — comments, creator relationships, the feel of a living platform — is something many listeners find valuable. Quinn has also been an important space for audio creators to find an audience and build a practice.`,
    },
    {
      h2: "What The Private Story is built for",
      body: `The Private Story does not have creators, a community, or a discovery feed. It has one thing: your story, written from scratch, around what you told it you wanted. Before anything is generated, you make seven structured choices — pairing, chemistry, archetype, setting, intensity, emotional mood, and situation. Those choices become the creative brief. The story is then written by AI, in service of exactly that brief, and delivered to your private account.<br><br>Nobody else will hear your story. Nobody knows it exists. There is no social layer, no public space, no sharing of any kind. The entire experience is between you and what you described wanting. See <a href="/private-audio-stories">private audio stories</a> for a full account of the privacy architecture, and <a href="/personalised-audio-stories">personalised audio stories</a> to understand the creation model.`,
    },
    {
      h2: "Personalisation at The Private Story — how it works",
      body: `Personalisation at The Private Story is not a recommendation algorithm. It is generative: the story is written around your choices for this session, not retrieved from a catalogue based on your listening history.<br><br>The Casting Room gives you choices across 220+ situations, 28 emotional moods, 14 character archetypes, nine chemistry types, 50+ country settings, and 12 historical periods. The combination you choose becomes the brief the AI writes toward. The story is original — it did not exist before you described what you wanted.<br><br>For listeners who have a very specific imaginative world they want to inhabit, or who have found that existing content never quite fits, this generative model is what the platform was built to serve. Explore <a href="/ai-audio-story-generator">how AI audio story generation works</a> or try <a href="/create-your-own-audio-story">creating your own story</a> to see the full creation flow.`,
    },
    {
      h2: "Privacy as a design principle",
      body: `The Private Story was designed privacy-first. There are no public profiles, no social features, no shared listening history, and no feeds. Your stories are stored privately in your account and are not visible to anyone — including the platform team. The platform does not run ads, sell data, or make any listening behaviour available to third parties.<br><br>For listeners who want to explore the full range of their imagination privately, the architecture is the point. It is not a feature added on — it is the founding design principle of the platform.`,
    },
    {
      h2: "What kind of listener chooses The Private Story over Quinn",
      body: `Quinn is the better choice if you value discovering independent creators, engaging with a community of audio storytellers, and the variety that comes from a platform with many voices and perspectives. If you enjoy following specific creators, leaving comments, or finding content you would not have thought to ask for, Quinn delivers that in a way The Private Story does not attempt to.<br><br>The Private Story is the better choice if you want something that no creator has made yet — something specific to you, this session, your imagination. It is built for listeners who have a clear idea of what they want and cannot find it anywhere, or who value the absolute privacy of the experience above the richness of a community feed. If those are your priorities, the creation flow at The Private Story is designed around them.`,
    },
    {
      h2: "Pricing and how The Private Story works",
      body: `The Private Story offers a Monthly subscription at £29/month (5 story generations) and an Annual subscription at £179/year (50 story generations). Additional stories can be generated for £3.99 each. Each story is a complete, private listening experience: your brief, a written narrative, professional AI narration, and original cover art, all stored securely in your private account.<br><br>There are no creators to follow, no community features to engage with, and no feed to browse. The value proposition is entirely the story itself — created for you, and for no one else. See the <a href="/pricing">pricing page</a> for full current details.`,
    },
  ],
  faqs: [
    {
      q: "What makes The Private Story different from a creator platform?",
      a: "The core difference is between discovering creators versus receiving a story created for you. On a creator platform, you find voices and content that exist and choose what to listen to. At The Private Story, you describe what you want and a story is written around that — by AI, from scratch, for this session. Nothing is retrieved from a library; everything is generated from your brief.",
    },
    {
      q: "Is everything on The Private Story private?",
      a: "Yes. Stories are stored in your private account and are not visible to anyone else. There are no public profiles, no shared listening history, no social features of any kind. The platform was built privacy-first — not as an add-on, but as the founding design principle.",
    },
    {
      q: "Is the content on The Private Story explicit?",
      a: "Yes. The Private Story supports the full spectrum from emotionally charged slow burn to fully explicit adult content, including dark romance and erotic fiction. Intensity is one of the seven choices you make before your story is written. All explicit content is available only to age-verified users aged 18 and over.",
    },
    {
      q: "How long does a personalised story take to receive?",
      a: "Most stories are generated and available to listen within a few minutes of completing the Casting Room. The brief itself typically takes under two minutes to complete.",
    },
    {
      q: "Can I use The Private Story alongside other audio platforms?",
      a: "Yes. Many listeners use more than one platform for different moods and purposes. The Private Story is particularly suited to when you want something written specifically for you, rather than discovered from what already exists.",
    },
  ],
};

export default function QuinnAlternative() {
  return <CompetitorPage config={config} />;
}
