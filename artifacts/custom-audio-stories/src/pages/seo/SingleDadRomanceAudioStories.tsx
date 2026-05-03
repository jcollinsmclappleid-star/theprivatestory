import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("single-dad-romance-audio-stories")!;

  export default function SingleDadRomanceAudioStories() {
    return <SEOPage config={config} slug="single-dad-romance-audio-stories" />;
  }
  