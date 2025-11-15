const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export function getAdminToken(): string | null {
  return localStorage.getItem('kc_admin_token');
}

export function setAdminToken(token: string) {
  localStorage.setItem('kc_admin_token', token);
}

export async function adminFetch(path: string, init: RequestInit = {}) {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (res.status === 401 || res.status === 403) {
    throw new Error('unauthorized');
  }
  return res;
}

export async function adminLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  const data = await res.json();
  setAdminToken(data.access_token);
  return data;
}

export type AdminSampleRequest = {
  id: number;
  created_at: string | null;
  status: string;
  name: string;
  company: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  category_slug: string;
  subcategory_slug: string;
  product_name?: string | null;
  form?: string | null;
  quantity?: string | null;
  assigned_to?: string | null;
};

export async function listSampleRequests(params: Record<string, any> = {}) {
  const cleaned: Record<string, string> = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') cleaned[k] = String(v);
  });
  const query = new URLSearchParams(cleaned).toString();
  const path = query ? `/admin/sample-requests?${query}` : `/admin/sample-requests`;
  const res = await adminFetch(path);
  if (!res.ok) throw new Error('Failed to load');
  return res.json();
}

export async function updateSampleRequest(id: number, body: Partial<AdminSampleRequest> & { internal_notes?: string }) {
  const res = await adminFetch(`/admin/sample-requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update');
  return res.json();
}

export async function exportSampleRequests(params: Record<string, any> = {}) {
  const cleaned: Record<string, string> = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') cleaned[k] = String(v);
  });
  const query = new URLSearchParams(cleaned).toString();
  const token = getAdminToken();
  const url = `${API_BASE}/admin/sample-requests/export${query ? `?${query}` : ''}`;
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sample_requests.csv';
  a.click();
}
