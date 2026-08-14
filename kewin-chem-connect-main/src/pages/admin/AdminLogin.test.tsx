import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import { adminLogin } from '@/lib/adminApi';

vi.mock('@/lib/adminApi', () => ({
  adminLogin: vi.fn(),
}));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

describe('AdminLogin', () => {
  it('navigates to the requests screen after successful cookie-backed login', async () => {
    vi.mocked(adminLogin).mockResolvedValueOnce({ ok: true });
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <Routes>
          <Route path="/admin/login" element={<><AdminLogin /><LocationProbe /></>} />
          <Route path="/admin/requests" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/username/i), 'admin');
    await user.type(screen.getByLabelText(/password/i), 'secret');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/admin/requests'));
    expect(adminLogin).toHaveBeenCalledWith('admin', 'secret');
  });
});
