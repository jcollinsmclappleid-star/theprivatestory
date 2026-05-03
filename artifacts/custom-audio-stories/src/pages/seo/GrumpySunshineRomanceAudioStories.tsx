import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("grumpy-sunshine-romance-audio-stories")!;

  export default function GrumpySunshineRomanceAudioStories() {
    return <SEOPage config={config} slug="grumpy-sunshine-romance-audio-stories" />;
  }
  