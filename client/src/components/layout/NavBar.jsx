import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import { useSiteOverview } from "../../hooks/useSiteOverview";

const FALLBACK_NAVIGATION = {
  logo: {
    src: "/logo.jpg",
    alt: "شعار جمعية الحمائم",
    title: "جمعية الحمائم للنهوض بالصحة النفسية",
  },
  primary: [
    { label: "الرئيسية", href: "/" },
    { label: "عن الجمعية", href: "/about" },
    {
      label: "عن التوحد",
      children: [
        { label: "ما هو التوحد؟", href: "/what-is-autism" },
        { label: "الأسئلة الشائعة", href: "/faqs" },
      ],
    },
    {
      label: "خدماتنا",
      children: [
        { label: "البرامج التعليمية", href: "/services/education" },
        { label: "الجلسات العلاجية", href: "/services/therapy" },
        { label: "الدعم الأسري", href: "/services/support" },
      ],
    },
    { label: "الأخبار", href: "/news" },
    { label: "الفعاليات", href: "/events" },
  ],
  cta: { label: "تواصل معنا", href: "/contact" },
};

function isValidArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function isPathActive(pathname, href) {
  if (!href) return false;
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

const buttonBase =
  "inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const desktopLinkClasses =
  "text-sm font-medium text-slate-600 transition hover:text-indigo-600";

const mobileLinkClasses =
  "block rounded-2xl px-4 py-3 text-base font-medium text-slate-700 transition hover:bg-indigo-50";

const mobileDropdownClasses =
  "grid overflow-hidden px-2 transition-all";

const mobileDropdownInner = "flex flex-col gap-2 py-2";

const iconButtonClasses =
  "inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-sm backdrop-blur transition hover:border-indigo-300 hover:text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";

const NavBar = () => {
  const location = useLocation();
  const { data, isLoading } = useSiteOverview();
  const navigation = data?.navigation ?? FALLBACK_NAVIGATION;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expandedDropdown, setExpandedDropdown] = useState(null);

  const primaryLinks = useMemo(
    () => (isValidArray(navigation.primary) ? navigation.primary : FALLBACK_NAVIGATION.primary),
    [navigation.primary]
  );

  useEffect(() => {
    setMobileOpen(false);
    setExpandedDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDropdown = (label) => {
    setExpandedDropdown((current) => (current === label ? null : label));
  };

  const activeLinkClass = (href, children) => {
    if (isValidArray(children)) {
      return children.some((child) => isPathActive(location.pathname, child.href));
    }
    return isPathActive(location.pathname, href);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-transparent transition ${
          scrolled
            ? "bg-white/95 border-slate-100 shadow-sm backdrop-blur"
            : "bg-white/60 backdrop-blur-lg"
        }`}
        dir="rtl"
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3" aria-label="العودة للرئيسية">
            <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-indigo-50">
              <img
                src={navigation.logo?.src || FALLBACK_NAVIGATION.logo.src}
                alt={navigation.logo?.alt || FALLBACK_NAVIGATION.logo.alt}
                className="h-14 w-14 object-cover"
                loading="lazy"
              />
            </span>
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-indigo-600">
                {navigation.logo?.title || FALLBACK_NAVIGATION.logo.title}
              </p>
              <p className="mt-1 text-base font-bold text-slate-900">
                {navigation.logo?.subtitle || "معًا لتمكين أطفال طيف التوحد"}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {primaryLinks.map((link) => {
              const hasChildren = isValidArray(link.children);
              const isActive = activeLinkClass(link.href, link.children);

              if (hasChildren) {
                const dropdownClasses = [
                  desktopLinkClasses,
                  "inline-flex items-center gap-2 rounded-full px-4 py-2",
                  isActive ? "text-indigo-600" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                const isDropdownOpen = expandedDropdown === link.label;
                const dropdownPanelClass = [
                  "absolute top-full right-0 z-40 min-w-[14rem] rounded-3xl border border-slate-100 bg-white/95 p-4 text-right shadow-2xl backdrop-blur transition",
                  isDropdownOpen
                    ? "visible opacity-100 translate-y-4"
                    : "invisible opacity-0 translate-y-3",
                  "group-hover:visible group-hover:translate-y-4 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-4 group-focus-within:opacity-100",
                ].join(" ");

                return (
                  <div
                    key={link.label}
                    className="group relative"
                    onMouseEnter={() => setExpandedDropdown(link.label)}
                    onMouseLeave={() => setExpandedDropdown(null)}
                  >
                    <button
                      type="button"
                      className={dropdownClasses}
                      aria-haspopup="true"
                      aria-expanded={expandedDropdown === link.label}
                      onClick={() => toggleDropdown(link.label)}
                    >
                      <span>{link.label}</span>
                      <FiChevronDown
                        className={`h-4 w-4 transition ${
                          expandedDropdown === link.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div className={dropdownPanelClass}>
                      <div className="flex flex-col gap-2">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className="rounded-2xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              const linkClasses = [desktopLinkClasses, isActive ? "text-indigo-600" : ""].filter(Boolean).join(" ");

              return (
                <Link key={link.href || link.label} to={link.href} className={linkClasses}>
                  {link.label}
                </Link>
              );
            })}
            {navigation.cta?.href && (
              <Link
                to={navigation.cta.href}
                className={`${buttonBase} border-indigo-500 bg-indigo-500 text-white hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-indigo-600`}
              >
                {navigation.cta.label || "تواصل معنا"}
              </Link>
            )}
          </nav>

          <button
            type="button"
            className={`lg:hidden ${iconButtonClasses} ${isLoading ? "animate-pulse" : ""}`}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {mobileOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </div>

        <div
          className={`lg:hidden ${
            mobileOpen ? "grid-rows-[1fr] border-t border-slate-100" : "grid-rows-[0fr]"
          } grid transition-all`}
        >
          <div className="overflow-hidden bg-white/95 backdrop-blur">
            <div className="space-y-1 px-4 py-4">
              {primaryLinks.map((link) => {
                const hasChildren = isValidArray(link.children);
                const isActive = activeLinkClass(link.href, link.children);

                if (hasChildren) {
                  return (
                    <div key={link.label} className="rounded-3xl border border-slate-100 bg-white">
                      <button
                        type="button"
                        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-right text-sm font-semibold text-slate-700 ${
                          isActive ? "text-indigo-600" : ""
                        }`}
                        onClick={() => toggleDropdown(link.label)}
                        aria-expanded={expandedDropdown === link.label}
                      >
                        <span>{link.label}</span>
                        <FiChevronDown
                          className={`h-4 w-4 transition ${
                            expandedDropdown === link.label ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <div
                        className={`${
                          expandedDropdown === link.label
                            ? `${mobileDropdownClasses} grid-rows-[1fr]`
                            : `${mobileDropdownClasses} grid-rows-[0fr]`
                        }`}
                      >
                        <div className={mobileDropdownInner}>
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              to={child.href}
                              className="rounded-2xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.href || link.label}
                    to={link.href}
                    className={`${mobileLinkClasses} ${isActive ? "bg-indigo-50 text-indigo-600" : ""}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {navigation.cta?.href && (
                <Link
                  to={navigation.cta.href}
                  className="block rounded-3xl bg-indigo-500 px-5 py-3 text-center text-base font-semibold text-white shadow-lg transition hover:bg-indigo-600"
                >
                  {navigation.cta.label || "تواصل معنا"}
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="h-20" aria-hidden="true" />
    </>
  );
};

export default NavBar;
