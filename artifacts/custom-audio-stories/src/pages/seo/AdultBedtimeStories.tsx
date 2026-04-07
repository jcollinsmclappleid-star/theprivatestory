import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("adult-bedtime-stories")!;

export default function AdultBedtimeStories() {
  return <SEOPage config={config} doorFilter={["quiet"]} showSecondaryDoors />;
}
