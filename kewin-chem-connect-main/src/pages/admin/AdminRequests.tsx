import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminFetch, exportSampleRequests, listSampleRequests, updateSampleRequest, AdminSampleRequest, getAdminToken } from '@/lib/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function useAuthGuard() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!getAdminToken()) navigate('/admin/login');
  }, [navigate]);
}

export default function AdminRequests() {
  useAuthGuard();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState('-created_at');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ items: AdminSampleRequest[]; total: number } | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await listSampleRequests({ q, status, page, page_size: pageSize, sort });
      setData(res);
    } catch (e: any) {
      if (e?.message === 'unauthorized') {
        window.location.href = '/admin/login';
        return;
      }
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, status, page, pageSize, sort]);

  async function updateRow(row: AdminSampleRequest, patch: Partial<AdminSampleRequest> & { internal_notes?: string }) {
    await updateSampleRequest(row.id, patch);
    load();
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Sample Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4 items-end">
            <div>
              <Label>Search</Label>
              <Input placeholder="name, company, email, product" value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status ?? 'all'} onValueChange={(v) => { setPage(1); setStatus(v === 'all' ? undefined : v); }}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sort</Label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-created_at">Newest first</SelectItem>
                  <SelectItem value="created_at">Oldest first</SelectItem>
                  <SelectItem value="-status">Status desc</SelectItem>
                  <SelectItem value="status">Status asc</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={() => exportSampleRequests({ q, status, sort })}>Export CSV</Button>
              <Button onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</Button>
            </div>
          </div>

          {error && <div className="text-red-600">{error}</div>}

          <div className="overflow-auto rounded border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-2 text-left">Created</th>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Company</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-left">Category/Sub</th>
                  <th className="px-3 py-2 text-left">Quantity</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.items?.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2">{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td>
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2">{r.company}</td>
                    <td className="px-3 py-2">{r.email}</td>
                    <td className="px-3 py-2">{r.product_name || '-'}</td>
                    <td className="px-3 py-2">{r.category_slug}/{r.subcategory_slug}</td>
                    <td className="px-3 py-2">{r.quantity || '-'}</td>
                    <td className="px-3 py-2">
                      <Select value={r.status} onValueChange={(v) => updateRow(r, { status: v })}>
                        <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
                {!data?.items?.length && !loading && (
                  <tr><td className="px-3 py-6 text-muted-foreground" colSpan={8}>No results</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {data && (
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-muted-foreground">Total: {data.total}</div>
              <div className="flex items-center gap-2">
                <Button disabled={page<=1} onClick={() => setPage((p)=>p-1)}>Prev</Button>
                <div className="text-sm">Page {page}</div>
                <Button disabled={(page*pageSize)>=data.total} onClick={() => setPage((p)=>p+1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
