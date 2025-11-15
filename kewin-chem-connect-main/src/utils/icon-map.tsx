import React from 'react';
import {
  Beaker,
  Droplet,
  Palette,
  Atom,
  TestTube2,
  Box,
  ShieldCheck,
  Heart,
  Layers,
  Hexagon,
  Sun,
  Activity,
  Wind,
  Pin,
  Zap
} from 'lucide-react';

// Map known subcategory slugs to icons. Extend as needed.
const iconBySlug: Record<string, React.ComponentType<{ className?: string }>> = {
  // dyes-intermediates
  'intermediates': Beaker,
  'acid-dyes': Droplet,
  'basic-dyes': Palette,
  'direct-dyes': Atom,
  'food-and-lake-color': TestTube2,
  'solvent-dyes': Zap,
  'reactive-dyes': Droplet,

  // food-pharma-colors
  'veterinary-formulation': Beaker,
  'veterinaryformulation': Beaker,
  'veterinary-apis': TestTube2,
  'tablets-capsules': Box,
  'reference-standards-impurities': ShieldCheck,
  'pellets': Activity,
  'patented-impurity-product': ShieldCheck,
  'nutraceuticals': Heart,
  'nasaldrops-oralsuspensions': Beaker,
  'medical-supplies-equipment': Box,
  'injectable-ointments': TestTube2,

  // shades-pigments
  'waterbase-inkjet-int': Droplet,
  'universal-stainer': Layers,
  'paints': Pin,
  'organic-pigment': Sun,
  'machine-coating-colorant': Layers,
  'inorganic-pigment': Hexagon,
  'industrial-coating': Activity,
  'cement-architecture-dispersion': Box,
  'architecture-paints': Wind,
  '13-waterbase-flexo-ink': Droplet,
  '11-mixed-metal-oxides': Activity,
  '08-+-12-pvc-and-pvc-master-batches': Layers,
  '08-12-pvc-and-pvc-master-batches': Layers,
};

const DefaultIcon = Beaker;

export function getIconForSlug(slug?: string) {
  if (!slug) return DefaultIcon;
  const key = slug.toLowerCase();
  return iconBySlug[key] || DefaultIcon;
}
