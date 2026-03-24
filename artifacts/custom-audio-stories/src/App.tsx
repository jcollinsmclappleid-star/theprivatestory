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
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/browse" component={Browse} />
        <Route path="/series" component={SeriesList} />
        <Route path="/series/:id" component={SeriesDetail} />
        <Route path="/search" component={Search} />
        <Route path="/story/:id" component={StoryDetail} />
        <Route path="/create" component={Create} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
