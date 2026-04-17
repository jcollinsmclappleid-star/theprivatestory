import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("quiet-intensity-stories")!;

export default function QuietIntensityAudioStories() {
  return <SEOPage config={config} doorFilter={["dark"]} />;
}
