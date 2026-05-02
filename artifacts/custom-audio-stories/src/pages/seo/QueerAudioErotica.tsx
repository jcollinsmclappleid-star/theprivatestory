import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("queer-audio-erotica")!;

  export default function QueerAudioErotica() {
    return <SEOPage config={config} />;
  }
  