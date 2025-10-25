import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Search } from 'lucide-react';
import { useMemo } from 'react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  // Search data - categories and sub-sections
  const searchData = useMemo(() => [
    // Dyes & Intermediates
    { 
      title: 'Dyes & Intermediates', 
      href: '/dyes-intermediates',
      type: 'category',
      description: 'Comprehensive range of high-quality dyes and intermediates for various industrial applications.'
    },
    { title: 'Intermediates', href: '/dyes-intermediates/intermediates', type: 'product', category: 'Dyes & Intermediates' },
    { title: 'Acid Dyes', href: '/dyes-intermediates/acid-dyes', type: 'product', category: 'Dyes & Intermediates' },
    { title: 'Basic Dyes', href: '/dyes-intermediates/basic-dyes', type: 'product', category: 'Dyes & Intermediates' },
    { title: 'Direct Dyes', href: '/dyes-intermediates/direct-dyes', type: 'product', category: 'Dyes & Intermediates' },
    { title: 'Food & Lake Color', href: '/dyes-intermediates/food-and-lake-color', type: 'product', category: 'Dyes & Intermediates' },
    { title: 'Solvent Dyes', href: '/dyes-intermediates/solvent-dyes', type: 'product', category: 'Dyes & Intermediates' },
    { title: 'Reactive Dyes', href: '/dyes-intermediates/reactive-dyes', type: 'product', category: 'Dyes & Intermediates' },

    // Food & Pharma
    { 
      title: 'Food & Pharma', 
      href: '/food-pharma',
      type: 'category',
      description: 'Premium pharmaceutical and food-grade products manufactured under strict quality controls.'
    },
    { title: 'Veterinary Formulation', href: '/food-pharma/veterinary-formulation', type: 'product', category: 'Food & Pharma' },
    { title: 'Veterinary APIs', href: '/food-pharma/veterinary-apis', type: 'product', category: 'Food & Pharma' },
    { title: 'Tablets & Capsules', href: '/food-pharma/tablets-and-capsules', type: 'product', category: 'Food & Pharma' },
    { title: 'Reference Standards & Impurities', href: '/food-pharma/reference-standards-and-impurities', type: 'product', category: 'Food & Pharma' },
    { title: 'Pellets', href: '/food-pharma/pellets', type: 'product', category: 'Food & Pharma' },
    { title: 'Patented Impurity Product', href: '/food-pharma/patented-impurity-product', type: 'product', category: 'Food & Pharma' },
    { title: 'Nutraceuticals', href: '/food-pharma/nutraceuticals', type: 'product', category: 'Food & Pharma' },
    { title: 'Nasal Drops & Oral Suspensions', href: '/food-pharma/nasal-drops-and-oral-suspensions', type: 'product', category: 'Food & Pharma' },
    { title: 'Medical Supplies & Equipment', href: '/food-pharma/medical-supplies-and-equipment', type: 'product', category: 'Food & Pharma' },
    { title: 'Injectables & Ointments', href: '/food-pharma/injectables-and-ointments', type: 'product', category: 'Food & Pharma' },

    // Shades & Pigments
    { 
      title: 'Shades & Pigments', 
      href: '/shades-pigments',
      type: 'category',
      description: 'Comprehensive portfolio of high-performance pigments and colorants for diverse industrial applications.'
    },
    { title: 'Waterbase Inkjet Int', href: '/shades-pigments/waterbase-inkjet-int', type: 'product', category: 'Shades & Pigments' },
    { title: 'Universal Stainer', href: '/shades-pigments/universal-stainer', type: 'product', category: 'Shades & Pigments' },
    { title: 'Paints', href: '/shades-pigments/paints', type: 'product', category: 'Shades & Pigments' },
    { title: 'Organic Pigment', href: '/shades-pigments/organic-pigment', type: 'product', category: 'Shades & Pigments' },
    { title: 'Machine Coating Colorant', href: '/shades-pigments/machine-coating-colorant', type: 'product', category: 'Shades & Pigments' },
    { title: 'Inorganic Pigment', href: '/shades-pigments/inorganic-pigment', type: 'product', category: 'Shades & Pigments' },
    { title: 'Industrial Coating', href: '/shades-pigments/industrial-coating', type: 'product', category: 'Shades & Pigments' },
    { title: 'Cement Architecture Dispersion', href: '/shades-pigments/cement-architecture-dispersion', type: 'product', category: 'Shades & Pigments' },
    { title: 'Architecture Paints', href: '/shades-pigments/architecture-paints', type: 'product', category: 'Shades & Pigments' },
    { title: '13 Waterbase Flexo Ink', href: '/shades-pigments/13-waterbase-flexo-ink', type: 'product', category: 'Shades & Pigments' },
    { title: '11 Mixed Metal Oxides', href: '/shades-pigments/11-mixed-metal-oxides', type: 'product', category: 'Shades & Pigments' },
    { title: '08 + 12 PVC and PVC Master Batches', href: '/shades-pigments/08-plus-12-pvc-and-pvc-master-batches', type: 'product', category: 'Shades & Pigments' },

    // Varieties in Cosmetics
    { 
      title: 'Varieties in Cosmetics', 
      href: '/varieties-cosmetics',
      type: 'category',
      description: 'Premium cosmetic-grade colors and ingredients for beauty and personal care applications.'
    },
    { title: 'D & C Color', href: '/varieties-cosmetics/d-and-c-color', type: 'product', category: 'Varieties in Cosmetics' },
    { title: 'Essential Oil', href: '/varieties-cosmetics/essential-oil', type: 'product', category: 'Varieties in Cosmetics' },
    { title: 'Lake Color', href: '/varieties-cosmetics/lake-color', type: 'product', category: 'Varieties in Cosmetics' },
  ], []);

  // Filter results based on search query
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase().trim();
    return searchData.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.category?.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm)
    );
  }, [query, searchData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Search className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Search Results
            </h1>
          </div>
          {query && (
            <p className="text-xl text-muted-foreground">
              Results for: <span className="font-semibold text-foreground">"{query}"</span>
            </p>
          )}
          <p className="text-muted-foreground mt-2">
            Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Results */}
        {filteredResults.length > 0 ? (
          <div className="space-y-4 max-w-4xl">
            {filteredResults.map((result, index) => (
              <Card key={index} className="group hover:shadow-corporate transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-primary-dark group-hover:text-primary transition-colors">
                          {result.title}
                        </h3>
                        {result.type === 'category' && (
                          <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full font-medium">
                            Category
                          </span>
                        )}
                        {result.type === 'product' && (
                          <span className="px-2 py-1 text-xs bg-secondary text-muted-foreground rounded-full font-medium">
                            Product
                          </span>
                        )}
                      </div>
                      
                      {result.category && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Category: {result.category}
                        </p>
                      )}
                      
                      {result.description && (
                        <p className="text-muted-foreground mb-4">
                          {result.description}
                        </p>
                      )}
                      
                      <Link
                        to={result.href}
                        className="inline-flex items-center text-primary hover:text-primary-dark transition-colors font-medium"
                      >
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors ml-4 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn't find any products or categories matching "{query}". Try different keywords or browse our product categories.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Start Your Search</h3>
            <p className="text-muted-foreground">
              Enter a search term to find products and categories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;