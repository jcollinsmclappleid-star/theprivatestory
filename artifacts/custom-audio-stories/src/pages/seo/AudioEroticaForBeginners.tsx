import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("audio-erotica-for-beginners")!;

  export default function AudioEroticaForBeginners() {
    return <SEOPage config={config} slug="audio-erotica-for-beginners" />;
  }
  