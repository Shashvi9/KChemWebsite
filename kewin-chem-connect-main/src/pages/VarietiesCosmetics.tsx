import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react'; // Removed Sparkles, Droplet, Heart

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  category_id: number;
}

const VarietiesCosmetics = () => {
  const navigate = useNavigate();
  const [subSections, setSubSections] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        // Assuming your backend is running on localhost:8000
        const response = await fetch('http://localhost:8000/api/v1/categories/varieties-cosmetics/subcategories');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Subcategory[] = await response.json();
        setSubSections(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Varieties in Cosmetics
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Premium cosmetic-grade colors and ingredients for beauty and personal care applications. 
            Our products are skin-safe, vibrant, and meet international cosmetic standards.
          </p>
        </div>

        {/* Sub-sections Grid */}
        {loading && <p className="text-center text-lg text-muted-foreground">Loading subcategories...</p>}
        {error && <p className="text-center text-lg text-destructive">Error: {error}</p>}
        {!loading && !error && subSections.length === 0 && (
          <p className="text-center text-lg text-muted-foreground">No subcategories found.</p>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
          {subSections.map((section, index) => (
            <Card
              key={section.slug} // Use slug for key
              onClick={() => navigate(`/varieties-cosmetics/${section.slug}`)} // Use slug for navigation
              className="group hover:shadow-hover transition-all duration-300 border-0 shadow-card animate-slide-up cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 mb-4">
                  {/* Removed icon and color for now */}
                  <div className="p-3 rounded-lg bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg">
                    {/* Placeholder icon or initial */}
                    <span className="h-6 w-6 text-white flex items-center justify-center text-lg font-bold">
                      {section.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                      {section.name}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm text-muted-foreground">
                  Cosmetic-grade {section.name.toLowerCase()} products designed for beauty and personal care formulations.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="inline-flex items-center text-primary hover:text-primary-dark transition-colors font-medium text-sm">
                  View Products
                  <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in">
          {[
            { title: 'FDA Approved', description: 'All cosmetic colors meet FDA safety standards for skin contact applications.', icon: Droplet },
            { title: 'Pure Quality', description: 'Premium grade essential oils and colors with consistent purity and performance.', icon: Heart },
            { title: 'Custom Blends', description: 'Tailored formulations to match your specific cosmetic product requirements.', icon: Sparkles },
          ].map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center animate-fade-in">
          <div className="bg-primary-light/20 rounded-2xl p-8 md:p-12 max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-primary-dark mb-4">
              Beauty Industry Partnership
            </h3>
            <p className="text-lg text-primary-dark/80 mb-6">
              Partner with us for reliable supply of cosmetic-grade ingredients that meet the highest industry standards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/contact')}
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Partnership Inquiry
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-md hover:bg-primary/5 transition-colors font-medium"
              >
                Product Catalog
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VarietiesCosmetics;
