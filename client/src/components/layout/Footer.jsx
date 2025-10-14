import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhone,
  FaYoutube,
} from "react-icons/fa";
import { useSiteOverview } from "../../hooks/useSiteOverview";

const FALLBACK_FOOTER = {
  about: {
    title: "جمعية الحمائم",
    description:
      "جمعية متخصصة في دعم وتمكين الأطفال ذوي طيف التوحد من خلال برامج تأهيلية وتعليمية متكاملة.",
  },
  contact: {
    address: "حي الزياتين، الجمّال - ولاية المنستير، تونس",
    phone: "+216 73 000 000",
    email: "contact@hamaim.tn",
    hours: "الاثنين - الجمعة: 8:30 - 17:00",
  },
  columns: [
    {
      title: "عن الجمعية",
      links: [
        { label: "من نحن", href: "/about" },
        { label: "رسالتنا", href: "/about" },
        { label: "انضم إلى فريقنا", href: "/contact" },
      ],
    },
    {
      title: "خدمات ومصادر",
      links: [
        { label: "ما هو التوحد؟", href: "/what-is-autism" },
        { label: "الأسئلة الشائعة", href: "/faqs" },
        { label: "الأخبار", href: "/news" },
      ],
    },
  ],
  social: [
    { platform: "facebook", url: "https://www.facebook.com/profile.php?id=100064660632943" },
    { platform: "instagram", url: "https://www.instagram.com" },
    { platform: "youtube", url: "https://www.youtube.com" },
  ],
  newsletter: {
    title: "انضم إلى النشرة",
    description: "أحدث أخبار البرامج والفعاليات مباشرة إلى بريدك الإلكتروني.",
    placeholder: "example@email.com",
    button: "اشتراك",
  },
  copyright: `© ${new Date().getFullYear()} جمعية الحمائم للنهوض بالصحة النفسية. جميع الحقوق محفوظة.`,
};

const ICONS = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  youtube: FaYoutube,
  email: FaEnvelope,
};

const Footer = () => {
  const { data } = useSiteOverview();
  const footer = data?.footer ?? FALLBACK_FOOTER;
  const contact = footer.contact ?? FALLBACK_FOOTER.contact;
  const columns = useMemo(
    () => (Array.isArray(footer.columns) && footer.columns.length ? footer.columns : FALLBACK_FOOTER.columns),
    [footer.columns]
  );
  const socialLinks = useMemo(
    () => (Array.isArray(footer.social) && footer.social.length ? footer.social : FALLBACK_FOOTER.social),
    [footer.social]
  );
  const [email, setEmail] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setEmail("");
  };

  return (
    <footer className="relative mt-24 bg-slate-950 text-slate-100" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-950 to-slate-950" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr,1fr,1fr,1fr]">
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-3" aria-label="العودة للرئيسية">
              <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/10">
                <img
                  src="/logo.jpg"
                  alt="شعار الجمعية"
                  className="h-12 w-12 object-cover"
                  loading="lazy"
                />
              </span>
              <div className="text-right">
                <p className="text-sm font-semibold text-indigo-200">جمعية الحمائم</p>
                <p className="text-lg font-bold text-white">للنهوض بالصحة النفسية</p>
              </div>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-slate-200">
              {footer.about?.description || FALLBACK_FOOTER.about.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                <FaMapMarkerAlt className="h-4 w-4" />
                {contact.address}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                <FaPhone className="h-4 w-4" />
                {contact.phone}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = ICONS[social.platform] || FaInstagram;
                return (
                  <a
                    key={`${social.platform}-${social.url}`}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20"
                    aria-label={`تابعنا على ${social.platform}`}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="space-y-4">
              <h3 className="text-lg font-semibold text-white">{column.title}</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                {Array.isArray(column.links) &&
                  column.links.map((link) => (
                    <li key={link.href || link.label}>
                      <Link
                        to={link.href}
                        className="transition hover:text-white hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">{footer.newsletter?.title || FALLBACK_FOOTER.newsletter.title}</h3>
            <p className="text-sm text-slate-300">
              {footer.newsletter?.description || FALLBACK_FOOTER.newsletter.description}
            </p>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="newsletter-email">
                البريد الإلكتروني
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={footer.newsletter?.placeholder || FALLBACK_FOOTER.newsletter.placeholder}
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-right text-sm text-white placeholder:text-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-600"
              >
                {footer.newsletter?.button || FALLBACK_FOOTER.newsletter.button}
              </button>
            </form>
            <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-200">
              <p className="font-semibold text-white">ساعات العمل</p>
              <p className="mt-2">{contact.hours}</p>
              <a
                href={`mailto:${contact.email}`}
                className="mt-3 inline-flex items-center gap-2 text-indigo-200 transition hover:text-white"
              >
                <FaEnvelope className="h-4 w-4" />
                {contact.email}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-6 text-center text-xs text-slate-400">
          {footer.copyright || FALLBACK_FOOTER.copyright}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
