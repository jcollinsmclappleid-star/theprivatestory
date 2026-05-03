import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("enemies-to-lovers-audio-stories")!;

export default function EnemiesToLoversAudioStories() {
  return <SEOPage config={config} slug="enemies-to-lovers-audio-stories" doorFilter={["dark"]} />;
}
