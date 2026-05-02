import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("audio-erotica-uk")!;

  export default function AudioEroticaUk() {
    return <SEOPage config={config} />;
  }
  