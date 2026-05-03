import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("dark-romantasy-audio-stories")!;

  export default function DarkRomantasyAudioStories() {
    return <SEOPage config={config} slug="dark-romantasy-audio-stories" />;
  }
  