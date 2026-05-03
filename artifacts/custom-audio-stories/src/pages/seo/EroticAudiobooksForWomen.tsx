import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("erotic-audiobooks-for-women")!;

export default function EroticAudiobooksForWomen() {
  return <SEOPage config={config} slug="erotic-audiobooks-for-women" doorFilter={["dark"]} />;
}
