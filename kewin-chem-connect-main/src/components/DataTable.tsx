import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RequestSampleDialog from "@/components/RequestSampleDialog";

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

interface Props {
  categorySlug?: string;
  subcategorySlug?: string;
  form?: string;
  initialData?: Product[];
  title?: string;
}

type Product = {
  id: number;
  name: string;
  form: string | null;
  attributes: Record<string, any> | null;
};

const DataTable: React.FC<Props> = ({ categorySlug, subcategorySlug, form, initialData, title }) => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If initialData is provided, use it directly
    if (initialData) {
      setData(initialData);
      setLoading(false);
      return;
    }

    // Otherwise fetch from API
    if (!categorySlug || !subcategorySlug) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          category_slug: categorySlug,
          subcategory_slug: subcategorySlug,
        });

        if (form) {
          params.append("form", form);
        }

        const response = await fetch(`${API_BASE}/products/?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const result: Product[] = await response.json();
        setData(result);
      } catch (err: any) {
        console.error("Error loading data:", err);
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug, subcategorySlug, form, initialData]);

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
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title || form || 'Products'}</CardTitle>
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
            <div className="overflow-auto rounded-md border max-h-[70vh]">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium bg-muted/40">Name</th>
                    <th className="px-3 py-2 text-left font-medium bg-muted/40">Form</th>
                    {attributeKeys.map(key => (
                      <th key={key} className="px-3 py-2 text-left font-medium capitalize bg-muted/40">{key.replace(/_/g, ' ')}</th>
                    ))}
                    <th className="px-3 py-2 text-left font-medium bg-muted/40">Actions</th>
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
  );
};

export default DataTable;