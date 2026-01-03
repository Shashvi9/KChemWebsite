import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ScrollToTop from "@/components/ScrollToTop";

// Main pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SearchResults from "./pages/SearchResults";
import About from "./pages/About";
import Contact from "./pages/Contact";

// Dynamic pages for fully dynamic routing
import CategoryPage from "./pages/dynamic/CategoryPage";
import SubcategoryPage from "./pages/dynamic/SubcategoryPage";
import FormPage from "./pages/dynamic/FormPage";

// Admin pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminRequests from "@/pages/admin/AdminRequests";

const queryClient = new QueryClient();

const App = () => (
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
            <Route path="/category/:categorySlug/:subcategorySlug/:formSlug" element={<FormPage />} />

            {/* Redirects from old paths to new dynamic routes */}
            <Route path="/products" element={<Navigate to="/" replace />} />
            <Route path="/dyes-intermediates" element={<Navigate to="/category/dyes-intermediates" replace />} />
            <Route path="/food-pharma" element={<Navigate to="/category/food-pharma-colors" replace />} />
            <Route path="/shades-pigments" element={<Navigate to="/category/shades-pigments" replace />} />
            <Route path="/varieties-cosmetics" element={<Navigate to="/category/varieties-cosmetics" replace />} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/requests" element={<AdminRequests />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
