import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("confident-energy-stories")!;

export default function ConfidentEnergyAudioStories() {
  return <SEOPage config={config} />;
}
