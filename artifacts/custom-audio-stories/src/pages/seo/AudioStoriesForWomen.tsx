import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("audio-stories-for-women")!;

export default function AudioStoriesForWomen() {
  return <SEOPage config={config} doorFilter={["dark"]} />;
}
