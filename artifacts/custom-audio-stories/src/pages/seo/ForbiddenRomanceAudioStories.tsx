import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("forbidden-romance-audio-stories")!;

export default function ForbiddenRomanceAudioStories() {
  return <SEOPage config={config} slug="forbidden-romance-audio-stories" doorFilter={["dark"]} />;
}
