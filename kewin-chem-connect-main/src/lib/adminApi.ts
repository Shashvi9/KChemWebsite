import { API_BASE } from '@/lib/apiConfig';

const TOKEN_KEY = 'kc_admin_token';

/** Returns the stored token only while it is unexpired (JWT `exp`), else clears it. */
export function getAdminToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof exp === 'number' && exp * 1000 > Date.now()) return token;
  } catch { /* malformed */ }
  localStorage.removeItem(TOKEN_KEY);
  return null;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function adminFetch(path: string, init: RequestInit = {}) {
  const token = getAdminToken();
  if (!token) throw new Error('unauthorized');
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init.headers as Record<string, string>) },
  });
  if (res.status === 401 || res.status === 403) {
    logout();
    throw new Error('unauthorized');
  }
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const d = (await res.json())?.detail;
      detail = typeof d === 'string' ? d : Array.isArray(d) ? d.map((x) => x.msg).join('; ') : detail;
    } catch { /* not JSON */ }
    throw new Error(detail);
  }
  return res;
}

export async function adminLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (res.status === 429) throw new Error('Too many attempts. Try again in 15 minutes.');
  if (!res.ok) throw new Error(res.status === 401 ? 'Wrong username or password' : 'Login is not available right now');
  const data = await res.json();
  localStorage.setItem(TOKEN_KEY, data.access_token);
  return data;
}

// Keep in sync with LEAD_* in backend/app/db/models.py
export const LEAD_STATUSES = {
  new: 'New', contacted: 'Contacted', quoted: 'Quoted', sample_sent: 'Sample sent',
  negotiating: 'Negotiating', won: 'Won', lost: 'Lost', spam: 'Spam',
} as const;
export const LEAD_TYPES = {
  sample: 'Sample request', inquiry: 'Inquiry', whatsapp: 'WhatsApp', email: 'Email', phone: 'Phone call',
  marketplace: 'Marketplace', trade_fair: 'Trade fair', other: 'Other',
} as const;
export const LEAD_SOURCES = {
  website: 'Website', whatsapp: 'WhatsApp', email: 'Email', phone: 'Phone', alibaba: 'Alibaba',
  indiamart: 'IndiaMART', tradeindia: 'TradeIndia', echemi: 'ECHEMI', trade_fair: 'Trade fair',
  referral: 'Referral', other: 'Other',
} as const;

export type LeadStatus = keyof typeof LEAD_STATUSES;
export type LeadType = keyof typeof LEAD_TYPES;
export type LeadSource = keyof typeof LEAD_SOURCES;

export type Lead = {
  id: number;
  type: LeadType;
  source: LeadSource;
  status: LeadStatus;
  product_id: number | null;
  product_name: string | null;
  category_slug: string | null;
  subcategory_slug: string | null;
  product_attributes: Record<string, unknown> | null;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  quantity: string | null;
  subject: string | null;
  message: string | null;
  assigned_to: string | null;
  notes: string | null;
  follow_up_on: string | null;
  email_sent: boolean | null;
  legacy_table: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadList = {
  items: Lead[];
  total: number;
  page: number;
  page_size: number;
  status_counts: Record<LeadStatus, number>;
  follow_ups_due: number;
};

export type LeadFilters = {
  q?: string;
  type?: LeadType;
  source?: LeadSource;
  status?: LeadStatus;
  date_from?: string;
  date_to?: string;
  due?: boolean;
  sort?: string;
  page?: number;
  page_size?: number;
};

export type LeadInput = Partial<Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'email_sent' | 'legacy_table'>>;

function qs(params: object) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== false) p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
}

export const listLeads = async (f: LeadFilters): Promise<LeadList> => (await adminFetch(`/admin/leads/${qs(f)}`)).json();

export const createLead = async (body: LeadInput): Promise<Lead> =>
  (await adminFetch('/admin/leads/', { method: 'POST', body: JSON.stringify(body) })).json();

export const updateLead = async (id: number, body: LeadInput): Promise<Lead> =>
  (await adminFetch(`/admin/leads/${id}`, { method: 'PATCH', body: JSON.stringify(body) })).json();

export async function exportLeads(f: LeadFilters) {
  const { page: _p, page_size: _s, ...rest } = f;
  const blob = await (await adminFetch(`/admin/leads/export/csv${qs(rest)}`)).blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function contactLinks(lead: Pick<Lead, 'email' | 'phone' | 'product_name' | 'subject'>) {
  const digits = (lead.phone ?? '').replace(/[^\d]/g, '');
  return {
    mail: lead.email
      ? `mailto:${lead.email}?subject=${encodeURIComponent(`Re: ${lead.product_name ?? lead.subject ?? 'your enquiry'} – Kewin Chemicals`)}`
      : null,
    whatsapp: digits.length >= 8 ? `https://wa.me/${digits}` : null,
  };
}
