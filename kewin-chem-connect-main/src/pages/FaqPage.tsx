import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/catalog/CatalogStatus';
import { FAQS } from '@/content/faq';
import { staticSeo, useSeo } from '@/lib/seo';

const FaqPage = () => {
  useSeo(staticSeo['/faq']);
  return (
    <div className="container py-10 md:py-14">
      <Breadcrumbs items={[{ label: 'Questions' }]} />
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Frequently asked questions</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Ordering, samples, documents and export from Kewin Chemicals, Ahmedabad, India.</p>
      <dl className="mt-8 max-w-3xl divide-y rounded-md border bg-card">
        {FAQS.map((f) => (
          <div key={f.q} className="px-5 py-5">
            <dt><h2 className="text-base font-semibold">{f.q}</h2></dt>
            <dd className="mt-2 leading-relaxed text-muted-foreground">
              {f.a}
              {f.link && <> <Link to={f.link.to} className="font-medium text-primary hover:underline">{f.link.label} →</Link></>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default FaqPage;
