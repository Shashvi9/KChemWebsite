import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RequestSampleDialog from '@/components/RequestSampleDialog';

type Product = {
  id: number;
  subcategory_id: number;
  name: string;
  form?: string | null;
  attributes?: Record<string, any> | null;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export default function SubcategoryDetail() {
  const { categorySlug, subcategorySlug } = useParams();
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        // Map frontend route slugs to backend category slugs
        const mappedCategory = (categorySlug === 'food-pharma')
          ? 'food-pharma-colors'
          : categorySlug || '';
        const url = `${API_BASE}/products?category_slug=${encodeURIComponent(mappedCategory)}&subcategory_slug=${encodeURIComponent(subcategorySlug || '')}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        const json: Product[] = await res.json();
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [categorySlug, subcategorySlug]);

  // Determine dynamic columns from attributes union
  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();
    data.forEach(p => {
      const attrs = p.attributes || {};
      Object.keys(attrs).forEach(k => keys.add(k));
    });
    return Array.from(keys).sort();
  }, [data]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-10">
      <div className="container mx-auto px-4">
        <div className="mb-6 text-sm text-muted-foreground">
          <Link to={`/${categorySlug}`} className="hover:underline">{categorySlug}</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">{subcategorySlug}</span>
        </div>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="capitalize">{subcategorySlug?.replace(/-/g, ' ')}</CardTitle>
            <RequestSampleDialog
              trigger={<Button>Request Sample</Button>}
              context={{ categorySlug: categorySlug || '', subcategorySlug: subcategorySlug || '', product: null }}
            />
          </CardHeader>
          <CardContent>
            {loading && <div className="text-muted-foreground">Loading products...</div>}
            {error && <div className="text-red-600">{error}</div>}
            {!loading && !error && (
              data.length === 0 ? (
                <div className="text-muted-foreground">No products found.</div>
              ) : (
                <div className="overflow-auto rounded-md border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Name</th>
                        <th className="px-3 py-2 text-left font-medium">Form</th>
                        {attributeKeys.map(key => (
                          <th key={key} className="px-3 py-2 text-left font-medium capitalize">{key.replace(/_/g, ' ')}</th>
                        ))}
                        <th className="px-3 py-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((p) => (
                        <tr key={p.id} className="border-t">
                          <td className="px-3 py-2 whitespace-nowrap">{p.name}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{p.form || '-'}</td>
                          {attributeKeys.map(key => (
                            <td key={key} className="px-3 py-2">
                              {String((p.attributes || {})[key] ?? '-')}
                            </td>
                          ))}
                          <td className="px-3 py-2">
                            <RequestSampleDialog
                              trigger={<Button size="sm" variant="outline">Request sample</Button>}
                              context={{
                                categorySlug: categorySlug || '',
                                subcategorySlug: subcategorySlug || '',
                                product: { id: p.id, name: p.name, form: p.form, attributes: p.attributes || {} },
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
