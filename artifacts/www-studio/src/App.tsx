import { Switch, Route, Router as WouterRouter } from "wouter";
import { useState, useCallback, useEffect } from "react";

function useHashLocation(): [string, (to: string) => void] {
  const [location, setLocation] = useState(window.location.hash.slice(1) || "/");
  useEffect(() => {
    const handler = () => setLocation(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  const navigate = useCallback((to: string) => { window.location.hash = to; }, []);
  return [location, navigate];
}
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import NewProject from "@/pages/new-project";
import Editor from "@/pages/editor";
import Profile from "@/pages/profile";
import Components from "@/pages/components";
import Gallery from "@/pages/gallery";
import Scenes from "@/pages/scenes";
import SceneEditor from "@/pages/scene-editor";
import ScenePreview from "@/pages/scene-preview";
import SceneShare from "@/pages/scene-share";
import FreeformEditor from "@/pages/freeform-editor";
import FreeformShare from "@/pages/freeform-share";
import DesignExtractPage from "@/pages/DesignExtractPage";
import DesignExtractGallery from "@/pages/DesignExtractGallery";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects" component={Dashboard} />
      <Route path="/ui-library" component={Components} />
      <Route path="/editor/new" component={NewProject} />
      <Route path="/editor/:projectId" component={Editor} />
      <Route path="/profile" component={Profile} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/scenes" component={Scenes} />
      <Route path="/scenes/:id" component={SceneEditor} />
      <Route path="/scenes/:id/preview" component={ScenePreview} />
      <Route path="/scenes/:id/share" component={SceneShare} />
      <Route path="/freeform/:projectId?" component={FreeformEditor} />
      <Route path="/freeform/:pageId/share" component={FreeformShare} />
      <Route path="/design-extract" component={DesignExtractPage} />
      <Route path="/design-extract/gallery" component={DesignExtractGallery} />
      <Route path="/design-extract/:id" component={DesignExtractPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="www-studio-theme">
        <TooltipProvider>
          <ErrorBoundary>
            <WouterRouter hook={useHashLocation}>
              <Router />
            </WouterRouter>
            <Toaster />
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;