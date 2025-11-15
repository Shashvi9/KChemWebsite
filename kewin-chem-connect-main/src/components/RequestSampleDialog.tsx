import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export type SampleContext = {
  categorySlug: string;
  subcategorySlug: string;
  product?: {
    id?: number;
    name?: string;
    form?: string | null;
    attributes?: Record<string, any> | null;
  } | null;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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

  const productName = context.product?.name || '';
  const productForm = context.product?.form || '';
  const productAttrs = useMemo(() => context.product?.attributes || {}, [context]);

  useEffect(() => {
    if (!open) {
      setSubmitting(false);
      setSuccess(null);
      setError(null);
    }
  }, [open]);

  async function submit() {
    setSubmitting(true);
    setSuccess(null);
    setError(null);
    try {
      // Map UI category to backend slug where needed
      const mappedCategory = (context.categorySlug === 'food-pharma') ? 'food-pharma-colors' : context.categorySlug;
      const body = {
        category_slug: mappedCategory,
        subcategory_slug: context.subcategorySlug,
        product_id: context.product?.id,
        product_name: productName || undefined,
        form: productForm || undefined,
        attributes: productAttrs && Object.keys(productAttrs).length ? productAttrs : undefined,
        quantity: quantity || undefined,
        use_case: useCase || undefined,
        name,
        company,
        email,
        phone: phone || undefined,
        country: country || undefined,
        send_copy_to_requester: !!sendCopy,
      };

      const res = await fetch(`${API_BASE}/sample-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setSuccess('Request sent. We will contact you shortly.');
      // simple reset
      setQuantity('');
      setUseCase('');
    } catch (e: any) {
      setError(e?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Sample</DialogTitle>
        </DialogHeader>

        {productName && (
          <div className="text-sm text-muted-foreground mb-2">
            Product: <span className="text-foreground font-medium">{productName}</span>
            {productForm ? <span> · Form: {productForm}</span> : null}
          </div>
        )}

        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity needed</Label>
              <Input id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g., 500 g" />
            </div>
          </div>
          <div>
            <Label htmlFor="usecase">Intended application (optional)</Label>
            <Textarea id="usecase" rows={3} value={useCase} onChange={(e) => setUseCase(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={sendCopy} onChange={(e) => setSendCopy(e.target.checked)} />
            Email me a copy of this request
          </label>
        </div>

        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
        {success && <div className="text-sm text-green-600 mt-2">{success}</div>}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Close</Button>
          <Button onClick={submit} disabled={submitting || !name || !company || !email}>
            {submitting ? 'Sending...' : 'Send request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
