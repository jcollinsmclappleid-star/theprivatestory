import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("alternatives-to-romance-audiobooks")!;

export default function AlternativesToRomanceAudiobooks() {
  return <SEOPage config={config} doorFilter={["dark"]} />;
}
