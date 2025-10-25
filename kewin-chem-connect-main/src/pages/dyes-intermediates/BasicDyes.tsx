// src/pages/dyes-intermediates/BasicDyes.tsx
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Droplet, FlaskConical } from 'lucide-react';
import React from 'react';

const basicDyes = [
  { name: 'Liquid', icon: Droplet, color: 'from-blue-500 to-blue-600' },
  { name: 'Powder', icon: FlaskConical, color: 'from-green-500 to-green-600' },
];

const BasicDyes: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Basic Dyes
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our Basic Dyes are available in both liquid and powder forms, designed for diverse industrial applications.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {basicDyes.map((item, index) => {
            const SafeIcon = item.icon;
            return (
              <Link
                key={item.name}
                to={`/dyes-intermediates/basic-dyes/${item.name.toLowerCase()}`}
                className="group"
              >
                <Card
                  className="hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-slide-up cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-3 flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${item.color} shadow-lg flex items-center justify-center`}>
                      <SafeIcon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {item.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      Explore our {item.name.toLowerCase()} form of basic dyes.
                    </p>
                    <div className="inline-flex items-center text-primary group-hover:text-primary-dark transition-colors font-medium text-sm">
                      View Products <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
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

export default BasicDyes;
