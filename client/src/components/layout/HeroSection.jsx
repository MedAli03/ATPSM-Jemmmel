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
import { resolveApiAssetPath } from "../../utils/url";

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

      const resolvedGallery = gallery
        .map((image) => resolveApiAssetPath(image) || null)
        .filter(Boolean);
      const resolvedImage = resolveApiAssetPath(merged.image) || fallback.image;

      return {
        ...merged,
        image: resolvedImage,
        gallery: resolvedGallery,
        preview: resolvedImage || resolveApiAssetPath(fallback.image) || fallback.image,
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
  const rafRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const cancelProgress = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

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
    cancelProgress();
    if (slideCount <= 1) {
      setProgress(1);
      return;
    }

    setProgress(0);

    autoplayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, AUTOPLAY_MS);
  }, [cancelProgress, clearAutoplay, slideCount]);

  useEffect(() => {
    restartAutoplay();
    return () => {
      clearAutoplay();
      cancelProgress();
    };
  }, [restartAutoplay, clearAutoplay, cancelProgress]);

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
    const fallback = FALLBACK_SLIDES[activeIndex % FALLBACK_SLIDES.length] || {};
    const fallbackGallery = Array.isArray(fallback.gallery) ? fallback.gallery : [];
    const requested = [
      activeSlide.image,
      ...(Array.isArray(activeSlide.gallery) ? activeSlide.gallery : []),
    ].filter(Boolean);
    const fallbackImages = [fallback.image, ...fallbackGallery].filter(Boolean);

    const ordered = [...requested, ...fallbackImages].map(
      (image) => resolveApiAssetPath(image) || image
    );

    const deduped = [];
    const seen = new Set();
    for (const image of ordered) {
      if (!image || seen.has(image)) continue;
      seen.add(image);
      deduped.push(image);
      if (deduped.length === 3) break;
    }

    return deduped;
  }, [activeSlide, activeIndex]);

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

  useEffect(() => {
    cancelProgress();
    if (slideCount <= 1) {
      setProgress(1);
      return undefined;
    }

    setProgress(0);
    const start = performance.now();

    const step = (timestamp) => {
      const elapsed = timestamp - start;
      const ratio = Math.min(elapsed / AUTOPLAY_MS, 1);
      setProgress(ratio);
      if (ratio < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      cancelProgress();
    };
  }, [activeIndex, cancelProgress, slideCount]);

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
                      className={`relative overflow-hidden rounded-full transition ${
                        isActive
                          ? "h-2.5 w-12 bg-white/25"
                          : "h-2.5 w-2.5 bg-white/25 hover:bg-white/60"
                      }`}
                      aria-label={`الانتقال إلى الشريحة ${index + 1}`}
                      aria-current={isActive ? "true" : undefined}
                    >
                      {isActive && (
                        <span
                          className="absolute inset-y-0 right-0 rounded-full bg-white"
                          style={{ width: `${Math.max(progress, 0.08) * 100}%` }}
                        />
                      )}
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
                className="relative w-full max-w-2xl"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-indigo-400/30 blur-3xl" aria-hidden />
                <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl" aria-hidden />

                <div className="relative grid h-[440px] gap-4 sm:h-[520px] sm:grid-cols-[minmax(0,1.35fr)_minmax(0,0.75fr)]">
                  <figure className="group relative overflow-hidden rounded-[2.75rem] border border-white/12 bg-white/5 shadow-[0_45px_90px_rgba(15,23,42,0.45)]">
                    {heroImages[0] ? (
                      <img
                        src={heroImages[0]}
                        alt={activeSlide?.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-900/40 text-4xl text-indigo-300">
                        <FiUsers aria-hidden="true" />
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" aria-hidden="true" />
                  </figure>

                  <div className="hidden h-full flex-col gap-4 sm:flex">
                    {[heroImages[1], heroImages[2]].map((image, idx) => (
                      <motion.figure
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${activeSlide?._key}-support-${idx}`}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: image ? 1 : 0.6, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.45, delay: idx * 0.08, ease: "easeOut" }}
                        className="relative flex-1 overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/5 shadow-[0_25px_55px_rgba(15,23,42,0.45)]"
                        aria-hidden={!image}
                      >
                        {image ? (
                          <img
                            src={image}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-900/40 text-2xl text-indigo-200">
                            <FiHeart aria-hidden="true" />
                          </div>
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-slate-950/40 via-transparent to-transparent" aria-hidden />
                      </motion.figure>
                    ))}
                  </div>
                </div>

                {statChips.length > 0 && (
                  <div className="absolute -bottom-8 left-1/2 hidden w-max -translate-x-1/2 items-center gap-4 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-xs font-semibold text-white backdrop-blur sm:flex">
                    {statChips.slice(0, 3).map((stat) => (
                      <span key={stat.id} className="flex items-center gap-2 whitespace-nowrap">
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

        {slides.length > 1 && (
          <div className="hidden items-stretch justify-end gap-4 lg:flex">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              const preview = resolveApiAssetPath(slide.preview || slide.image) || slide.image;
              return (
                <button
                  key={`preview-${slide._key}`}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`group relative w-40 overflow-hidden rounded-3xl border transition ${
                    isActive
                      ? "border-indigo-300/70 shadow-[0_25px_55px_rgba(67,56,202,0.35)]"
                      : "border-white/10 hover:border-indigo-200/50"
                  }`}
                  aria-label={`معاينة ${slide.title}`}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-white/5">
                    {preview ? (
                      <img
                        src={preview}
                        alt=""
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-900/40 text-indigo-200">
                        <FiCompass className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 px-4 py-3 text-right">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-indigo-200/80">
                      {slide.tag}
                    </p>
                    <p className="text-sm font-bold text-white line-clamp-2">{slide.title}</p>
                  </div>
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-l from-indigo-400 via-sky-400 to-violet-400" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>
        )}

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
