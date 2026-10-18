import { Link, useParams } from 'react-router-dom';
import { Breadcrumbs, CatalogStatus } from '@/components/catalog/CatalogStatus';
import { ProductTable } from '@/components/catalog/ProductTable';
import { findSubcategory, useCatalogOverview, type CategorySummary, type Product } from '@/lib/catalog';
import { findIndustry, INDUSTRIES, industryPath, useIndustryProducts, type Industry } from '@/lib/industries';
import { industrySeo, useSeo } from '@/lib/seo';
import NotFound from '@/pages/NotFound';
import { INDUSTRY_GUIDES, type GuideSection } from '@/content/industryGuides';

/** Count products per range, biggest first: "120 acid dyes, 30 direct dyes". */
export function rangeBreakdown(products: Product[], overview: CategorySummary[] | undefined) {
  const n = new Map<string, number>();
  products.forEach((p) => {
    const name = findSubcategory(overview, p.subcategory_id)?.subcategory.name;
    if (name) n.set(name, (n.get(name) ?? 0) + 1);
  });
  return [...n.entries()].sort((a, b) => b[1] - a[1]);
}

export function industryIntro(ind: Industry, products: Product[], overview: CategorySummary[] | undefined) {
  const ranges = rangeBreakdown(products, overview).slice(0, 4).map(([r]) => r.toLowerCase());
  const joined = ranges.length > 1 ? `${ranges.slice(0, -1).join(', ')} and ${ranges[ranges.length - 1]}` : ranges[0];
  return [
    `Kewin Chemicals manufactures and exports dyes for ${ind.uses}, from Ahmedabad, Gujarat, India.`,
    joined ? `The range includes ${joined}.` : '',
    'Each product is listed with its CAS number. Select products to request samples or an export quote.',
  ].filter(Boolean).join(' ');
}

function Guide({ sections }: { sections: GuideSection[] }) {
  return (
    <section className="mt-14 max-w-3xl space-y-10">
      {sections.map((sec) => (
        <div key={sec.heading}>
          <h2 className="text-xl font-semibold tracking-tight">{sec.heading}</h2>
          {sec.paragraphs?.map((t) => <p key={t.slice(0, 40)} className="mt-3 leading-relaxed text-muted-foreground">{t}</p>)}
          {sec.points && (
            <dl className="mt-4 divide-y rounded-md border bg-card">
              {sec.points.map((pt) => (
                <div key={pt.term} className="grid gap-1 px-4 py-3 sm:grid-cols-[14rem,1fr] sm:gap-6">
                  <dt className="font-medium">{pt.term}</dt>
                  <dd className="text-sm leading-relaxed text-muted-foreground">{pt.text}</dd>
                </div>
              ))}
            </dl>
          )}
          {sec.links?.map((l) => (
            <Link key={l.to} to={l.to} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">{l.label} →</Link>
          ))}
        </div>
      ))}
    </section>
  );
}

function Body({ ind }: { ind: Industry }) {
  const { data: overview } = useCatalogOverview();
  const q = useIndustryProducts(ind);
  useSeo(q.data ? industrySeo(ind, q.data.length) : null);

  return (
    <div className="container py-10 md:py-14">
      <Breadcrumbs items={[{ label: 'Industries' }, { label: ind.name }]} />
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{ind.name}</h1>
        <p className="mt-1 text-sm font-medium text-muted-foreground">Manufacturer, exporter and supplier in Ahmedabad, Gujarat, India</p>
        {q.data && <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">{industryIntro(ind, q.data, overview)}</p>}
      </header>
      <CatalogStatus loading={q.isLoading} error={q.error} onRetry={() => q.refetch()} />
      {q.data && (
        <ProductTable
          products={q.data}
          categorySlug="industry"
          subcategorySlug={ind.slug}
        />
      )}
      {INDUSTRY_GUIDES[ind.slug] && <Guide sections={INDUSTRY_GUIDES[ind.slug]} />}
      <nav aria-label="Other industries" className="mt-12 border-t pt-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Other industries</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {INDUSTRIES.filter((i) => i.slug !== ind.slug).map((i) => (
            <li key={i.slug}><Link to={industryPath(i)} className="inline-block rounded-sm border bg-card px-3 py-1.5 text-sm hover:border-primary hover:text-primary">{i.name}</Link></li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

const IndustryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const ind = findIndustry(slug);
  return ind ? <Body ind={ind} /> : <NotFound />;
};

export default IndustryPage;
