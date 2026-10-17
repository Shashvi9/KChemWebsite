import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from '@/lib/contact';
import logoWhite from '@/assets/logoWhite.png';

export const Footer = () => {
  return (
    <footer className="bg-gradient-hero text-primary-foreground">
      <div className="container mx-auto px-4">
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
                    href={`tel:${CONTACT_PHONE_TEL}`}
                    className="hover:text-primary-accent transition-colors"
                  >
                    {CONTACT_PHONE}
                  </a>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary-accent" />
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="hover:text-primary-accent transition-colors"
                  >
                    {CONTACT_EMAIL}
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
                  { name: 'Home', href: '/' },
                  { name: 'About Us', href: '/about' },
                  { name: 'Contact Us', href: '/contact' },
                  { name: 'Request a Sample / Quote', href: '/contact?subject=Sample%20request' },
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
                  { name: 'Dyes & Intermediates', href: '/category/dyes-intermediates' },
                  { name: 'Food & Pharma Colors', href: '/category/food-pharma-colors' },
                  { name: 'Shades & Pigments', href: '/category/pigments' },
                  { name: 'Cosmetic Varieties', href: '/contact?subject=Cosmetic%20colors' },
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
                © {new Date().getFullYear()} Kewin Chemicals Pvt. Ltd. All rights reserved.
              </p>
              <p className="text-sm text-primary-foreground/60 mt-1">
                Quality chemical solutions since 1999
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </footer>
  );
};