import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("mafia-romance-audio-stories")!;

  export default function MafiaRomanceAudioStories() {
    return <SEOPage config={config} />;
  }
  