import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, CupSoda, FlaskRound, IceCream, CandyCane, Palette } from 'lucide-react';
import React from 'react';

const foodLakeColors = [
  { name: 'Blended Color', icon: Palette, color: 'from-pink-500 to-pink-600', path: 'blended-color' },
  { name: 'D & C Color', icon: FlaskRound, color: 'from-purple-500 to-purple-600', path: 'd-and-c-color' },
  { name: 'FD & C Color', icon: CupSoda, color: 'from-blue-500 to-blue-600', path: 'fdc-color' },
  { name: 'Food Color', icon: IceCream, color: 'from-yellow-400 to-yellow-500', path: 'food-color' },
  { name: 'Lake Color', icon: CandyCane, color: 'from-red-500 to-red-600', path: 'lake-color' },
];

const FoodLakeColor: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Food & Lake Color
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Wide range of food-grade and lake colors ensuring safety, vibrancy, and compliance with international standards.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {foodLakeColors.map((item, index) => {
            const SafeIcon = item.icon;
            return (
              <Link
                key={item.name}
                to={`/dyes-intermediates/food-and-lake-color/${item.path}`}
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
                      Explore our {item.name} options for food and beverage industries.
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

export default FoodLakeColor;
