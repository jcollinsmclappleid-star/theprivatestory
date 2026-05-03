import SEOPage from "@/components/SEOPage";
  import { getPageConfig } from "@workspace/seo-data";

  const config = getPageConfig("audio-erotica-for-women-over-30")!;

  export default function AudioEroticaForWomenOver30() {
    return <SEOPage config={config} slug="audio-erotica-for-women-over-30" />;
  }
  