import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("age-gap-romance-audio-stories")!;

  export default function AgeGapRomanceAudioStories() {
    return <SEOPage config={config} />;
  }
  