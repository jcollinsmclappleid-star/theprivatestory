import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("how-to-listen-to-audio-erotica")!;

  export default function HowToListenToAudioErotica() {
    return <SEOPage config={config} />;
  }
  