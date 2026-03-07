import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Loader2, Palette } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

type Subcategory = {
  id: number;
  name: string;
  slug: string;
};

const colorGradients = [
  'from-blue-500 to-blue-600',
  'from-green-500 to-green-600',
  'from-purple-500 to-purple-600',
  'from-pink-500 to-pink-600',
  'from-yellow-400 to-yellow-500',
  'from-red-500 to-red-600',
  'from-indigo-500 to-indigo-600',
  'from-teal-500 to-teal-600',
];

const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categorySlug) return;

    const fetchSubcategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/categories/${categorySlug}/subcategories`);
        if (!response.ok) throw new Error('Failed to fetch subcategories');
        const data: Subcategory[] = await response.json();
        setSubcategories(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSubcategories();
  }, [categorySlug]);

  // Convert slug to title case for display
  const toTitle = (slug: string) =>
    slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const categoryTitle = categorySlug ? toTitle(categorySlug) : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {categoryTitle}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore our range of {categoryTitle.toLowerCase()} products.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-muted-foreground">Loading subcategories...</p>
              <p className="text-sm text-muted-foreground/70 mt-2">First load may take 30 seconds as server wakes up</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16 text-red-600">{error}</div>
        )}

        {/* Subcategories Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center max-w-6xl mx-auto">
            {subcategories.map((sub, index) => (
              <Link
                key={sub.id}
                to={`/category/${categorySlug}/${sub.slug}`}
                className="group hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-slide-up block w-full md:w-72"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="border-0 shadow-card h-full w-full">
                  <CardHeader className="pb-3 flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${colorGradients[index % colorGradients.length]} shadow-lg flex items-center justify-center`}>
                      <Palette className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {sub.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      Explore our {sub.name.toLowerCase()} products.
                    </p>
                    <div className="inline-flex items-center text-primary font-medium text-sm">
                      View Products <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* No Subcategories Found */}
        {!loading && !error && subcategories.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">No subcategories found.</div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
