import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs, CatalogStatus } from '@/components/catalog/CatalogStatus';
import { findCategory, plural, slugTitle, useCatalogOverview } from '@/lib/catalog';
import { categorySeo, LOCATION, useSeo } from '@/lib/seo';

const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { data, isLoading, error, refetch } = useCatalogOverview();
  const category = findCategory(data, categorySlug);
  const title = category?.name ?? slugTitle(categorySlug);
  useSeo(category ? categorySeo(category) : null);

  return (
    <div className="container py-10 md:py-14">
      <Breadcrumbs items={[{ label: title }]} />
      <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Manufacturer, exporter and supplier in {LOCATION}</p>
        </div>
        {category && <p className="font-mono text-sm text-muted-foreground">{plural(category.product_count, 'product')} · {plural(category.subcategories.length, 'range')}</p>}
      </header>

      <CatalogStatus loading={isLoading} error={error} onRetry={() => refetch()} />
      {data && !category && (
        <p className="rounded-md border bg-card p-8 text-center text-muted-foreground">
          This range isn't available. <Link to="/" className="font-medium text-primary hover:underline">See all products</Link>
        </p>
      )}

      {category && (
        <ul className="divide-y overflow-hidden rounded-md border bg-card">
          {category.subcategories.map((s) => (
            <li key={s.id}>
              <Link to={`/category/${category.slug}/${s.slug}`} className="group flex items-center justify-between gap-4 px-5 py-4 hover:bg-secondary/40">
                <span className="font-medium group-hover:text-primary">{s.name}</span>
                <span className="flex items-center gap-4">
                  <span className="font-mono text-sm text-muted-foreground">{s.product_count}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoryPage;
