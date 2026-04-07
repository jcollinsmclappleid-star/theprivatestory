import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("audio-erotica-for-women")!;

export default function AudioEroticaForWomen() {
  return <SEOPage config={config} doorFilter={["dark"]} />;
}
