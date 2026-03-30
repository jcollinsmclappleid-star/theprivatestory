import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Layout } from "@/components/Layout";
import { AudioProvider } from "@/components/AudioProvider";
import { AuthModal } from "@/components/AuthModal";

import { useParams } from "wouter";
import Home from "@/pages/Home";
import Browse from "@/pages/Browse";
import Search from "@/pages/Search";
import StoryDetail from "@/pages/StoryDetail";
import Create from "@/pages/Create";
import Gift from "@/pages/Gift";
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
import NotFound from "@/pages/not-found";
import ResetPassword from "@/pages/ResetPassword";
import Contact from "@/pages/Contact";
import Pricing from "@/pages/Pricing";
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

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/admin" component={Admin} />
      <Route path="/admin/moderation" component={AdminModeration} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/browse" component={Browse} />
            <Route path="/search" component={Search} />
            <Route path="/story/:id" component={StoryDetail} />
            <Route path="/create" component={Create} />
            <Route path="/gift" component={Gift} />
            <Route path="/library" component={Library} />
            <Route path="/after-dark" component={AfterDark} />
            <Route path="/drift" component={Drift} />
            <Route path="/me" component={Profile} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/privacy-policy" component={PrivacyPolicy} />
            <Route path="/terms" component={Terms} />
            <Route path="/content-policy" component={ContentPolicy} />
            <Route path="/contact" component={Contact} />
            <Route path="/pricing" component={Pricing} />
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
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AudioProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthModal />
            <Router />
          </WouterRouter>
        </AudioProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
