import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COUNTRIES } from '@/lib/contact';
import { LEAD_SOURCES, LEAD_STATUSES, LEAD_TYPES, type LeadInput } from '@/lib/adminApi';

const TEXT_FIELDS: { key: keyof LeadInput; label: string; type?: string; required?: boolean }[] = [
  { key: 'name', label: 'Name', required: true },
  { key: 'company', label: 'Company' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Phone / WhatsApp', type: 'tel' },
  { key: 'country', label: 'Country' },
  { key: 'product_name', label: 'Product' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'assigned_to', label: 'Assigned to' },
  { key: 'follow_up_on', label: 'Follow up on', type: 'date' },
];

function Choice<T extends string>({ id, label, value, options, onChange }: {
  id: string; label: string; value: T; options: Record<T, string>; onChange: (v: T) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger id={id}><SelectValue /></SelectTrigger>
        <SelectContent>
          {(Object.entries(options) as [T, string][]).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Shared by "Add lead" and the lead detail panel. Sends only fields that changed. */
export function LeadForm({ initial, onSubmit, submitLabel, onCancel }: {
  initial: LeadInput;
  onSubmit: (changes: LeadInput) => Promise<void>;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const [v, setV] = useState<LeadInput>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof LeadInput>(k: K, val: LeadInput[K]) => setV((s) => ({ ...s, [k]: val }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!v.email && !v.phone) {
      setError('Add an email or a phone number.');
      return;
    }
    // Only changed fields; cleared inputs go as null (an empty string is not a valid email).
    const changes = Object.fromEntries(
      Object.entries(v)
        .map(([k, val]) => [k, typeof val === 'string' && !val.trim() ? null : val])
        .filter(([k, val]) => val !== (initial[k as keyof LeadInput] ?? null)),
    ) as LeadInput;
    setSaving(true);
    setError(null);
    try {
      await onSubmit(changes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Choice id="lf-status" label="Status" value={v.status ?? 'new'} options={LEAD_STATUSES} onChange={(x) => set('status', x)} />
        <Choice id="lf-type" label="Type" value={v.type ?? 'whatsapp'} options={LEAD_TYPES} onChange={(x) => set('type', x)} />
        <Choice id="lf-source" label="Source" value={v.source ?? 'whatsapp'} options={LEAD_SOURCES} onChange={(x) => set('source', x)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TEXT_FIELDS.map((f) => (
          <div key={f.key}>
            <Label htmlFor={`lf-${f.key}`}>{f.label}{f.required ? ' *' : ''}</Label>
            <Input
              id={`lf-${f.key}`}
              type={f.type ?? 'text'}
              list={f.key === 'country' ? 'lf-countries' : undefined}
              required={f.required}
              value={(v[f.key] as string | null) ?? ''}
              onChange={(e) => set(f.key, e.target.value as never)}
            />
          </div>
        ))}
        <datalist id="lf-countries">{COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist>
      </div>
      <div>
        <Label htmlFor="lf-message">Message from the buyer</Label>
        <Textarea id="lf-message" rows={3} value={v.message ?? ''} onChange={(e) => set('message', e.target.value)} />
      </div>
      <div>
        <Label htmlFor="lf-notes">Internal notes</Label>
        <Textarea id="lf-notes" rows={4} placeholder="Quoted USD 6.2/kg CIF Chittagong, sample sent by DHL…" value={v.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : submitLabel}</Button>
      </div>
    </form>
  );
}
