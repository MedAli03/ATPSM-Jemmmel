import { Link } from "react-router-dom";
import { FiArrowLeft, FiCompass, FiHeart, FiUsers } from "react-icons/fi";

const FEATURES = [
  {
    id: "family",
    title: "دعم متواصل للأسر",
    description:
      "جلسات إرشاد فردية وجماعية تساعد الأولياء على متابعة الخطة في المنزل.",
    icon: FiHeart,
  },
  {
    id: "programs",
    title: "برامج علاجية متخصصة",
    description:
      "فريق يجمع الأخصائيين في النطق، العلاج الوظيفي، والتربية الخاصة.",
    icon: FiUsers,
  },
  {
    id: "community",
    title: "مجتمع وعي وتمكين",
    description: "شراكات وتظاهرات تعزز ثقافة الدمج وتدعم مبادرات التوعية.",
    icon: FiCompass,
  },
];

const STATS = [
  { id: "children", label: "الأطفال المنتفعون", value: "50" },
  { id: "educators", label: "الأخصائيون", value: "10" },
  { id: "parents", label: "الأولياء المرافقون", value: "44" },
  { id: "groups", label: "المجموعات النشطة", value: "6" },
];

const HeroSection = () => {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 py-16 sm:py-20 text-white"
      dir="rtl"
    >
      {/* خلفية زخرفية */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-4rem] h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-14 px-6 lg:flex-row lg:items-start lg:gap-12 lg:px-8">
        {/* النص الأساسي + CTA + أرقام */}
        <div className="flex-1 max-w-xl lg:max-w-2xl text-right">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs sm:text-sm font-medium text-cyan-100 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span>رسالتنا</span>
          </div>

          <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
            نرافق أطفال طيف التوحد وأسرهم بخطط إنسانية متكاملة
          </h1>

          <p className="mt-5 text-base sm:text-lg leading-8 text-slate-100/90">
            نوفّر برامج تعليمية وعلاجية يومية يقودها فريق متعدد الاختصاصات ليحصل
            كل طفل على الرعاية التي يستحقها، في بيئة آمنة، دافئة ومهيكلة تراعي
            خصوصيته وإيقاعه الخاص.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-start gap-4 sm:gap-5">
            <Link
              to="/services/education"
              className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm sm:text-base font-semibold text-slate-900 shadow-sm transition hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
            >
              تعرّف على خدماتنا
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm sm:text-base font-semibold text-white transition hover:border-white/40 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
            >
              <FiArrowLeft className="h-4 w-4" />
              تواصل معنا
            </Link>
          </div>
        </div>

        {/* كروت المميزات + أرقام (موبايل) */}
        <div className="flex-1 space-y-6 lg:max-w-md">
          {/* كروت المميزات */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-7 shadow-2xl backdrop-blur">
            <h2 className="mb-4 text-lg sm:text-xl font-semibold">
              لماذا يختارنا الأولياء؟
            </h2>
            <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.id}
                    className="flex h-full flex-col gap-2 rounded-2xl border border-white/5 bg-white/5 p-4 text-right"
                  >
                    <div className="flex h-10 w-10 items-center justify-center self-end rounded-full bg-cyan-500/15 text-cyan-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm leading-6 text-slate-100/80">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
