import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/apiConfig';
import type { Product } from '@/lib/catalog';

/** Industry pages, each grouping one or more applications (applications table slugs). */
export type Industry = {
  slug: string;
  name: string;          // page heading, e.g. "Textile dyes"
  keyword: string;       // what buyers search, used in the title
  applications: string[];
  uses: string;          // short, factual description of what the page covers
};

export const INDUSTRIES: Industry[] = [
  { slug: 'textile-dyes', name: 'Textile dyes', keyword: 'Textile Dyes', applications: ['wool-dyeing', 'polyamide-dyeing', 'silk-dyeing', 'cotton-dyeing'],
    uses: 'dyeing wool, nylon (polyamide), silk and cotton' },
  { slug: 'leather-dyes', name: 'Leather dyes', keyword: 'Leather Dyes', applications: ['leather-dyeing'], uses: 'dyeing and finishing leather' },
  { slug: 'paper-dyes', name: 'Paper dyes', keyword: 'Paper Dyes', applications: ['paper-dyeing'], uses: 'colouring paper and board' },
  { slug: 'ink-dyes', name: 'Dyes for inks', keyword: 'Ink Dyes', applications: ['ink-manufacturing'], uses: 'printing and writing inks' },
  { slug: 'wood-stain-dyes', name: 'Wood stain dyes', keyword: 'Wood Stain Dyes', applications: ['wood-stain'], uses: 'wood stains and wood finishes' },
  { slug: 'aluminium-anodizing-dyes', name: 'Aluminium anodizing dyes', keyword: 'Aluminium Anodizing Dyes', applications: ['aluminium-anodizing'],
    uses: 'colouring anodized aluminium' },
];

/** Application name (as shown in product data) -> industry, for linking. */
const BY_APP_NAME: Record<string, Industry> = {
  'Wool Dyeing': INDUSTRIES[0], 'Polyamide Dyeing': INDUSTRIES[0], 'Silk Dyeing': INDUSTRIES[0], 'Cotton Dyeing': INDUSTRIES[0],
  'Leather Dyeing': INDUSTRIES[1], 'Paper Dyeing': INDUSTRIES[2], 'Ink Manufacturing': INDUSTRIES[3],
  'Wood Stain': INDUSTRIES[4], 'Aluminium Anodizing': INDUSTRIES[5],
};
export const industryForApplication = (name: string) => BY_APP_NAME[name.trim()];
export const findIndustry = (slug?: string) => INDUSTRIES.find((i) => i.slug === slug);
export const industryPath = (i: Industry) => `/industries/${i.slug}`;

export function useIndustryProducts(industry?: Industry) {
  return useQuery({
    queryKey: ['industry', industry?.slug],
    queryFn: () => apiGet<Product[]>(`/products/by-application?slugs=${industry!.applications.join(',')}`),
    enabled: !!industry,
    staleTime: 60 * 60 * 1000,
  });
}
