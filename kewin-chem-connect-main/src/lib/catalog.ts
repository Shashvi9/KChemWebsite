import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/apiConfig';

export type SubcategorySummary = { id: number; name: string; slug: string; category_id: number; product_count: number };
export type CategorySummary = { id: number; name: string; slug: string; product_count: number; subcategories: SubcategorySummary[] };
export type Product = { id: number; name: string; slug?: string | null; attributes: Record<string, string | number> | null; subcategory_id: number };
export type RangeRef = { name: string; slug: string; category_slug: string; category_name: string };
export type Chemistry = {
  iupac_name: string | null;
  exact_mass: string | null;
  properties: Record<string, string>;
};
export type ProductDetail = Product & {
  slug: string;
  product_type: string | null;
  ranges: RangeRef[];
  related: { name: string; slug: string; cas: string | null }[];
  documents: { type: string; url: string }[];
  indexable: boolean;
  chemistry?: Chemistry | null;
  updated_at: string | null;
};

const HOUR = 60 * 60 * 1000;

// ponytail: display order lives here until categories.sort_order is set in the DB (admin), then drop this.
const CATEGORY_ORDER = ['dyes-intermediates', 'dye-intermediates', 'food-pharma-colors', 'pigments', 'pharmaceutical-products'];
const rank = (slug: string) => (CATEGORY_ORDER.indexOf(slug) + 1 || 99);
export const sortOverview = (cats: CategorySummary[]) => [...cats].sort((a, b) => rank(a.slug) - rank(b.slug));

const RANGE_GROUPS: Record<string, [string, string[]][]> = {
  'dyes-intermediates': [
    ['Acid', ['acid-dyes', 'levelling-dyes', 'metal-complex-11-dyes', 'metal-complex-12-dyes', 'milling-dyes']],
    ['Basic', ['basic-dyes-liquid', 'basic-dyes-powder']],
    ['Reactive', ['reactive-dyes-he', 'reactive-dyes-hot-brand', 'reactive-dyes-me', 'reactive-printing-dyes', 'vinyl-sulphone-base-dyes']],
    ['Direct', ['direct-dyes']],
    ['Solvent', ['solvent-dyes']],
  ],
};

export const groupId = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** A category's ranges under headings; ranges not listed in RANGE_GROUPS fall under "Other". */
export function groupRanges<T extends { slug: string }>(categorySlug: string, ranges: T[]): { title: string | null; ranges: T[] }[] {
  const groups = RANGE_GROUPS[categorySlug];
  if (!groups) return [{ title: null, ranges }];
  const out = groups.map(([title, slugs]) => ({ title, ranges: slugs.map((s) => ranges.find((r) => r.slug === s)).filter((r): r is T => !!r) }));
  const listed = new Set(groups.flatMap(([, slugs]) => slugs));
  out.push({ title: 'Other', ranges: ranges.filter((r) => !listed.has(r.slug)) });
  return out.filter((g) => g.ranges.length > 0);
}

/** Groups laid out as columns: each large group alone, the small ones (two ranges or fewer) stacked together second. */
export function groupColumns<G extends { ranges: unknown[] }>(groups: G[]): G[][] {
  const small = groups.filter((g) => g.ranges.length <= 2);
  const columns = groups.filter((g) => g.ranges.length > 2).map((g) => [g]);
  if (small.length) columns.splice(1, 0, small);
  return columns;
}

/** Categories with subcategories and counts. Cached for the session: one cold-start hit, then instant menus. */
export function useCatalogOverview() {
  return useQuery({
    queryKey: ['catalog-overview'],
    queryFn: async () => sortOverview(await apiGet<CategorySummary[]>('/categories/overview')),
    staleTime: HOUR,
  });
}

/** Applications across products with how many products list each, most common first. */
export function topUses(products: Product[], n: number): [string, number][] {
  const uses = new Map<string, number>();
  products.forEach((p) => String(p.attributes?.applications ?? '').split(',').map((s) => s.trim()).filter(Boolean)
    .forEach((u) => uses.set(u, (uses.get(u) ?? 0) + 1)));
  return [...uses.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

export const plural =(n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function useProducts(categorySlug?: string, subcategorySlug?: string) {
  return useQuery({
    queryKey: ['products', categorySlug, subcategorySlug],
    queryFn: () =>
      apiGet<Product[]>(`/products/?${new URLSearchParams({ category_slug: categorySlug!, subcategory_slug: subcategorySlug! })}`),
    enabled: !!categorySlug && !!subcategorySlug,
    staleTime: HOUR,
  });
}

export function useProductDetail(slug?: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => apiGet<ProductDetail>(`/products/by-slug/${encodeURIComponent(slug!)}`),
    enabled: !!slug,
    staleTime: HOUR,
  });
}

export const productPath = (slug?: string | null) => (slug ? `/products/${slug}` : undefined);

export function useProductSearch(q: string) {
  const term = q.trim();
  return useQuery({
    queryKey: ['search', term.toLowerCase()],
    queryFn: () => apiGet<Product[]>(`/products/search?q=${encodeURIComponent(term)}&limit=200`),
    enabled: term.length >= 2,
    staleTime: HOUR,
  });
}

export function findCategory(overview: CategorySummary[] | undefined, slug?: string) {
  return overview?.find((c) => c.slug === slug);
}

export function findSubcategory(overview: CategorySummary[] | undefined, id?: number | string) {
  for (const c of overview ?? []) {
    const s = c.subcategories.find((x) => x.id === id || x.slug === id);
    if (s) return { category: c, subcategory: s };
  }
  return undefined;
}

/** Fallback title from a URL slug while the overview loads ("food-pharma-colors" -> "Food Pharma Colors"). */
export const slugTitle = (slug = '') => slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

// Uppercase tokens that must stay uppercase when tidying ALL-CAPS product names.
const KEEP_UPPER = new Set(['FCF', 'FD&C', 'D&C', 'HE', 'ME', 'PN', 'H', 'G', 'R', 'B', 'K', 'BP', 'IP', 'USP', 'WSP', 'II', 'III']);

/** "ACID RED 114" -> "Acid Red 114", "SUNSET YELLOW FCF" -> "Sunset Yellow FCF". Mixed-case names are left alone. */
export function displayName(name: string) {
  if (name !== name.toUpperCase() || !/[A-Z]{3}/.test(name)) return name;
  return name
    .split(/(\s+|-)/)
    .map((w) => (KEEP_UPPER.has(w) || /\d/.test(w) || w.length <= 1 ? w : w.charAt(0) + w.slice(1).toLowerCase()))
    .join('');
}

/** The trade abbreviation buyers search by ("PNTOSA"), from synonyms; skipped when the name already contains it. */
export function shortName(p: Product) {
  const words = String(p.attributes?.also_known_as ?? '').split(', ');
  const short = words.find((w) => /^[A-Z0-9,-]{2,10}$/.test(w) && (w.match(/[A-Z]/g) ?? []).length >= 2 && !/AMINO|NITRO|CHLORO|METHYL|ACID/.test(w));
  return short && !p.name.toUpperCase().includes(short) ? short : undefined;
}

/** "Para Nitro Toluene Ortho Sulfonic Acid (PNTOSA)": display name with the short name, for titles and headings. */
export const titleName = (p: Product) => {
  const short = shortName(p);
  return short ? `${displayName(p.name)} (${short})` : displayName(p.name);
};

const LABELS: Record<string, string> = {
  cas: 'CAS No.',
  ci_name: 'C.I. Name',
  ci_number: 'C.I. No.',
  e_number: 'E-number',
  also_known_as: 'Also known as',
  applications: 'Applications',
  chemical_family: 'Chemical family',
  dosage_form: 'Dosage form',
  therapeutic_segment: 'Therapeutic segment',
  molecular_formula: 'Formula',
  molecular_weight: 'Mol. weight',
  chemical_class: 'Chemical class',
  appearance: 'Physical appearance',
  hue: 'Hue',
  solubility: 'Solubility',
  dye_content: 'Dye content (typical)',
  light_fastness: 'Light fastness (typical)',
  wash_fastness: 'Wash fastness (typical)',
};

/** Data-sheet fields: shown on product pages, kept out of range tables to keep those scannable. */
export const DETAIL_ONLY = new Set(['chemical_class', 'appearance', 'hue', 'solubility', 'dye_content', 'light_fastness', 'wash_fastness', 'description', 'shade_hex']);
/** Used for visuals only, never shown as a data row. */
export const NOT_A_SPEC = new Set(['shade_hex']);

export const columnLabel = (key: string) => LABELS[key] ?? key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

/** Identifier-like columns read best in monospace. */
export const isCodeColumn = (key: string) => ['cas', 'ci_number', 'e_number', 'molecular_formula', 'molecular_weight'].includes(key);

// Columns shown first, in this order; anything else follows alphabetically.
const ORDER = ['cas', 'ci_name', 'ci_number', 'chemical_class', 'appearance', 'hue', 'solubility', 'dye_content', 'light_fastness',
  'wash_fastness', 'e_number', 'also_known_as', 'applications', 'chemical_family', 'strength'];
export function orderColumns(keys: string[]) {
  return [...keys].sort((a, b) => {
    const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.localeCompare(b);
  });
}
