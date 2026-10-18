import { displayName, type Product } from '@/lib/catalog';

/** Range introduction built from the range's own data (counts, uses, example products), so each hub
 *  page has unique, accurate text. Replace with hand-written copy per range when available. */
export function rangeIntro(rangeName: string, products: Product[]) {
  const uses = new Map<string, number>();
  products.forEach((p) => String(p.attributes?.applications ?? '').split(',').map((s) => s.trim()).filter(Boolean)
    .forEach((u) => uses.set(u, (uses.get(u) ?? 0) + 1)));
  const topUses = [...uses.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([u]) => u.toLowerCase());
  const withCas = products.filter((p) => p.attributes?.cas).length;
  const examples = products.slice(0, 4).map((p) => displayName(p.name));
  const lower = rangeName.toLowerCase();
  return [
    `Kewin Chemicals manufactures and exports ${products.length} ${lower} from Gujarat, India${withCas ? `, ${withCas === products.length ? 'each' : `${withCas}`} listed with its CAS number` : ''}.`,
    topUses.length ? `They are used mainly for ${topUses.join(', ')}.` : '',
    examples.length ? `The range includes ${examples.join(', ')}${products.length > examples.length ? ' and more' : ''}.` : '',
    'Select products below to request samples or an export quote.',
  ].filter(Boolean).join(' ');
}

export function RangeIntro({ rangeName, products }: { rangeName: string; products: Product[] }) {
  return <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">{rangeIntro(rangeName, products)}</p>;
}
