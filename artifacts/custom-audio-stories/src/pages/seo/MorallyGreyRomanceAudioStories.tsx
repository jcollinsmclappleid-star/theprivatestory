import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("morally-grey-romance-audio-stories")!;

  export default function MorallyGreyRomanceAudioStories() {
    return <SEOPage config={config} />;
  }
  