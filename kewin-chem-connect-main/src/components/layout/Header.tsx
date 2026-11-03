import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Mail, Menu, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SearchBar } from '@/components/search/SearchBar';
import { useCatalogOverview } from '@/lib/catalog';
import { INDUSTRIES, industryPath } from '@/lib/industries';
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL, WHATSAPP_URL } from '@/lib/contact';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

const QUOTE_URL = '/contact?subject=Quote%20request';

const navLink = ({ isActive }: { isActive: boolean }) =>
  cn('text-sm font-medium transition-colors hover:text-primary', isActive ? 'text-primary' : 'text-foreground');

/** Header dropdown: opens on hover or click; closes on Escape, outside click, mouse leave or navigation. */
function NavMenu({ label, active, children }: { label: string; active: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(true)} /* hover already opens it; a toggle here would close it on the same gesture */
        onMouseEnter={() => setOpen(true)}
        className={cn('flex items-center gap-1 text-sm font-medium hover:text-primary', active ? 'text-primary' : 'text-foreground')}
      >
        {label} <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && <div className="absolute -left-6 top-full z-50 pt-3">{children}</div>}
    </div>
  );
}

function ProductsMenu() {
  const { data } = useCatalogOverview();
  const location = useLocation();
  return (
    <NavMenu label="Products" active={location.pathname.startsWith('/category') || location.pathname.startsWith('/products')}>
      <div className="grid w-[44rem] grid-cols-2 gap-x-8 gap-y-6 rounded-md border bg-card p-6 shadow-hover">
        {(data ?? []).map((c) => (
          <div key={c.id}>
            <Link to={`/category/${c.slug}`} className="flex items-baseline justify-between border-b pb-2 font-semibold hover:text-primary">
              {c.name} <span className="font-mono text-xs font-normal text-muted-foreground">{c.product_count}</span>
            </Link>
            <ul className="mt-2 space-y-1">
              {c.subcategories.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <Link to={`/category/${c.slug}/${s.slug}`} className="text-sm text-muted-foreground hover:text-primary">{s.name}</Link>
                </li>
              ))}
              {c.subcategories.length > 6 && (
                <li><Link to={`/category/${c.slug}`} className="text-sm font-medium text-primary">All {c.subcategories.length} ranges →</Link></li>
              )}
            </ul>
          </div>
        ))}
        {!data && <p className="col-span-2 text-sm text-muted-foreground">Loading product ranges…</p>}
      </div>
    </NavMenu>
  );
}

function IndustriesMenu() {
  const location = useLocation();
  return (
    <NavMenu label="Industries" active={location.pathname.startsWith('/industries')}>
      <ul className="w-80 rounded-md border bg-card p-2 shadow-hover">
        {INDUSTRIES.map((i) => (
          <li key={i.slug}>
            <Link to={industryPath(i)} className="block rounded-sm px-3 py-2 hover:bg-secondary/60">
              <span className="block text-sm font-medium">{i.name}</span>
              <span className="block text-xs text-muted-foreground">For {i.uses}</span>
            </Link>
          </li>
        ))}
      </ul>
    </NavMenu>
  );
}

function MobileMenu() {
  const { data } = useCatalogOverview();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname, location.search]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="mt-6 space-y-6">
          <SearchBar className="flex" onSearch={() => setOpen(false)} />
          <nav className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Products</p>
              <ul className="space-y-2">
                {(data ?? []).map((c) => (
                  <li key={c.id}>
                    <Link to={`/category/${c.slug}`} className="flex justify-between font-medium">
                      {c.name} <span className="font-mono text-sm text-muted-foreground">{c.product_count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t pt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Industries</p>
              <ul className="space-y-2">
                {INDUSTRIES.map((i) => <li key={i.slug}><Link to={industryPath(i)} className="block font-medium">{i.name}</Link></li>)}
              </ul>
            </div>
            <div className="space-y-2 border-t pt-5">
              <Link to="/about" className="block font-medium">About</Link>
              <Link to="/contact" className="block font-medium">Contact</Link>
            </div>
          </nav>
          <Button asChild className="w-full"><Link to={QUOTE_URL}>Request a quote</Link></Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export const Header = () => (
  <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
    <div className="hidden border-b bg-background text-xs text-muted-foreground md:block">
      <div className="container flex h-8 items-center justify-between">
        <span>Export enquiries welcome · replies by email and WhatsApp</span>
        <div className="flex items-center gap-5">
          <a href={`tel:${CONTACT_PHONE_TEL}`} className="flex items-center gap-1.5 hover:text-foreground"><Phone className="h-3 w-3" aria-hidden />{CONTACT_PHONE}</a>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">WhatsApp</a>
          <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-1.5 hover:text-foreground"><Mail className="h-3 w-3" aria-hidden />{CONTACT_EMAIL}</a>
        </div>
      </div>
    </div>
    <div className="container flex h-16 items-center gap-8">
      <Link to="/" className="shrink-0" aria-label="Kewin Chemicals home">
        <img src={logo} alt="Kewin Chemicals Pvt. Ltd." width={134} height={48} className="h-10 w-auto md:h-12" />
      </Link>
      <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
        <ProductsMenu />
        <IndustriesMenu />
        <NavLink to="/about" className={navLink}>About</NavLink>
        <NavLink to="/contact" className={navLink}>Contact</NavLink>
      </nav>
      <div className="ml-auto flex items-center gap-3">
        <SearchBar />
        <Button asChild className="hidden sm:inline-flex"><Link to={QUOTE_URL}>Request a quote</Link></Button>
        <MobileMenu />
      </div>
    </div>
  </header>
);
