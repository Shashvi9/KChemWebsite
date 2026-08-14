import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import AdminRequests from './AdminRequests';
import {
  AdminAuthError,
  adminLogout,
  exportSampleRequests,
  listSampleRequests,
  updateSampleRequest,
} from '@/lib/adminApi';

vi.mock('@/lib/adminApi', async () => {
  const actual = await vi.importActual<typeof import('@/lib/adminApi')>('@/lib/adminApi');
  return {
    ...actual,
    adminLogout: vi.fn(),
    exportSampleRequests: vi.fn(),
    listSampleRequests: vi.fn(),
    updateSampleRequest: vi.fn(),
  };
});

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderRequests() {
  return render(
    <MemoryRouter initialEntries={['/admin/requests']}>
      <Routes>
        <Route path="/admin/requests" element={<><AdminRequests /><LocationProbe /></>} />
        <Route path="/admin/login" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

const sampleData = {
  items: [{
    id: 1,
    created_at: '2026-08-14T00:00:00.000Z',
    status: 'pending',
    name: 'Ada',
    company: 'Kewin',
    email: 'ada@example.com',
    category_slug: 'dyes',
    subcategory_slug: 'acid',
    product_name: 'Blue 1',
    quantity: '1kg',
  }],
  total: 1,
};

describe('AdminRequests', () => {
  it('calls logout, clears visible request state, and navigates to login', async () => {
    vi.mocked(listSampleRequests).mockResolvedValueOnce(sampleData);
    vi.mocked(adminLogout).mockResolvedValueOnce(undefined);
    const user = userEvent.setup();

    renderRequests();

    expect(await screen.findByText('Ada')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/admin/login'));
    expect(adminLogout).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Ada')).not.toBeInTheDocument();
  });

  it('redirects to login when the initial protected load is rejected', async () => {
    vi.mocked(listSampleRequests).mockRejectedValueOnce(new AdminAuthError());

    renderRequests();

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/admin/login'));
  });

  it('redirects to login when export is rejected', async () => {
    vi.mocked(listSampleRequests).mockResolvedValueOnce(sampleData);
    vi.mocked(exportSampleRequests).mockRejectedValueOnce(new AdminAuthError());
    const user = userEvent.setup();

    renderRequests();

    expect(await screen.findByText('Ada')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /export csv/i }));

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/admin/login'));
  });

  it('redirects to login when a protected update is rejected', async () => {
    vi.mocked(listSampleRequests).mockResolvedValueOnce(sampleData);
    vi.mocked(updateSampleRequest).mockRejectedValueOnce(new AdminAuthError());
    const user = userEvent.setup();

    renderRequests();

    expect(await screen.findByText('Ada')).toBeInTheDocument();
    const statusSelect = screen.getAllByRole('combobox').at(-1);
    expect(statusSelect).toBeDefined();
    await user.click(statusSelect as HTMLElement);
    await user.click(await screen.findByText('Completed'));

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/admin/login'));
  });
});
