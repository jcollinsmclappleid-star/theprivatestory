import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Layout } from "@/components/Layout";
import { AudioProvider } from "@/components/AudioProvider";
import { AuthModal } from "@/components/AuthModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { ScrollToTop } from "@/components/ScrollToTop";

import { useParams } from "wouter";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Browse from "@/pages/Browse";
import Search from "@/pages/Search";
import StoryDetail from "@/pages/StoryDetail";
import Create from "@/pages/Create";
import Library from "@/pages/Library";
import Admin from "@/pages/Admin";
import AdminModeration from "@/pages/AdminModeration";
import AfterDark from "@/pages/AfterDark";
import Drift from "@/pages/Drift";
import Profile from "@/pages/Profile";
import Privacy from "@/pages/Privacy";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";
import ContentPolicy from "@/pages/ContentPolicy";
import RefundPolicy from "@/pages/RefundPolicy";
import NotFound from "@/pages/not-found";
import ResetPassword from "@/pages/ResetPassword";
import Contact from "@/pages/Contact";
import Pricing from "@/pages/Pricing";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import PersonalisedAudioStories from "@/pages/seo/PersonalisedAudioStories";
import PrivateAudioStories from "@/pages/seo/PrivateAudioStories";
import CreateYourOwnAudioStory from "@/pages/seo/CreateYourOwnAudioStory";
import SleepAudioStories from "@/pages/seo/SleepAudioStories";
import AIAudioStoryGenerator from "@/pages/seo/AIAudioStoryGenerator";
import BedtimeAudioStories from "@/pages/seo/BedtimeAudioStories";
import RelaxingAudioStories from "@/pages/seo/RelaxingAudioStories";
import RomanticAudioStories from "@/pages/seo/RomanticAudioStories";
import LoveStoriesAudio from "@/pages/seo/LoveStoriesAudio";
import EmotionalAudioStories from "@/pages/seo/EmotionalAudioStories";
import IntimateAudioStories from "@/pages/seo/IntimateAudioStories";
import LateNightAudioStories from "@/pages/seo/LateNightAudioStories";
import SlowBurnAudioStories from "@/pages/seo/SlowBurnAudioStories";
import ConfidentEnergyAudioStories from "@/pages/seo/ConfidentEnergyAudioStories";
import QuietIntensityAudioStories from "@/pages/seo/QuietIntensityAudioStories";
import DarkRomanceAudioStories from "@/pages/seo/DarkRomanceAudioStories";
import ForbiddenRomanceAudioStories from "@/pages/seo/ForbiddenRomanceAudioStories";
import EnemiesToLoversAudioStories from "@/pages/seo/EnemiesToLoversAudioStories";
import AdultAudioStories from "@/pages/seo/AdultAudioStories";
import AudioStoriesForWomen from "@/pages/seo/AudioStoriesForWomen";
import AudioStoriesVsAudiobooks from "@/pages/seo/AudioStoriesVsAudiobooks";
import AudioStoriesVsPodcasts from "@/pages/seo/AudioStoriesVsPodcasts";
import BestAudioStoryAppForAdults from "@/pages/seo/BestAudioStoryAppForAdults";
import AlternativesToRomanceAudiobooks from "@/pages/seo/AlternativesToRomanceAudiobooks";
import DipseaAlternative from "@/pages/seo/DipseaAlternative";
import QuinnAlternative from "@/pages/seo/QuinnAlternative";
import GoneWildAudioAlternative from "@/pages/seo/GoneWildAudioAlternative";
import AudioEroticaForWomen from "@/pages/seo/AudioEroticaForWomen";
import EroticAudioStoriesForWomen from "@/pages/seo/EroticAudioStoriesForWomen";
import PersonalisedErotica from "@/pages/seo/PersonalisedErotica";
import EroticAudioStories from "@/pages/seo/EroticAudioStories";
import AdultBedtimeStories from "@/pages/seo/AdultBedtimeStories";
import AIRomanceStoriesForWomen from "@/pages/seo/AIRomanceStoriesForWomen";
import SpicyAudioStories from "@/pages/seo/SpicyAudioStories";
import ForcedProximityRomanceAudioStories from "@/pages/seo/ForcedProximityRomanceAudioStories";
import EroticAudiobooksForWomen from "@/pages/seo/EroticAudiobooksForWomen";
import OfficeRomanceAudioStories from "@/pages/seo/OfficeRomanceAudioStories";
import FerlyAlternative from "@/pages/seo/FerlyAlternative";
import SteamyAudioStories from "@/pages/seo/SteamyAudioStories";
import AIErotica from "@/pages/seo/AIErotica";
import Discover from "@/pages/Discover";
import HowItWorks from "@/pages/HowItWorks";
import ThreeDoorsPage, { CreateMyStoryPage } from "@/pages/ThreeDoorsPage";
import PurchaseConfirmed from "@/pages/PurchaseConfirmed";
import Listen from "@/pages/Listen";
import ListenPrivate from "@/pages/ListenPrivate";
import ListenAfterDark from "@/pages/ListenAfterDark";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/admin" component={Admin} />
      <Route path="/admin/moderation" component={AdminModeration} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/purchase/confirmed" component={PurchaseConfirmed} />
      <Route path="/listen/private" component={ListenPrivate} />
      <Route path="/listen/after-dark" component={ListenAfterDark} />
      <Route path="/listen" component={Listen} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/browse" component={Browse} />
            <Route path="/search" component={Search} />
            <Route path="/story/:id" component={StoryDetail} />
            <Route path="/create" component={Create} />
            <Route path="/gift"><Redirect to="/" /></Route>
            <Route path="/library" component={Library} />
            <Route path="/after-dark" component={AfterDark} />
            <Route path="/drift" component={Drift} />
            <Route path="/me" component={Profile} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/privacy-policy" component={PrivacyPolicy} />
            <Route path="/terms" component={Terms} />
            <Route path="/content-policy" component={ContentPolicy} />
            <Route path="/refund-policy" component={RefundPolicy} />
            <Route path="/contact" component={Contact} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/the-three-doors" component={ThreeDoorsPage} />
            <Route path="/create-my-story" component={CreateMyStoryPage} />
            <Route path="/checkout/success" component={CheckoutSuccess} />
            <Route path="/personalised-audio-stories" component={PersonalisedAudioStories} />
            <Route path="/private-audio-stories" component={PrivateAudioStories} />
            <Route path="/create-your-own-audio-story" component={CreateYourOwnAudioStory} />
            <Route path="/sleep-audio-stories" component={SleepAudioStories} />
            <Route path="/ai-audio-story-generator" component={AIAudioStoryGenerator} />
            <Route path="/bedtime-audio-stories" component={BedtimeAudioStories} />
            <Route path="/relaxing-audio-stories" component={RelaxingAudioStories} />
            <Route path="/romantic-audio-stories" component={RomanticAudioStories} />
            <Route path="/love-stories-audio" component={LoveStoriesAudio} />
            <Route path="/emotional-audio-stories" component={EmotionalAudioStories} />
            <Route path="/intimate-audio-stories" component={IntimateAudioStories} />
            <Route path="/late-night-audio-stories" component={LateNightAudioStories} />
            <Route path="/slow-burn-audio-stories" component={SlowBurnAudioStories} />
            <Route path="/confident-energy-stories" component={ConfidentEnergyAudioStories} />
            <Route path="/quiet-intensity-stories" component={QuietIntensityAudioStories} />
            <Route path="/dark-romance-audio-stories" component={DarkRomanceAudioStories} />
            <Route path="/forbidden-romance-audio-stories" component={ForbiddenRomanceAudioStories} />
            <Route path="/enemies-to-lovers-audio-stories" component={EnemiesToLoversAudioStories} />
            <Route path="/adult-audio-stories" component={AdultAudioStories} />
            <Route path="/audio-stories-for-women" component={AudioStoriesForWomen} />
            <Route path="/audio-stories-vs-audiobooks" component={AudioStoriesVsAudiobooks} />
            <Route path="/audio-stories-vs-podcasts" component={AudioStoriesVsPodcasts} />
            <Route path="/best-audio-story-app-for-adults" component={BestAudioStoryAppForAdults} />
            <Route path="/alternatives-to-romance-audiobooks" component={AlternativesToRomanceAudiobooks} />
            <Route path="/dipsea-alternative" component={DipseaAlternative} />
            <Route path="/quinn-alternative" component={QuinnAlternative} />
            <Route path="/gonewildaudio-alternative" component={GoneWildAudioAlternative} />
            <Route path="/audio-erotica-for-women" component={AudioEroticaForWomen} />
            <Route path="/erotic-audio-stories-for-women" component={EroticAudioStoriesForWomen} />
            <Route path="/personalised-erotica" component={PersonalisedErotica} />
            <Route path="/erotic-audio-stories" component={EroticAudioStories} />
            <Route path="/adult-bedtime-stories" component={AdultBedtimeStories} />
            <Route path="/ai-romance-stories-for-women" component={AIRomanceStoriesForWomen} />
            <Route path="/spicy-audio-stories" component={SpicyAudioStories} />
            <Route path="/forced-proximity-romance-audio-stories" component={ForcedProximityRomanceAudioStories} />
            <Route path="/erotic-audiobooks-for-women" component={EroticAudiobooksForWomen} />
            <Route path="/office-romance-audio-stories" component={OfficeRomanceAudioStories} />
            <Route path="/ferly-alternative" component={FerlyAlternative} />
            <Route path="/steamy-audio-stories" component={SteamyAudioStories} />
            <Route path="/ai-erotica" component={AIErotica} />
            <Route path="/discover" component={Discover} />
            <Route path="/how-it-works" component={HowItWorks} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  useEffect(() => {
    const el = document.getElementById("tps-static-about");
    if (el) el.hidden = true;
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AudioProvider>
            <WouterRouter base={(() => {
              const builtBase = import.meta.env.BASE_URL.replace(/\/$/, "");
              return (builtBase && window.location.pathname.startsWith(builtBase)) ? builtBase : "";
            })()}>
              <ScrollToTop />
              <AuthModal />
              <Router />
            </WouterRouter>
          </AudioProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
