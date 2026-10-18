/**
 * Build-time pre-rendering: turns the SPA into real HTML pages search engines can read.
 *
 * Runs after `vite build` (client) and `vite build --ssr src/entry-server.tsx` (server bundle).
 * Fetches the catalogue once from the API, renders every public page with its data, writes
 *   dist/index.html, dist/<path>.html (served at /<path> via cleanUrls), dist/404.html,
 *   dist/spa.html (untouched shell for client-only routes) and dist/sitemap.xml.
 *
 * PRERENDER_API overrides the API base (default: production). Fails the build rather than
 * shipping empty pages if the API can't be reached.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const API = (process.env.PRERENDER_API || 'https://kewinchem-backend.onrender.com/api/v1').replace(/\/$/, '');

const { render, seo, sortOverview } = await import(path.join(root, 'dist-server', 'entry-server.js'));

async function getJson(url, tries = 4) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(90_000) }); // Render can take ~40s to wake
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i >= tries) throw new Error(`prerender: ${url} failed after ${tries} tries: ${e.message}`);
      console.warn(`prerender: ${url} (${e.message}), retrying…`);
      await new Promise((r) => setTimeout(r, 5000 * i));
    }
  }
}

const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
await fs.writeFile(path.join(dist, 'spa.html'), template); // shell for /search, /admin, unknown products

// Strip the template's generic head tags; each page gets its own.
const baseHead = template
  .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
  .replace(/<meta\s+name="description"[^>]*>\s*/i, '')
  .replace(/<meta\s+property="og:(title|description|url)"[^>]*>\s*/gi, '')
  .replace(/<meta\s+name="twitter:(title|description)"[^>]*>\s*/gi, '')
  .replace(/<!--\s*Structured Data\s*-->\s*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/i, '');

const safeJson = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

function page(url, seed, meta) {
  const { html, state } = render(url, seed);
  return baseHead
    .replace('</head>', `    ${seo.headTags(meta)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>\n    <script>window.__RQ_STATE__=${safeJson(state)}</script>`);
}

async function write(urlPath, html) {
  const file = urlPath === '/' ? path.join(dist, 'index.html') : path.join(dist, `${urlPath.replace(/^\//, '')}.html`);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, html);
}

console.log(`prerender: fetching catalogue from ${API}`);
const overview = sortOverview(await getJson(`${API}/categories/overview`));
const products = await getJson(`${API}/products/static-export`);
const base = [[['catalog-overview'], overview]];
const sitemap = []; // { path, lastmod? }
const started = Date.now();

await write('/', page('/', base, seo.homeSeo()));
sitemap.push({ path: '' });
for (const p of ['/about', '/contact']) {
  await write(p, page(p, base, seo.staticSeo[p]));
  sitemap.push({ path: p });
}

// Listing rows in the API's order (range sort order, then catalogue id); same shape as /products/.
const toRow = ({ id, name, slug, attributes, subcategory_id }) => ({ id, name, slug, attributes, subcategory_id });
for (const c of overview) {
  const cPath = `/category/${c.slug}`;
  await write(cPath, page(cPath, base, seo.categorySeo(c)));
  sitemap.push({ path: cPath });
  for (const s of c.subcategories) {
    const rows = products.filter((p) => p.ranges.some((r) => r.slug === s.slug && r.category_slug === c.slug)).map(toRow);
    const sPath = `${cPath}/${s.slug}`;
    const meta = seo.subcategorySeo(c, s, rows.slice(0, 3).map((r) => r.name));
    await write(sPath, page(sPath, [...base, [['products', c.slug, s.slug], rows]], meta));
    sitemap.push({ path: sPath });
  }
}

let noindex = 0;
for (const p of products) {
  const pPath = `/products/${p.slug}`;
  await write(pPath, page(pPath, [...base, [['product', p.slug], p]], seo.productSeo(p)));
  if (p.indexable) sitemap.push({ path: pPath, lastmod: p.updated_at?.slice(0, 10) });
  else noindex++;
}

await fs.writeFile(path.join(dist, '404.html'), page('/404-not-found', base, seo.staticSeo['/404']));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map((u) => `  <url><loc>${seo.SITE}${u.path || '/'}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
await fs.writeFile(path.join(dist, 'sitemap.xml'), xml);

console.log(`prerender: ${sitemap.length} indexable pages, ${noindex} noindex product pages, sitemap.xml written (${((Date.now() - started) / 1000).toFixed(1)}s)`);
