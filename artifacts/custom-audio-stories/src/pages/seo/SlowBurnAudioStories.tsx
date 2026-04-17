import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("slow-burn-audio-stories")!;

export default function SlowBurnAudioStories() {
  return <SEOPage config={config} doorFilter={["dark"]} />;
}
