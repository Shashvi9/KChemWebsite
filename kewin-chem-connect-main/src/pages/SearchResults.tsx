import { Link, useSearchParams } from 'react-router-dom';
import { Breadcrumbs, CatalogStatus } from '@/components/catalog/CatalogStatus';
import { ProductTable } from '@/components/catalog/ProductTable';
import { findSubcategory, useCatalogOverview, useProductSearch } from '@/lib/catalog';
import { WHATSAPP_URL } from '@/lib/contact';
import { staticSeo, useSeo } from '@/lib/seo';

const SearchResults = () => {
  useSeo(staticSeo['/search']);
  const [params] = useSearchParams();
  const q = (params.get('q') ?? '').trim();
  const { data: overview } = useCatalogOverview();
  const search = useProductSearch(q);

  return (
    <div className="container py-10 md:py-14">
      <Breadcrumbs items={[{ label: 'Search' }]} />
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">
        {q ? <>Results for “{q}”</> : 'Search the catalogue'}
      </h1>
      {q.length < 2 && <p className="text-muted-foreground">Enter at least 2 characters: a product name, C.I. name or CAS number.</p>}
      <CatalogStatus loading={search.isLoading} error={search.error} onRetry={() => search.refetch()} />
      {search.data && search.data.length > 0 && (
        <ProductTable
          products={search.data}
          categorySlug="search"
          subcategorySlug="search"
          extraColumn={{
            label: 'Range',
            value: (p) => {
              const hit = findSubcategory(overview, p.subcategory_id);
              return hit ? <Link to={`/category/${hit.category.slug}/${hit.subcategory.slug}`} className="hover:text-primary">{hit.subcategory.name}</Link> : '—';
            },
          }}
        />
      )}
      {search.data && search.data.length === 0 && (
        <div className="rounded-md border bg-card p-8 text-center">
          <p className="font-medium">Nothing matches “{q}”.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Can't find it? <Link to={`/contact?subject=${encodeURIComponent(`Enquiry: ${q}`)}`} className="font-medium text-primary hover:underline">Ask us about it</Link> or{' '}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">message us on WhatsApp</a>.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
