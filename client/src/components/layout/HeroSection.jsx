import { useMemo, useRef } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiMapPin,
} from "react-icons/fi";
import { useSiteOverview } from "../../hooks/useSiteOverview";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const FALLBACK_SLIDES = [
  {
    id: "vision",
    title: "نحو مستقبل أكثر إشراقًا لأطفال طيف التوحد",
    subtitle: "نرافق الأسر بخطط فردية تدعم التعلم والتواصل والاستقلالية",
    image: "/aut1.jpg",
    ctaPrimary: { label: "تعرف على خدماتنا", href: "/services/education" },
    ctaSecondary: { label: "تواصل معنا", href: "/contact" },
  },
];

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

const HeroSection = () => {
  const sliderRef = useRef(null);
  const { data } = useSiteOverview();
  const slides = useMemo(() => {
    if (Array.isArray(data?.hero?.slides) && data.hero.slides.length > 0) {
      return data.hero.slides.map((slide, index) => ({
        ...slide,
        image: slide.image || FALLBACK_SLIDES[index % FALLBACK_SLIDES.length].image,
        ctaPrimary: slide.ctaPrimary || FALLBACK_SLIDES[0].ctaPrimary,
        ctaSecondary: slide.ctaSecondary || FALLBACK_SLIDES[0].ctaSecondary,
      }));
    }
    return FALLBACK_SLIDES;
  }, [data?.hero?.slides]);

  const events = useMemo(() => {
    if (Array.isArray(data?.highlights?.events)) {
      return data.highlights.events.slice(0, 2);
    }
    return [];
  }, [data?.highlights?.events]);

  const settings = {
    dots: true,
    infinite: true,
    rtl: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    arrows: false,
    pauseOnHover: true,
  };

  return (
    <section className="relative overflow-hidden" dir="rtl">
      <Slider {...settings} ref={sliderRef}>
        {slides.map((slide) => (
          <div key={slide.id} className="relative h-[520px] w-full bg-slate-900 sm:h-[560px] lg:h-[640px]">
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-slate-900/85 via-slate-900/65 to-slate-900/20" aria-hidden="true" />
            <div className="relative mx-auto flex h-full max-w-7xl items-center justify-end px-4 py-10 sm:px-6">
              <div className="max-w-2xl text-white">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-semibold backdrop-blur">
                  مبادرة الجمعية
                </span>
                <h1 className="mt-5 text-3xl font-black leading-relaxed sm:text-4xl lg:text-[2.9rem]">
                  {slide.title}
                </h1>
                {slide.subtitle && (
                  <p className="mt-4 text-lg leading-8 text-slate-100/90">
                    {slide.subtitle}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap justify-end gap-3">
                  {slide.ctaPrimary?.href && (
                    <Link
                      to={slide.ctaPrimary.href}
                      className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-600"
                    >
                      {slide.ctaPrimary.label}
                      <FiChevronLeft className="h-4 w-4" />
                    </Link>
                  )}
                  {slide.ctaSecondary?.href && (
                    <Link
                      to={slide.ctaSecondary.href}
                      className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
                    >
                      {slide.ctaSecondary.label}
                      <FiChevronLeft className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      <button
        type="button"
        className="absolute right-6 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-3 text-slate-700 shadow-lg transition hover:bg-white lg:inline-flex"
        onClick={() => sliderRef.current?.slickNext()}
        aria-label="الشريحة التالية"
      >
        <FiChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        className="absolute left-6 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-3 text-slate-700 shadow-lg transition hover:bg-white lg:inline-flex"
        onClick={() => sliderRef.current?.slickPrev()}
        aria-label="الشريحة السابقة"
      >
        <FiChevronRight className="h-5 w-5" />
      </button>

      {events.length > 0 && (
        <aside className="pointer-events-auto absolute bottom-10 left-1/2 hidden w-full max-w-sm -translate-x-1/2 rounded-3xl border border-white/20 bg-white/90 p-5 text-right shadow-2xl backdrop-blur lg:block">
          <p className="text-sm font-semibold text-indigo-600">الفعاليات القادمة</p>
          <ul className="mt-4 space-y-4 text-slate-700">
            {events.map((event) => (
              <li key={event.id} className="rounded-2xl bg-white/60 p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">{event.titre}</p>
                <div className="mt-2 flex flex-col gap-2 text-xs text-slate-600">
                  {event.debut && (
                    <span className="inline-flex items-center gap-2">
                      <FiCalendar className="h-4 w-4" />
                      {formatDate(event.debut)}
                    </span>
                  )}
                  {event.fin && (
                    <span className="inline-flex items-center gap-2">
                      <FiClock className="h-4 w-4" />
                      {formatDate(event.fin, { timeStyle: "short", dateStyle: "short" })}
                    </span>
                  )}
                  {event.lieu && (
                    <span className="inline-flex items-center gap-2">
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
    </section>
  );
};

export default HeroSection;
