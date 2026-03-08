import { useSearchParams, Link } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RequestSampleDialog from '@/components/RequestSampleDialog';

import { API_BASE } from '@/lib/apiConfig';

interface Product {
  id: number;
  name: string;
  form: string | null;
  attributes: Record<string, any> | null;
  subcategory_id: number;
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim() || query.trim().length < 2) {
        setProducts([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query.trim())}`);
        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }
        const result: Product[] = await response.json();
        setProducts(result);
      } catch (e: any) {
        setError(e.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [query]);

  // Determine dynamic columns from attributes union
  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();
    products.forEach(p => {
      const attrs = p.attributes || {};
      Object.keys(attrs).forEach(k => keys.add(k));
    });
    return Array.from(keys).sort();
  }, [products]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-10">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">Search Results</span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Searching products...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && products.length > 0 && (
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{query ? `Results for "${query}"` : 'Search Results'}</CardTitle>
              <RequestSampleDialog
                trigger={<Button>Request Sample</Button>}
                context={{ categorySlug: '', subcategorySlug: '', product: null }}
              />
            </CardHeader>
            <CardContent>
              <div className="overflow-auto rounded-md border max-h-[70vh]">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/40 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium bg-muted/40">Name</th>
                      <th className="px-3 py-2 text-left font-medium bg-muted/40">Form</th>
                      {attributeKeys.map(key => (
                        <th key={key} className="px-3 py-2 text-left font-medium capitalize bg-muted/40">{key.replace(/_/g, ' ')}</th>
                      ))}
                      <th className="px-3 py-2 text-left font-medium bg-muted/40">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="px-3 py-2 whitespace-nowrap">{p.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{p.form || '-'}</td>
                        {attributeKeys.map(key => (
                          <td key={key} className="px-3 py-2">
                            {String((p.attributes || {})[key] ?? '-')}
                          </td>
                        ))}
                        <td className="px-3 py-2">
                          <RequestSampleDialog
                            trigger={<Button size="sm" variant="outline">Request sample</Button>}
                            context={{
                              categorySlug: '',
                              subcategorySlug: '',
                              product: { id: p.id, name: p.name, form: p.form, attributes: p.attributes || {} },
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {!loading && !error && products.length === 0 && query && query.length >= 2 && (
          <Card className="shadow-card">
            <CardContent className="text-center py-16">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                We couldn't find any products matching "{query}". Try a different product name or CAS number.
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Browse All Products
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Empty Query */}
        {!loading && !query && (
          <Card className="shadow-card">
            <CardContent className="text-center py-16">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Search Products</h3>
              <p className="text-gray-500">
                Enter a product name or CAS number in the search bar above.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Query too short */}
        {!loading && query && query.length < 2 && (
          <Card className="shadow-card">
            <CardContent className="text-center py-16">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Enter More Characters</h3>
              <p className="text-gray-500">
                Please enter at least 2 characters to search.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SearchResults;