import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("sleep-audio-stories")!;

export default function SleepAudioStories() {
  return <SEOPage config={config} doorFilter={["quiet"]} showSecondaryDoors />;
}
