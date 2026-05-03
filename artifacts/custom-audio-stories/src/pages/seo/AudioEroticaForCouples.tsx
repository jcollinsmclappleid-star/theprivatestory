import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("audio-erotica-for-couples")!;

  export default function AudioEroticaForCouples() {
    return <SEOPage config={config} slug="audio-erotica-for-couples" />;
  }
  