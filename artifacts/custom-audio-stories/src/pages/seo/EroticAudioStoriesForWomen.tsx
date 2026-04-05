import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("erotic-audio-stories-for-women")!;

export default function EroticAudioStoriesForWomen() {
  return <SEOPage config={config} />;
}
