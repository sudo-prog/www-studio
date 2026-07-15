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
import { AppLayout } from "@/components/layout/AppLayout";
import Gallery from "@/pages/gallery";
import Scenes from "@/pages/scenes";
import SceneEditor from "@/pages/scene-editor";
import ScenePreview from "@/pages/scene-preview";
import SceneShare from "@/pages/scene-share";
import SceneGallery from "@/pages/scene-gallery";
import FreeformEditor from "@/pages/freeform-editor";
import FreeformShare from "@/pages/freeform-share";
import DesignExtractPage from "@/pages/DesignExtractPage";
import DesignExtractGallery from "@/pages/DesignExtractGallery";
import DesignExtractCompare from "@/pages/DesignExtractCompare";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/"><AppLayout><Home /></AppLayout></Route>
      <Route path="/projects"><AppLayout><Dashboard /></AppLayout></Route>
      <Route path="/ui-library"><AppLayout><Components /></AppLayout></Route>
      <Route path="/editor/new"><AppLayout><NewProject /></AppLayout></Route>
      {/* Full-screen editor / share / preview pages render their own header (with a
          working Back control) so a bare variant is used — no double navbar. */}
      <Route path="/editor/:projectId"><AppLayout variant="bare"><Editor /></AppLayout></Route>
      <Route path="/profile"><AppLayout><Profile /></AppLayout></Route>
      <Route path="/gallery"><AppLayout><Gallery /></AppLayout></Route>
      <Route path="/scenes"><AppLayout><Scenes /></AppLayout></Route>
      <Route path="/scenes/gallery"><AppLayout><SceneGallery /></AppLayout></Route>
      <Route path="/scenes/:id"><AppLayout variant="bare"><SceneEditor /></AppLayout></Route>
      <Route path="/scenes/:id/preview"><AppLayout variant="bare"><ScenePreview /></AppLayout></Route>
      <Route path="/scenes/:id/share"><AppLayout variant="bare"><SceneShare /></AppLayout></Route>
      <Route path="/freeform/:projectId?"><AppLayout variant="bare"><FreeformEditor /></AppLayout></Route>
      <Route path="/freeform/:pageId/share"><AppLayout variant="bare"><FreeformShare /></AppLayout></Route>
      <Route path="/design-extract"><AppLayout><DesignExtractPage /></AppLayout></Route>
      <Route path="/design-extract/gallery"><AppLayout><DesignExtractGallery /></AppLayout></Route>
      <Route path="/design-extract/:id/compare"><AppLayout><DesignExtractCompare /></AppLayout></Route>
      <Route path="/design-extract/:id"><AppLayout><DesignExtractPage /></AppLayout></Route>
      <Route><AppLayout><NotFound /></AppLayout></Route>
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