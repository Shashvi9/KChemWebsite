import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs, CatalogStatus } from '@/components/catalog/CatalogStatus';
import { findCategory, groupColumns, groupId, groupRanges, plural, slugTitle, useCatalogOverview } from '@/lib/catalog';
import { categorySeo, LOCATION, useSeo } from '@/lib/seo';

const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { data, isLoading, error, refetch } = useCatalogOverview();
  const category = findCategory(data, categorySlug);
  const title = category?.name ?? slugTitle(categorySlug);
  useSeo(category ? categorySeo(category) : null);
  const { hash } = useLocation();
  useEffect(() => {
    if (category && hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [category, hash]);

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

      {category && (() => {
        const groups = groupRanges(category.slug, category.subcategories);
        const card = (s: (typeof category.subcategories)[number]) => (
          <li key={s.id}>
            <Link to={`/category/${category.slug}/${s.slug}`} className="group flex h-full items-center justify-between gap-3 rounded-md border bg-card px-4 py-3 transition-colors hover:border-primary hover:bg-primary/5">
              <span className="text-sm font-medium leading-snug group-hover:text-primary">{s.name}</span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-xs text-muted-foreground">{s.product_count}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" aria-hidden />
              </span>
            </Link>
          </li>
        );
        if (!groups[0].title) return <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{groups[0].ranges.map(card)}</ul>;
        return (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {groupColumns(groups).map((col) => (
              <div key={col[0].title} className="space-y-8">
                {col.map((g) => (
                  <section key={g.title} id={groupId(g.title!)} className="scroll-mt-24">
                    <h2 className="mb-3 text-lg font-semibold tracking-tight">{g.title}</h2>
                    <ul className="space-y-3">{g.ranges.map(card)}</ul>
                  </section>
                ))}
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
};

export default CategoryPage;
