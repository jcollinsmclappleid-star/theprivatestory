import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("personalised-erotica")!;

export default function PersonalisedErotica() {
  return <SEOPage config={config} slug="personalised-erotica" doorFilter={["dark"]} />;
}
