import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import logoWhite from '@/assets/logoWhite.png';

export const Footer = () => {
  return (
    <footer className="bg-gradient-hero text-primary-foreground">
      <div className="container mx-auto px-4">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-primary-accent/20">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Updated with Kewin Chemical</h3>
            <p className="text-primary-foreground/80 mb-6">
              Get the latest updates on new products, industry insights, and chemical solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <Button variant="secondary" className="font-medium">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <Link to="/" className="inline-block mb-6">
                <img
                  src={logoWhite}
                  alt="Kewin Chemicals Pvt. Ltd."
                  className="h-16 w-auto object-contain"
                />
              </Link>
              <p className="text-primary-foreground/80 mb-6 max-w-md">
                Leading manufacturer and supplier of high-quality dyes, intermediates, pigments, 
                food & pharma colors, and cosmetic varieties since 1999.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 text-primary-accent flex-shrink-0" />
                  <div>
                    <p className="font-medium">Head Office</p>
                    <p className="text-primary-foreground/80 text-sm">
                      C308, The First<br />
                      Vastrapur, Ahmedabad.<br />
                      PIN 380015
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary-accent" />
                  <a
                    href="tel:+919879563306"
                    className="hover:text-primary-accent transition-colors"
                  >
                    +91 9879563306
                  </a>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary-accent" />
                  <a
                    href="mailto:kctl96@gmail.com"
                    className="hover:text-primary-accent transition-colors"
                  >
                    kctl96@gmail.com
                  </a>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary-accent" />
                  <span className="text-primary-foreground/80">
                    Mon - Sat: 9:00 AM - 6:00 PM
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { name: 'About Us', href: '/about' },
                  { name: 'Our Products', href: '/products' },
                  { name: 'Quality & Certifications', href: '/quality' },
                  { name: 'News & Updates', href: '/news' },
                  { name: 'Contact Us', href: '/contact' },
                  { name: 'Request Sample', href: '/sample' },
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-primary-foreground/80 hover:text-primary-accent transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product Categories */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Product Categories</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Dyes & Intermediates', href: '/products/dyes-intermediates' },
                  { name: 'Food & Pharma Colors', href: '/products/food-pharma' },
                  { name: 'Shades & Pigments', href: '/products/shades-pigments' },
                  { name: 'Cosmetic Varieties', href: '/products/varieties-cosmetics' },
                  // { name: 'Acid Dyes', href: '/products/dyes-intermediates/acid-dyes' },
                  // { name: 'Reactive Dyes', href: '/products/dyes-intermediates/reactive-dyes' },
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-primary-foreground/80 hover:text-primary-accent transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-primary-accent/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-primary-foreground/80">
                © 2024 Kewin Chemicals Pvt. Ltd. All rights reserved.
              </p>
              <p className="text-sm text-primary-foreground/60 mt-1">
                Quality chemical solutions since 1999
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-primary-foreground/80">Follow Us:</span>
              <div className="flex space-x-3">
                {[
                  { icon: Facebook, href: '#', label: 'Facebook' },
                  { icon: Twitter, href: '#', label: 'Twitter' },
                  { icon: Linkedin, href: '#', label: 'LinkedIn' },
                  { icon: Instagram, href: '#', label: 'Instagram' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};