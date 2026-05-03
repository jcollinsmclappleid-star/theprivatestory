import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("emotional-audio-stories")!;

export default function EmotionalAudioStories() {
  return <SEOPage config={config} slug="emotional-audio-stories" doorFilter={["dark"]} />;
}
