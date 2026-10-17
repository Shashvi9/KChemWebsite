import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { COUNTRIES, WHATSAPP_URL, errorMessage } from '@/lib/contact';

export type SampleContext = {
  categorySlug: string;
  subcategorySlug: string;
  product?: {
    id?: number;
    name?: string;
    attributes?: Record<string, any> | null;
  } | null;
  /** Several products in one request (catalogue multi-select). */
  products?: { id: number; name: string }[];
};

import { API_BASE } from '@/lib/apiConfig';

export default function RequestSampleDialog(props: {
  trigger: React.ReactNode;
  context: SampleContext;
}) {
  const { trigger, context } = props;
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [quantity, setQuantity] = useState('');
  const [useCase, setUseCase] = useState('');
  const [sendCopy, setSendCopy] = useState(true);
  const [website, setWebsite] = useState(''); // honeypot

  const many = context.products && context.products.length > 1 ? context.products : null;
  const productName = many ? `${many.length} products: ${many.map((p) => p.name).join(', ')}`.slice(0, 255)
    : context.products?.[0]?.name || context.product?.name || '';
  const productAttrs = useMemo(
    () => (many ? { products: many.map((p) => p.name).join('; ') } : context.product?.attributes || {}),
    [context, many]);
  const productId = many ? undefined : context.products?.[0]?.id ?? context.product?.id;

  useEffect(() => {
    if (!open) {
      setSubmitting(false);
      setSuccess(null);
      setError(null);
    }
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);
    try {
      const body = {
        category_slug: context.categorySlug || 'search',
        subcategory_slug: context.subcategorySlug || context.categorySlug || 'search',
        product_id: productId,
        product_name: productName || undefined,
        attributes: productAttrs && Object.keys(productAttrs).length ? productAttrs : undefined,
        quantity: quantity || undefined,
        use_case: useCase || undefined,
        name,
        company,
        email,
        phone: phone || undefined,
        country,
        website: website || undefined,
        send_copy_to_requester: !!sendCopy,
      };

      const res = await fetch(`${API_BASE}/sample-requests/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await errorMessage(res));
      setSuccess('Thank you. Our export team will reply within one working day.');
      setQuantity('');
      setUseCase('');
    } catch (err: any) {
      setError(err?.name === 'TypeError' ? 'Network error. Please check your connection and try again.' : err?.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{many ? 'Request a quote or samples' : 'Request a sample'}</DialogTitle>
        </DialogHeader>

        {many ? (
          <div className="mb-2 text-sm">
            <p className="text-muted-foreground">{many.length} products selected</p>
            <ul className="mt-1 max-h-24 overflow-y-auto rounded-sm border bg-secondary/50 px-3 py-2">
              {many.map((p) => <li key={p.id} className="truncate">{p.name}</li>)}
            </ul>
          </div>
        ) : productName && (
          <div className="text-sm text-muted-foreground mb-2">
            Product: <span className="text-foreground font-medium">{productName}</span>
          </div>
        )}

        {success ? (
          <div role="status" className="py-6 text-center space-y-4">
            <p className="text-lg font-medium text-green-700">{success}</p>
            <p className="text-sm text-muted-foreground">
              Need it faster?{' '}
              <a className="text-primary underline" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>.
            </p>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        ) : (
        <form onSubmit={submit} className="grid gap-3">
          <p className="text-xs text-muted-foreground">Fields marked * are required.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={255} />
            </div>
            <div>
              <Label htmlFor="company">Company *</Label>
              <Input id="company" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} required minLength={2} maxLength={255} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="email">Work email *</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
            </div>
            <div>
              <Label htmlFor="phone">Phone / WhatsApp</Label>
              <Input id="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={64} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="country">Country *</Label>
              <Input id="country" list="sample-countries" autoComplete="country-name" value={country} onChange={(e) => setCountry(e.target.value)} required maxLength={255} />
              <datalist id="sample-countries">{COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity needed</Label>
              <Input id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g., 500 g sample, 2 MT/month" maxLength={255} />
            </div>
          </div>
          <div>
            <Label htmlFor="usecase">Intended application</Label>
            <Textarea id="usecase" rows={3} value={useCase} onChange={(e) => setUseCase(e.target.value)} maxLength={2000} />
          </div>
          {/* Honeypot: hidden from people, filled by bots */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={website} onChange={(e) => setWebsite(e.target.value)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={sendCopy} onChange={(e) => setSendCopy(e.target.checked)} />
            Email me a copy of this request
          </label>

          {error && <div role="alert" className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send request'}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
