// Single source for public contact details. Change here, not in components.
export const CONTACT_EMAIL = 'kctl96@gmail.com';
export const CONTACT_PHONE = '+91 9879563306';
export const CONTACT_PHONE_TEL = '+919879563306';
export const WHATSAPP_URL = 'https://wa.me/919879563306';

// Suggestions for the country field (buyers can still type any country).
export const COUNTRIES = [
  'Bangladesh', 'Brazil', 'China', 'Egypt', 'Ethiopia', 'Germany', 'India', 'Indonesia', 'Iran', 'Italy',
  'Jordan', 'Kenya', 'Malaysia', 'Mexico', 'Morocco', 'Nepal', 'Nigeria', 'Pakistan', 'Peru', 'Philippines',
  'Saudi Arabia', 'South Africa', 'Spain', 'Sri Lanka', 'Tanzania', 'Thailand', 'Tunisia', 'Turkey',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uzbekistan', 'Vietnam',
];

/** Read `detail` from an error response without throwing on non-JSON bodies (e.g. a 502 HTML page). */
export async function errorMessage(res: Response): Promise<string> {
  try {
    const d = (await res.json())?.detail;
    if (typeof d === 'string') return d;
  } catch { /* not JSON */ }
  return res.status === 429
    ? 'Too many requests. Please try again later or contact us on WhatsApp.'
    : 'Could not send right now. Please try again, or email or WhatsApp us.';
}
