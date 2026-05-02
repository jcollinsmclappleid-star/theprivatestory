import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("romantasy-audio-stories")!;

  export default function RomantasyAudioStories() {
    return <SEOPage config={config} />;
  }
  