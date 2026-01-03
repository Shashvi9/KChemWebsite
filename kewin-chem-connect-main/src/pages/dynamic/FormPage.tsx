import { useParams } from 'react-router-dom';
import DataTable from '@/components/DataTable';

const FormPage = () => {
  const { categorySlug, subcategorySlug, formSlug } = useParams<{ 
    categorySlug: string; 
    subcategorySlug: string; 
    formSlug: string;
  }>();

  // Convert slug to title case for display and form matching
  const toTitle = (slug: string) =>
    slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const formTitle = formSlug ? toTitle(formSlug) : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {formTitle} - Product List
          </h1>
          <p className="text-muted-foreground">
            Browse our comprehensive database of {formTitle} with technical
            details, specifications, and product information.
          </p>
        </div>

        {/* Data Table */}
        {categorySlug && subcategorySlug && formSlug && (
          <DataTable 
            categorySlug={categorySlug} 
            subcategorySlug={subcategorySlug} 
            form={formTitle}
            title={formTitle}
          />
        )}
      </div>
    </div>
  );
};

export default FormPage;
