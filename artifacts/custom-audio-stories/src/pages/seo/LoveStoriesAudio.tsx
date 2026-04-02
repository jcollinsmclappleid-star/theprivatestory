import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("love-stories-audio")!;

export default function LoveStoriesAudio() {
  return <SEOPage config={config} />;
}
