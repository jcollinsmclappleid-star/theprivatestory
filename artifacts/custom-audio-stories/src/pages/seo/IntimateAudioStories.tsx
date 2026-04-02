import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("intimate-audio-stories")!;

export default function IntimateAudioStories() {
  return <SEOPage config={config} />;
}
