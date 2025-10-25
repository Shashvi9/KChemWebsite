import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Palette, Heart, Beaker, Sparkles } from 'lucide-react';

const categories = [
  {
    id: 'dyes-intermediates',
    title: 'Dyes & Intermediates',
    description: 'Comprehensive range of acid dyes, basic dyes, reactive dyes, and chemical intermediates for textile and industrial applications.',
    icon: Palette,
    href: '/products/dyes-intermediates',
    color: 'from-blue-500 to-blue-600',
    products: ['Acid Dyes', 'Basic Dyes', 'Reactive Dyes', 'Direct Dyes', 'Solvent Dyes'],
  },
  {
    id: 'food-pharma',
    title: 'Food & Pharma Colors',
    description: 'FDA-approved food colors, pharmaceutical grades, and lake colors meeting international safety standards.',
    icon: Heart,
    href: '/products/food-pharma',
    color: 'from-green-500 to-green-600',
    products: ['Food Colors', 'Lake Colors', 'Pharma Grade', 'Natural Colors'],
  },
  {
    id: 'shades-pigments',
    title: 'Shades & Pigments',
    description: 'High-performance pigments and colorants for paints, coatings, plastics, and printing applications.',
    icon: Beaker,
    href: '/products/shades-pigments',
    color: 'from-purple-500 to-purple-600',
    products: ['Organic Pigments', 'Inorganic Pigments', 'Special Effects', 'Dispersions'],
  },
  {
    id: 'varieties-cosmetics',
    title: 'Cosmetic Varieties',
    description: 'Safe and vibrant colors for cosmetics, personal care products, and beauty applications.',
    icon: Sparkles,
    href: '/products/varieties-cosmetics',
    color: 'from-pink-500 to-pink-600',
    products: ['Cosmetic Colors', 'Mica', 'Pearl Pigments', 'Special Effects'],
  },
];

export const ProductCategories = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Product Categories
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover our comprehensive range of high-quality chemical solutions, 
            tailored to meet diverse industry needs across the globe.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {categories.map((category, index) => (
            <Card
              key={category.id}
              onClick={() => navigate(category.href)} // Whole card clickable
              className="group hover:shadow-hover transition-all duration-300 border-0 shadow-card animate-slide-up cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color} shadow-lg`}>
                    <category.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                      {category.title}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  {category.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {category.products.map((product) => (
                      <span
                        key={product}
                        className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium"
                      >
                        {product}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    {/* Explore Products button */}
                    <Button
                      variant="ghost"
                      className="group/btn p-0 h-auto font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(category.href);
                      }}
                    >
                      Explore Products
                      <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>

                    {/* Request Sample button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent card click
                        navigate('/contact'); // navigate to Contact page
                      }}
                    >
                      Request Sample
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
