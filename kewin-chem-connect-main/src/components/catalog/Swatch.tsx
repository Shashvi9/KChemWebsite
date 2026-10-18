// Indicative colour for a product. Priority: a reference shade (specs.shade_hex), else the C.I. colour
// family adjusted by the hue wording ("greenish yellow", "dark red"...). Real product photos can
// replace this later via product_documents (type "image").
const FAMILY: [RegExp, string][] = [
  [/navy/, '#1f2f63'], [/turq|cyan/, '#1c8c9c'], [/violet|purple|magenta/, '#6a2c91'], [/pink|rhodamine/, '#d6457a'],
  [/scarlet|crimson|carmine|red|ponceau|carmoisine|allura|erythros/, '#c8262f'], [/orange|sunset/, '#e8691f'],
  [/lemon|tartrazine|quinoline|yellow/, '#f0c419'], [/olive/, '#6b6b2a'], [/green/, '#237a4f'],
  [/blue|indigo/, '#1f5fa8'], [/brown|chocolate|coffee|caramel/, '#7a3b1e'], [/black|nigrosine/, '#232227'],
  [/white|titanium/, '#f4f2ee'],
];
const family = (text: string) => FAMILY.find(([re]) => re.test(text))?.[1] ?? null;

function toHsl(hex: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (!d) return [0, 0, l * 100];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s * 100, l * 100];
}
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const hsl = (h: number, s: number, l: number) =>
  `hsl(${Math.round(h)} ${Math.round(clamp(s, 0, 100))}% ${Math.round(clamp(l, 8, 92))}%)`;

/** Nudge a family colour by the hue's modifiers; the main colour word stays in charge. */
function adjust(base: string, hue: string) {
  let [h, s, l] = toHsl(base);
  const towards = (target: number, amt: number) => {
    const d = ((target - h + 540) % 360) - 180;
    h = (h + Math.sign(d) * Math.min(Math.abs(d), amt) + 360) % 360;
  };
  if (/greenish/.test(hue)) towards(110, 18);
  if (/reddish|golden/.test(hue)) towards(5, 14);
  if (/bluish/.test(hue)) towards(225, 18);
  if (/yellowish/.test(hue)) towards(50, 14);
  if (/bright|brilliant|vivid/.test(hue)) { s += 12; l += 4; }
  if (/dark|deep/.test(hue)) l -= 14;
  if (/dull|muted|grey|gray/.test(hue)) s -= 25;
  if (/pale|light/.test(hue)) l += 14;
  return hsl(h, s, l);
}

export function swatchColour(hex?: string | null, hue?: string | null, name = '') {
  if (hex && /^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const lowerHue = (hue ?? '').toLowerCase();
  const ci = name.toLowerCase().match(/^(?:acid|basic|direct|reactive|solvent|disperse|pigment|mordant|vat|food|d&c|fd&c)\s+([a-z]+)/)?.[1];
  const hueMain = lowerHue.trim().split(/\s+/).pop();
  const base = (ci && family(ci)) || (hueMain && family(hueMain)) || family(`${name} ${lowerHue}`.toLowerCase());
  return base && lowerHue ? adjust(base, lowerHue) : base;
}

export function Swatch({ hex, hue, name }: { hex?: string | null; hue?: string | null; name: string }) {
  const colour = swatchColour(hex, hue, name);
  if (!colour) return null;
  return (
    <figure className="w-full max-w-[12rem]">
      <div className="aspect-square rounded-md ring-1 ring-black/5" style={{ background: colour }} role="img" aria-label={`Indicative colour of ${name}`} />
      <figcaption className="mt-1.5 text-xs text-muted-foreground">Indicative colour. Actual shade depends on grade, substrate and process.</figcaption>
    </figure>
  );
}
