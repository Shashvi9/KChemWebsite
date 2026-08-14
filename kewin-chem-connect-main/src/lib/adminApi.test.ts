import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AdminAuthError,
  adminFetch,
  adminLogin,
  adminLogout,
  exportSampleRequests,
  listSampleRequests,
  updateSampleRequest,
} from './adminApi';

const fetchMock = vi.fn();

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

function lastFetch() {
  return fetchMock.mock.calls.at(-1) as [string, RequestInit];
}

function headersFrom(init: RequestInit) {
  return new Headers(init.headers);
}

describe('adminApi cookie-backed session requests', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('logs in with included browser credentials and does not write web storage', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await adminLogin('admin', 'secret');

    const [url, init] = lastFetch();
    expect(url).toBe('/api/v1/admin/auth/login');
    expect(init).toMatchObject({
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ username: 'admin', password: 'secret' }),
    });
    expect(headersFrom(init).get('Authorization')).toBeNull();
    expect(headersFrom(init).get('Content-Type')).toBe('application/json');
    expect(setItem).not.toHaveBeenCalled();
  });

  it('sends protected list and update requests with credentials and no bearer header', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ items: [], total: 0 }))
      .mockResolvedValueOnce(jsonResponse({ id: 1, status: 'completed' }));

    await listSampleRequests({ q: 'blue', status: 'pending', page: 2, empty: '' });
    await updateSampleRequest(1, { status: 'completed' });

    const [, listInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const [updateUrl, updateInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/admin/sample-requests?q=blue&status=pending&page=2');
    expect(listInit.credentials).toBe('include');
    expect(headersFrom(listInit).get('Authorization')).toBeNull();
    expect(updateUrl).toBe('/api/v1/admin/sample-requests/1');
    expect(updateInit.credentials).toBe('include');
    expect(updateInit.method).toBe('PATCH');
    expect(headersFrom(updateInit).get('Authorization')).toBeNull();
  });

  it('exports CSV with credentials and does not download on auth rejection', async () => {
    const createObjectURL = vi.fn(() => 'blob:test');
    const click = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL });
    vi.spyOn(document, 'createElement').mockReturnValue({ click } as unknown as HTMLAnchorElement);
    fetchMock.mockResolvedValueOnce(new Response('name,email', { status: 200 }));

    await exportSampleRequests({ status: 'pending' });

    const [url, init] = lastFetch();
    expect(url).toBe('/api/v1/admin/sample-requests/export?status=pending');
    expect(init.credentials).toBe('include');
    expect(headersFrom(init).get('Authorization')).toBeNull();
    expect(click).toHaveBeenCalledTimes(1);

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    await expect(exportSampleRequests()).rejects.toBeInstanceOf(AdminAuthError);
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('treats 401 and 403 as typed admin auth errors', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));
    await expect(adminFetch('/admin/sample-requests')).rejects.toBeInstanceOf(AdminAuthError);

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    await expect(adminLogout()).rejects.toBeInstanceOf(AdminAuthError);
  });

  it('does not read or write the removed admin credential storage key', async () => {
    const key = ['kc', 'admin', 'token'].join('_');
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse({ items: [], total: 0 })));

    await adminLogin('admin', 'secret');
    await listSampleRequests();
    await updateSampleRequest(1, { status: 'pending' });

    expect(getItem).not.toHaveBeenCalledWith(key);
    expect(setItem).not.toHaveBeenCalledWith(key, expect.any(String));
    expect(fetchMock.mock.calls).toHaveLength(3);
  });
});
