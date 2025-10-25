import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronRight, Heart, Beaker, Activity, Award, TestTube2, Box, ShieldCheck, Coffee } from 'lucide-react';

const subSections = [
  { name: 'Veterinary Formulation', icon: Beaker, color: 'from-blue-500 to-blue-600' },
  { name: 'Veterinary APIs', icon: TestTube2, color: 'from-green-500 to-green-600' },
  { name: 'Tablets & Capsules', icon: Coffee, color: 'from-purple-500 to-purple-600' },
  { name: 'Reference Standards & Impurities', icon: ShieldCheck, color: 'from-indigo-500 to-indigo-600' },
  { name: 'Pellets', icon: Activity, color: 'from-pink-500 to-pink-600' },
  { name: 'Patented Impurity Product', icon: Award, color: 'from-yellow-400 to-yellow-500' },
  { name: 'Nutraceuticals', icon: Heart, color: 'from-red-500 to-red-600' },
  { name: 'Nasal Drops & Oral Suspensions', icon: Beaker, color: 'from-teal-500 to-teal-600' },
  { name: 'Medical Supplies & Equipment', icon: Box, color: 'from-cyan-500 to-cyan-600' },
  { name: 'Injectables & Ointments', icon: TestTube2, color: 'from-orange-500 to-orange-600' },
];

const FoodPharma = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Food & Pharma
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Premium pharmaceutical and food-grade products manufactured under strict quality controls.
            Our formulations comply with international regulatory standards for safety and efficacy.
          </p>
        </div>

        {/* Sub-sections Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto">
          {subSections.map((section, index) => {
            const href = `/food-pharma/${section.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`;

            return (
              <Card
                key={section.name}
                onClick={() => navigate(href)} // Make the entire card clickable
                className="group hover:shadow-hover transition-all duration-300 border-0 shadow-card animate-slide-up cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${section.color} shadow-lg`}>
                      <section.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                        {section.name}
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground">
                    Professional grade {section.name.toLowerCase()} solutions meeting pharmaceutical and food industry standards.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
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
        <div className="text-center animate-fade-in">
          <div className="bg-primary-light rounded-2xl p-8 md:p-12 max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-primary-dark mb-4">
              Regulatory Compliance & Quality
            </h3>
            <p className="text-lg text-primary-dark/80 mb-6">
              All our pharmaceutical products are manufactured in compliance with GMP standards and international regulatory requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/contact')} className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium">
                Quality Certification
              </Button>
              <Button onClick={() => navigate('/contact')} variant="outline" className="px-6 py-3 border border-primary text-primary rounded-md hover:bg-primary/5 transition-colors font-medium">
                Request Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodPharma;
