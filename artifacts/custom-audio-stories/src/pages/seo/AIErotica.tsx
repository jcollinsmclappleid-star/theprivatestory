import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("ai-erotica")!;

export default function AIErotica() {
  return <SEOPage config={config} doorFilter={["dark"]} />;
}
