import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { getIconForSlug } from '@/utils/icon-map';

type Subcategory = {
  id: number;
  name: string;
  slug: string;
  category_id: number;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const ShadesPigments = () => {
  const navigate = useNavigate();
  const [subs, setSubs] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/categories/shades-pigments/subcategories`);
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
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Shades & Pigments</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Comprehensive portfolio of high-performance pigments and colorants for diverse industrial applications. 
            Our products deliver superior color strength, stability, and consistency.
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto">
            {subs.map((sub, index) => {
              const href = `/shades-pigments/${sub.slug}`;
              const Icon = getIconForSlug(sub.slug);
              return (
                <Card
                  key={sub.id}
                  onClick={() => navigate(href)}
                  className="group hover:shadow-hover transition-all duration-300 border-0 shadow-card animate-slide-up cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r from-primary to-primary/80 shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                          {sub.name}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-sm text-muted-foreground">
                      High-quality {sub.name.toLowerCase()} solutions for professional coating and coloration applications.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="inline-flex items-center text-primary hover:text-primary-dark transition-colors font-medium text-sm">
                      View Products
                      <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center animate-fade-in">
          <div className="bg-primary-light rounded-2xl p-8 md:p-12 max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-primary-dark mb-4">Custom Pigment Solutions</h3>
            <p className="text-lg text-primary-dark/80 mb-6">
              Need specific color matching or custom pigment formulations? Our R&D team can develop tailored solutions for your requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/contact')}
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Custom Solutions
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-md hover:bg-primary/5 transition-colors font-medium"
              >
                Color Matching
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShadesPigments;
