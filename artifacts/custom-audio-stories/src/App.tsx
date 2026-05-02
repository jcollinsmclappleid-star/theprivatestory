import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Layout } from "@/components/Layout";
import { AudioProvider } from "@/components/AudioProvider";
import { AuthModal } from "@/components/AuthModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CookieBanner } from "@/components/CookieBanner";

import { ScrollToTop } from "@/components/ScrollToTop";

import { useParams } from "wouter";

// Eager — small/critical pages that render the app shell on first paint.
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";

// Lazy — every other page is loaded on demand. This removes the create flow,
// admin, library, and SEO landing pages from the initial JS bundle so each
// route only pays for the code it actually needs.
const About = lazy(() => import("@/pages/About"));
const Browse = lazy(() => import("@/pages/Browse"));
const Search = lazy(() => import("@/pages/Search"));
const StoryDetail = lazy(() => import("@/pages/StoryDetail"));
const Create = lazy(() => import("@/pages/Create"));
const Library = lazy(() => import("@/pages/Library"));
const Admin = lazy(() => import("@/pages/Admin"));
const AdminModeration = lazy(() => import("@/pages/AdminModeration"));
const AfterDark = lazy(() => import("@/pages/AfterDark"));
const Drift = lazy(() => import("@/pages/Drift"));
const Profile = lazy(() => import("@/pages/Profile"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("@/pages/CookiePolicy"));
const Terms = lazy(() => import("@/pages/Terms"));
const ContentPolicy = lazy(() => import("@/pages/ContentPolicy"));
const RefundPolicy = lazy(() => import("@/pages/RefundPolicy"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Contact = lazy(() => import("@/pages/Contact"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const CheckoutSuccess = lazy(() => import("@/pages/CheckoutSuccess"));
const PersonalisedAudioStories = lazy(() => import("@/pages/seo/PersonalisedAudioStories"));
const PrivateAudioStories = lazy(() => import("@/pages/seo/PrivateAudioStories"));
const CreateYourOwnAudioStory = lazy(() => import("@/pages/seo/CreateYourOwnAudioStory"));
const SleepAudioStories = lazy(() => import("@/pages/seo/SleepAudioStories"));
const AIAudioStoryGenerator = lazy(() => import("@/pages/seo/AIAudioStoryGenerator"));
const BedtimeAudioStories = lazy(() => import("@/pages/seo/BedtimeAudioStories"));
const RelaxingAudioStories = lazy(() => import("@/pages/seo/RelaxingAudioStories"));
const RomanticAudioStories = lazy(() => import("@/pages/seo/RomanticAudioStories"));
const LoveStoriesAudio = lazy(() => import("@/pages/seo/LoveStoriesAudio"));
const EmotionalAudioStories = lazy(() => import("@/pages/seo/EmotionalAudioStories"));
const IntimateAudioStories = lazy(() => import("@/pages/seo/IntimateAudioStories"));
const LateNightAudioStories = lazy(() => import("@/pages/seo/LateNightAudioStories"));
const SlowBurnAudioStories = lazy(() => import("@/pages/seo/SlowBurnAudioStories"));
const ConfidentEnergyAudioStories = lazy(() => import("@/pages/seo/ConfidentEnergyAudioStories"));
const QuietIntensityAudioStories = lazy(() => import("@/pages/seo/QuietIntensityAudioStories"));
const DarkRomanceAudioStories = lazy(() => import("@/pages/seo/DarkRomanceAudioStories"));
const ForbiddenRomanceAudioStories = lazy(() => import("@/pages/seo/ForbiddenRomanceAudioStories"));
const EnemiesToLoversAudioStories = lazy(() => import("@/pages/seo/EnemiesToLoversAudioStories"));
const AdultAudioStories = lazy(() => import("@/pages/seo/AdultAudioStories"));
const AudioStoriesForWomen = lazy(() => import("@/pages/seo/AudioStoriesForWomen"));
const AudioStoriesVsAudiobooks = lazy(() => import("@/pages/seo/AudioStoriesVsAudiobooks"));
const AudioStoriesVsPodcasts = lazy(() => import("@/pages/seo/AudioStoriesVsPodcasts"));
const BestAudioStoryAppForAdults = lazy(() => import("@/pages/seo/BestAudioStoryAppForAdults"));
const AlternativesToRomanceAudiobooks = lazy(() => import("@/pages/seo/AlternativesToRomanceAudiobooks"));
const DipseaAlternative = lazy(() => import("@/pages/seo/DipseaAlternative"));
const QuinnAlternative = lazy(() => import("@/pages/seo/QuinnAlternative"));
const GoneWildAudioAlternative = lazy(() => import("@/pages/seo/GoneWildAudioAlternative"));
const AudioEroticaForWomen = lazy(() => import("@/pages/seo/AudioEroticaForWomen"));
const EroticAudioStoriesForWomen = lazy(() => import("@/pages/seo/EroticAudioStoriesForWomen"));
const PersonalisedErotica = lazy(() => import("@/pages/seo/PersonalisedErotica"));
const EroticAudioStories = lazy(() => import("@/pages/seo/EroticAudioStories"));
const AdultBedtimeStories = lazy(() => import("@/pages/seo/AdultBedtimeStories"));
const AIRomanceStoriesForWomen = lazy(() => import("@/pages/seo/AIRomanceStoriesForWomen"));
const SpicyAudioStories = lazy(() => import("@/pages/seo/SpicyAudioStories"));
const ForcedProximityRomanceAudioStories = lazy(() => import("@/pages/seo/ForcedProximityRomanceAudioStories"));
const BillionaireRomanceAudioStories = lazy(() => import("@/pages/seo/BillionaireRomanceAudioStories"));
const MafiaRomanceAudioStories = lazy(() => import("@/pages/seo/MafiaRomanceAudioStories"));
const MorallyGreyRomanceAudioStories = lazy(() => import("@/pages/seo/MorallyGreyRomanceAudioStories"));
const AgeGapRomanceAudioStories = lazy(() => import("@/pages/seo/AgeGapRomanceAudioStories"));
const FakeDatingRomanceAudioStories = lazy(() => import("@/pages/seo/FakeDatingRomanceAudioStories"));
const SecondChanceRomanceAudioStories = lazy(() => import("@/pages/seo/SecondChanceRomanceAudioStories"));
const GrumpySunshineRomanceAudioStories = lazy(() => import("@/pages/seo/GrumpySunshineRomanceAudioStories"));
const SingleDadRomanceAudioStories = lazy(() => import("@/pages/seo/SingleDadRomanceAudioStories"));
const RomantasyAudioStories = lazy(() => import("@/pages/seo/RomantasyAudioStories"));
const DarkRomantasyAudioStories = lazy(() => import("@/pages/seo/DarkRomantasyAudioStories"));
const BooktokRomanceAudioStories = lazy(() => import("@/pages/seo/BooktokRomanceAudioStories"));
const SmutAudioStories = lazy(() => import("@/pages/seo/SmutAudioStories"));
const SpicyReadsAudioStories = lazy(() => import("@/pages/seo/SpicyReadsAudioStories"));
const AudioEroticaUk = lazy(() => import("@/pages/seo/AudioEroticaUk"));
const BritishAudioEroticaForWomen = lazy(() => import("@/pages/seo/BritishAudioEroticaForWomen"));
const BestAudioEroticaAppUk = lazy(() => import("@/pages/seo/BestAudioEroticaAppUk"));
const AudioEroticaMaleVoiceBritish = lazy(() => import("@/pages/seo/AudioEroticaMaleVoiceBritish"));
const AudioEroticaForWomenOver30 = lazy(() => import("@/pages/seo/AudioEroticaForWomenOver30"));
const AudioEroticaForCouples = lazy(() => import("@/pages/seo/AudioEroticaForCouples"));
const LesbianAudioErotica = lazy(() => import("@/pages/seo/LesbianAudioErotica"));
const QueerAudioErotica = lazy(() => import("@/pages/seo/QueerAudioErotica"));
const ShortEroticAudioStories = lazy(() => import("@/pages/seo/ShortEroticAudioStories"));
const AudioEroticaWithMaleNarrator = lazy(() => import("@/pages/seo/AudioEroticaWithMaleNarrator"));
const SensualAudioStories = lazy(() => import("@/pages/seo/SensualAudioStories"));
const HowToListenToAudioErotica = lazy(() => import("@/pages/seo/HowToListenToAudioErotica"));
const AudioEroticaForBeginners = lazy(() => import("@/pages/seo/AudioEroticaForBeginners"));
const EroticAudiobooksForWomen = lazy(() => import("@/pages/seo/EroticAudiobooksForWomen"));
const OfficeRomanceAudioStories = lazy(() => import("@/pages/seo/OfficeRomanceAudioStories"));
const FerlyAlternative = lazy(() => import("@/pages/seo/FerlyAlternative"));
const SteamyAudioStories = lazy(() => import("@/pages/seo/SteamyAudioStories"));
const AIErotica = lazy(() => import("@/pages/seo/AIErotica"));
const Discover = lazy(() => import("@/pages/Discover"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const ThreeDoorsPage = lazy(() => import("@/pages/ThreeDoorsPage"));
const CreateMyStoryPage = lazy(() =>
  import("@/pages/ThreeDoorsPage").then((m) => ({ default: m.CreateMyStoryPage })),
);
const PurchaseConfirmed = lazy(() => import("@/pages/PurchaseConfirmed"));
// Listen / ListenPrivate / ListenAfterDark are intentionally not lazy-imported
// here — the routes redirect to /samples. The component files remain on disk
// for git history and can be deleted once the redirect is verified in prod.
const Samples = lazy(() => import("@/pages/Samples"));

const queryClient = new QueryClient();

// Lightweight fallback for lazy route loading. Matches the dark brand surface
// so there's no white flash between routes.
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-6 h-6 border-2 border-primary/25 border-t-primary rounded-full animate-spin" aria-label="Loading" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/admin" component={Admin} />
        <Route path="/admin/moderation" component={AdminModeration} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/purchase/confirmed" component={PurchaseConfirmed} />
        {/*
         * Old long-form sample routes (`/listen`, `/listen/private`,
         * `/listen/after-dark`) are retired in favour of the new central
         * Editor's Picks landing at `/samples`. The two long-form pieces
         * contained explicit Scene 4 content behind only a self-declaration
         * AgeGate — out of scope for the public surface under our editorial
         * standard. Components are kept in the codebase but no longer routed.
         */}
        <Route path="/listen/private"><Redirect to="/samples" /></Route>
        <Route path="/listen/after-dark"><Redirect to="/samples" /></Route>
        <Route path="/listen"><Redirect to="/samples" /></Route>
        <Route path="/samples" component={Samples} />
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
              <Route path="/signin"><Redirect to="/" /></Route>
              <Route path="/sign-in"><Redirect to="/" /></Route>
              <Route path="/login"><Redirect to="/" /></Route>
              <Route path="/signup"><Redirect to="/" /></Route>
              <Route path="/sign-up"><Redirect to="/" /></Route>
              <Route path="/library" component={Library} />
              <Route path="/after-dark" component={AfterDark} />
              <Route path="/drift" component={Drift} />
              <Route path="/me" component={Profile} />
              <Route path="/privacy" component={Privacy} />
              <Route path="/privacy-policy" component={PrivacyPolicy} />
              <Route path="/cookie-policy" component={CookiePolicy} />
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
              <Route path="/billionaire-romance-audio-stories" component={BillionaireRomanceAudioStories} />
              <Route path="/mafia-romance-audio-stories" component={MafiaRomanceAudioStories} />
              <Route path="/morally-grey-romance-audio-stories" component={MorallyGreyRomanceAudioStories} />
              <Route path="/age-gap-romance-audio-stories" component={AgeGapRomanceAudioStories} />
              <Route path="/fake-dating-romance-audio-stories" component={FakeDatingRomanceAudioStories} />
              <Route path="/second-chance-romance-audio-stories" component={SecondChanceRomanceAudioStories} />
              <Route path="/grumpy-sunshine-romance-audio-stories" component={GrumpySunshineRomanceAudioStories} />
              <Route path="/single-dad-romance-audio-stories" component={SingleDadRomanceAudioStories} />
              <Route path="/romantasy-audio-stories" component={RomantasyAudioStories} />
              <Route path="/dark-romantasy-audio-stories" component={DarkRomantasyAudioStories} />
              <Route path="/booktok-romance-audio-stories" component={BooktokRomanceAudioStories} />
              <Route path="/smut-audio-stories" component={SmutAudioStories} />
              <Route path="/spicy-reads-audio-stories" component={SpicyReadsAudioStories} />
              <Route path="/audio-erotica-uk" component={AudioEroticaUk} />
              <Route path="/british-audio-erotica-for-women" component={BritishAudioEroticaForWomen} />
              <Route path="/best-audio-erotica-app-uk" component={BestAudioEroticaAppUk} />
              <Route path="/audio-erotica-male-voice-british" component={AudioEroticaMaleVoiceBritish} />
              <Route path="/audio-erotica-for-women-over-30" component={AudioEroticaForWomenOver30} />
              <Route path="/audio-erotica-for-couples" component={AudioEroticaForCouples} />
              <Route path="/lesbian-audio-erotica" component={LesbianAudioErotica} />
              <Route path="/queer-audio-erotica" component={QueerAudioErotica} />
              <Route path="/short-erotic-audio-stories" component={ShortEroticAudioStories} />
              <Route path="/audio-erotica-with-male-narrator" component={AudioEroticaWithMaleNarrator} />
              <Route path="/sensual-audio-stories" component={SensualAudioStories} />
              <Route path="/how-to-listen-to-audio-erotica" component={HowToListenToAudioErotica} />
              <Route path="/audio-erotica-for-beginners" component={AudioEroticaForBeginners} />
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
    </Suspense>
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
          <WouterRouter>
            <ScrollToTop />
            <AudioProvider>
              <Router />
              <AuthModal />
              <CookieBanner />
              <Toaster />
            </AudioProvider>
          </WouterRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
