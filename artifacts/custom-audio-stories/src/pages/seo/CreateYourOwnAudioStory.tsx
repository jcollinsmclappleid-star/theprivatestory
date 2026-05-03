import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("create-your-own-audio-story")!;

export default function CreateYourOwnAudioStory() {
  return <SEOPage config={config} slug="create-your-own-audio-story" doorFilter={["dark"]} />;
}
