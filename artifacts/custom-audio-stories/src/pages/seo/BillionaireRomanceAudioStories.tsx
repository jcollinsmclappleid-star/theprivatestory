import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("billionaire-romance-audio-stories")!;

  export default function BillionaireRomanceAudioStories() {
    return <SEOPage config={config} />;
  }
  