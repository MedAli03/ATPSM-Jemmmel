import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiCompass,
  FiHeart,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";
import { useSiteOverview } from "../../hooks/useSiteOverview";

const AUTOPLAY_MS = 8000;

const FALLBACK_SLIDES = [
  {
    id: "vision",
    tag: "قصص نجاح",
    title: "نحو مستقبل أكثر إشراقًا لأطفال طيف التوحد",
    subtitle: "نرافق الأسر بخطط فردية تدعم التعلم والتواصل والاستقلالية في كل خطوة.",
    image: "/aut1.jpg",
    gallery: ["/aut2.jpg", "/aut3.jpg"],
    ctaPrimary: { label: "تعرف على خدماتنا", href: "/services/education" },
    ctaSecondary: { label: "تواصل معنا", href: "/contact" },
  },
  {
    id: "programs",
    tag: "برامج علاجية",
    title: "برامج علاجية متخصصة تقودها كفاءات وطنية",
    subtitle: "جلسات علاج وظيفي ونطق وتربية خاصة تدعم تطور الطفل في بيئة آمنة ومحبة.",
    image: "/aut2.jpg",
    gallery: ["/aut1.jpg", "/aut3.jpg"],
    ctaPrimary: { label: "استكشف البرامج", href: "/services/therapy" },
    ctaSecondary: { label: "قصص نجاح", href: "/news" },
  },
  {
    id: "families",
    tag: "دعم الأسر",
    title: "شراكة حقيقية مع الأسرة من أول خطوة",
    subtitle: "ورش عمل وإرشاد أسري يضع احتياجات الأولياء في قلب الاهتمام طوال الرحلة.",
    image: "/aut3.jpg",
    gallery: ["/aut2.jpg", "/aut1.jpg"],
    ctaPrimary: { label: "مواعيد الاستشارات", href: "/contact" },
    ctaSecondary: { label: "الأسئلة الشائعة", href: "/faqs" },
  },
];

const FALLBACK_FEATURES = [
  {
    id: "family",
    title: "مرافقة يومية للأسر",
    description: "جلسات إرشاد واستشارات فردية لضمان استمرارية الخطة في المنزل.",
    icon: FiHeart,
  },
  {
    id: "programs",
    title: "برامج علاجية متخصصة",
    description: "جلسات علاج وظيفي ونطق وتربية خاصة يقودها فريق متعدد الاختصاصات.",
    icon: FiUsers,
  },
  {
    id: "community",
    title: "مجتمع داعم",
    description: "شراكات مع المدارس والمجتمع المدني لتعزيز الدمج والتوعية.",
    icon: FiCompass,
  },
];

const FEATURE_ICON_MAP = {
  family: FiHeart,
  programs: FiUsers,
  community: FiCompass,
};

function formatDate(value, options = {}) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const formatter = new Intl.DateTimeFormat("ar-TN", {
    dateStyle: options.dateStyle || "medium",
    timeStyle: options.timeStyle,
  });
  return formatter.format(date);
}

function formatNumber(value) {
  if (value === null || value === undefined) return null;
  const number = Number(value);
  if (Number.isNaN(number)) return null;
  return new Intl.NumberFormat("ar-TN").format(number);
}

const HeroSection = () => {
  const { data } = useSiteOverview();

  const slides = useMemo(() => {
    const source = Array.isArray(data?.hero?.slides) && data.hero.slides.length
      ? data.hero.slides
      : FALLBACK_SLIDES;

    const seen = new Set();

    return source.map((slide, index) => {
      const fallback = FALLBACK_SLIDES[index % FALLBACK_SLIDES.length];
      const merged = { ...fallback, ...slide };
      const gallery = Array.isArray(slide?.gallery) && slide.gallery.length
        ? slide.gallery
        : fallback.gallery || [];
      const baseKey = merged.id ?? fallback.id ?? `slide-${index}`;
      let uniqueKey = String(baseKey);
      let attempt = 1;
      while (seen.has(uniqueKey)) {
        uniqueKey = `${baseKey}-${attempt++}`;
      }
      seen.add(uniqueKey);

      return {
        ...merged,
        image: merged.image || fallback.image,
        gallery,
        ctaPrimary: merged.ctaPrimary || fallback.ctaPrimary,
        ctaSecondary: merged.ctaSecondary || fallback.ctaSecondary,
        tag: merged.tag || fallback.tag || "مبادرة الجمعية",
        _key: uniqueKey,
      };
    });
  }, [data?.hero?.slides]);

  const slideCount = slides.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const autoplayRef = useRef(null);

  useEffect(() => {
    if (activeIndex > slideCount - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, slideCount]);

  const clearAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  const restartAutoplay = useCallback(() => {
    clearAutoplay();
    if (slideCount <= 1) return;

    autoplayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, AUTOPLAY_MS);
  }, [clearAutoplay, slideCount]);

  useEffect(() => {
    restartAutoplay();
    return clearAutoplay;
  }, [restartAutoplay, clearAutoplay]);

  const goTo = useCallback(
    (index) => {
      if (!slideCount) return;
      setActiveIndex((prev) => {
        const next = ((index % slideCount) + slideCount) % slideCount;
        if (next === prev) {
          return prev;
        }
        return next;
      });
      restartAutoplay();
    },
    [restartAutoplay, slideCount]
  );

  const nextSlide = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  const prevSlide = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  const activeSlide = slides[activeIndex] ?? slides[0];

  const heroImages = useMemo(() => {
    if (!activeSlide) return [];
    const images = [
      activeSlide.image,
      ...(Array.isArray(activeSlide.gallery) ? activeSlide.gallery : []),
    ]
      .filter(Boolean)
      .slice(0, 3);
    return images;
  }, [activeSlide]);

  const events = useMemo(() => {
    if (Array.isArray(data?.highlights?.events)) {
      return data.highlights.events.slice(0, 3);
    }
    return [];
  }, [data?.highlights?.events]);

  const featureCards = useMemo(() => {
    const highlights = data?.about?.highlights;
    if (Array.isArray(highlights) && highlights.length) {
      return highlights.slice(0, 3).map((item, index) => ({
        ...item,
        icon:
          FEATURE_ICON_MAP[item.id] ||
          FEATURE_ICON_MAP[FALLBACK_FEATURES[index]?.id] ||
          FiCompass,
      }));
    }
    return FALLBACK_FEATURES;
  }, [data?.about?.highlights]);

  const statChips = useMemo(() => {
    const stats = data?.highlights?.stats;
    if (!stats) return [];
    const candidates = [
      { id: "children", label: "أطفال مستفيدون", value: stats.children },
      { id: "activeGroups", label: "مجموعات نشطة", value: stats.activeGroups },
      { id: "parents", label: "أسر مرافقة", value: stats.parents },
    ];

    return candidates
      .map((item) => {
        const formatted = formatNumber(item.value);
        if (!formatted) return null;
        return { ...item, formatted };
      })
      .filter(Boolean);
  }, [data?.highlights?.stats]);

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white" dir="rtl">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25)_0%,_rgba(15,23,42,0.95)_55%,_rgba(15,23,42,1)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(15,23,42,0.4),_rgba(79,70,229,0.25))] mix-blend-screen" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-16 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center">
          <div className="flex flex-col gap-8 text-right">
            <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-indigo-100/90">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-1 font-semibold backdrop-blur">
                {activeSlide?.tag || "مبادرة الجمعية"}
              </span>
              {activeSlide?.publishedAt && (
                <span className="text-xs text-slate-200/80">
                  {formatDate(activeSlide.publishedAt)}
                </span>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.article
                key={activeSlide?._key || activeIndex}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="space-y-6"
              >
                <h1 className="text-3xl font-black leading-[1.5] sm:text-4xl lg:text-[2.9rem]">
                  {activeSlide?.title}
                </h1>
                {activeSlide?.subtitle && (
                  <p className="text-lg leading-8 text-slate-100/85">
                    {activeSlide.subtitle}
                  </p>
                )}
              </motion.article>
            </AnimatePresence>

            <div className="flex flex-wrap items-center justify-end gap-3">
              {activeSlide?.ctaPrimary?.href && (
                <Link
                  to={activeSlide.ctaPrimary.href}
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-600"
                >
                  {activeSlide.ctaPrimary.label}
                  <FiChevronLeft className="h-4 w-4" />
                </Link>
              )}
              {activeSlide?.ctaSecondary?.href && (
                <Link
                  to={activeSlide.ctaSecondary.href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/95 transition hover:border-white hover:bg-white/10"
                >
                  {activeSlide.ctaSecondary.label}
                  <FiChevronLeft className="h-4 w-4" />
                </Link>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 text-slate-200/80">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={nextSlide}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-white hover:bg-white/20"
                  aria-label="الشريحة التالية"
                >
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={prevSlide}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-white hover:bg-white/20"
                  aria-label="الشريحة السابقة"
                >
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                {slides.map((slide, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={slide._key}
                      type="button"
                      onClick={() => goTo(index)}
                      className={`h-2.5 rounded-full transition ${
                        isActive
                          ? "w-8 bg-indigo-400"
                          : "w-2.5 bg-white/30 hover:bg-white/60"
                      }`}
                      aria-label={`الانتقال إلى الشريحة ${index + 1}`}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <span className="sr-only">{slide.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide?._key || `${activeIndex}-visual`}
                initial={{ opacity: 0, scale: 0.96, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.02, y: -18 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative w-full max-w-xl"
              >
                <div className="relative h-[440px] overflow-hidden rounded-[2.75rem] border border-white/15 bg-white/5 shadow-[0_45px_90px_rgba(15,23,42,0.45)]">
                  {heroImages[0] && (
                    <img
                      src={heroImages[0]}
                      alt={activeSlide?.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" aria-hidden="true" />
                </div>

                {heroImages[1] && (
                  <motion.img
                    key={`${activeSlide?._key}-secondary`}
                    src={heroImages[1]}
                    alt=""
                    aria-hidden="true"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
                    className="absolute -left-12 top-16 hidden h-44 w-36 rounded-3xl border-4 border-slate-950 object-cover shadow-2xl sm:block"
                    loading="lazy"
                  />
                )}

                {heroImages[2] && (
                  <motion.img
                    key={`${activeSlide?._key}-tertiary`}
                    src={heroImages[2]}
                    alt=""
                    aria-hidden="true"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
                    className="absolute -right-10 bottom-12 hidden h-48 w-40 rounded-3xl border-4 border-slate-950 object-cover shadow-xl sm:block"
                    loading="lazy"
                  />
                )}

                {statChips.length > 0 && (
                  <div className="absolute -bottom-6 left-1/2 flex w-max -translate-x-1/2 items-center gap-4 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs font-semibold text-white backdrop-blur">
                    {statChips.slice(0, 2).map((stat) => (
                      <span key={stat.id} className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{stat.formatted}</span>
                        <span className="text-[0.7rem] text-slate-100/90">{stat.label}</span>
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {featureCards.map((feature, index) => {
              const Icon = feature.icon || FiCompass;
              return (
                <div
                  key={feature.id || feature.title || `feature-${index}`}
                  className="group relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-5 text-right text-slate-100 backdrop-blur transition hover:border-indigo-300/60 hover:bg-white/15"
                >
                  <div className="flex items-center justify-end gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-200/85">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {events.length > 0 && (
            <aside className="rounded-3xl border border-white/15 bg-white/10 p-6 text-right text-slate-100 shadow-[0_25px_60px_rgba(15,23,42,0.35)] backdrop-blur">
              <h3 className="text-sm font-semibold tracking-wide text-indigo-100">الفعاليات القادمة</h3>
              <ul className="mt-5 space-y-4 text-sm">
                {events.map((event) => (
                  <li
                    key={event.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-indigo-200/40 hover:bg-white/10"
                  >
                    <p className="text-sm font-semibold text-white">{event.titre}</p>
                    <div className="mt-3 space-y-2 text-xs text-slate-100/80">
                      {event.debut && (
                        <span className="flex items-center justify-end gap-2">
                          <FiCalendar className="h-4 w-4" />
                          {formatDate(event.debut)}
                        </span>
                      )}
                      {event.fin && (
                        <span className="flex items-center justify-end gap-2">
                          <FiClock className="h-4 w-4" />
                          {formatDate(event.fin, { timeStyle: "short", dateStyle: "short" })}
                        </span>
                      )}
                      {event.lieu && (
                        <span className="flex items-center justify-end gap-2">
                          <FiMapPin className="h-4 w-4" />
                          {event.lieu}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
