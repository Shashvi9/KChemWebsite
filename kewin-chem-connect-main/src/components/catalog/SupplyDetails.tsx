import { SUPPLY_ROWS, type Supply } from '@/content/rangeSupply';

/** Supply terms as a sidebar card on product pages. */
export function SupplyCard({ supply }: { supply: Supply }) {
  return (
    <div className="rounded-md border bg-card p-5">
      <p id="supply" className="font-semibold">Supply details</p>
      <dl className="mt-3 divide-y text-sm">
        {SUPPLY_ROWS.filter(([k]) => supply[k]).map(([k, label]) => (
          <div key={k} className="py-2 first:pt-0 last:pb-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className="mt-0.5">{supply[k]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
