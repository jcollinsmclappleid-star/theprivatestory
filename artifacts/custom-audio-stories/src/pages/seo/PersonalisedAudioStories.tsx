import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("personalised-audio-stories")!;

export default function PersonalisedAudioStories() {
  return <SEOPage config={config} doorFilter={["dark"]} />;
}
