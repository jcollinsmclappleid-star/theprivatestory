import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("audio-stories-vs-audiobooks")!;

export default function AudioStoriesVsAudiobooks() {
  return <SEOPage config={config} slug="audio-stories-vs-audiobooks" doorFilter={["dark"]} />;
}
