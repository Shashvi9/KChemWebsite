import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Contact from './Contact';
import { renderWithRouter, screen, waitFor } from '@/test/test-utils';

describe('Contact', () => {
  it('blocks invalid inquiry values before submitting', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter(<Contact />);

    await user.type(screen.getByPlaceholderText(/your name/i), 'Nora');
    await user.type(screen.getByPlaceholderText(/your email/i), 'invalid-email');
    await user.type(screen.getByPlaceholderText(/subject/i), 'Pigment pricing');
    await user.type(screen.getByPlaceholderText(/your message/i), 'Please send pricing.');
    await user.click(screen.getByRole('button', { name: /submit inquiry/i }));

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends the expected inquiry payload for valid values', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter(<Contact />);

    await user.type(screen.getByPlaceholderText(/your name/i), ' Nora ');
    await user.type(screen.getByPlaceholderText(/your email/i), ' nora@example.com ');
    await user.type(screen.getByPlaceholderText(/subject/i), ' Pigment pricing ');
    await user.type(screen.getByPlaceholderText(/your message/i), ' Please send pricing. ');
    await user.click(screen.getByRole('button', { name: /submit inquiry/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      name: 'Nora',
      email: 'nora@example.com',
      subject: 'Pigment pricing',
      message: 'Please send pricing.',
    });
  });
});
