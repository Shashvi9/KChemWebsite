// src/pages/dyes-intermediates/AcidDyes.tsx
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Droplet, Beaker, Palette, Atom, TestTube } from "lucide-react";
import React from "react";

const acidDyesSections = [
  { name: "Milling Dyes", icon: Beaker, color: "from-blue-500 to-blue-600", path: "/dyes-intermediates/acid-dyes/milling-dyes" },
  { name: "Levelling Dyes", icon: Palette, color: "from-green-500 to-green-600", path: "/dyes-intermediates/acid-dyes/levelling-dyes" },
  { name: "Acid Dyes", icon: Droplet, color: "from-red-500 to-red-600", path: "/dyes-intermediates/acid-dyes/acid-dyes" },
  { name: "1:1 Metal Complex Dyes", icon: Atom, color: "from-purple-500 to-purple-600", path: "/dyes-intermediates/acid-dyes/1-1-metal-complex-dyes" },
  { name: "1:2 Metal Complex Dyes", icon: TestTube, color: "from-indigo-500 to-indigo-600", path: "/dyes-intermediates/acid-dyes/1-2-metal-complex-dyes" },
];

const AcidDyes: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Acid Dyes</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore our comprehensive range of acid dyes, designed to deliver excellent shade consistency,
            brilliance, and performance for various textile and industrial applications.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {acidDyesSections.map((section, index) => {
            const SafeIcon = section.icon;
            return (
              <Link key={section.name} to={section.path} className="group">
                <Card
                  className="hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-slide-up cursor-pointer"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <CardHeader className="pb-3 flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-r ${section.color} shadow-lg flex items-center justify-center`}
                    >
                      <SafeIcon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {section.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      Discover our {section.name.toLowerCase()} for superior dyeing results and reliable performance.
                    </p>

                    <div className="inline-flex items-center text-primary group-hover:text-primary-dark transition-colors font-medium text-sm">
                      View Products
                      <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center animate-fade-in">
          <div className="bg-primary-light/20 rounded-2xl p-8 md:p-12 max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-primary-dark mb-4">Need Expert Guidance?</h3>
            <p className="text-muted-foreground mb-6">
              Our technical experts are ready to guide you in selecting the right acid dyes for your application needs.
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

export default AcidDyes;
