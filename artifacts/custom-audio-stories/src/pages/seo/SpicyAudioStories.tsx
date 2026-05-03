import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("spicy-audio-stories")!;

export default function SpicyAudioStories() {
  return <SEOPage config={config} slug="spicy-audio-stories" doorFilter={["dark"]} />;
}
