import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("british-audio-erotica-for-women")!;

  export default function BritishAudioEroticaForWomen() {
    return <SEOPage config={config} slug="british-audio-erotica-for-women" />;
  }
  