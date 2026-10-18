import { Link } from "react-router-dom";
import { SearchBar } from "@/components/search/SearchBar";
import { useCatalogOverview } from "@/lib/catalog";
import { staticSeo, useSeo } from "@/lib/seo";

const NotFound = () => {
  useSeo(staticSeo["/404"]);
  const { data } = useCatalogOverview();
  return (
    <div className="container py-16 md:py-24">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">This page doesn't exist</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">It may have moved. Search by product name or CAS number, or pick a range.</p>
      <div className="mt-6 max-w-md"><SearchBar className="flex" /></div>
      <ul className="mt-8 flex flex-wrap gap-2">
        {(data ?? []).map((c) => (
          <li key={c.id}><Link to={`/category/${c.slug}`} className="inline-block rounded-sm border bg-card px-3 py-1.5 text-sm hover:border-primary hover:text-primary">{c.name}</Link></li>
        ))}
        <li><Link to="/" className="inline-block rounded-sm border bg-card px-3 py-1.5 text-sm hover:border-primary hover:text-primary">Home</Link></li>
      </ul>
    </div>
  );
};

export default NotFound;
