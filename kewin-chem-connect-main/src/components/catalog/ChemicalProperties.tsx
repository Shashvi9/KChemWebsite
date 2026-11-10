import type { Chemistry } from '@/lib/catalog';

const PROPERTY_ORDER = ['Physical Description', 'Color/Form', 'Odor', 'Melting Point', 'Boiling Point', 'Density', 'Solubility',
  'Vapor Pressure', 'LogP', 'Dissociation Constants', 'Stability/Shelf Life', 'Decomposition', 'Flash Point'];
const LABEL: Record<string, string> = { 'Color/Form': 'Colour / form', Odor: 'Odour', 'Dissociation Constants': 'pKa', 'Stability/Shelf Life': 'Stability' };

const label = (k: string) => LABEL[k] ?? k.charAt(0) + k.slice(1).toLowerCase();

/** Identity and physical properties for a product. */
export function ChemicalProperties({ c }: { c: Chemistry }) {
  const rows: [string, string, boolean?][] = [
    ...(c.iupac_name ? [['IUPAC name', c.iupac_name] as [string, string]] : []),
    ...PROPERTY_ORDER.filter((k) => c.properties[k]).map((k) => [label(k), c.properties[k].replace(/ \| /g, '; ')] as [string, string]),
    ...(c.exact_mass ? [['Exact mass', c.exact_mass, true] as [string, string, boolean]] : []),
  ];
  return (
    <section aria-labelledby="chemistry" className="mt-10">
      <h2 id="chemistry" className="text-lg font-semibold">Chemical properties</h2>
      {rows.length > 0 && (
        <table className="mt-3 w-full overflow-hidden rounded-md border bg-card text-sm">
          <tbody>
            {rows.map(([k, v, mono]) => (
              <tr key={k} className="border-b last:border-0">
                <th scope="row" className="w-1/3 bg-secondary/50 px-4 py-2.5 text-left align-top font-medium">{k}</th>
                <td className={mono ? 'px-4 py-2.5 font-mono text-[13px] [overflow-wrap:anywhere]' : 'px-4 py-2.5 [overflow-wrap:anywhere]'}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="mt-3 text-xs text-muted-foreground">Typical reference values. Ask for our TDS for grade-specific values.</p>
    </section>
  );
}
