import { Button } from '@/components/ui/button';
import { ArrowRight, Award, Users, Globe, Zap } from 'lucide-react';

const stats = [
  { icon: Award, label: 'Years of Excellence', value: '25+' },
  { icon: Users, label: 'Global Clients', value: '500+' },
  { icon: Globe, label: 'Countries Served', value: '20+' },
  { icon: Zap, label: 'Product Range', value: '1000+' },
];

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="text-center lg:text-left animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-primary-foreground mb-6 backdrop-blur-sm">
              <Award className="h-4 w-4 mr-2" />
              Leading Chemical Solutions Since 1999
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Premium
              <span className="text-primary-accent"> Chemical </span>
              Solutions
            </h1>
            
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl">
              Kewin Chemical is your trusted partner for high-quality dyes, intermediates, 
              pigments, food & pharma colors, and cosmetic varieties. Delivering excellence 
              across industries worldwide.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button variant="hero" size="lg" className="group">
                Explore Products
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                Request Sample
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-3">
                    <stat.icon className="h-6 w-6 text-primary-accent" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-primary-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-primary-foreground/80">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Hero Visual */}
          <div className="relative animate-scale-in">
            <div className="relative">
              {/* Floating Cards */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="w-8 h-8 bg-primary-accent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-primary-foreground font-medium">Dyes</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="w-8 h-8 bg-primary-accent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-primary-foreground font-medium">Pigments</p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="w-8 h-8 bg-primary-accent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-primary-foreground font-medium">Food Colors</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="w-8 h-8 bg-primary-accent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-primary-foreground font-medium">Cosmetics</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary-accent/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary-light/30 rounded-full blur-lg"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave Separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-12 text-background"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
        </svg>
      </div>
    </section>
  );
};