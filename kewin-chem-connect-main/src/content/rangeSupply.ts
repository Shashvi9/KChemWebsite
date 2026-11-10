/** Supply terms shown on range pages. PLACEHOLDER values until Kewin confirms them; flip SUPPLY_CONFIRMED then.
 *  Until then they show only on the local dev site, never in production builds. */
export const SUPPLY_CONFIRMED = false;
const SHOW_SUPPLY = SUPPLY_CONFIRMED || import.meta.env.DEV;

export type Supply = {
  forms: string;
  strength?: string;
  packing: string;
  moq: string;
  samples: string;
  leadTime: string;
  documents: string;
  shadeMatching?: string;
  shipping: string;
  payment: string;
};

const PACKING = '25 kg HDPE bags, box / cartons, fibre drums, jumbo bags';

const DYES: Supply = {
  forms: 'Powder; liquid on request',
  strength: 'Standard strength (100%); other strengths on request',
  packing: PACKING,
  moq: '25 kg per product; 500 kg per export order',
  samples: '50–100 g free sample; courier at buyer’s cost',
  leadTime: '7–10 days domestic; 15–20 days export',
  documents: 'TDS and MSDS for every product; COA with every batch',
  shadeMatching: 'Yes, matched to your standard or sample',
  shipping: 'FOB / CIF from Mundra or Nhava Sheva',
  payment: 'Advance T/T or L/C at sight',
};

const INTERMEDIATES: Supply = {
  forms: 'Powder or wet cake, as listed in the TDS',
  packing: PACKING,
  moq: '100 kg per product; 1 MT per export order',
  samples: '100 g free sample; courier at buyer’s cost',
  leadTime: '10–15 days domestic; 20–25 days export',
  documents: 'TDS and MSDS for every product; COA with every batch',
  shipping: 'FOB / CIF from Mundra or Nhava Sheva',
  payment: 'Advance T/T or L/C at sight',
};

const BY_CATEGORY: Record<string, Supply> = { 'dyes-intermediates': DYES, 'dye-intermediates': INTERMEDIATES };

const BY_RANGE: Record<string, Partial<Supply>> = {
  'basic-dyes-liquid': { forms: 'Liquid', strength: undefined, packing: '50 kg or 200 kg HDPE drums; 1,000 kg IBC on request' },
  'reactive-printing-dyes': { forms: 'Powder or granules' },
  'solvent-dyes': { forms: 'Powder or granules' },
};

export function supplyFor(categorySlug: string, rangeSlug: string): Supply | undefined {
  const base = SHOW_SUPPLY ? BY_CATEGORY[categorySlug] : undefined;
  return base && { ...base, ...BY_RANGE[rangeSlug] };
}

export const SUPPLY_ROWS: [keyof Supply, string][] = [
  ['forms', 'Forms'], ['strength', 'Strength'], ['packing', 'Packing'], ['moq', 'Minimum order'], ['samples', 'Samples'],
  ['leadTime', 'Lead time'], ['documents', 'Documents'], ['shadeMatching', 'Shade matching'], ['shipping', 'Shipping'], ['payment', 'Payment'],
];

/** Buyer questions answered from this range's supply terms, for the page and its FAQPage data. */
export function rangeFaqs(rangeName: string, s: Supply) {
  const name = rangeName.toLowerCase();
  return [
    { q: `What is the minimum order for ${name}?`, a: `${s.moq}. Packed in ${s.packing.charAt(0).toLowerCase()}${s.packing.slice(1)}.` },
    { q: `Can I get a sample before ordering?`, a: `${s.samples}. ${s.documents}.` },
    { q: `How soon can you ship?`, a: `${s.leadTime}. ${s.shipping}; payment by ${s.payment.charAt(0).toLowerCase()}${s.payment.slice(1)}.` },
    ...(s.shadeMatching ? [{ q: `Do you match shades?`, a: `${s.shadeMatching}. Send a reference sample or shade card with your enquiry.` }] : []),
  ];
}
