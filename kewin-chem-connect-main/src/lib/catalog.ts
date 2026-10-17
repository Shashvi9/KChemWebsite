import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/apiConfig';

export type SubcategorySummary = { id: number; name: string; slug: string; category_id: number; product_count: number };
export type CategorySummary = { id: number; name: string; slug: string; product_count: number; subcategories: SubcategorySummary[] };
export type Product = { id: number; name: string; slug?: string | null; attributes: Record<string, string | number> | null; subcategory_id: number };

const HOUR = 60 * 60 * 1000;

// ponytail: display order lives here until categories.sort_order is set in the DB (admin), then drop this.
const CATEGORY_ORDER = ['dyes-intermediates', 'food-pharma-colors', 'pigments', 'pharmaceutical-products'];
const rank = (slug: string) => (CATEGORY_ORDER.indexOf(slug) + 1 || 99);

/** Categories with subcategories and counts. Cached for the session: one cold-start hit, then instant menus. */
export function useCatalogOverview() {
  return useQuery({
    queryKey: ['catalog-overview'],
    queryFn: async () => (await apiGet<CategorySummary[]>('/categories/overview')).sort((a, b) => rank(a.slug) - rank(b.slug)),
    staleTime: HOUR,
  });
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function useProducts(categorySlug?: string, subcategorySlug?: string) {
  return useQuery({
    queryKey: ['products', categorySlug, subcategorySlug],
    queryFn: () =>
      apiGet<Product[]>(`/products/?${new URLSearchParams({ category_slug: categorySlug!, subcategory_slug: subcategorySlug! })}`),
    enabled: !!categorySlug && !!subcategorySlug,
    staleTime: HOUR,
  });
}

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
};

export const columnLabel = (key: string) => LABELS[key] ?? key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

/** Identifier-like columns read best in monospace. */
export const isCodeColumn = (key: string) => ['cas', 'ci_number', 'e_number', 'molecular_formula'].includes(key);

// Columns shown first, in this order; anything else follows alphabetically.
const ORDER = ['cas', 'ci_name', 'ci_number', 'e_number', 'also_known_as', 'applications', 'chemical_family', 'strength'];
export function orderColumns(keys: string[]) {
  return [...keys].sort((a, b) => {
    const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.localeCompare(b);
  });
}
