import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Palette, Sparkles, Beaker } from 'lucide-react';

const organicPigments = [
  { name: 'Toner Fanal Pigments', icon: Palette, color: 'from-pink-500 to-pink-600' },
  { name: 'High Performance Pigments', icon: Beaker, color: 'from-blue-500 to-blue-600' },
  { name: 'Fluorescent Pigments', icon: Sparkles, color: 'from-yellow-400 to-yellow-500' },
];

const OrganicPigments = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Organic Pigments
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore our diverse range of Organic Pigments, engineered for brilliance, durability, and performance in coatings, inks, and plastics.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center max-w-6xl mx-auto">
          {organicPigments.map((item, index) => (
            <Link
              key={item.name}
              to={`/shades-pigments/${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="group hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-slide-up block w-full md:w-72"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card className="border-0 shadow-card h-full w-full">
                <CardHeader className="pb-3 flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${item.color} shadow-lg flex items-center justify-center`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    Discover premium {item.name} formulated for vibrant color strength and long-lasting applications.
                  </p>
                  <div className="inline-flex items-center text-primary font-medium text-sm">
                    View Products <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrganicPigments;
