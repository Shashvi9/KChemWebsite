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
import DyesIntermediates from "./pages/DyesIntermediates";
import FoodPharma from "./pages/FoodPharma";
import ShadesPigments from "./pages/ShadesPigments";
import VarietiesCosmetics from "./pages/VarietiesCosmetics";
import SearchResults from "./pages/SearchResults";
import ProductSegment from "./pages/ProductSegment";
import About from "./pages/About";
import News from "./pages/News";
import Contact from "./pages/Contact";

// Dyes & Intermediates sub-pages
import BasicDyes from "./pages/dyes-intermediates/BasicDyes";
import FoodLakeColor from "./pages/dyes-intermediates/FoodLakeColor";
import ReactiveDyes from "./pages/dyes-intermediates/ReactiveDyes";
import AcidDyes from "./pages/dyes-intermediates/AcidDyes";


// Food & Pharma sub-pages
import VeterinaryFormulation from "./pages/food-pharma/VeterinaryFormulation";
import TabletsCapsules from "./pages/food-pharma/TabletsCapsules";
import Nutraceuticals from "./pages/food-pharma/Nutraceuticals";
import NasalDropsOralSuspensions from "./pages/food-pharma/NasalDropsOralSuspensions";
import InjectableOintments from "./pages/food-pharma/InjectableOintments";

// Shades & Pigments sub-pages
import OrganicPigments from "./pages/shades-pigments/OrganicPigments";

// Varieties & Cosmetics sub-pages
import EssentialOil from "./pages/varieties-cosmetics/EssentialOil";

// Tables Detail Pages
import AcidDyeDetail from "@/pages/dyes-intermediates/tables/fetchAcidDyesDatafile/AcidDyeDetail";
import DyeDetail from "@/pages/dyes-intermediates/tables/fetchAcidDyesDatafile/DyeDetail";
import LevellingDyesDetail from "@/pages/dyes-intermediates/tables/fetchAcidDyesDatafile/LevellingDyesDetail";
import MetalComplex1_1Detail from "@/pages/dyes-intermediates/tables/fetchAcidDyesDatafile/MetalComplex1_1Detail";
import MetalComplex1_2Detail from "@/pages/dyes-intermediates/tables/fetchAcidDyesDatafile/MetalComplex1_2Detail";

// New Import for Basic Dyes tables
import Liquid from "@/pages/dyes-intermediates/tables/fatchBasicDyesDatafile/Liquid";
import Powder from "@/pages/dyes-intermediates/tables/fatchBasicDyesDatafile/Powder";

// Food & Lake Color Table Pages
import BlendedColor from "@/pages/dyes-intermediates/tables/fatchFoodAndLakeColorDatafile/BlendedColor";
import LakeColor from "@/pages/dyes-intermediates/tables/fatchFoodAndLakeColorDatafile/LakeColor";
import FoodColor from "@/pages/dyes-intermediates/tables/fatchFoodAndLakeColorDatafile/FoodColor";
import FDCColor from "@/pages/dyes-intermediates/tables/fatchFoodAndLakeColorDatafile/FDCColor";
import DandCColor from "@/pages/dyes-intermediates/tables/fatchFoodAndLakeColorDatafile/DandCColor";

// Reactive Dyes Detail Page
import ReactiveHEDyesDetail from "@/pages/dyes-intermediates/tables/fatchReactiveDyesDatafile/ReactiveHEDyesDetail";
import ReactiveHotDyesDetail from "./pages/dyes-intermediates/tables/fatchReactiveDyesDatafile/ReactiveHotDyesDetail";
import ReactiveMEDyesDetail from "./pages/dyes-intermediates/tables/fatchReactiveDyesDatafile/ReactiveMEDyesDetail";
import ReactivePrintingDyes1Detail from "./pages/dyes-intermediates/tables/fatchReactiveDyesDatafile/ReactivePrintingDyes1Detail";
import ReactivePrintingDyes2Detail from "./pages/dyes-intermediates/tables/fatchReactiveDyesDatafile/ReactivePrintingDyes2Detail";
import ReactiveVinylSulphoneDyesDetail from "./pages/dyes-intermediates/tables/fatchReactiveDyesDatafile/ReactiveVinylSulphoneDyesDetail";

// New Imports for Intermediates, Direct Dys and Solvent Dyes Detail Pages
import IntermediatesDetail from "./pages/dyes-intermediates/tables/IntermediatesDetail";
import SolventDyesDetail from "./pages/dyes-intermediates/tables/SolventDyesDetail";
import DirectDyesDetail from "./pages/dyes-intermediates/tables/DirectDyesDetail";

// FODD & PHARMA IN Veterinary Formulation Tables Detail Pages
import PoultryProductsDetail from "./pages/food-pharma/tables/fetch-veterinaryFormulationData/PoultryProductsDetail";
import OtherProductsDetail from "./pages/food-pharma/tables/fetch-veterinaryFormulationData/OtherProductsDetail";
import LiveStockProductsDetail from "./pages/food-pharma/tables/fetch-veterinaryFormulationData/LiveStockProductsDetail";
import CompanionAnimalProductsDetail from "./pages/food-pharma/tables/fetch-veterinaryFormulationData/CompanionAnimalProductsDetail";

// FODD & PHARMA IN Tablets & Capsules Detail Page
import TabletsCapsulesDetail from "./pages/food-pharma/tables/fetch-tablets-CapsulesData/TabletsCapsulesDetail";
import CombinationFormulationsDetail from "./pages/food-pharma/tables/fetch-tablets-CapsulesData/CombinationFormulationsDetail";

// FODD & PHARMA IN nutraceuticals Detail Page
import AminoAcidsDetail from "./pages/food-pharma/tables/fetch-nutraceuticalsData/AminoAcidsDetail";
import MineralsDetail from "./pages/food-pharma/tables/fetch-nutraceuticalsData/MineralsDetail";
import SpecialitiesDetail from "./pages/food-pharma/tables/fetch-nutraceuticalsData/SpecialitiesDetail";
import StabilizedVitaminsDetail from "./pages/food-pharma/tables/fetch-nutraceuticalsData/StabilizedVitaminsDetail";

// FODD & PHARMA IN Nasal Drops & Oral Suspensions Detail Page
import NasalDropsDetail from "./pages/food-pharma/tables/fetch-nasalDrops-OralSuspensionsData/NasalDropsDetail";
import OralSuspensionDetail from "./pages/food-pharma/tables/fetch-nasalDrops-OralSuspensionsData/OralSuspensionDetail";


// FOOD & PHARMA IN Injectables OintmentsData Detail Page

import InjectablesDetail from "./pages/food-pharma/tables/fetch-Injectables-OintmentsData/InjectablesDetail";
import OintmentsDetail from "./pages/food-pharma/tables/fetch-Injectables-OintmentsData/OintmentsDetails";
import SubcategoryDetail from "./pages/SubcategoryDetail";
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
            <Route path="/products" element={<ProductSegment />} />
            <Route path="/dyes-intermediates" element={<DyesIntermediates />} />
            <Route path="/food-pharma" element={<FoodPharma />} />
            <Route path="/shades-pigments" element={<ShadesPigments />} />
            <Route path="/varieties-cosmetics" element={<VarietiesCosmetics />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/about" element={<About />} />
            <Route path="/news" element={<News />} />
            <Route path="/contact" element={<Contact />} />

            {/* Redirect old product paths */}
            <Route path="/products/dyes-intermediates" element={<Navigate to="/dyes-intermediates" replace />} />
            <Route path="/products/food-pharma" element={<Navigate to="/food-pharma" replace />} />
            <Route path="/products/shades-pigments" element={<Navigate to="/shades-pigments" replace />} />
            <Route path="/products/varieties-cosmetics" element={<Navigate to="/varieties-cosmetics" replace />} />

            {/* Dyes & Intermediates sub-routes */}
            <Route path="/dyes-intermediates/basic-dyes" element={<BasicDyes />} />
            <Route path="/dyes-intermediates/food-and-lake-color" element={<FoodLakeColor />} />
            <Route path="/dyes-intermediates/reactive-dyes" element={<ReactiveDyes />} />
            <Route path="/dyes-intermediates/acid-dyes" element={<AcidDyes />} />

            {/* Food & Pharma sub-routes */}
            <Route path="/food-pharma/veterinary-formulation" element={<VeterinaryFormulation />} />
            <Route path="/food-pharma/tablets-and-capsules" element={<TabletsCapsules />} />
            <Route path="/food-pharma/nutraceuticals" element={<Nutraceuticals />} />
            <Route path="/food-pharma/nasal-drops-and-oral-suspensions" element={<NasalDropsOralSuspensions />} />
            <Route path="/food-pharma/injectables-and-ointments" element={<InjectableOintments />} />

            {/* Shades & Pigments sub-routes */}
            <Route path="/shades-pigments/organic-pigments" element={<OrganicPigments />} />
            <Route path="/shades-pigments/organic-pigment" element={<Navigate to="/shades-pigments/organic-pigments" replace />} />

            {/* Varieties & Cosmetics sub-routes */}
            <Route path="/varieties-cosmetics/essential-oil" element={<EssentialOil />} />
            <Route path="/ess_oil_list" element={<Navigate to="/varieties-cosmetics/essential-oil" replace />} />
           
            {/* Tables Detail Pages */}
            <Route path="/dyes-intermediates/acid-dyes/:form" element={<DyeDetail/>} />
           
            // New Route for Basic Dyes tables
            {/* <Route path="/basic-dyes/liquid" element={<Liquid/>} /> */}
            <Route path="/dyes-intermediates/basic-dyes/liquid" element={<Liquid />} />
            <Route path="/dyes-intermediates/basic-dyes/powder" element={<Powder />} />

            {/* Food & Lake Color Table Pages */}
            <Route path="/dyes-intermediates/food-and-lake-color/blended-color" element={<BlendedColor />} />
            <Route path="/dyes-intermediates/food-and-lake-color/d-and-c-color" element={<DandCColor />} />
            <Route path="/dyes-intermediates/food-and-lake-color/fdc-color" element={<FDCColor />} />
            <Route path="/dyes-intermediates/food-and-lake-color/food-color" element={<FoodColor />} />
            <Route path="/dyes-intermediates/food-and-lake-color/lake-color" element={<LakeColor />} />

            // Reactive Dyes Detail Page
            <Route path="/dyes-intermediates/reactive-dyes/reactive-he-dyes" element={<ReactiveHEDyesDetail />} />
            <Route path="/dyes-intermediates/reactive-dyes/reactive-hot-dyes" element={<ReactiveHotDyesDetail />} />
            <Route path="/dyes-intermediates/reactive-dyes/reactive-me-dyes" element={<ReactiveMEDyesDetail />} />
            <Route path="/dyes-intermediates/reactive-dyes/reactive-printing-dyes-1" element={<ReactivePrintingDyes1Detail />} />
            <Route path="/dyes-intermediates/reactive-dyes/reactive-printing-dyes-2" element={<ReactivePrintingDyes2Detail />} />
            <Route path="/dyes-intermediates/reactive-dyes/reactive-vinyl-sulphone-base-dye" element={<ReactiveVinylSulphoneDyesDetail />} />


            <Route path="/dyes-intermediates/intermediates" element={<IntermediatesDetail />} />
            <Route path="/dyes-intermediates/solvent-dyes" element={<SolventDyesDetail />} />
            <Route path="/dyes-intermediates/direct-dyes" element={<DirectDyesDetail />} /> 

            {/* FODD & PHARMA IN Veterinary Formulation Tables Detail Pages */}
            <Route path="/food-pharma/veterinary-formulation/poultry-products" element={<PoultryProductsDetail />} />
            <Route path="/food-pharma/veterinary-formulation/other-products" element={<OtherProductsDetail />} />
            <Route path="/food-pharma/veterinary-formulation/livestock-products" element={<LiveStockProductsDetail />} />
            <Route path="/food-pharma/veterinary-formulation/companion-animal-products" element={<CompanionAnimalProductsDetail />} />

            {/* FODD & PHARMA IN Tablets & Capsules Detail Page */}
            <Route path="/food-pharma/tablets-capsules/tablets-&-capsules" element={<TabletsCapsulesDetail />} />
            <Route path="/food-pharma/tablets-capsules/combination-formulations" element={<CombinationFormulationsDetail />} />

            {/* FODD & PHARMA IN nutraceuticals Detail Page */}
            <Route path="/food-pharma/nutraceuticals/amino-acids" element={<AminoAcidsDetail />} />
            <Route path="/food-pharma/nutraceuticals/minerals" element={<MineralsDetail />} />
            <Route path="/food-pharma/nutraceuticals/specialities" element={<SpecialitiesDetail />} />
            <Route path="/food-pharma/nutraceuticals/stabilized-vitamins" element={<StabilizedVitaminsDetail />} />

            {/* FODD & PHARMA IN Nasal Drops & Oral Suspensions Detail Page */}
            <Route path="/food-pharma/nasal-oral/oral-suspension" element={<NasalDropsDetail />} />
            <Route path="/food-pharma/nasal-oral/nasal-drops" element={<OralSuspensionDetail />} />

            {/* FOOD & PHARMA IN Injectables OintmentsData Detail Page */}
            <Route path="/food-pharma/injectable-ointments/injectables" element={<InjectablesDetail />} />
            <Route path="/food-pharma/injectable-ointments/ointments" element={<OintmentsDetail />} />



            {/* Dynamic subcategory route - keep after specific routes to avoid conflicts */}
            <Route path=":categorySlug/:subcategorySlug" element={<SubcategoryDetail />} />

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
