import { useParams } from 'react-router-dom';
import { Breadcrumbs, CatalogStatus } from '@/components/catalog/CatalogStatus';
import { ProductTable } from '@/components/catalog/ProductTable';
import { findCategory, slugTitle, useCatalogOverview, useProducts } from '@/lib/catalog';

const SubcategoryPage = () => {
  const { categorySlug = '', subcategorySlug = '' } = useParams<{ categorySlug: string; subcategorySlug: string }>();
  const { data: overview } = useCatalogOverview();
  const products = useProducts(categorySlug, subcategorySlug);
  const category = findCategory(overview, categorySlug);
  const sub = category?.subcategories.find((s) => s.slug === subcategorySlug);
  const title = sub?.name ?? slugTitle(subcategorySlug);

  return (
    <div className="container py-10 md:py-14">
      <Breadcrumbs items={[{ label: category?.name ?? slugTitle(categorySlug), to: `/category/${categorySlug}` }, { label: title }]} />
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Select products to request a quote or samples together, or use “Sample” on any row.
        </p>
      </header>
      <CatalogStatus loading={products.isLoading} error={products.error} onRetry={() => products.refetch()} />
      {products.data && (
        <ProductTable products={products.data} categorySlug={categorySlug} subcategorySlug={subcategorySlug} />
      )}
    </div>
  );
};

export default SubcategoryPage;
