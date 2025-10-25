import { Link,useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Beaker, Palette, Droplet, TestTube, Zap, Atom } from 'lucide-react';

const subSections = [
  { name: 'Intermediates', icon: Beaker, color: 'from-blue-500 to-blue-600' },
  { name: 'Acid Dyes', icon: Droplet, color: 'from-red-500 to-red-600' },
  { name: 'Basic Dyes', icon: Palette, color: 'from-green-500 to-green-600' },
  { name: 'Direct Dyes', icon: Atom, color: 'from-purple-500 to-purple-600' },
  { name: 'Food & Lake Color', icon: TestTube, color: 'from-yellow-400 to-yellow-500' },
  { name: 'Solvent Dyes', icon: Zap, color: 'from-pink-500 to-pink-600' },
  { name: 'Reactive Dyes', icon: Droplet, color: 'from-indigo-500 to-indigo-600' },
];

const DyesIntermediates = () => {
  const navigate = useNavigate();

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {subSections.map((section, index) => {
            const href = `/dyes-intermediates/${section.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`;

            return (
              <Card
                key={section.name}
                onClick={() => navigate(href)} // Make the whole card clickable
                className="group hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-slide-up cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3 flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${section.color} shadow-lg flex items-center justify-center`}>
                    <section.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {section.name}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    Explore our range of {section.name.toLowerCase()} products designed for optimal performance and quality.
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
