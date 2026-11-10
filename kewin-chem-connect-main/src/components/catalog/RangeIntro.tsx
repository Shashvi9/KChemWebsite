import type { Product } from '@/lib/catalog';
import { rangeFaqs, SUPPLY_CONFIRMED, SUPPLY_ROWS, type Supply } from '@/content/rangeSupply';
import { cn } from '@/lib/utils';

/** Range introduction built from the range's own data (uses, CAS coverage), so each hub page has unique,
 *  accurate text. Replace with hand-written copy per range when available. */
export function rangeIntro(rangeName: string, products: Product[]) {
  const uses = new Map<string, number>();
  products.forEach((p) => String(p.attributes?.applications ?? '').split(',').map((s) => s.trim()).filter(Boolean)
    .forEach((u) => uses.set(u, (uses.get(u) ?? 0) + 1)));
  const topUses = [...uses.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([u]) => u.toLowerCase());
  const withCas = products.filter((p) => p.attributes?.cas).length;
  const lower = rangeName.toLowerCase();
  return [
    `Kewin Chemicals manufactures and exports ${lower} from Gujarat, India${withCas === products.length ? ', each listed with its CAS number' : withCas ? ', listed with their CAS numbers' : ''}.`,
    topUses.length ? `They are used mainly for ${topUses.join(', ')}.` : '',
    'Select products below to request samples or an export quote.',
  ].filter(Boolean).join(' ');
}

export function RangeIntro({ rangeName, products }: { rangeName: string; products: Product[] }) {
  return <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">{rangeIntro(rangeName, products)}</p>;
}

/** Supply terms and buyer questions for a range, below its product table. */
export function RangeSupply({ rangeName, supply }: { rangeName: string; supply: Supply }) {
  const rows = SUPPLY_ROWS.filter(([k]) => supply[k]);
  return (
    <div className={cn('mt-12 grid gap-10 lg:grid-cols-2', !SUPPLY_CONFIRMED && 'rounded-md border-2 border-dashed border-amber-400 p-4')}>
      {!SUPPLY_CONFIRMED && <p className="text-xs font-medium text-amber-700 lg:col-span-2">Placeholder supply terms: confirm before publishing.</p>}
      <section aria-labelledby="supply">
        <h2 id="supply" className="text-lg font-semibold">Supply details: {rangeName}</h2>
        <dl className="mt-3 divide-y rounded-md border bg-card text-sm">
          {rows.map(([k, label]) => (
            <div key={k} className="grid grid-cols-[9rem,1fr] gap-3 px-4 py-2.5">
              <dt className="text-muted-foreground">{label}</dt>
              <dd>{supply[k]}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section aria-labelledby="buying">
        <h2 id="buying" className="text-lg font-semibold">Buying {rangeName.toLowerCase()} from Kewin</h2>
        <dl className="mt-3 divide-y rounded-md border bg-card">
          {rangeFaqs(rangeName, supply).map((f) => (
            <div key={f.q} className="px-4 py-3">
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
