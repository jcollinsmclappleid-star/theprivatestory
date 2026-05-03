import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("romantic-audio-stories")!;

export default function RomanticAudioStories() {
  return <SEOPage config={config} slug="romantic-audio-stories" doorFilter={["dark"]} />;
}
