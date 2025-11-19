import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCompass,
  FiHeart,
  FiUsers,
} from "react-icons/fi";
import { useSiteOverview } from "../../hooks/useSiteOverview";

const FALLBACK_ABOUT = {
  heading: "نصنع الفارق مع أطفال طيف التوحد وأسرهم",
  intro:
    "منذ تأسيس الجمعية ونحن نوحّد جهود المختصين والمتطوعين لرسم مسار تعليمي وعلاجي إنساني يرتكز على احترام خصوصية كل طفل.",
  story:
    "نرافق العائلات منذ اللحظة الأولى للتشخيص بتقييمات دقيقة، خطط فردية، ومتابعة متعددة التخصصات تعزز ثقة الأسرة والطفل في رحلتهما.",
  highlights: [
    {
      id: "family",
      title: "شراكة مع العائلات",
      description: "لقاءات دورية واستشارات فردية تبقي الأسرة محور الاهتمام.",
    },
    {
      id: "programs",
      title: "برامج علاجية متكاملة",
      description: "خطط فردية يقودها اختصاصيون في العلاج الوظيفي والنطق والتربية الخاصة.",
    },
    {
      id: "community",
      title: "مجتمع داعم وفعّال",
      description: "ورشات وفعاليات توعوية تبني بيئة دامجة ومتفهمة.",
    },
  ],
  pillars: [
    {
      id: "vision",
      title: "الرؤية",
      points: [
        "مجتمع تونسي يحتضن جميع الأطفال دون استثناء",
        "حضور وطني للبرامج النوعية الموجهة لطيف التوحد",
      ],
    },
    {
      id: "mission",
      title: "الرسالة",
      points: [
        "تمكين الطفل من مهارات الاستقلال والتواصل",
        "تأهيل الأسرة بالأدوات العملية والدعم النفسي",
        "العمل مع الشركاء لتسهيل الاندماج المدرسي والمجتمعي",
      ],
    },
    {
      id: "values",
      title: "قيمنا",
      points: [
        "التعاطف والاحترام",
        "الابتكار والاستناد للأدلة العلمية",
        "الشفافية والعمل المشترك",
      ],
    },
  ],
  cta: { label: "اكتشف خدماتنا", href: "/services/education" },
};

const HIGHLIGHT_ICONS = {
  family: FiHeart,
  programs: FiUsers,
  community: FiCompass,
};

const About = () => {
  const { data } = useSiteOverview();
  const about = data?.about ?? FALLBACK_ABOUT;

  const highlights = useMemo(() => {
    if (Array.isArray(about.highlights) && about.highlights.length) {
      return about.highlights.slice(0, 3);
    }
    return FALLBACK_ABOUT.highlights;
  }, [about.highlights]);

  const pillars = useMemo(() => {
    if (Array.isArray(about.pillars) && about.pillars.length) {
      return about.pillars;
    }
    return FALLBACK_ABOUT.pillars;
  }, [about.pillars]);

  return (
    <section className="relative mt-24 overflow-hidden" dir="rtl">
      <div
        className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950"
        aria-hidden={true}
      />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-indigo-600/40 to-transparent" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-10 text-white">
            <div className="text-right">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-4 py-1 text-sm font-semibold text-indigo-100">
                عن الجمعية
              </span>
              <h2 className="mt-5 text-3xl font-black leading-relaxed sm:text-4xl">
                {about.heading || FALLBACK_ABOUT.heading}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-indigo-100/90">
                {about.intro || FALLBACK_ABOUT.intro}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map((highlight) => {
                const Icon = HIGHLIGHT_ICONS[highlight.id] || FiHeart;
                return (
                  <div
                    key={highlight.id || highlight.title}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-indigo-300/60 hover:bg-white/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 transition group-hover:opacity-100" aria-hidden />
                    <div className="flex items-center justify-end gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-semibold text-white">
                        {highlight.title}
                      </h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-indigo-100/85">
                      {highlight.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-4xl border border-white/10 bg-white/10 p-8 text-right shadow-2xl backdrop-blur">
              <p className="text-sm leading-8 text-indigo-100/90">
                {about.story || FALLBACK_ABOUT.story}
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-4 text-sm">
              {about.cta?.href && (
                <Link
                  to={about.cta.href}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-100"
                >
                  {about.cta.label || FALLBACK_ABOUT.cta.label}
                  <FiArrowLeft className="h-4 w-4" />
                </Link>
              )}
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                حجز موعد استشاري
                <FiArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-4xl border border-indigo-200/30 bg-white text-right text-slate-900 shadow-2xl">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-indigo-500 via-violet-500 to-sky-400" aria-hidden />
              <div className="absolute -left-12 top-10 hidden h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl lg:block" aria-hidden />
              <div className="absolute -right-8 -bottom-8 hidden h-40 w-40 rounded-full bg-sky-400/20 blur-3xl lg:block" aria-hidden />
              <div className="relative space-y-6 p-8">
                <h3 className="text-lg font-bold text-slate-900">مرتكزات العمل داخل الجمعية</h3>
                <p className="text-sm leading-7 text-slate-600">
                  يجتمع فريقنا متعدد الاختصاصات يوميًا لبناء مسارات دعم شاملة تستجيب لحاجات الطفل والأسرة والمجتمع.
                </p>
                <div className="space-y-5">
                  {pillars.map((pillar) => (
                    <div
                      key={pillar.id || pillar.title}
                      className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5"
                    >
                      <h4 className="text-base font-semibold text-slate-900">{pillar.title}</h4>
                      <ul className="mt-3 space-y-2 text-sm text-slate-600">
                        {Array.isArray(pillar.points) &&
                          pillar.points.map((point, index) => (
                            <li key={`${pillar.id || pillar.title}-${index}`} className="flex items-start justify-end gap-2">
                              <span className="mt-1 text-indigo-500">
                                <FiCheckCircle className="h-4 w-4" />
                              </span>
                              <span>{point}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-4xl border border-white/10 bg-gradient-to-l from-indigo-500/30 via-indigo-500/20 to-sky-400/20 p-6 text-sm text-white backdrop-blur">
              <p className="font-semibold text-white">منصة رقمية تربطنا بالأسر</p>
              <p className="mt-2 text-indigo-100/90">
                يمكن للأولياء تسجيل أطفالهم، متابعة الجلسات، والتواصل مع الإخصائيين مباشرة عبر المنصة الإدارية.
              </p>
              <Link
                to="/login"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-indigo-200"
              >
                الدخول إلى المنصة
                <FiArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
