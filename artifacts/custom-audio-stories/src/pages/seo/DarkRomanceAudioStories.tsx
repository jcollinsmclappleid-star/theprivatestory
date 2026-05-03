import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("dark-romance-audio-stories")!;

export default function DarkRomanceAudioStories() {
  return <SEOPage config={config} slug="dark-romance-audio-stories" doorFilter={["dark"]} />;
}
