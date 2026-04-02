import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("late-night-audio-stories")!;

export default function LateNightAudioStories() {
  return <SEOPage config={config} />;
}
