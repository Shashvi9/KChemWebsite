import { API_BASE } from '@/lib/apiConfig';

export class AdminAuthError extends Error {
  constructor(message = 'Admin session expired') {
    super(message);
    this.name = 'AdminAuthError';
  }
}

export function isAdminAuthError(error: unknown): error is AdminAuthError {
  return error instanceof AdminAuthError;
}

function isAuthRejected(res: Response) {
  return res.status === 401 || res.status === 403;
}

function mergeJsonHeaders(headers?: HeadersInit): Headers {
  const merged = new Headers(headers);
  if (!merged.has('Content-Type')) {
    merged.set('Content-Type', 'application/json');
  }
  return merged;
}

export async function adminFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: mergeJsonHeaders(init.headers),
    credentials: 'include',
  });
  if (isAuthRejected(res)) {
    throw new AdminAuthError();
  }
  return res;
}

export async function adminLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    let message = 'Login failed';
    try {
      const data = await res.json();
      message = data?.detail || data?.message || message;
    } catch {
      // Empty or non-JSON login failures use the generic message.
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function adminLogout() {
  const res = await fetch(`${API_BASE}/admin/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (isAuthRejected(res)) {
    throw new AdminAuthError();
  }
  if (!res.ok) throw new Error('Logout failed');
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
  quantity?: string | null;
  assigned_to?: string | null;
};

export async function listSampleRequests(params: Record<string, unknown> = {}) {
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

export async function exportSampleRequests(params: Record<string, unknown> = {}) {
  const cleaned: Record<string, string> = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') cleaned[k] = String(v);
  });
  const query = new URLSearchParams(cleaned).toString();
  const url = `${API_BASE}/admin/sample-requests/export${query ? `?${query}` : ''}`;
  const res = await fetch(url, { credentials: 'include' });
  if (isAuthRejected(res)) {
    throw new AdminAuthError();
  }
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sample_requests.csv';
  a.click();
}
