import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { getIconForSlug } from '@/utils/icon-map';

type Subcategory = {
  id: number;
  name: string;
  slug: string;
  category_id: number;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const DyesIntermediates = () => {
  const navigate = useNavigate();
  const [subs, setSubs] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/categories/dyes-intermediates/subcategories`);
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        const data: Subcategory[] = await res.json();
        if (!cancelled) setSubs(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load subcategories');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Dyes & Intermediates
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Comprehensive range of high-quality dyes and intermediates for various industrial applications. 
            Our products meet international standards and are trusted by manufacturers worldwide.
          </p>
        </div>

        {/* Sub-sections Grid */}
        {loading && (
          <div className="text-center text-muted-foreground">Loading subcategories...</div>
        )}
        {error && (
          <div className="text-center text-red-600">{error}</div>
        )}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {subs.map((sub, index) => {
              const href = `/dyes-intermediates/${sub.slug}`;
              const Icon = getIconForSlug(sub.slug);
              return (
                <Card
                  key={sub.id}
                  onClick={() => navigate(href)}
                  className="group hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-slide-up cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-3 flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r from-primary to-primary/80 shadow-lg flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {sub.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      Explore our range of {sub.name.toLowerCase()} products designed for optimal performance and quality.
                    </p>
                    <div className="inline-flex items-center text-primary hover:text-primary-dark transition-colors font-medium text-sm">
                      View Products
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center animate-fade-in">
          <div className="bg-primary-light/20 rounded-2xl p-8 md:p-12 max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-primary-dark mb-4">
              Need Technical Assistance?
            </h3>
            <p className="text-muted-foreground mb-6">
              Our technical team is ready to help you choose the right dyes and intermediates for your specific requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Contact Technical Team
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-md hover:bg-primary/5 transition-colors font-medium"
              >
                Request Sample
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DyesIntermediates;
