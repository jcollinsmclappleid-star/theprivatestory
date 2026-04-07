import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("adult-audio-stories")!;

export default function AdultAudioStories() {
  return <SEOPage config={config} doorFilter={["dark"]} />;
}
