import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("spicy-reads-audio-stories")!;

  export default function SpicyReadsAudioStories() {
    return <SEOPage config={config} />;
  }
  