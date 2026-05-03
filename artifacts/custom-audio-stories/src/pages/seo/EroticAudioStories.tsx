import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("erotic-audio-stories")!;

export default function EroticAudioStories() {
  return <SEOPage config={config} slug="erotic-audio-stories" doorFilter={["dark"]} />;
}
