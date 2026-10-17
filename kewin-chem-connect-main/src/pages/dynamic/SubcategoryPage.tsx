import { useParams } from 'react-router-dom';
import DataTable from '@/components/DataTable';

const toTitle = (slug: string) =>
  slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const SubcategoryPage = () => {
  const { categorySlug, subcategorySlug } = useParams<{ categorySlug: string; subcategorySlug: string }>();
  const subcategoryTitle = subcategorySlug ? toTitle(subcategorySlug) : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{subcategoryTitle}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore our range of {subcategoryTitle.toLowerCase()} products.
          </p>
        </div>
        <DataTable categorySlug={categorySlug} subcategorySlug={subcategorySlug} title={subcategoryTitle} />
      </div>
    </div>
  );
};

export default SubcategoryPage;
