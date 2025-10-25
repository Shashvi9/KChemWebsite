import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Flame, Sun, Zap, Printer, Brush, Droplets } from 'lucide-react';
import React from 'react';

const reactiveDyes = [
  { name: 'Reactive HE Dyes', icon: Sun, color: 'from-orange-500 to-orange-600', path: 'reactive-he-dyes' },
  { name: 'Reactive Hot Dyes', icon: Flame, color: 'from-red-500 to-red-600', path: 'reactive-hot-dyes' },
  { name: 'Reactive ME Dyes', icon: Zap, color: 'from-purple-500 to-purple-600', path: 'reactive-me-dyes' },
  { name: 'Reactive Printing Dyes 1', icon: Printer, color: 'from-blue-500 to-blue-600', path: 'reactive-printing-dyes-1' },
  { name: 'Reactive Printing Dyes 2', icon: Brush, color: 'from-green-500 to-green-600', path: 'reactive-printing-dyes-2' },
  { name: 'Reactive Vinyl Sulphone Base Dye', icon: Droplets, color: 'from-indigo-500 to-indigo-600', path: 'reactive-vinyl-sulphone-base-dye' },
];

const ReactiveDyes: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Reactive Dyes
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Comprehensive collection of Reactive Dyes for textiles and industrial applications, available in multiple categories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reactiveDyes.map((item, index) => {
            const SafeIcon = item.icon;
            return (
              <Link
                key={item.name}
                to={`/dyes-intermediates/reactive-dyes/${item.path}`}
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
                      Discover our {item.name} designed for high performance in dyeing and printing.
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

export default ReactiveDyes;
