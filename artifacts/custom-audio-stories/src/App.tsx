import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Layout } from "@/components/Layout";
import { AudioProvider } from "@/components/AudioProvider";

import Home from "@/pages/Home";
import Browse from "@/pages/Browse";
import SeriesList from "@/pages/SeriesList";
import SeriesDetail from "@/pages/SeriesDetail";
import Search from "@/pages/Search";
import StoryDetail from "@/pages/StoryDetail";
import Create from "@/pages/Create";
import Gift from "@/pages/Gift";
import Library from "@/pages/Library";
import Admin from "@/pages/Admin";
import AfterDark from "@/pages/AfterDark";
import Profile from "@/pages/Profile";
import Privacy from "@/pages/Privacy";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/admin" component={Admin} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/browse" component={Browse} />
            <Route path="/series" component={SeriesList} />
            <Route path="/series/:id" component={SeriesDetail} />
            <Route path="/search" component={Search} />
            <Route path="/story/:id" component={StoryDetail} />
            <Route path="/create" component={Create} />
            <Route path="/gift" component={Gift} />
            <Route path="/library" component={Library} />
            <Route path="/after-dark" component={AfterDark} />
            <Route path="/me" component={Profile} />
            <Route path="/privacy" component={Privacy} />
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
            <Router />
          </WouterRouter>
        </AudioProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
