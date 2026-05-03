import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("private-audio-stories")!;

export default function PrivateAudioStories() {
  return <SEOPage config={config} slug="private-audio-stories" doorFilter={["dark"]} />;
}
