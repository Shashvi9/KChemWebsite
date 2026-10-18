import { Link, useParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RequestSampleDialog from '@/components/RequestSampleDialog';
import { Breadcrumbs, CatalogStatus } from '@/components/catalog/CatalogStatus';
import { Swatch } from '@/components/catalog/Swatch';
import { columnLabel, displayName, isCodeColumn, NOT_A_SPEC, orderColumns, productPath, useProductDetail, type ProductDetail } from '@/lib/catalog';
import { WHATSAPP_URL } from '@/lib/contact';
import { productSeo, useSeo } from '@/lib/seo';

const KIND: Record<string, string> = {
  dye: 'dye', intermediate: 'dye intermediate', food_color: 'food colour', pigment: 'pigment', pharma: 'pharmaceutical product',
};
const DOC_LABEL: Record<string, string> = { msds: 'Safety data sheet (MSDS)', tds: 'Technical data sheet (TDS)', coa: 'Certificate of analysis (COA)' };

/** Plain-language facts built only from this product's data; no generic filler. */
function aboutText(p: ProductDetail) {
  const name = displayName(p.name);
  const a = p.attributes ?? {};
  const range = p.ranges[0];
  const ids = [a.cas && `CAS number ${String(a.cas).replace(/ \/ /g, ' or ')}`, a.ci_number && `Colour Index number ${a.ci_number}`, a.e_number && `E-number ${a.e_number}`]
    .filter(Boolean);
  const kind = range ? range.name.replace(/s(\s|$)/, '$1').toLowerCase() : KIND[p.product_type ?? ''] ?? 'product';
  const parts = [`${name} is a${/^[aeiou]/i.test(kind) ? 'n' : ''} ${kind} manufactured and exported by Kewin Chemicals from Gujarat, India.`];
  if (ids.length) parts.push(`It is identified by ${ids.join(', ')}.`);
  const form = [a.chemical_class && `a ${String(a.chemical_class).toLowerCase()} dye`, a.appearance && `supplied as a ${String(a.appearance).toLowerCase()}`]
    .filter(Boolean).join(', ');
  if (form) parts.push(`Chemically it is ${form}${a.hue ? ` with a ${String(a.hue).toLowerCase()} hue` : ''}.`);
  if (a.solubility) parts.push(`Solubility: ${String(a.solubility).toLowerCase()}.`);
  if (a.also_known_as) parts.push(`It is also known as ${a.also_known_as}.`);
  if (a.applications) parts.push(`Typical applications: ${String(a.applications).toLowerCase()}.`);
  if (a.strength) parts.push(`Available strength: ${a.strength}.`);
  if (a.dosage_form || a.presentation) parts.push(`Supplied as ${[a.dosage_form, a.presentation && `in ${a.presentation}`].filter(Boolean).join(' ')}.`);
  return parts.join(' ');
}

function faqs(p: ProductDetail) {
  const name = displayName(p.name);
  const a = p.attributes ?? {};
  return [
    a.cas && { q: `What is the CAS number of ${name}?`, a: `The CAS number of ${name} is ${String(a.cas).replace(/ \/ /g, ', also listed as ')}.` },
    a.applications && { q: `What is ${name} used for?`, a: `${name} is used in ${String(a.applications).toLowerCase()}.` },
    a.also_known_as && { q: `What are other names for ${name}?`, a: `${name} is also sold as ${a.also_known_as}.` },
    { q: `Can I get a sample of ${name}?`, a: 'Yes. Request a sample with the form on this page and our export team will reply by email or WhatsApp with availability, documents and shipping terms.' },
  ].filter(Boolean) as { q: string; a: string }[];
}

function Body({ p }: { p: ProductDetail }) {
  const name = displayName(p.name);
  const a = p.attributes ?? {};
  const rows = orderColumns(Object.keys(a)).filter((k) => !NOT_A_SPEC.has(k) && a[k] !== '' && a[k] !== '-');
  const range = p.ranges[0];
  const sample = (label: string, variant?: 'outline') => (
    <RequestSampleDialog
      trigger={<Button size="lg" variant={variant}>{label}</Button>}
      context={{ categorySlug: range?.category_slug ?? 'search', subcategorySlug: range?.slug ?? 'search', product: { id: p.id, name, attributes: a } }}
    />
  );

  return (
    <article className="container py-10 md:py-14">
      <Breadcrumbs items={[
        ...(range ? [{ label: range.category_name, to: `/category/${range.category_slug}` }, { label: range.name, to: `/category/${range.category_slug}/${range.slug}` }] : []),
        { label: name },
      ]} />

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{range?.name ?? KIND[p.product_type ?? '']}</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">{name}</h1>
              {a.cas && <p className="mt-2 font-mono text-muted-foreground">CAS {a.cas}</p>}
            </div>
            {p.product_type !== 'pharma' && p.product_type !== 'intermediate' && (
              <div className="hidden w-28 shrink-0 sm:block"><Swatch hex={a.shade_hex as string | undefined} hue={a.hue as string | undefined} name={name} /></div>
            )}
          </div>

          <section aria-labelledby="specs" className="mt-8">
            <h2 id="specs" className="text-lg font-semibold">Technical data</h2>
            <table className="mt-3 w-full overflow-hidden rounded-md border bg-card text-sm">
              <tbody>
                <tr className="border-b"><th scope="row" className="w-1/3 bg-secondary/50 px-4 py-2.5 text-left font-medium">Product</th><td className="px-4 py-2.5">{name}</td></tr>
                {rows.map((k) => (
                  <tr key={k} className="border-b last:border-0">
                    <th scope="row" className="w-1/3 bg-secondary/50 px-4 py-2.5 text-left font-medium">{columnLabel(k)}</th>
                    <td className={isCodeColumn(k) ? 'px-4 py-2.5 font-mono' : 'px-4 py-2.5'}>{String(a[k])}</td>
                  </tr>
                ))}
                {p.ranges.length > 0 && (
                  <tr><th scope="row" className="w-1/3 bg-secondary/50 px-4 py-2.5 text-left font-medium">Range</th>
                    <td className="px-4 py-2.5">{p.ranges.map((r, i) => (
                      <span key={r.slug}>{i > 0 && ', '}<Link to={`/category/${r.category_slug}/${r.slug}`} className="text-primary hover:underline">{r.name}</Link></span>
                    ))}</td></tr>
                )}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-muted-foreground">
              {rows.some((k) => k.endsWith('_fastness') || k === 'dye_content')
                ? 'Typical values for the standard grade. Every batch ships with its own certificate of analysis (COA).'
                : 'Specifications vary by grade. Ask for the TDS of the grade you need.'}
            </p>
          </section>

          <section aria-labelledby="about" className="mt-10">
            <h2 id="about" className="text-lg font-semibold">About {name}</h2>
            <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">{aboutText(p)}</p>
          </section>

          <section aria-labelledby="faq" className="mt-10">
            <h2 id="faq" className="text-lg font-semibold">Questions</h2>
            <dl className="mt-3 divide-y rounded-md border bg-card">
              {faqs(p).map((f) => (
                <div key={f.q} className="px-4 py-3">
                  <dt className="font-medium">{f.q}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-md border bg-card p-5">
            <p className="font-semibold">Buy {name}</p>
            <p className="mt-1 text-sm text-muted-foreground">Samples, prices and export quotes from our team.</p>
            <div className="mt-4 grid gap-2">
              {sample('Request a sample or quote')}
              <Button asChild size="lg" variant="outline">
                <a href={`${WHATSAPP_URL}?text=${encodeURIComponent(`Hello, please share the price for ${name}${a.cas ? ` (CAS ${String(a.cas).split(' / ')[0]})` : ''}.`)}`} target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a>
              </Button>
            </div>
          </div>

          <div className="rounded-md border bg-card p-5">
            <p className="font-semibold">Documents</p>
            {p.documents.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {p.documents.map((d) => (
                  <li key={d.url}><a href={d.url} className="inline-flex items-center gap-2 text-primary hover:underline" target="_blank" rel="noopener noreferrer"><FileText className="h-4 w-4" aria-hidden />{DOC_LABEL[d.type] ?? d.type}</a></li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">TDS, MSDS and COA are available on request.</p>
            )}
          </div>

          {p.related.length > 0 && (
            <nav aria-labelledby="related" className="rounded-md border bg-card p-5">
              <p id="related" className="font-semibold">Related products</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {p.related.map((r) => (
                  <li key={r.slug} className="flex items-baseline justify-between gap-3">
                    <Link to={productPath(r.slug)!} className="hover:text-primary">{displayName(r.name)}</Link>
                    {r.cas && <span className="shrink-0 font-mono text-xs text-muted-foreground">{r.cas}</span>}
                  </li>
                ))}
              </ul>
              {range && <Link to={`/category/${range.category_slug}/${range.slug}`} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">All {range.name.toLowerCase()} →</Link>}
            </nav>
          )}
        </aside>
      </div>
    </article>
  );
}

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const q = useProductDetail(slug);
  useSeo(q.data ? productSeo(q.data) : null);
  const notFound = (q.error as Error | null)?.message === 'HTTP 404';

  if (q.data) return <Body p={q.data} />;
  return (
    <div className="container py-14">
      {notFound ? (
        <div className="rounded-md border bg-card p-8 text-center">
          <h1 className="text-2xl font-semibold">Product not found</h1>
          <p className="mt-2 text-muted-foreground"><Link to="/" className="font-medium text-primary hover:underline">Browse all products</Link> or use the search.</p>
        </div>
      ) : (
        <CatalogStatus loading={q.isLoading} error={q.error} onRetry={() => q.refetch()} />
      )}
    </div>
  );
};

export default ProductPage;
