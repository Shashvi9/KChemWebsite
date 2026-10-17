import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RequestSampleDialog from '@/components/RequestSampleDialog';
import { columnLabel, displayName, isCodeColumn, orderColumns, type Product } from '@/lib/catalog';
import { cn } from '@/lib/utils';

type Props = {
  products: Product[];
  categorySlug: string;
  subcategorySlug: string;
  /** Extra leading column, e.g. the range each search result belongs to. */
  extraColumn?: { label: string; value: (p: Product) => React.ReactNode };
};

const cell = (v: unknown) => (v === undefined || v === null || v === '' || v === '-' ? '—' : String(v));

export function ProductTable({ products, categorySlug, subcategorySlug, extraColumn }: Props) {
  const [filter, setFilter] = useState('');
  const [app, setApp] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const columns = useMemo(() => {
    const keys = new Set<string>();
    products.forEach((p) => Object.keys(p.attributes ?? {}).forEach((k) => keys.add(k)));
    return orderColumns([...keys]);
  }, [products]);

  // Application chips only when the range has them (dyes); counted so buyers see what each filter yields.
  const applications = useMemo(() => {
    const n = new Map<string, number>();
    products.forEach((p) =>
      String(p.attributes?.applications ?? '').split(',').map((s) => s.trim()).filter(Boolean)
        .forEach((a) => n.set(a, (n.get(a) ?? 0) + 1)));
    return [...n.entries()].sort((a, b) => b[1] - a[1]);
  }, [products]);

  const rows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return products.filter((p) => {
      if (app && !String(p.attributes?.applications ?? '').includes(app)) return false;
      if (!q) return true;
      return [p.name, ...Object.values(p.attributes ?? {})].some((v) => String(v).toLowerCase().includes(q));
    });
  }, [products, filter, app]);

  const toggle = (id: number) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  const allVisibleSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggleAll = () =>
    setSelected((s) => {
      const next = new Set(s);
      rows.forEach((r) => (allVisibleSelected ? next.delete(r.id) : next.add(r.id)));
      return next;
    });
  const chosen = products.filter((p) => selected.has(p.id)).map((p) => ({ id: p.id, name: displayName(p.name) }));

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <label htmlFor="table-filter" className="sr-only">Filter this list</label>
          <input
            id="table-filter"
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by name, CAS or C.I. name"
            className="h-10 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {rows.length === products.length ? `${products.length} products` : `${rows.length} of ${products.length} products`}
        </p>
      </div>

      {applications.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by application">
          {applications.map(([a, n]) => (
            <button
              key={a}
              type="button"
              aria-pressed={app === a}
              onClick={() => setApp(app === a ? null : a)}
              className={cn('rounded-sm border px-2.5 py-1 text-xs transition-colors',
                app === a ? 'border-foreground bg-foreground text-background' : 'bg-card hover:border-foreground')}
            >
              {a} <span className="font-mono opacity-60">{n}</span>
            </button>
          ))}
        </div>
      )}

      {/* Desktop / tablet: table with a sticky product column */}
      <div className="mt-4 hidden overflow-x-auto rounded-md border bg-card md:block">
        <table className="w-full text-sm">
          <thead className="border-b bg-secondary/60 text-left">
            <tr>
              <th scope="col" className="sticky left-0 z-10 w-10 bg-secondary px-3 py-2.5">
                <input type="checkbox" aria-label="Select all shown" checked={allVisibleSelected} onChange={toggleAll} className="h-4 w-4 accent-[hsl(var(--primary))]" />
              </th>
              <th scope="col" className="sticky left-10 z-10 bg-secondary px-3 py-2.5 font-medium">Product</th>
              {extraColumn && <th scope="col" className="px-3 py-2.5 font-medium">{extraColumn.label}</th>}
              {columns.map((k) => <th key={k} scope="col" className="whitespace-nowrap px-3 py-2.5 font-medium">{columnLabel(k)}</th>)}
              <th scope="col" className="px-3 py-2.5"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const on = selected.has(p.id);
              return (
                <tr key={p.id} className={cn('border-b last:border-0', on ? 'bg-primary/5' : 'hover:bg-secondary/40')}>
                  <td className={cn('sticky left-0 px-3 py-2.5', on ? 'bg-[hsl(23_86%_97%)]' : 'bg-card')}>
                    <input type="checkbox" aria-label={`Select ${displayName(p.name)}`} checked={on} onChange={() => toggle(p.id)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                  </td>
                  <th scope="row" className={cn('sticky left-10 min-w-[11rem] max-w-[20rem] px-3 py-2.5 text-left font-medium', on ? 'bg-[hsl(23_86%_97%)]' : 'bg-card')}>
                    {displayName(p.name)}
                  </th>
                  {extraColumn && <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{extraColumn.value(p)}</td>}
                  {columns.map((k) => (
                    <td key={k} className={cn('px-3 py-2.5 align-top', isCodeColumn(k) ? 'whitespace-nowrap font-mono text-[13px]' : 'min-w-[10rem] text-muted-foreground')}>
                      {cell(p.attributes?.[k])}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    <RequestSampleDialog
                      trigger={<Button size="sm" variant="ghost" className="text-primary hover:text-primary">Sample</Button>}
                      context={{ categorySlug, subcategorySlug, product: { id: p.id, name: displayName(p.name), attributes: p.attributes } }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: one card per product, nothing hidden off-screen */}
      <ul className="mt-4 space-y-2 md:hidden">
        {rows.map((p) => {
          const on = selected.has(p.id);
          return (
            <li key={p.id} className={cn('rounded-md border bg-card p-4', on && 'border-primary bg-primary/5')}>
              <div className="flex items-start gap-3">
                <input type="checkbox" aria-label={`Select ${displayName(p.name)}`} checked={on} onChange={() => toggle(p.id)} className="mt-1 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{displayName(p.name)}</p>
                  <dl className="mt-1.5 grid grid-cols-[auto,1fr] gap-x-3 gap-y-0.5 text-sm">
                    {extraColumn && <><dt className="text-muted-foreground">{extraColumn.label}</dt><dd>{extraColumn.value(p)}</dd></>}
                    {columns.filter((k) => cell(p.attributes?.[k]) !== '—').map((k) => (
                      <div key={k} className="contents">
                        <dt className="text-muted-foreground">{columnLabel(k)}</dt>
                        <dd className={cn('min-w-0 break-words', isCodeColumn(k) && 'font-mono text-[13px]')}>{cell(p.attributes?.[k])}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {rows.length === 0 && (
        <div className="mt-4 rounded-md border bg-card p-8 text-center text-sm text-muted-foreground">
          No products match{filter && <> “{filter}”</>}{app && <> in {app}</>}.{' '}
          <button type="button" className="font-medium text-primary hover:underline" onClick={() => { setFilter(''); setApp(null); }}>Clear filters</button>
        </div>
      )}

      {selected.size > 0 && (
        <div className="sticky bottom-4 z-20 mr-16 mt-6 flex items-center justify-between gap-3 rounded-md bg-foreground px-4 py-3 text-background shadow-hover sm:mr-40">
          {/* right margin leaves room for the floating WhatsApp button */}
          <span className="whitespace-nowrap text-sm">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" aria-label="Clear selection" className="px-2 text-background hover:bg-background/10 hover:text-background sm:px-3" onClick={() => setSelected(new Set())}>
              <X className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Clear</span>
            </Button>
            <RequestSampleDialog
              trigger={<Button size="sm"><span className="sm:hidden">Get quote</span><span className="hidden sm:inline">Request quote for {selected.size}</span></Button>}
              context={{ categorySlug, subcategorySlug, products: chosen }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
