import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("audio-stories-vs-podcasts")!;

export default function AudioStoriesVsPodcasts() {
  return <SEOPage config={config} doorFilter={["dark"]} />;
}
