// Single source for public contact details. Change here, not in components.
export const CONTACT_EMAIL = 'kctl96@gmail.com';
export const CONTACT_PHONE = '+91 9879563306';
export const CONTACT_PHONE_TEL = '+919879563306';
export const WHATSAPP_URL = 'https://wa.me/919879563306';

/** Official profiles (LinkedIn, IndiaMART, TradeIndia...), published as Organization sameAs. Only add URLs that are Kewin's own. */
export const PROFILE_URLS: string[] = [];

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

export const HEAD_OFFICE = 'C-308, The First, Nyay Marg, near IIM, Vastrapur, Ahmedabad 380015, Gujarat, India';
export const FACILITIES = [
  { name: 'Unit 1 · Vatva', address: '214, Phase 2, GIDC Vatva, Ahmedabad, Gujarat', map: 'https://maps.google.com/?q=Kewin+Chemicals+Pvt+Ltd+GIDC+Vatva' },
  { name: 'Unit 2 · Jhabua', address: '136, A.K.V.N., Jhabua, Madhya Pradesh', map: 'https://maps.google.com/?q=Kewin+Chemicals+Jhabua' },
];
