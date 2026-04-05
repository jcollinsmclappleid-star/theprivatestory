import SEOPage from "@/components/SEOPage";
import { getPageConfig } from "@workspace/seo-data";

const config = getPageConfig("office-romance-audio-stories")!;

export default function OfficeRomanceAudioStories() {
  return <SEOPage config={config} />;
}
