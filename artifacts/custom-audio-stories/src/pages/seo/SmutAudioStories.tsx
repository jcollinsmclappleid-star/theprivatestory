import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("smut-audio-stories")!;

  export default function SmutAudioStories() {
    return <SEOPage config={config} slug="smut-audio-stories" />;
  }
  