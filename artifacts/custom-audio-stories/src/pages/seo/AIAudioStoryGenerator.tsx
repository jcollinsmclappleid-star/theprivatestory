import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("ai-audio-story-generator")!;

export default function AIAudioStoryGenerator() {
  return <SEOPage config={config} slug="ai-audio-story-generator" doorFilter={["dark"]} />;
}
