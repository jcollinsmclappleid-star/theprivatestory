import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("relaxing-audio-stories")!;

export default function RelaxingAudioStories() {
  return <SEOPage config={config} />;
}
