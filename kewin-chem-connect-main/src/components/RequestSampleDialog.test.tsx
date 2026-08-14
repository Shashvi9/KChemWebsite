import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import RequestSampleDialog from './RequestSampleDialog';
import { renderWithRouter, screen, waitFor } from '@/test/test-utils';

describe('RequestSampleDialog', () => {
  it('blocks invalid sample requests before submitting', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter(
      <RequestSampleDialog
        trigger={<button>Request sample</button>}
        context={{ categorySlug: 'food-pharma', subcategorySlug: 'tablets', product: { id: 12, name: 'Lake Red' } }}
      />,
    );

    await user.click(screen.getByRole('button', { name: /request sample/i }));
    await user.type(screen.getByLabelText(/name/i), 'Ada Buyer');
    await user.type(screen.getByLabelText(/company/i), 'Acme Labs');
    await user.type(screen.getByLabelText(/work email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /send request/i }));

    expect(await screen.findByText('Enter a valid work email.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends the expected sample request payload for valid values', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter(
      <RequestSampleDialog
        trigger={<button>Request sample</button>}
        context={{
          categorySlug: 'food-pharma',
          subcategorySlug: 'tablets',
          product: { id: 12, name: 'Lake Red', attributes: { shade: 'red' } },
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: /request sample/i }));
    await user.type(screen.getByLabelText(/name/i), ' Ada Buyer ');
    await user.type(screen.getByLabelText(/company/i), ' Acme Labs ');
    await user.type(screen.getByLabelText(/work email/i), ' ada@example.com ');
    await user.type(screen.getByLabelText(/phone/i), ' +1 555 0100 ');
    await user.type(screen.getByLabelText(/country/i), ' US ');
    await user.type(screen.getByLabelText(/quantity/i), ' 500 g ');
    await user.type(screen.getByLabelText(/intended application/i), ' Tablet coating ');
    await user.click(screen.getByRole('checkbox', { name: /email me a copy/i }));
    await user.click(screen.getByRole('button', { name: /send request/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      category_slug: 'food-pharma-colors',
      subcategory_slug: 'tablets',
      product_id: 12,
      product_name: 'Lake Red',
      attributes: { shade: 'red' },
      quantity: '500 g',
      use_case: 'Tablet coating',
      name: 'Ada Buyer',
      company: 'Acme Labs',
      email: 'ada@example.com',
      phone: '+1 555 0100',
      country: 'US',
      send_copy_to_requester: false,
    });
  });
});
