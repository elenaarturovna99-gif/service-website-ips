
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Brand from "./pages/Brand";
import Privacy from "./pages/Privacy";
import ServicePage from "./pages/ServicePage";
import Articles from "./pages/Articles";
import ArticlePage from "./pages/ArticlePage";
import Cases from "./pages/Cases";
import CasePage from "./pages/CasePage";
import DzenKit from "./pages/DzenKit";
import RouteTracker from "./components/RouteTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteTracker />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/logo" element={<Brand />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/uslugi/:slug" element={<ServicePage />} />
          <Route path="/stati" element={<Articles />} />
          <Route path="/stati/:slug" element={<ArticlePage />} />
          <Route path="/kejsy" element={<Cases />} />
          <Route path="/kejsy/:slug" element={<CasePage />} />
          <Route path="/dzen-kit" element={<DzenKit />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;