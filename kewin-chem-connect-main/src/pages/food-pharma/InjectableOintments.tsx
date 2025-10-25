import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Droplet, Heart } from 'lucide-react';

const subSections = [
  { name: 'Ointments', icon: Heart, color: 'from-pink-500 to-pink-600', path: 'ointments' },
  { name: 'Injectables', icon: Droplet, color: 'from-blue-500 to-blue-600', path: 'injectables' },
];

const InjectableOintments = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Injectable & Ointments
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            High-quality injectables and ointments for veterinary and human use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {subSections.map((section, index) => {
            const SafeIcon = section.icon;
            return (
              <Link
                key={section.name}
                to={`/food-pharma/injectable-ointments/${section.path}`}
                className="group cursor-pointer"
              >
                <Card
                  className="hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-3 flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${section.color} shadow-lg flex items-center justify-center`}>
                      <SafeIcon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {section.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      Explore our {section.name.toLowerCase()} formulations.
                    </p>
                    <div className="inline-flex items-center text-primary font-medium text-sm">
                      View Products <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InjectableOintments;
