import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadForm } from '@/components/admin/LeadForm';
import {
  LEAD_SOURCES, LEAD_STATUSES, LEAD_TYPES, contactLinks, createLead, exportLeads, getAdminToken, listLeads, logout, updateLead,
  type Lead, type LeadFilters, type LeadList, type LeadStatus,
} from '@/lib/adminApi';

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800', contacted: 'bg-indigo-100 text-indigo-800', quoted: 'bg-amber-100 text-amber-900',
  sample_sent: 'bg-cyan-100 text-cyan-900', negotiating: 'bg-purple-100 text-purple-800',
  won: 'bg-green-100 text-green-800', lost: 'bg-gray-200 text-gray-700', spam: 'bg-red-100 text-red-800',
};

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

const fmtDate = (s: string) => new Date(s).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
const today = () => new Date().toISOString().slice(0, 10);

export default function AdminLeads() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<LeadFilters>({ sort: '-created_at', page: 1, page_size: 25 });
  const [search, setSearch] = useState('');
  const q = useDebounced(search);
  const [data, setData] = useState<LeadList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Lead | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    // Admin pages must not be indexed.
    const m = document.createElement('meta');
    m.name = 'robots';
    m.content = 'noindex, nofollow';
    document.head.appendChild(m);
    return () => m.remove();
  }, []);

  const onAuthError = useCallback((e: unknown) => {
    if (e instanceof Error && e.message === 'unauthorized') navigate('/admin/login', { replace: true });
    else setError(e instanceof Error ? e.message : 'Something went wrong');
  }, [navigate]);

  const load = useCallback(async () => {
    if (!getAdminToken()) return navigate('/admin/login', { replace: true });
    setLoading(true);
    setError(null);
    try {
      setData(await listLeads({ ...filters, q }));
    } catch (e) {
      onAuthError(e);
    } finally {
      setLoading(false);
    }
  }, [filters, q, navigate, onAuthError]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => setFilters((f) => ({ ...f, page: 1 })), [q]);

  const setFilter = (patch: Partial<LeadFilters>) => setFilters((f) => ({ ...f, ...patch, page: 1 }));

  async function quickStatus(lead: Lead, status: LeadStatus) {
    try {
      await updateLead(lead.id, { status });
      load();
    } catch (e) {
      onAuthError(e);
    }
  }

  const allCount = data ? Object.values(data.status_counts).reduce((a, b) => a + b, 0) : 0;
  const page = filters.page ?? 1;
  const pageSize = filters.page_size ?? 25;

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold mr-auto">Leads</h1>
        {!!data?.follow_ups_due && (
          <Button variant={filters.due ? 'default' : 'outline'} onClick={() => setFilter({ due: !filters.due })}>
            {data.follow_ups_due} follow-up{data.follow_ups_due > 1 ? 's' : ''} due
          </Button>
        )}
        <Button onClick={() => setAdding(true)}>Add lead</Button>
        <Button variant="outline" onClick={() => exportLeads({ ...filters, q }).catch(onAuthError)}>Export CSV</Button>
        <Button variant="ghost" onClick={() => { logout(); navigate('/admin/login'); }}>Log out</Button>
      </div>

      {/* Status tabs: counts ignore the status filter so every bucket stays visible */}
      <div role="tablist" aria-label="Filter by status" className="flex flex-wrap gap-2">
        {([['', 'All', allCount], ...Object.entries(LEAD_STATUSES).map(([k, label]) =>
          [k, label, data?.status_counts[k as LeadStatus] ?? 0])] as [string, string, number][]).map(([k, label, n]) => {
          const active = (filters.status ?? '') === k;
          return (
            <button
              key={k || 'all'}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter({ status: (k || undefined) as LeadStatus | undefined })}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${active ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
            >
              {label} <span className="opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="grow min-w-[220px]">
          <Label htmlFor="lead-search">Search</Label>
          <Input id="lead-search" type="search" placeholder="Name, company, email, phone, country, product, notes…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <FilterSelect id="f-type" label="Type" value={filters.type} options={LEAD_TYPES} onChange={(type) => setFilter({ type })} />
        <FilterSelect id="f-source" label="Source" value={filters.source} options={LEAD_SOURCES} onChange={(source) => setFilter({ source })} />
        <div>
          <Label htmlFor="f-from">From</Label>
          <Input id="f-from" type="date" max={today()} value={filters.date_from ?? ''} onChange={(e) => setFilter({ date_from: e.target.value || undefined })} />
        </div>
        <div>
          <Label htmlFor="f-to">To</Label>
          <Input id="f-to" type="date" max={today()} value={filters.date_to ?? ''} onChange={(e) => setFilter({ date_to: e.target.value || undefined })} />
        </div>
        <FilterSelect id="f-sort" label="Sort" value={filters.sort} allowAll={false}
          options={{ '-created_at': 'Newest first', created_at: 'Oldest first', follow_up_on: 'Follow-up date', country: 'Country', name: 'Name' }}
          onChange={(sort) => setFilter({ sort })} />
      </div>

      {error && (
        <div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-3">
          {error} <Button size="sm" variant="outline" onClick={load}>Retry</Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              {['Received', 'Buyer', 'Contact', 'Country', 'Product', 'Type · Source', 'Status', 'Follow up'].map((h) => (
                <th key={h} scope="col" className="px-3 py-2 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.items.map((l) => {
              const links = contactLinks(l);
              const overdue = l.follow_up_on && l.follow_up_on <= today() && !['won', 'lost', 'spam'].includes(l.status);
              return (
                <tr key={l.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => setOpen(l)}>
                  <td className="px-3 py-2 whitespace-nowrap">{fmtDate(l.created_at)}</td>
                  <td className="px-3 py-2">
                    <button className="font-medium text-left hover:underline" onClick={(e) => { e.stopPropagation(); setOpen(l); }}>{l.name}</button>
                    {l.company && <div className="text-muted-foreground">{l.company}</div>}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    {links.mail && <a className="block text-primary hover:underline" href={links.mail}>{l.email}</a>}
                    {links.whatsapp && <a className="block text-green-700 hover:underline" href={links.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp {l.phone}</a>}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{l.country ?? '–'}</td>
                  <td className="px-3 py-2">{l.product_name ?? l.subject ?? '–'}{l.quantity && <div className="text-muted-foreground">{l.quantity}</div>}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{LEAD_TYPES[l.type]} · {LEAD_SOURCES[l.source]}</td>
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <Select value={l.status} onValueChange={(v) => quickStatus(l, v as LeadStatus)}>
                      <SelectTrigger aria-label={`Status for ${l.name}`} className={`h-8 w-[140px] border-0 ${STATUS_STYLE[l.status]}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(LEAD_STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {l.follow_up_on ? <Badge variant={overdue ? 'destructive' : 'secondary'}>{fmtDate(l.follow_up_on)}</Badge> : '–'}
                  </td>
                </tr>
              );
            })}
            {data && !data.items.length && (
              <tr><td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">No leads match these filters.</td></tr>
            )}
            {!data && loading && (
              <tr><td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">Loading leads…</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.total > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, data.total)} of {data.total}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setFilters((f) => ({ ...f, page: page - 1 }))}>Previous</Button>
            <Button size="sm" variant="outline" disabled={page * pageSize >= data.total} onClick={() => setFilters((f) => ({ ...f, page: page + 1 }))}>Next</Button>
          </div>
        </div>
      )}

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle>{open.name}{open.company ? ` · ${open.company}` : ''}</SheetTitle>
              </SheetHeader>
              <LeadMeta lead={open} />
              <LeadForm
                key={open.id}
                initial={open}
                submitLabel="Save changes"
                onSubmit={async (changes) => {
                  if (!Object.keys(changes).length) return setOpen(null);
                  await updateLead(open.id, changes);
                  setOpen(null);
                  load();
                }}
              />
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add a lead</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">For enquiries that came by WhatsApp, email, phone, a marketplace or a trade fair.</p>
          <LeadForm
            initial={{ type: 'whatsapp', source: 'whatsapp', status: 'new' }}
            submitLabel="Add lead"
            onCancel={() => setAdding(false)}
            onSubmit={async (v) => {
              await createLead({ type: 'whatsapp', source: 'whatsapp', status: 'new', ...v });
              setAdding(false);
              setFilter({ status: undefined });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LeadMeta({ lead }: { lead: Lead }) {
  const links = contactLinks(lead);
  const rows: [string, string | null][] = [
    ['Received', new Date(lead.created_at).toLocaleString()],
    ['Came from', `${LEAD_TYPES[lead.type]} · ${LEAD_SOURCES[lead.source]}`],
    ['Page', lead.category_slug && lead.category_slug !== 'search' ? `${lead.category_slug} / ${lead.subcategory_slug}` : lead.category_slug === 'search' ? 'Search results' : null],
    ['Subject', lead.subject],
    ['Product details', lead.product_attributes ? Object.entries(lead.product_attributes).map(([k, v]) => `${k}: ${v}`).join(', ') : null],
    ['Notification email', lead.email_sent === null ? null : lead.email_sent ? 'Sent' : 'Not sent – reply to this lead directly'],
  ];
  return (
    <div className="my-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        {links.mail && <Button asChild size="sm"><a href={links.mail}>Reply by email</a></Button>}
        {links.whatsapp && <Button asChild size="sm" variant="outline"><a href={links.whatsapp} target="_blank" rel="noopener noreferrer">Open WhatsApp</a></Button>}
      </div>
      <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-sm">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="contents"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
    </div>
  );
}

function FilterSelect<T extends string>({ id, label, value, options, onChange, allowAll = true }: {
  id: string; label: string; value?: T; options: Record<T, string>; onChange: (v: T | undefined) => void; allowAll?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Select value={value ?? 'all'} onValueChange={(v) => onChange(v === 'all' ? undefined : (v as T))}>
        <SelectTrigger id={id} className="w-[160px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {allowAll && <SelectItem value="all">All</SelectItem>}
          {(Object.entries(options) as [T, string][]).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
