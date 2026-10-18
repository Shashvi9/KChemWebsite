import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppButton from "@/components/WhatsAppButton";
import { warmUpApi } from "@/lib/apiConfig";

// Main pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SearchResults from "./pages/SearchResults";
import About from "./pages/About";
import Contact from "./pages/Contact";

// Dynamic pages for fully dynamic routing
import CategoryPage from "./pages/dynamic/CategoryPage";
import SubcategoryPage from "./pages/dynamic/SubcategoryPage";
import ProductPage from "./pages/ProductPage";

// Admin pages: loaded only when visited, so public visitors don't download them
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminLeads = lazy(() => import("@/pages/admin/AdminLeads"));

// apiGet already retries with timeouts (cold starts); don't multiply that here.
export const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false, staleTime: 60 * 60 * 1000 } } });

// Start waking the Render backend the moment the site opens, before the user reaches a product page.
warmUpApi();

/** The query client is passed in so the pre-renderer can seed it and the browser can hydrate it. */
const App = ({ queryClient }: { queryClient: QueryClient }) => {
  const isAdmin = useLocation().pathname.startsWith("/admin");
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="min-h-screen flex flex-col">
        <Header />
        <ScrollToTop />
        <main className="flex-1">
          <Routes>
            {/* Main routes */}
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Fully dynamic routes - 3 level hierarchy */}
            <Route path="/category/:categorySlug" element={<CategoryPage />} />
            <Route path="/category/:categorySlug/:subcategorySlug" element={<SubcategoryPage />} />
            <Route path="/products/:slug" element={<ProductPage />} />
            {/* Forms (powder/liquid) are separate subcategories now; old form URLs go up a level */}
            <Route path="/category/:categorySlug/:subcategorySlug/:formSlug" element={<Navigate to=".." relative="path" replace />} />

            {/* Redirects from old paths to new dynamic routes */}
            <Route path="/products" element={<Navigate to="/" replace />} />
            <Route path="/dyes-intermediates" element={<Navigate to="/category/dyes-intermediates" replace />} />
            <Route path="/food-pharma" element={<Navigate to="/category/food-pharma-colors" replace />} />
            <Route path="/shades-pigments" element={<Navigate to="/category/pigments" replace />} />
            <Route path="/category/shades-pigments" element={<Navigate to="/category/pigments" replace />} />
            {/* No cosmetics catalog in the DB yet: send buyers to an inquiry instead of an error */}
            <Route path="/varieties-cosmetics" element={<Navigate to="/contact?subject=Cosmetic%20colors" replace />} />
            <Route path="/category/varieties-cosmetics" element={<Navigate to="/contact?subject=Cosmetic%20colors" replace />} />

            {/* Admin */}
            <Route path="/admin/login" element={<Suspense fallback={null}><AdminLogin /></Suspense>} />
            <Route path="/admin/leads" element={<Suspense fallback={null}><AdminLeads /></Suspense>} />
            <Route path="/admin/requests" element={<Navigate to="/admin/leads" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/leads" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!isAdmin && <Footer />}
        {!isAdmin && <WhatsAppButton />}
      </div>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
