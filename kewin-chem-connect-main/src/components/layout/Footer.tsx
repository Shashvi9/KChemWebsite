import { Link } from 'react-router-dom';
import { useCatalogOverview } from '@/lib/catalog';
import { INDUSTRIES, industryPath } from '@/lib/industries';
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL, HEAD_OFFICE, WHATSAPP_URL } from '@/lib/contact';
import logoWhite from '@/assets/logoWhite.png';

const heading = 'mb-4 text-xs font-semibold uppercase tracking-wider text-white/50';
const link = 'text-sm text-white/80 hover:text-white';

export const Footer = () => {
  const { data } = useCatalogOverview();
  return (
    <footer className="bg-foreground text-white">
      <div className="container grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-3">
          <img src={logoWhite} alt="Kewin Chemicals Pvt. Ltd." width={160} height={57} className="h-12 w-auto" loading="lazy" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            Manufacturer and exporter of dyes, dye intermediates, food colours and pigments since 1999.
          </p>
        </div>
        <div className="md:col-span-2">
          <p className={heading}>Products</p>
          <ul className="space-y-2">
            {(data ?? []).map((c) => (
              <li key={c.id}><Link to={`/category/${c.slug}`} className={link}>{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className={heading}>Industries</p>
          <ul className="space-y-2">
            {INDUSTRIES.map((i) => <li key={i.slug}><Link to={industryPath(i)} className={link}>{i.name}</Link></li>)}
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className={heading}>Company</p>
          <ul className="space-y-2">
            <li><Link to="/about" className={link}>About</Link></li>
            <li><Link to="/contact" className={link}>Contact</Link></li>
            <li><Link to="/faq" className={link}>Questions</Link></li>
            <li><Link to="/contact?subject=Quote%20request" className={link}>Request a quote</Link></li>
          </ul>
        </div>
        <div className="space-y-4 text-sm md:col-span-3">
          <p className={heading}>Contact</p>
          <address className="not-italic leading-relaxed text-white/80">{HEAD_OFFICE}</address>
          <p className="space-y-1">
            <a href={`tel:${CONTACT_PHONE_TEL}`} className={`block ${link}`}>{CONTACT_PHONE}</a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={`block ${link}`}>WhatsApp</a>
            <a href={`mailto:${CONTACT_EMAIL}`} className={`block ${link}`}>{CONTACT_EMAIL}</a>
          </p>
          <p className="text-white/60">Mon–Sat, 9:00–18:00 IST</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-2 py-5 text-xs text-white/50 md:flex-row md:justify-between">
          <span>© {new Date().getFullYear()} Kewin Chemicals Pvt. Ltd.</span>
          <span>Manufacturing units at GIDC Vatva, Gujarat and Jhabua, Madhya Pradesh</span>
        </div>
      </div>
    </footer>
  );
};
