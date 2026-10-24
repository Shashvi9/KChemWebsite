import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { plural, useCatalogOverview, type CategorySummary } from '@/lib/catalog';
import { FACILITIES, HEAD_OFFICE, WHATSAPP_URL } from '@/lib/contact';
import { homeSeo, useSeo } from '@/lib/seo';
import { INDUSTRIES, industryPath } from '@/lib/industries';

const YEAR_FOUNDED = 1999;

// Products from the live catalogue; colours are indicative screen approximations of each dye's shade.
const SHADES = [
  { name: 'Acid Yellow 17', hex: '#F2D22E' },
  { name: 'Tartrazine', hex: '#F4BE00' },
  { name: 'Sunset Yellow FCF', hex: '#F08A1C' },
  { name: 'Acid Orange 7', hex: '#E9621F' },
  { name: 'Acid Red 18', hex: '#D3262F' },
  { name: 'Carmoisine', hex: '#AE1631' },
  { name: 'Acid Violet 17', hex: '#6A2C91' },
  { name: 'Basic Blue 9', hex: '#1B6EB3' },
  { name: 'Acid Blue 113', hex: '#24397A' },
  { name: 'Acid Green 25', hex: '#1F7A4F' },
  { name: 'Acid Brown 14', hex: '#7A3B1E' },
  { name: 'Acid Black 1', hex: '#222027' },
];

const CATEGORY_BLURB: Record<string, string> = {
  'dyes-intermediates': 'Acid, basic, reactive, direct and solvent dyes for textiles, leather, paper and inks.',
  'dye-intermediates': 'Naphthalene, aniline, phenol, pyrazolone and other intermediates for dye and pigment manufacturing.',
  'food-pharma-colors': 'FD&C, D&C, lake and blended colours for food, beverages, pharmaceuticals and cosmetics.',
  pigments: 'Organic toner and fanal pigments.',
  'pharmaceutical-products': 'Human and veterinary formulations and nutraceutical ingredients.',
};

// Industries without their own page link to the matching product category.
const MORE_INDUSTRIES = [
  { name: 'Food & beverages', to: '/category/food-pharma-colors' },
  { name: 'Pharmaceuticals', to: '/category/pharmaceutical-products' },
];

function Hero() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  return (
    <section className="border-b">
      <div className="container grid gap-12 py-14 md:py-20 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <p className="mb-5 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-brand-green" aria-hidden />
            Manufacturer &amp; exporter · Ahmedabad, India · since {YEAR_FOUNDED}
          </p>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            Dyes, dye intermediates and food colours: manufacturer and exporter in Gujarat, India.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Search our catalogue by product name or CAS number, request a free sample, and get a quote from our export team.
          </p>
          <form
            role="search"
            className="mt-8 flex max-w-xl flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
            }}
          >
            <label htmlFor="hero-search" className="sr-only">Search by product name or CAS number</label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                id="hero-search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="e.g. Acid Red 18 or 2611-82-7"
                className="h-12 w-full rounded-md border border-input bg-card pl-10 pr-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Button type="submit" size="lg" className="h-12">Search</Button>
          </form>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link to="#products" className="font-medium text-primary hover:underline" onClick={(e) => { e.preventDefault(); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Browse the catalogue →
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Ask on WhatsApp →</a>
          </div>
        </div>

        <figure className="lg:col-span-5">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {SHADES.map((s) => (
              <Link key={s.name} to={`/search?q=${encodeURIComponent(s.name)}`} className="group block" title={s.name}>
                <span className="block aspect-[4/5] rounded-sm ring-1 ring-black/5 transition-transform group-hover:-translate-y-0.5" style={{ background: s.hex }} />
                <span className="mt-1.5 block text-[11px] leading-tight text-muted-foreground group-hover:text-foreground">{s.name}</span>
              </Link>
            ))}
          </div>
          <figcaption className="mt-3 text-xs text-muted-foreground">Indicative shades from our range. Actual shade depends on substrate and process.</figcaption>
        </figure>
      </div>
    </section>
  );
}

function Facts({ total }: { total?: number }) {
  const facts = [
    { value: `${new Date().getFullYear() - YEAR_FOUNDED}+`, label: 'years manufacturing' },
    { value: '2', label: 'manufacturing units in India' },
    { value: total ? total.toLocaleString() : '1,400+', label: 'products in the catalogue' },
    { value: '20+', label: 'export countries' },
  ];
  return (
    <section className="border-b bg-card">
      <dl className="container grid grid-cols-2 divide-border md:grid-cols-4 md:divide-x">
        {facts.map((f) => (
          <div key={f.label} className="flex flex-col py-6 md:px-6 md:first:pl-0">
            <dt className="text-sm text-muted-foreground">{f.label}</dt>
            <dd className="order-first font-mono text-3xl font-medium">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function FamilyCard({ c, className = '' }: { c: CategorySummary; className?: string }) {
  return (
    <div className={`flex flex-col bg-card p-6 md:p-8 ${className}`}>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-xl font-semibold">
          <Link to={`/category/${c.slug}`} className="hover:text-primary">{c.name}</Link>
        </h3>
        <span className="shrink-0 font-mono text-sm text-muted-foreground">{plural(c.product_count, 'product')}</span>
      </div>
      {CATEGORY_BLURB[c.slug] && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{CATEGORY_BLURB[c.slug]}</p>}
      <ul className="mt-5 flex flex-wrap gap-2">
        {c.subcategories.slice(0, 8).map((s) => (
          <li key={s.id}>
            <Link to={`/category/${c.slug}/${s.slug}`} className="inline-flex items-center gap-1.5 rounded-sm border bg-background px-2.5 py-1 text-sm hover:border-primary hover:text-primary">
              {s.name} <span className="font-mono text-xs text-muted-foreground">{s.product_count}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to={`/category/${c.slug}`} className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium text-primary hover:underline">
        {c.subcategories.length === 1 ? 'View range' : `View all ${c.subcategories.length} ranges`} <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

function Families() {
  const { data, isLoading } = useCatalogOverview();
  const cats = data ?? [];
  const last = cats.length % 2 ? cats[cats.length - 1] : null;
  const paired = last ? cats.slice(0, -1) : cats;
  return (
    <section id="products" className="scroll-mt-24 py-16 md:py-20">
      <div className="container">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">Product ranges</h2>
          <p className="mt-3 text-muted-foreground">Every product is listed with its CAS number. Pick a range to see the full list and request samples.</p>
        </div>
        <div className={`grid gap-px overflow-hidden rounded-md border bg-border md:grid-cols-2 ${last ? 'rounded-b-none' : ''}`}>
          {paired.map((c) => <FamilyCard key={c.id} c={c} />)}
          {isLoading && Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-56 animate-pulse bg-card" />)}
        </div>
        {last && <FamilyCard c={last} className="-mt-px rounded-b-md border md:mx-auto md:w-1/2" />}
      </div>
    </section>
  );
}

function Industries() {
  return (
    <section className="border-y bg-secondary/50 py-12">
      <div className="container flex flex-col gap-4 md:flex-row md:items-baseline md:gap-10">
        <h2 className="shrink-0 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Industries we supply</h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-lg">
          {[...INDUSTRIES.map((i) => ({ name: i.name, to: industryPath(i) })), ...MORE_INDUSTRIES].map((i) => (
            <li key={i.name}><Link to={i.to} className="underline decoration-border underline-offset-4 hover:text-primary hover:decoration-primary">{i.name}</Link></li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function HowToOrder() {
  const steps = [
    { t: 'Find the product', d: 'Browse a range or search by name, C.I. name or CAS number.' },
    { t: 'Request a sample or quote', d: 'Select one or several products and tell us the quantity and your country.' },
    { t: 'Talk to our export team', d: 'We reply by email or WhatsApp with pricing, documents and shipping terms.' },
  ];
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <h2 className="text-3xl font-semibold tracking-tight">How to order</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.t} className="border-t-2 border-foreground pt-5">
              <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Locations() {
  const places = [{ name: 'Head office', address: HEAD_OFFICE, map: undefined as string | undefined }, ...FACILITIES];
  return (
    <section className="border-t bg-card py-16 md:py-20">
      <div className="container grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="text-3xl font-semibold tracking-tight">Where we make it</h2>
          <p className="mt-3 text-muted-foreground">Two manufacturing units in western and central India, managed from our Ahmedabad office.</p>
        </div>
        <ul className="grid gap-6 sm:grid-cols-3 lg:col-span-8">
          {places.map((p) => (
            <li key={p.name} className="rounded-md border p-5">
              <MapPin className="h-5 w-5 text-primary" aria-hidden />
              <h3 className="mt-3 font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.address}</p>
              {p.map && <a href={p.map} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">Map →</a>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Need a price or a sample?</h2>
          <p className="mt-1 text-primary-foreground/85">Tell us the product, quantity and destination port.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" variant="secondary"><Link to="/contact?subject=Quote%20request">Request a quote</Link></Button>
          <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

const Index = () => {
  const { data } = useCatalogOverview();
  useSeo(homeSeo());
  return (
    <>
      <Hero />
      <Facts total={data?.reduce((n, c) => n + c.product_count, 0)} />
      <Families />
      <Industries />
      <HowToOrder />
      <Locations />
      <ClosingCta />
    </>
  );
};

export default Index;
