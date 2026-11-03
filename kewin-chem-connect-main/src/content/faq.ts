import { CONTACT_EMAIL, CONTACT_PHONE, FACILITIES, HEAD_OFFICE } from '@/lib/contact';

/** Questions buyers ask. Shown on /faq and published as FAQPage structured data from the same list. */
export type Faq = { q: string; a: string; link?: { label: string; to: string } };

export const FAQS: Faq[] = [
  {
    q: 'What does Kewin Chemicals manufacture?',
    a: 'Kewin Chemicals manufactures and exports dyes (acid, basic, direct, reactive and solvent dyes), dye intermediates, food and pharma colours (FD&C, D&C, lake and blended colours), organic pigments and pharmaceutical products.',
    link: { label: 'Browse all product ranges', to: '/' },
  },
  {
    q: 'Where is Kewin Chemicals located?',
    a: `The head office is at ${HEAD_OFFICE}. Products are made at two manufacturing units: ${FACILITIES.map((f) => `${f.name.split('·')[1].trim()} (${f.address})`).join(' and ')}.`,
  },
  {
    q: 'How long has Kewin Chemicals been in business?',
    a: 'Kewin Chemicals has manufactured and supplied dyes and colourants since 1999.',
    link: { label: 'About Kewin Chemicals', to: '/about' },
  },
  {
    q: 'Do you export outside India?',
    a: 'Yes. Kewin Chemicals is a manufacturer and exporter. Send the product, quantity and destination country with your enquiry, and the export team will reply with availability, documents and shipping terms.',
    link: { label: 'Request an export quote', to: '/contact?subject=Quote%20request' },
  },
  {
    q: 'Can I get a sample before ordering?',
    a: 'Yes. Use "Request a sample" on any product page, or contact the team directly, so you can check shade and performance on your own substrate before placing an order.',
  },
  {
    q: 'Which documents are available with the products?',
    a: 'A technical data sheet (TDS) and safety data sheet (MSDS) are available on request for each product, and every batch ships with its own certificate of analysis (COA).',
  },
  {
    q: 'How can I find a product by its CAS number?',
    a: 'Every product is listed with its CAS number where one exists. Type the CAS number, the product name or the C.I. name into the search box at the top of any page.',
  },
  {
    q: 'How do I contact Kewin Chemicals for a price?',
    a: `Email ${CONTACT_EMAIL}, call or WhatsApp ${CONTACT_PHONE}, or send the enquiry form. The team replies Monday to Saturday, 9:00 to 18:00 India Standard Time.`,
    link: { label: 'Contact us', to: '/contact' },
  },
];
