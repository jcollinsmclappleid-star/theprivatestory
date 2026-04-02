import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("best-audio-story-app-for-adults")!;

export default function BestAudioStoryAppForAdults() {
  return <SEOPage config={config} />;
}
