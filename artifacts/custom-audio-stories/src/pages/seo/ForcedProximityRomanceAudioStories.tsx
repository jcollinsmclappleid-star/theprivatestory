import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("forced-proximity-romance-audio-stories")!;

export default function ForcedProximityRomanceAudioStories() {
  return <SEOPage config={config} slug="forced-proximity-romance-audio-stories" />;
}
