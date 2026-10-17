import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Factory } from "lucide-react";
import { API_BASE } from '@/lib/apiConfig';
import { CONTACT_EMAIL, CONTACT_PHONE, COUNTRIES, WHATSAPP_URL, errorMessage } from '@/lib/contact';

const offices = [
  {
    title: "Head Office",
    icon: MapPin,
    content: (
      <>
        <p className="font-medium text-foreground">C - 308, The First</p>
        <p className="text-muted-foreground">Nyay Marg, IIM, Vastrapur,</p>
        <p className="text-muted-foreground">Ahmedabad - 380015</p>
      </>
    ),
  },
  {
    title: "Contact",
    icon: Phone,
    content: (
      <div className="space-y-1">
        {/* WhatsApp / Phone */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground font-medium hover:underline block"
        >
          {CONTACT_PHONE} (WhatsApp)
        </a>

        {/* Email */}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-muted-foreground font-medium hover:underline block"
        >
          {CONTACT_EMAIL}
        </a>
      </div>
    ),
  },
  {
    title: "Factory 1",
    icon: Factory,
    content: (
      <a
        href="https://www.google.com/maps/place/Kewin+Chemicals+Pvt+Ltd/@22.9638752,72.6403775,16.74z/data=!4m15!1m8!3m7!1s0x395e848aa5155555:0xb8730d1b59be389f!2sKewin+Chemicals+Pvt+Ltd!8m2!3d22.9639535!4d72.6407919!10e5!16s%2Fg%2F1thhhxfq!3m5!1s0x395e848aa5155555:0xb8730d1b59be389f!8m2!3d22.9639535!4d72.6407919!16s%2Fg%2F1thhhxfq?authuser=0&entry=ttu&g_ep=EgoyMDI1MDkxNy4wIKXMDSoASAFQAw%3D%3D"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground font-medium hover:underline block"
      >
        214, Phase - 2 G.I.D.C Vatva, Ahmedabad, Gujarat (India)
      </a>
    ),
  },
  {
    title: "Factory 2",
    icon: Factory,
    content: (
      <a
        href="https://www.google.com/maps/place/Kewin+chemicals+Pvt+Ltd+saykha+unit+1/@21.7939325,70.6977081,8z/data=!4m10!1m2!2m1!1sKewin+Chemicals+Pvt+Ltd+Madhya+Pradesh+!3m6!1s0x395f875a8713e20f:0x83515f38b0b5907a!8m2!3d21.7938945!4d72.8069544!15sCiZLZXdpbiBDaGVtaWNhbHMgUHZ0IEx0ZCBNYWRoeWEgUHJhZGVzaJIBDG1hbnVmYWN0dXJlcqoBbBABKhsiF2tld2luIGNoZW1pY2FscyBwdnQgbHRkKAAyHxABIhtNzCDzeS0vpsqjWU-xWGCmvWb7lFAe6h8ItTMyKhACIiZrZXdpbiBjaGVtaWNhbHMgcHZ0IGx0ZCBtYWRoeWEgcHJhZGVzaOABAA!16s%2Fg%2F11ry58ms9l?authuser=0&entry=ttu&g_ep=EgoyMDI1MDkxNy4wIKXMDSoASAFQAw%3D%3D"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground font-medium hover:underline block"
      >
        136, A.K.V.N Jhabua, Madhya Pradesh (India)
      </a>
    ),
  },
];

const EMPTY = { name: "", email: "", company: "", country: "", phone: "", subject: "", message: "", website: "" };

const Contact = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ ...EMPTY, subject: searchParams.get("subject") || "" });

  // Links like /contact?subject=Cosmetic%20colors prefill the subject, also when already on this page.
  useEffect(() => {
    const subject = searchParams.get("subject");
    if (subject) setFormData((f) => ({ ...f, subject }));
  }, [searchParams]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitted(false);

    try {
      const response = await fetch(`${API_BASE}/inquiries/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(await errorMessage(response));

      setSubmitted(true);
      setFormData(EMPTY);
    } catch (err: any) {
      setError(err?.name === 'TypeError' ? 'Network error. Please check your connection and try again.' : err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-background to-white min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-2">
            Contact us
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Reach out to Kewin Chemicals for product inquiries, support, or custom chemical solutions.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Inquiry Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center md:text-left">
              Send an Inquiry
            </h2>
            {submitted && (
              <p role="status" className="text-green-700 text-center mb-4">
                Thank you. Our export team will reply within one working day.
              </p>
            )}
            {error && (
              <p role="alert" className="text-red-600 text-center mb-4">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name *"
                aria-label="Your name"
                autoComplete="name"
                minLength={2}
                maxLength={255}
                required
                className="p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:outline-none"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email *"
                aria-label="Your email"
                autoComplete="email"
                required
                className="p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:outline-none"
              />
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Company"
                aria-label="Company"
                autoComplete="organization"
                maxLength={255}
                className="p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:outline-none"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="country"
                  list="contact-countries"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country *"
                  aria-label="Country"
                  autoComplete="country-name"
                  required
                  maxLength={255}
                  className="p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:outline-none"
                />
                <datalist id="contact-countries">{COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone / WhatsApp"
                  aria-label="Phone or WhatsApp"
                  autoComplete="tel"
                  maxLength={64}
                  className="p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:outline-none"
                />
              </div>
              {/* Honeypot: hidden from people, filled by bots */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={formData.website} onChange={handleChange} />
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject *"
                aria-label="Subject"
                minLength={2}
                maxLength={255}
                required
                className="p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:outline-none"
              />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message *"
                aria-label="Your message"
                minLength={10}
                maxLength={5000}
                rows={5}
                required
                className="p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:outline-none"
              />
              <div className="text-center md:text-right">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-primary text-white hover:bg-primary/90 font-semibold px-8"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Inquiry'}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column - Contact Info */}
          <div className="space-y-6">
            {offices.map((office, idx) => (
              <div
                key={office.title}
                className="bg-white rounded-xl shadow-lg p-6 flex items-start gap-4 hover:shadow-2xl transition-shadow"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="w-10 h-10 bg-secondary text-primary rounded-full flex items-center justify-center mt-1">
                  <office.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{office.title}</h3>
                  <div className="text-muted-foreground text-sm leading-snug">{office.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
