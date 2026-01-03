import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Phone, Mail, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import logoWhite from '@/assets/logoWhite.png';
import { SearchBar } from '@/components/search/SearchBar';

const navigation = [
  { name: 'Home', href: '/' },
  {
    name: 'Product Segment',
    href: '/products',
    children: [
      { name: 'Dyes & Intermediates', href: '/category/dyes-intermediates' },
      { name: 'Food & Pharma', href: '/category/food-pharma-colors' },
      { name: 'Shades & Pigments', href: '/category/shades-pigments' },
      { name: 'Varieties in Cosmetics', href: '/category/varieties-cosmetics' },
    ],
  },
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

// Desktop Navigation
const DesktopNavigation = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="hidden lg:flex items-center space-x-8">
      {navigation.map((item) => {
        const isActive = item.href === currentPath ||
          (item.children && item.children.some(child => child.href === currentPath));

        return (
          <div
            key={item.name}
            className="relative"
            onMouseEnter={() => item.children && setActiveDropdown(item.name)}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Link
              to={item.href}
              className={cn(
                'flex items-center text-foreground hover:text-primary transition-colors font-medium',
                item.children && 'gap-1',
                isActive && 'text-primary'
              )}
            >
              {item.name}
              {item.children && <ChevronDown className="h-4 w-4" />}
            </Link>

          {item.children && activeDropdown === item.name && (
            <div className="absolute top-full left-0 w-64 pt-2 z-50">
              <div className="bg-card border border-border rounded-lg shadow-corporate">
                <div className="p-2">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      to={child.href}
                      className="block px-4 py-2 text-sm text-foreground hover:bg-secondary rounded-md transition-colors"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
      })}
    </nav>
  );
};

// Mobile Navigation
const MobileNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <div className="flex flex-col space-y-4 mt-8">
          {navigation.map((item) => {
            const isActive = item.href === currentPath ||
              (item.children && item.children.some(child => child.href === currentPath));

            return (
              <div key={item.name} className="space-y-2">
                <Link
                  to={item.href}
                  className={cn(
                    "block text-lg font-medium text-foreground hover:text-primary transition-colors",
                    isActive && "text-primary"
                  )}
                >
                  {item.name}
                </Link>
                {item.children && (
                  <div className="ml-4 space-y-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.href}
                        className={cn(
                          "block text-sm text-muted-foreground hover:text-primary transition-colors",
                          child.href === currentPath && "text-primary"
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
      <div className="bg-primary-light border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center space-x-6">
              <a
                href="tel:+919879563306"
                className="flex items-center gap-2 text-primary-dark hover:text-primary transition-colors"
              >
                <Phone className="h-3 w-3" />
                +91 9879563306
              </a>
              <a
                href="mailto:kctl96@gmail.com"
                className="flex items-center gap-2 text-primary-dark hover:text-primary transition-colors"
              >
                <Mail className="h-3 w-3" />
                kctl96@gmail.com
              </a>
            </div>
            <div className="hidden md:block text-primary-dark">
              Since 1999 - Leading Chemical Solutions
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src={logoWhite}
              alt="Kewin Chemicals Pvt. Ltd."
              className="h-8 w-auto md:h-10 object-contain"
            />
          </Link>

          {/* Desktop Navigation + Buttons */}
          <div className="flex items-center space-x-4">
            <DesktopNavigation />

            <div className="flex items-center space-x-2">
              <SearchBar />

              <MobileNavigation />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
