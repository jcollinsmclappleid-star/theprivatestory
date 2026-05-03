import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("lesbian-audio-erotica")!;

  export default function LesbianAudioErotica() {
    return <SEOPage config={config} slug="lesbian-audio-erotica" />;
  }
  