/**
 * Page metadata, shared by the build-time pre-renderer (scripts/prerender.mjs) and the browser
 * (useSeo), so crawlers and visitors always get the same title, canonical and structured data.
 */
import { useEffect } from 'react';
import { columnLabel, displayName, type CategorySummary, type ProductDetail, type SubcategorySummary } from '@/lib/catalog';
import type { Industry } from '@/lib/industries';
import { CONTACT_EMAIL, CONTACT_PHONE_TEL, HEAD_OFFICE } from '@/lib/contact';

export const SITE = 'https://kewinchem.com';
const BRAND = 'Kewin Chemicals';

export type Seo = {
  title: string;
  description: string;
  path: string; // canonical path, no trailing slash
  noindex?: boolean;
  jsonLd?: object[];
};

const clip = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1).replace(/[\s,;·-]+\S*$/, '')}…`);
const list = (xs: string[], n = 4) => (xs.length <= n ? xs.join(', ') : `${xs.slice(0, n).join(', ')} and more`);

const organization = {
  '@type': 'Organization',
  '@id': `${SITE}/#organization`,
  name: 'Kewin Chemicals Pvt. Ltd.',
  url: SITE,
  logo: `${SITE}/apple-touch-icon.png`,
  email: CONTACT_EMAIL,
  telephone: CONTACT_PHONE_TEL,
  address: { '@type': 'PostalAddress', streetAddress: HEAD_OFFICE, addressLocality: 'Ahmedabad', addressRegion: 'Gujarat', postalCode: '380015', addressCountry: 'IN' },
};

function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '' }, ...items].map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.name, item: `${SITE}${it.path || '/'}`,
    })),
  };
}

const withContext = (nodes: object[]) => nodes.map((n) => ({ '@context': 'https://schema.org', ...n }));

// ---- per page type -------------------------------------------------------------------------

export function homeSeo(): Seo {
  return {
    title: 'Dyes Manufacturer & Exporter in India | Kewin Chemicals',
    description: 'Manufacturer, exporter and supplier of acid, reactive, direct, basic and solvent dyes, intermediates and food colours from Ahmedabad, Gujarat, India.',
    path: '',
    jsonLd: withContext([{ ...organization }, { '@type': 'WebSite', url: SITE, name: BRAND,
      potentialAction: { '@type': 'SearchAction', target: `${SITE}/search?q={q}`, 'query-input': 'required name=q' } }]),
  };
}

export function categorySeo(c: CategorySummary): Seo {
  return {
    title: hubTitle(c.name),
    description: clip(`${c.product_count} ${c.name.toLowerCase()} from Kewin Chemicals, ${LOCATION}: ${list(c.subcategories.map((s) => s.name))}. Request samples and export quotes.`, 158),
    path: `/category/${c.slug}`,
    jsonLd: withContext([breadcrumbs([{ name: c.name, path: `/category/${c.slug}` }])]),
  };
}

export function subcategorySeo(c: CategorySummary, s: SubcategorySummary, examples: string[]): Seo {
  const path = `/category/${c.slug}/${s.slug}`;
  return {
    title: hubTitle(s.name),
    description: clip(`${s.product_count} ${s.name.toLowerCase()} with CAS numbers${examples.length ? `, including ${list(examples, 3)}` : ''}. Manufacturer, exporter and supplier in ${LOCATION}.`, 158),
    path,
    jsonLd: withContext([breadcrumbs([{ name: c.name, path: `/category/${c.slug}` }, { name: s.name, path }])]),
  };
}

/** First option that fits ~65 characters: options go from fullest keyword pattern to plainest; the brand is never cut. */
const fit = (...options: string[]) => options.find((t) => t.length <= 65) ?? clip(options[options.length - 1], 65);

function fitTitle(name: string, casNo: string) {
  const cas = casNo ? ` (CAS ${casNo})` : '';
  return fit(
    `${name}${cas} Manufacturer & Exporter, India | ${BRAND}`,
    `${name}${cas} Manufacturer & Exporter | ${BRAND}`,
    `${name}${cas} Manufacturer | ${BRAND}`,
    `${name}${cas} | ${BRAND}`,
    `${name} | ${BRAND}`,
  );
}

/** "Manufacturers, Exporters & Suppliers in India" pattern for hub pages, shortened to fit. */
const hubTitle = (subject: string) => fit(
  `${subject} Manufacturers, Exporters & Suppliers in India | ${BRAND}`,
  `${subject} Manufacturers & Exporters in India | ${BRAND}`,
  `${subject} Manufacturer & Exporter, India | ${BRAND}`,
  `${subject} Manufacturer, India | ${BRAND}`,
  `${subject} | ${BRAND}`,
);

export const LOCATION = 'Ahmedabad, Gujarat, India';

const TYPE_LABEL: Record<string, string> = {
  dye: 'dye', intermediate: 'dye intermediate', food_color: 'food colour', pigment: 'pigment', pharma: 'pharmaceutical product',
};

export function productSeo(p: ProductDetail): Seo {
  const name = displayName(p.name);
  const a = p.attributes ?? {};
  const casNo = String(a.cas ?? '').split(' / ')[0];
  const range = p.ranges[0];
  const kind = (range?.name ?? TYPE_LABEL[p.product_type ?? ''] ?? 'product').replace(/s$/, '').toLowerCase();
  const uses = String(a.applications ?? '').split(',').map((x) => x.trim().replace(/ (Dyeing|Manufacturing)$/, '')).filter(Boolean);
  const path = `/products/${p.slug}`;
  const facts = [casNo && `CAS ${casNo}`, a.ci_number && `C.I. ${a.ci_number}`, a.e_number && String(a.e_number)].filter(Boolean).join(', ');
  return {
    title: fitTitle(name, casNo),
    description: clip(`${name}${facts ? ` (${facts})` : ''}, ${kind}${uses.length ? ` for ${list(uses.map((u) => u.toLowerCase()), 3)}` : ''}. Manufacturer, supplier and exporter in ${LOCATION} since 1999.`, 158),
    path,
    noindex: !p.indexable,
    jsonLd: withContext([
      {
        '@type': 'Product',
        name,
        url: `${SITE}${path}`,
        category: range?.name,
        ...(a.also_known_as ? { alternateName: String(a.also_known_as).split(',').map((x) => x.trim()) } : {}),
        ...(casNo ? { identifier: { '@type': 'PropertyValue', propertyID: 'CAS', value: casNo } } : {}),
        additionalProperty: Object.entries(a)
          .filter(([k]) => k !== 'cas')
          .map(([k, v]) => ({ '@type': 'PropertyValue', name: columnLabel(k), value: String(v) })),
        manufacturer: { '@id': `${SITE}/#organization` },
        brand: { '@type': 'Brand', name: BRAND },
      },
      { ...organization },
      breadcrumbs([
        ...(range ? [{ name: range.category_name, path: `/category/${range.category_slug}` }, { name: range.name, path: `/category/${range.category_slug}/${range.slug}` }] : []),
        { name, path },
      ]),
    ]),
  };
}

export function industrySeo(ind: Industry, count: number): Seo {
  const path = `/industries/${ind.slug}`;
  return {
    title: hubTitle(ind.keyword),
    description: clip(`${count} ${ind.name.toLowerCase()} for ${ind.uses}, each with its CAS number. Manufacturer, exporter and supplier in ${LOCATION}. Request samples and quotes.`, 158),
    path,
    jsonLd: withContext([breadcrumbs([{ name: ind.name, path }])]),
  };
}

export const staticSeo: Record<string, Seo> = {
  '/about': { title: `About Us | ${BRAND}`, description: 'Kewin Chemicals has manufactured and exported dyes, dye intermediates and food colours from Gujarat, India since 1999.', path: '/about' },
  '/contact': { title: `Contact & Request a Quote | ${BRAND}`, description: 'Contact Kewin Chemicals, Ahmedabad, for samples, prices and export quotes on dyes, intermediates and food colours. Email, phone or WhatsApp.', path: '/contact' },
  '/search': { title: `Search Products | ${BRAND}`, description: 'Search Kewin Chemicals products by name, C.I. name or CAS number.', path: '/search', noindex: true },
  '/404': { title: `Page not found | ${BRAND}`, description: 'This page does not exist.', path: '/404', noindex: true },
};

// ---- head rendering ------------------------------------------------------------------------

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Tags for the pre-rendered HTML <head>. JSON-LD is escaped so product text can't close the script. */
export function headTags(seo: Seo): string {
  const url = `${SITE}${seo.path}`;
  return [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    seo.path === '/404' ? '' : `<link rel="canonical" href="${url}" />`,
    seo.noindex ? '<meta name="robots" content="noindex, follow" />' : '',
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    ...(seo.jsonLd ?? []).map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`),
  ].filter(Boolean).join('\n    ');
}

/** Keeps <head> in step during client-side navigation (crawlers get the pre-rendered tags). */
export function useSeo(seo: Seo | null) {
  const key = seo ? `${seo.path}|${seo.title}|${seo.noindex}` : '';
  useEffect(() => {
    if (!seo) return;
    document.title = seo.title;
    const set = (sel: string, make: () => HTMLElement, attr: string, val: string) => {
      let el = document.head.querySelector(sel) as HTMLElement | null;
      if (!el) { el = make(); document.head.appendChild(el); }
      el.setAttribute(attr, val);
    };
    const meta = (name: string, prop = 'name') => () => Object.assign(document.createElement('meta'), { [prop === 'name' ? 'name' : 'property']: name });
    set('meta[name="description"]', meta('description'), 'content', seo.description);
    set('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', `${SITE}${seo.path}`);
    const robots = document.head.querySelector('meta[name="robots"]');
    if (seo.noindex) set('meta[name="robots"]', meta('robots'), 'content', 'noindex, follow');
    else robots?.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
