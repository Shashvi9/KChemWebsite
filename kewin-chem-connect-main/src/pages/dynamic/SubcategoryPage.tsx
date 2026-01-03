import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Loader2, Palette } from 'lucide-react';
import DataTable from '@/components/DataTable';

const colorGradients = [
  'from-pink-500 to-pink-600',
  'from-blue-500 to-blue-600',
  'from-yellow-400 to-yellow-500',
  'from-green-500 to-green-600',
  'from-purple-500 to-purple-600',
  'from-red-500 to-red-600',
  'from-indigo-500 to-indigo-600',
  'from-teal-500 to-teal-600',
];

const SubcategoryPage = () => {
  const { categorySlug, subcategorySlug } = useParams<{ categorySlug: string; subcategorySlug: string }>();
  const [forms, setForms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categorySlug || !subcategorySlug) return;

    const fetchForms = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/v1/products/forms/?category_slug=${categorySlug}&subcategory_slug=${subcategorySlug}`);
        if (!response.ok) throw new Error('Failed to fetch forms');
        const data: string[] = await response.json();
        setForms(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, [categorySlug, subcategorySlug]);

  // Convert slug to title case for display
  const toTitle = (slug: string) =>
    slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  // Convert form name to URL slug
  const toSlug = (form: string) => form.toLowerCase().replace(/\s+/g, '-');

  const subcategoryTitle = subcategorySlug ? toTitle(subcategorySlug) : '';

  // If there's only one form or no forms, show products directly
  // If there are multiple forms, show form selection cards
  const showFormSelection = forms.length > 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {subcategoryTitle}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore our range of {subcategoryTitle.toLowerCase()} products.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16 text-red-600">{error}</div>
        )}

        {/* Multiple Forms - Show Selection Cards */}
        {!loading && !error && showFormSelection && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center max-w-6xl mx-auto">
            {forms.map((form, index) => (
              <Link
                key={form}
                to={`/category/${categorySlug}/${subcategorySlug}/${toSlug(form)}`}
                className="group hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-slide-up block w-full md:w-72"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="border-0 shadow-card h-full w-full">
                  <CardHeader className="pb-3 flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${colorGradients[index % colorGradients.length]} shadow-lg flex items-center justify-center`}>
                      <Palette className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {form}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      Explore our {form.toLowerCase()} products.
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

        {/* Single Form or No Forms - Show Products Directly */}
        {!loading && !error && !showFormSelection && (
          <DataTable 
            categorySlug={categorySlug} 
            subcategorySlug={subcategorySlug} 
            form={forms.length === 1 ? forms[0] : undefined}
            title={subcategoryTitle}
          />
        )}
      </div>
    </div>
  );
};

export default SubcategoryPage;
