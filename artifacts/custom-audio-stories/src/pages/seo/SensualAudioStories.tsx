import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("sensual-audio-stories")!;

  export default function SensualAudioStories() {
    return <SEOPage config={config} slug="sensual-audio-stories" />;
  }
  