import { useState } from "react";
import {
  FaClock,
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhone,
  FaTwitter,
} from "react-icons/fa";
import { useSiteOverview } from "../../hooks/useSiteOverview";

const FALLBACK_CONTACT = {
  address: "حي الزياتين، الجمّال - ولاية المنستير، تونس",
  phone: "+216 73 000 000",
  email: "contact@hamaim.tn",
  hours: "الاثنين - الجمعة: 8:30 - 17:00",
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1644.9784642295117!2d10.760607824637864!3d35.615385065890756!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13020f849bdd6ebf%3A0xd864a3f1a3a38882!2zSlE4Nis4Q0osINi32LHZitmCINin2YTYqtmK2KfZitix2KksIEplbW1lbA!5e1!3m2!1sfr!2stn!4v1742081263237!5m2!1sfr!2stn",
  social: [
    { platform: "facebook", url: "https://www.facebook.com/profile.php?id=100064660632943" },
    { platform: "instagram", url: "https://www.instagram.com" },
    { platform: "twitter", url: "https://twitter.com" },
  ],
};

const ICONS = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  twitter: FaTwitter,
};

const Contact = () => {
  const { data } = useSiteOverview();
  const contact = data?.contact ?? FALLBACK_CONTACT;
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const socialLinks = Array.isArray(contact.social) && contact.social.length ? contact.social : FALLBACK_CONTACT.social;

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <section className="relative bg-white py-20" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-end text-right">
          <span className="text-sm font-semibold text-indigo-600">تواصل معنا</span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">نرافقك خطوة بخطوة لدعم طفلك</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            يسعد فريقنا باستقبال استفساراتكم حول البرامج، المواعيد، أو فرص التعاون المجتمعي.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr,1fr]">
          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden rounded-4xl border border-slate-100 bg-white p-8 shadow-xl"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-400" aria-hidden={true} />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="text-right">
                <label htmlFor="contact-name" className="text-sm font-semibold text-slate-700">
                  الاسم الكامل
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div className="text-right">
                <label htmlFor="contact-email" className="text-sm font-semibold text-slate-700">
                  البريد الإلكتروني
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
            <div className="mt-6 text-right">
              <label htmlFor="contact-subject" className="text-sm font-semibold text-slate-700">
                الموضوع
              </label>
              <input
                id="contact-subject"
                type="text"
                required
                value={formData.subject}
                onChange={(event) => setFormData((prev) => ({ ...prev, subject: event.target.value }))}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="mt-6 text-right">
              <label htmlFor="contact-message" className="text-sm font-semibold text-slate-700">
                الرسالة
              </label>
              <textarea
                id="contact-message"
                required
                rows={5}
                value={formData.message}
                onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <button
              type="submit"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-600"
            >
              إرسال الرسالة
            </button>
          </form>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-4xl border border-indigo-100 bg-gradient-to-br from-indigo-500 via-indigo-400 to-sky-400 p-8 text-white shadow-xl">
              <h3 className="text-xl font-semibold">تفاصيل الاتصال</h3>
              <p className="mt-2 text-sm text-white/90">سنكون سعداء بزيارتكم أو التواصل معنا عبر القنوات التالية:</p>
              <div className="mt-6 space-y-4 text-sm text-white/90">
                <div className="flex items-start justify-end gap-3">
                  <div>
                    <p className="font-semibold">العنوان</p>
                    <p>{contact.address}</p>
                  </div>
                  <FaMapMarkerAlt className="mt-1 h-5 w-5" />
                </div>
                <div className="flex items-start justify-end gap-3">
                  <div>
                    <p className="font-semibold">الهاتف</p>
                    <p>{contact.phone}</p>
                  </div>
                  <FaPhone className="mt-1 h-5 w-5" />
                </div>
                <div className="flex items-start justify-end gap-3">
                  <div>
                    <p className="font-semibold">البريد الإلكتروني</p>
                    <a href={`mailto:${contact.email}`} className="transition hover:text-white">
                      {contact.email}
                    </a>
                  </div>
                  <FaEnvelope className="mt-1 h-5 w-5" />
                </div>
                <div className="flex items-start justify-end gap-3">
                  <div>
                    <p className="font-semibold">ساعات العمل</p>
                    <p>{contact.hours}</p>
                  </div>
                  <FaClock className="mt-1 h-5 w-5" />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                {socialLinks.map((social) => {
                  const Icon = ICONS[social.platform] || FaInstagram;
                  return (
                    <a
                      key={`${social.platform}-${social.url}`}
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white transition hover:bg-white/25"
                      aria-label={`تابعنا على ${social.platform}`}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {contact.mapEmbed && (
              <div className="overflow-hidden rounded-4xl border border-slate-200 shadow-lg">
                <iframe
                  title="موقع الجمعية"
                  src={contact.mapEmbed}
                  className="h-64 w-full"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
