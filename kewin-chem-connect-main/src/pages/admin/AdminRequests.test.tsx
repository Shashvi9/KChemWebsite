import type React from 'react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AdminRequests from './AdminRequests';
import { createDeferred } from '@/test/deferred';
import { renderWithRouter, screen, waitFor, within } from '@/test/test-utils';

vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: { value?: string; onValueChange?: (value: string) => void; children: React.ReactNode }) => (
    <select aria-label={`select-${value ?? 'all'}`} value={value} onChange={(event) => onValueChange?.(event.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: () => null,
}));

function jsonResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  };
}

function requestItem(id: number, name: string, status = 'pending') {
  return {
    id,
    created_at: '2026-08-14T08:00:00Z',
    status,
    name,
    company: `${name} Co`,
    email: `${name.toLowerCase()}@example.com`,
    category_slug: 'food-pharma-colors',
    subcategory_slug: 'tablets',
    product_name: `${name} Product`,
    quantity: '1 kg',
  };
}

describe('AdminRequests', () => {
  it('requests and renders filtered, paginated queue state', async () => {
    const user = userEvent.setup();
    localStorage.setItem('kc_admin_token', 'token');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ items: [requestItem(1, 'Initial')], total: 25 }));
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter(<AdminRequests />);

    expect(await screen.findByText('Initial')).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/name, company, email, product/i), 'red');

    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([url]) => String(url).includes('q=red'))).toBe(true);
    });

    await user.selectOptions(screen.getByLabelText('select-all'), 'pending');

    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([url]) => String(url).includes('status=pending'))).toBe(true);
    });

    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([url]) => String(url).includes('page=2'))).toBe(true);
    });

    const latestUrl = String(fetchMock.mock.calls.at(-1)?.[0]);
    expect(latestUrl).toContain('/admin/sample-requests?');
    expect(latestUrl).toContain('q=red');
    expect(latestUrl).toContain('status=pending');
    expect(latestUrl).toContain('page=2');
    expect(latestUrl).toContain('page_size=20');
    expect(latestUrl).toContain('sort=-created_at');
  });

  it('keeps stale out-of-order search responses from replacing latest results', async () => {
    const user = userEvent.setup();
    localStorage.setItem('kc_admin_token', 'token');

    const initial = createDeferred<ReturnType<typeof jsonResponse>>();
    const stale = createDeferred<ReturnType<typeof jsonResponse>>();
    const latest = createDeferred<ReturnType<typeof jsonResponse>>();
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(initial.promise)
      .mockReturnValueOnce(stale.promise)
      .mockReturnValueOnce(latest.promise);
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter(<AdminRequests />);

    initial.resolve(jsonResponse({ items: [requestItem(1, 'Initial')], total: 1 }));
    expect(await screen.findByText('Initial')).toBeInTheDocument();

    const search = screen.getByPlaceholderText(/name, company, email, product/i);
    await user.type(search, 'a');
    await user.type(search, 'b');

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

    latest.resolve(jsonResponse({ items: [requestItem(3, 'Latest')], total: 1 }));
    expect(await screen.findByText('Latest')).toBeInTheDocument();

    stale.resolve(jsonResponse({ items: [requestItem(2, 'Stale')], total: 1 }));

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).queryByText('Stale')).not.toBeInTheDocument();
      expect(within(table).getByText('Latest')).toBeInTheDocument();
    });
  });
});
