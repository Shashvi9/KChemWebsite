import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronRight, Droplet, Layers, Sliders, Activity, Hexagon, Sun, Wind, Box, TrendingUp, Pin } from 'lucide-react';

const subSections = [
  { name: 'Waterbase Inkjet Int', icon: Droplet, color: 'from-blue-500 to-blue-600' },
  { name: 'Universal Stainer', icon: Sliders, color: 'from-green-500 to-green-600' },
  { name: 'Paints', icon: Pin, color: 'from-purple-500 to-purple-600' },
  { name: 'Organic Pigment', icon: Sun, color: 'from-indigo-500 to-indigo-600' },
  { name: 'Machine Coating Colorant', icon: Layers, color: 'from-pink-500 to-pink-600' },
  { name: 'Inorganic Pigment', icon: Hexagon, color: 'from-yellow-400 to-yellow-500' },
  { name: 'Industrial Coating', icon: TrendingUp, color: 'from-red-500 to-red-600' },
  { name: 'Cement Architecture Dispersion', icon: Box, color: 'from-teal-500 to-teal-600' },
  { name: 'Architecture Paints', icon: Wind, color: 'from-cyan-500 to-cyan-600' },
  { name: '13 Waterbase Flexo Ink', icon: Droplet, color: 'from-orange-500 to-orange-600' },
  { name: '11 Mixed Metal Oxides', icon: Activity, color: 'from-lime-500 to-lime-600' },
  { name: '08 + 12 PVC and PVC Master Batches', icon: Layers, color: 'from-fuchsia-500 to-fuchsia-600' },
];

const ShadesPigments = () => {
  const navigate = useNavigate();

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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto">
          {subSections.map((section, index) => (
            <Card
              key={section.name}
              onClick={() =>
                navigate(
                  `/shades-pigments/${section.name
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/&/g, 'and')
                    .replace(/\+/g, 'plus')}`
                )
              }
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
                  High-quality {section.name.toLowerCase()} solutions for professional coating and coloration applications.
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
