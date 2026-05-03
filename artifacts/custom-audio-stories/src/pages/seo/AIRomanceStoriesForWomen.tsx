import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("ai-romance-stories-for-women")!;

export default function AIRomanceStoriesForWomen() {
  return <SEOPage config={config} slug="ai-romance-stories-for-women" doorFilter={["dark"]} />;
}
