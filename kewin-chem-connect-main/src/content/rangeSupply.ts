/** Supply terms shown in the sidebar of every dye, intermediate, colour and pigment product page. */
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
};

const SAMPLES = '50–100 g free sample through DHL';
const PACKING = '25 kg HDPE bags, box / cartons, fibre drums, jumbo bags';

const DYES: Supply = {
  forms: 'Powder; liquid on request',
  strength: 'Standard strength (100%); other strengths on request',
  packing: PACKING,
  moq: '25 kg per product; 500 kg per export order',
  samples: SAMPLES,
  leadTime: '7–10 days domestic; 15–20 days export',
  documents: 'TDS and MSDS for every product; COA with every batch',
  shadeMatching: 'Yes, matched to your standard or sample',
  shipping: 'FOB / CIF from Mundra or Nhava Sheva',
};

const INTERMEDIATES: Supply = {
  forms: 'Powder or wet cake, as listed in the TDS',
  packing: PACKING,
  moq: '100 kg per product; 1 MT per export order',
  samples: SAMPLES,
  leadTime: '10–15 days domestic; 20–25 days export',
  documents: 'TDS and MSDS for every product; COA with every batch',
  shipping: 'FOB / CIF from Mundra or Nhava Sheva',
};

const BY_CATEGORY: Record<string, Supply> = {
  'dyes-intermediates': DYES, 'dye-intermediates': INTERMEDIATES, 'food-pharma-colors': DYES, pigments: DYES,
};

const BY_RANGE: Record<string, Partial<Supply>> = {
  'basic-dyes-liquid': { forms: 'Liquid', strength: undefined, packing: '50 kg or 200 kg HDPE drums; 1,000 kg IBC on request' },
  'reactive-printing-dyes': { forms: 'Powder or granules' },
  'solvent-dyes': { forms: 'Powder or granules' },
};

export function supplyFor(categorySlug: string, rangeSlug: string): Supply | undefined {
  const base = BY_CATEGORY[categorySlug];
  return base && { ...base, ...BY_RANGE[rangeSlug] };
}

export const SUPPLY_ROWS: [keyof Supply, string][] = [
  ['forms', 'Forms'], ['strength', 'Strength'], ['packing', 'Packing'], ['moq', 'Minimum order'], ['samples', 'Samples'],
  ['leadTime', 'Lead time'], ['documents', 'Documents'], ['shadeMatching', 'Shade matching'], ['shipping', 'Shipping'],
];
