import CompetitorPage, { type CompetitorPageConfig } from "@/components/CompetitorPage";

const config: CompetitorPageConfig = {
  slug: "dipsea-alternative",
  competitorName: "Dipsea",
  metaTitle: "Looking for a Dipsea Alternative? | The Private Story",
  metaDescription:
    "Exploring audio erotica beyond Dipsea? The Private Story writes your story from scratch — personalised to your mood, cast, and imagination. Completely private.",
  badge: "Compare",
  h1: "Looking for a Dipsea Alternative?",
  tagline:
    "Dipsea has built something genuinely good. If you want something different — a story written from scratch, around your imagination — that is what The Private Story is here for.",
  intro:
    "This page is written by The Private Story. We have a commercial interest in your choosing our platform — please weigh what we say here accordingly. What we can offer honestly is a clear account of what Dipsea does well, and what The Private Story was built to do.",
  sections: [
    {
      h2: "What Dipsea does well",
      body: `Dipsea has done genuinely important work for audio erotica. It launched in 2018 when the category was barely on the map, and it has built a substantial library of high-quality stories narrated by professional voice actors. The production values are high. The catalogue covers a real range — from slow burn romance to more explicit content — and the platform has been thoughtfully designed for women. If you want a curated library of professionally produced audio stories to browse and discover, Dipsea is a strong platform.`,
    },
    {
      h2: "What The Private Story is built for",
      body: `The Private Story starts from a different premise: rather than giving you a library to browse, it writes a story around you. Before anything is generated, you make seven creative choices — the pairing, the chemistry between the characters, the archetype, the setting, the intensity, the emotional mood, and the situation. Those choices become the brief. The story is then written, by AI, in service of exactly what you described.<br><br>The result is a story that has never existed before. It will not be recommended to other users, displayed on any public part of the platform, or used as training data. It belongs to you alone. See <a href="/personalised-audio-stories">personalised audio stories</a> for a full account of how this works, or <a href="/private-audio-stories">private audio stories</a> to understand the privacy architecture.`,
    },
    {
      h2: "Personalisation at The Private Story — what it actually means",
      body: `Personalisation at The Private Story is generative, not algorithmic. It does not mean a recommendation engine suggesting stories you might like based on listening history. It means the story is written from scratch, this session, around the choices you just made.<br><br>The Casting Room — the creation flow — offers over 220 situations across 11 dramatic categories, 28 emotional moods, 50+ country settings, 12 historical eras, 14 character archetypes, and nine distinct chemistry types. The combinations are effectively infinite. No two listeners receive the same story. No story is written in advance and retrieved. This is what <a href="/ai-audio-story-generator">AI audio story generation</a> makes possible that a curated library cannot.<br><br>If you have ever found yourself wanting something very specific — a particular dynamic, a precise emotional register, a scenario that exists in your imagination but not in any library — The Private Story was built for exactly that.`,
    },
    {
      h2: "Privacy as a core feature",
      body: `The Private Story was built privacy-first. There are no social features — no followers, no shared listening history, no public profiles. Your stories are stored privately in your account and are not visible to anyone else, including the platform operators. We do not sell data, run ads, or make listening history available to third parties.<br><br>For some listeners, the private nature of the content they want to explore makes this architecture meaningful rather than incidental. The platform was designed with that in mind from the start.`,
    },
    {
      h2: "What kind of listener chooses The Private Story over Dipsea",
      body: `Dipsea is the better choice if you value professional production, a curated library, and the pleasure of discovering stories that already exist. It is a strong platform for browsing, for regular listening across a diverse catalogue, and for listeners who want a polished out-of-the-box experience.<br><br>The Private Story is the better choice if what you want does not exist in any library — if your imagination is specific, if the scenario you have in mind is one no one has written for you, or if the privacy of the experience matters to you as much as the quality of the story. It is built for listeners who have found that even the best curated platforms do not quite reach what they are looking for. If that is you, the Casting Room was built for exactly that feeling.`,
    },
    {
      h2: "Pricing and what you get",
      body: `The Private Story offers two subscription tiers: Monthly at £29/month (5 story generations) and Annual at £179/year (50 story generations). Additional stories are available at £3.99 each. Every story includes the full creation flow — your brief, the written narrative, professional AI narration, and original cover art — saved privately to your account.<br><br>You are not paying for access to a library. You are paying for the generation of a story that has never been written before and will not be written for anyone else. Please see the <a href="/pricing">pricing page</a> for full details and any current offers.`,
    },
  ],
  faqs: [
    {
      q: "What makes The Private Story different from a curated audio platform?",
      a: "The core difference is generative versus curatorial. A curated platform selects from stories written in advance. The Private Story writes your story from scratch, around the choices you make before each session. Nothing is retrieved from a library — the story is created for this listening experience, based on what you just told us you want.",
    },
    {
      q: "How long does it take to get a personalised story?",
      a: "Most stories are generated and available to listen within a few minutes of completing the creation flow. The Casting Room — the step-by-step brief — typically takes under two minutes to complete.",
    },
    {
      q: "Is the content on The Private Story explicit?",
      a: "Yes. The Private Story supports the full spectrum from emotionally charged slow burn to fully explicit adult content, including dark romance and erotic fiction. Intensity is one of the choices you make in the creation flow — the story is calibrated to match what you selected. All explicit content is available only to age-verified users aged 18 and over.",
    },
    {
      q: "Can I listen to The Private Story alongside other platforms?",
      a: "Yes. Many listeners use more than one audio platform for different purposes. The Private Story is particularly suited to the moments when you want something created for you specifically, rather than chosen from what already exists.",
    },
    {
      q: "Does The Private Story have a free trial?",
      a: "Please check the current pricing page for any introductory offers. Availability may change over time.",
    },
  ],
};

export default function DipseaAlternative() {
  return <CompetitorPage config={config} />;
}
