import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiCompass,
  FiHeart,
  FiUsers,
} from "react-icons/fi";
import { useSiteOverview } from "../../hooks/useSiteOverview";

const FALLBACK_HERO = {
  tag: "رسالتنا",
  title: "نرافق أطفال طيف التوحد وأسرهم بخطط إنسانية متكاملة",
  subtitle:
    "نوفّر برامج تعليمية وعلاجية يومية يقودها فريق متعدد الاختصاصات ليحصل كل طفل على الرعاية التي يستحقها.",
  ctaPrimary: { label: "تعرف على خدماتنا", href: "/services/education" },
  ctaSecondary: { label: "تواصل معنا", href: "/contact" },
};

const FALLBACK_FEATURES = [
  {
    id: "family",
    title: "دعم متواصل للأسر",
    description: "جلسات إرشاد فردية وجماعية تساعد الأولياء على متابعة الخطة في المنزل.",
    icon: FiHeart,
  },
  {
    id: "programs",
    title: "برامج علاجية متخصصة",
    description: "فريق يجمع الأخصائيين في النطق، العلاج الوظيفي، والتربية الخاصة.",
    icon: FiUsers,
  },
  {
    id: "community",
    title: "مجتمع وعي وتمكين",
    description: "شراكات وتظاهرات تعزز ثقافة الدمج وتدعم مبادرات التوعية.",
    icon: FiCompass,
  },
];

const FALLBACK_STATS = {
  children: 120,
  educators: 24,
  parents: 180,
  activeGroups: 12,
};

const FEATURE_ICON_MAP = {
  family: FiHeart,
  programs: FiUsers,
  community: FiCompass,
};

function sanitizeText(value, fallback) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;

  // Treat obviously placeholder ASCII strings (e.g. "qsdqdsq") as invalid
  if (/^[a-z]+$/i.test(trimmed) && !/[aeiou]/i.test(trimmed) && trimmed.length <= 16) {
    return fallback;
  }

  if (trimmed.length < 3) {
    return fallback;
  }

  return trimmed;
}

function formatNumber(value) {
  if (value === null || value === undefined) return null;
  const number = Number(value);
  if (Number.isNaN(number)) return null;
  return new Intl.NumberFormat("ar-TN").format(number);
}

function resolveHero(slides) {
  if (!Array.isArray(slides) || !slides.length) {
    return FALLBACK_HERO;
  }

  const meaningfulSlides = slides.filter((slide) =>
    Boolean(
      sanitizeText(slide?.title, "") ||
        sanitizeText(slide?.subtitle, "")
    )
  );

  const [first] = meaningfulSlides.length ? meaningfulSlides : slides;
  return {
    tag: sanitizeText(first.tag, FALLBACK_HERO.tag) || FALLBACK_HERO.tag,
    title: sanitizeText(first.title, FALLBACK_HERO.title) || FALLBACK_HERO.title,
    subtitle: sanitizeText(first.subtitle, FALLBACK_HERO.subtitle) || FALLBACK_HERO.subtitle,
    ctaPrimary: first.ctaPrimary || FALLBACK_HERO.ctaPrimary,
    ctaSecondary: first.ctaSecondary || FALLBACK_HERO.ctaSecondary,
  };
}

function resolveFeatures(highlights) {
  if (!Array.isArray(highlights) || !highlights.length) {
    return FALLBACK_FEATURES;
  }

  return highlights.slice(0, 3).map((item, index) => {
    const fallback = FALLBACK_FEATURES[index % FALLBACK_FEATURES.length];
    const icon = FEATURE_ICON_MAP[item.id] || fallback.icon || FiHeart;

    return {
      id: item.id || fallback.id || `feature-${index}`,
      title: sanitizeText(item.title, fallback.title) || fallback.title,
      description: sanitizeText(item.description, fallback.description) || fallback.description,
      icon,
    };
  });
}

function resolveStats(stats) {
  if (!stats) return FALLBACK_STATS;

  return {
    children: stats.children ?? FALLBACK_STATS.children,
    educators: stats.educators ?? FALLBACK_STATS.educators,
    parents: stats.parents ?? FALLBACK_STATS.parents,
    activeGroups: stats.activeGroups ?? FALLBACK_STATS.activeGroups,
  };
}

const HeroSection = () => {
  const { data, isLoading } = useSiteOverview();

  const hero = useMemo(() => resolveHero(data?.hero?.slides), [data?.hero?.slides]);
  const features = useMemo(
    () => resolveFeatures(data?.about?.highlights),
    [data?.about?.highlights]
  );
  const stats = useMemo(
    () => resolveStats(data?.highlights?.stats),
    [data?.highlights?.stats]
  );

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 py-20 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.25),transparent_60%)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-cyan-100 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            {hero.tag}
          </div>
          <h1 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {hero.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-100/90">
            {hero.subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            {hero.ctaPrimary?.href && (
              <Link
                to={hero.ctaPrimary.href}
                className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
              >
                {hero.ctaPrimary.label}
              </Link>
            )}
            {hero.ctaSecondary?.href && (
              <Link
                to={hero.ctaSecondary.href}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-base font-semibold text-white transition hover:border-white/40 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
              >
                <FiArrowLeft className="h-4 w-4" />
                {hero.ctaSecondary.label}
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur lg:col-span-7">
            <h2 className="text-xl font-semibold text-white">لماذا يختارنا الأولياء؟</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon || FiHeart;
                return (
                  <div
                    key={feature.id}
                    className="flex h-full flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-5 shadow-sm"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm leading-6 text-slate-100/80">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur">
              <h2 className="text-lg font-semibold text-white">أرقام تعكس أثرنا</h2>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    { id: "children", label: "الأطفال المنتفعون", value: stats.children },
                    { id: "educators", label: "الأخصائيون", value: stats.educators },
                    { id: "parents", label: "الأولياء المرافقون", value: stats.parents },
                    { id: "groups", label: "المجموعات النشطة", value: stats.activeGroups },
                  ]
                ).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/5 bg-white/5 px-4 py-5 text-center"
                  >
                    <dt className="text-sm text-slate-100/70">{item.label}</dt>
                    <dd className="mt-2 text-2xl font-semibold text-white">
                      {formatNumber(item.value) ?? "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-transparent p-7 text-white backdrop-blur">
              <h2 className="text-lg font-semibold">شركاؤنا في الرحلة</h2>
              <p className="mt-3 text-sm leading-6 text-slate-100/85">
                نعمل جنبًا إلى جنب مع المدارس، المؤسسات الصحية، والمتطوعين لتأمين كل ما يحتاجه
                أطفالنا من دعم ومرافقة يومية.
              </p>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-x-0 bottom-6 flex justify-center">
            <span className="animate-pulse text-xs text-slate-200/70">
              جاري تحميل آخر التحديثات...
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
