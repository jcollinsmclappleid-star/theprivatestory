import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("steamy-audio-stories")!;

export default function SteamyAudioStories() {
  return <SEOPage config={config} slug="steamy-audio-stories" doorFilter={["dark"]} />;
}
