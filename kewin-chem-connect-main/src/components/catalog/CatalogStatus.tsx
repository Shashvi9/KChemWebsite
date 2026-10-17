import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadError from '@/components/LoadError';

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li><Link to="/" className="hover:text-foreground">Home</Link></li>
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-1.5">
            <span aria-hidden>/</span>
            {it.to ? <Link to={it.to} className="hover:text-foreground">{it.label}</Link> : <span aria-current="page" className="text-foreground">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Loading / error states shared by catalogue pages (the API may be waking up). */
export function CatalogStatus({ loading, error, onRetry }: { loading: boolean; error: unknown; onRetry: () => void }) {
  if (error) return <LoadError onRetry={onRetry} />;
  if (!loading) return null;
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
      <p>Loading products…</p>
      <p className="text-sm">This can take up to 30 seconds the first time.</p>
    </div>
  );
}
