import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("fake-dating-romance-audio-stories")!;

  export default function FakeDatingRomanceAudioStories() {
    return <SEOPage config={config} />;
  }
  