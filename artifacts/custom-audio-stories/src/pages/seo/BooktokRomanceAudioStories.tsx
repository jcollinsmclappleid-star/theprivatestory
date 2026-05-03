import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("booktok-romance-audio-stories")!;

  export default function BooktokRomanceAudioStories() {
    return <SEOPage config={config} slug="booktok-romance-audio-stories" />;
  }
  