import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("bedtime-audio-stories")!;

export default function BedtimeAudioStories() {
  return <SEOPage config={config} slug="bedtime-audio-stories" doorFilter={["quiet"]} showSecondaryDoors />;
}
