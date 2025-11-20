import { useMemo } from "react";
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

const FALLBACK = {
  about: {
    title: "جمعية الحمائم",
    description:
      "جمعية تُعنى بدعم وتمكين الأطفال ذوي طيف التوحد عبر برامج تعليمية وتأهيلية.",
  },
  contact: {
    address: "حي الزياتين، الجمال – المنستير، تونس",
    phone: "+216 73 000 000",
    email: "contact@hamaim.tn",
  },
  columns: [
    {
      title: "عن الجمعية",
      links: [
        { label: "من نحن", href: "/about" },
        { label: "رسالتنا", href: "/about" },
        { label: "انضم إلينا", href: "/contact" },
      ],
    },
    {
      title: "مصادر",
      links: [
        { label: "ما هو التوحد؟", href: "/what-is-autism" },
        { label: "الأسئلة الشائعة", href: "/faqs" },
        { label: "الأخبار", href: "/news" },
      ],
    },
  ],
  social: [
    { platform: "facebook", url: "https://facebook.com" },
    { platform: "instagram", url: "https://instagram.com" },
    { platform: "youtube", url: "https://youtube.com" },
  ],
  copyright: `© ${new Date().getFullYear()} جمعية الحمائم. جميع الحقوق محفوظة.`,
};

const ICONS = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  youtube: FaYoutube,
};

const Footer = () => {
  const { data } = useSiteOverview();
  const footer = data?.footer ?? FALLBACK;

  const columns = useMemo(
    () =>
      Array.isArray(footer.columns) && footer.columns.length
        ? footer.columns
        : FALLBACK.columns,
    [footer.columns]
  );

  const socials = useMemo(
    () =>
      Array.isArray(footer.social) && footer.social.length
        ? footer.social
        : FALLBACK.social,
    [footer.social]
  );

  const contact = footer.contact ?? FALLBACK.contact;

  return (
    <footer className="bg-slate-950 text-slate-200 pt-14 pb-6 mt-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 grid gap-12 md:grid-cols-3">
        {/* العمود 1: التعريف الأساسي */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="Logo"
              className="h-12 w-12 rounded-xl object-cover border border-slate-700"
            />
            <div className="text-right">
              <p className="text-indigo-300 font-semibold text-sm">
                {footer.about?.title || FALLBACK.about.title}
              </p>
              <p className="text-white font-bold text-lg">
                للنهوض بالصحة النفسية
              </p>
            </div>
          </Link>
          <p className="text-sm text-slate-300 leading-relaxed">
            {footer.about?.description || FALLBACK.about.description}
          </p>

          <div className="text-sm space-y-2">
            <p className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-indigo-400" />
              {contact.address}
            </p>
            <p className="flex items-center gap-2">
              <FaPhone className="text-indigo-400" />
              {contact.phone}
            </p>
            <p className="flex items-center gap-2">
              <FaEnvelope className="text-indigo-400" />
              {contact.email}
            </p>
          </div>
        </div>

        {/* العمود 2: روابط سريعة */}
        <div className="grid grid-cols-2 gap-8 text-right">
          {columns.map((col, idx) => (
            <div key={idx}>
              <h3 className="text-white font-semibold mb-3">{col.title}</h3>
              <ul className="space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="hover:text-indigo-400 transition"
                      to={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* العمود 3: تواصل اجتماعي */}
        <div className="text-right space-y-4">
          <h3 className="text-white font-semibold mb-3">تابعونا</h3>
          <div className="flex gap-3 justify-start md:justify-end">
            {socials.map((s, i) => {
              const Icon = ICONS[s.platform] || FaInstagram;
              return (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="h-10 w-10 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-full text-slate-200 hover:bg-slate-700 hover:text-white transition"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* حقوق النشر */}
      <div className="text-center text-xs text-slate-500 mt-10 pt-6 border-t border-slate-800">
        {footer.copyright}
      </div>
    </footer>
  );
};

export default Footer;
